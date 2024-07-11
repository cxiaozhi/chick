import { ArrowLeftOutlined, ArrowRightOutlined, ReloadOutlined } from "@ant-design/icons";
import "./index.scss";
import { Input, Button, message } from "antd";
import React, { useEffect, useRef, useState } from "react";
import GLOBAL from "../../common/global";
import { useDispatch, useSelector } from "react-redux";
import { updateNodePos, updateRect, updateTabBar } from "@/features/global/reducer";
function TabContent() {
    const global = useSelector((state: any) => state.globalReducer);
    const dispatch = useDispatch();
    const [canBack, setCanBack] = useState(false);
    const [canNext, setCanNext] = useState(false);
    const elementRef = useRef(null);

    const enter = (e?: any) => {
        console.log(e);

        if (global.TabList[global.captureTab]) {
            if (global.TabList[global.captureTab].search.includes("http")) {
                if (elementRef.current) {
                    let msg: Message = {
                        eventName: "search",
                        params: { x: global.rect.x, y: global.rect.y, width: global.rect.width, height: global.rect.height, tabID: global.captureTab, url: global.TabList[global.captureTab].search },
                    };
                    GLOBAL.ws!.send(JSON.stringify(msg));
                }
            } else {
                message.warning("您输入的网址不正确");
            }
        }
    };

    useEffect(() => {
        const resizeObserver = new ResizeObserver((entries) => {
            entries.forEach((entry) => {
                dispatch(updateRect({ width: entry.contentRect.width, height: entry.contentRect.height }));
            });
        });

        const intersectionObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                dispatch(updateNodePos({ x: entry.intersectionRect.x, y: entry.intersectionRect.y }));
            });
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
                    dispatch(updateTabBar({ search: data.params.url, tabID: global.captureTab }));
                }
            } else if (data.eventName == "finish-load") {
                console.log("finish");
                if (data.params) {
                    if (data.params.tabID) {
                        dispatch(updateTabBar({ loadFinish: true, tabID: data.params.tabID }));
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
                            window.ipcRenderer.invoke("back", { tabID: global.captureTab }).then((res) => {
                                setCanBack(res.canGoBack);
                                setCanNext(res.canGoForward);
                            });
                        }}
                    />
                </div>
                <div className={canNext ? "right-arrow" : "right-arrow gray"}>
                    <ArrowRightOutlined
                        onClick={() => {
                            window.ipcRenderer.invoke("next", { tabID: global.captureTab }).then((res) => {
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
                        onPressEnter={(event) => enter(event)}
                        value={global.TabList[global.captureTab]?.search}
                        onChange={(e) => {
                            dispatch(updateTabBar({ search: e.target.value, tabID: global.captureTab }));
                        }}
                    ></Input>
                </div>
                <Button
                    type="primary"
                    onClick={async () => {
                        console.log("开始采集");

                        dispatch(updateTabBar({ loadFinish: false, tabID: global.captureTab }));
                        let msg: Message = {
                            eventName: "start-collection",
                            params: { tabID: global.captureTab, search: global.TabList[global.captureTab].search, savePath: localStorage.getItem("save-path") },
                        };
                        let res = await window.ipcRenderer.invoke("start-collection", msg);
                        console.log("采集结束", res);
                        if (!res.data) {
                            return message.error(res.msg);
                        }

                        dispatch(updateTabBar({ loadFinish: true, tabID: global.captureTab }));
                        return message.success(res.msg);
                    }}
                    disabled={!global.TabList[global.captureTab].loadFinish}
                >
                    开始采集
                </Button>
            </div>
            <div ref={elementRef} className="iframe-content" id="my-webview"></div>
        </div>
    );
}

export default React.memo(TabContent);
