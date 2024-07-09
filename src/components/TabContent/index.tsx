import { ArrowLeftOutlined, ArrowRightOutlined, ReloadOutlined } from "@ant-design/icons";
import "./index.scss";
import { Input, Button, message } from "antd";
import { useEffect, useRef, useState } from "react";
import GLOBAL from "../../common/global";
export default function TabContent() {
    const [tableList, setTableList] = useState(GLOBAL.TabList);
    const [canBack, setCanBack] = useState(false);
    const [canNext, setCanNext] = useState(false);

    const elementRef = useRef(null);
    const updateWebView = (react: DOMRectReadOnly) => {
        if (elementRef.current) {
            const rect = (elementRef.current as any).getBoundingClientRect();
            let msg: Message = {
                eventName: "update-webview",
                params: { x: rect.x, y: rect.y, width: react.width, height: react.height, tabID: GLOBAL.captureTab },
            };
            GLOBAL.ws!.send(JSON.stringify(msg));
        }
    };
    const showWebview = () => {
        if (elementRef.current) {
            const rect = (elementRef.current as any).getBoundingClientRect();
            let msg: Message = {
                eventName: "show-webview",
                params: { x: rect.x, y: rect.y, width: rect.width, height: rect.height, tabID: GLOBAL.captureTab },
            };
            GLOBAL.ws!.send(JSON.stringify(msg));
        }
    };

    useEffect(showWebview, []);
    useEffect(() => {
        const resizeObserver = new ResizeObserver((entries) => {
            entries.forEach((entry) => {
                updateWebView(entry.contentRect);
            });
        });

        const intersectionObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {});
        });

        if (elementRef.current) {
            resizeObserver.observe(elementRef.current);
            intersectionObserver.observe(elementRef.current);
        }

        return () => {
            resizeObserver.disconnect();
            intersectionObserver.disconnect();
        };
    }, []);
    if (GLOBAL.ws) {
        GLOBAL.ws.onmessage = (event) => {
            let data: Message = JSON.parse(event.data);
            console.log(data);
            if (data.eventName == "navigation") {
                setCanBack(true);
                if (data.params) {
                    GLOBAL.TabList[GLOBAL.captureTab].search = data.params.url;
                    let newList = [...GLOBAL.TabList];
                    setTableList(newList);
                }
            } else if (data.eventName == "finish-load") {
                console.log("finish");
                if (data.params) {
                    if (data.params.tabID) {
                        GLOBAL.TabList[data.params.tabID].loadFinish = true;
                        let newList = [...GLOBAL.TabList];
                        setTableList(newList);
                    }
                }
            }
        };
    }

    return (
        <div className="capture-page">
            <div className="top">
                <div className={canBack ? "left-arrow" : "left-arrow gray"}>
                    <ArrowLeftOutlined
                        onClick={() => {
                            window.ipcRenderer.invoke("back", { tabID: GLOBAL.captureTab }).then((res) => {
                                setCanBack(res.canGoBack);
                                setCanNext(res.canGoForward);
                            });
                        }}
                    />
                </div>
                <div className={canNext ? "right-arrow" : "right-arrow gray"}>
                    <ArrowRightOutlined
                        onClick={() => {
                            window.ipcRenderer.invoke("next", { tabID: GLOBAL.captureTab }).then((res) => {
                                setCanBack(res.canGoBack);
                                setCanNext(res.canGoForward);
                            });
                        }}
                    />
                </div>
                <div className="update">
                    <ReloadOutlined />
                </div>
                <div className="input-box">
                    <Input
                        className="capture-url"
                        onPressEnter={(e) => {
                            if (GLOBAL.TabList[GLOBAL.captureTab]) {
                                if (GLOBAL.TabList[GLOBAL.captureTab].search.includes("http")) {
                                    if (elementRef.current) {
                                        const rect = (elementRef.current as any).getBoundingClientRect();
                                        let msg: Message = {
                                            eventName: "search",
                                            params: { x: rect.x, y: rect.y, width: rect.width, height: rect.height, tabID: GLOBAL.captureTab, url: GLOBAL.TabList[GLOBAL.captureTab].search },
                                        };
                                        GLOBAL.ws!.send(JSON.stringify(msg));
                                    }
                                } else {
                                    message.warning("您输入的网址不正确");
                                }
                            }
                        }}
                        value={GLOBAL.TabList[GLOBAL.captureTab]?.search}
                        onChange={(e) => {
                            if (GLOBAL.TabList[GLOBAL.captureTab]) {
                                GLOBAL.TabList[GLOBAL.captureTab].search = e.target.value;
                                let newList = [...tableList];
                                console.log("---->", newList);
                                setTableList(newList);
                            }
                        }}
                    ></Input>
                </div>
                <Button
                    type="primary"
                    onClick={async () => {
                        console.log("开始采集");
                        GLOBAL.TabList[GLOBAL.captureTab].loadFinish = false;
                        let newList = [...GLOBAL.TabList];
                        setTableList(newList);

                        let msg: Message = {
                            eventName: "start-collection",
                            params: { tabID: GLOBAL.captureTab, search: GLOBAL.TabList[GLOBAL.captureTab].search, savePath: localStorage.getItem("save-path") },
                        };
                        let res = await window.ipcRenderer.invoke("start-collection", msg);
                        console.log("采集结束", res);
                        if (!res.data) {
                            return message.error(res.msg);
                        }

                        GLOBAL.TabList[GLOBAL.captureTab].loadFinish = true;
                        newList = [...GLOBAL.TabList];
                        setTableList(newList);
                        return message.success(res.msg);
                    }}
                    disabled={!GLOBAL.TabList[GLOBAL.captureTab].loadFinish}
                >
                    开始采集
                </Button>
            </div>
            <div
                ref={elementRef}
                className="iframe-content"
                onClick={(e) => {
                    console.log(e);
                }}
                id="my-webview"
            ></div>
        </div>
    );
}
