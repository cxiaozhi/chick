import { ArrowLeftOutlined, ArrowRightOutlined, ReloadOutlined } from "@ant-design/icons";
import "./index.scss";
import { Input, Button, message } from "antd";
import { useEffect, useRef, useState } from "react";
import GLOBAL from "../../common/global";
export default function TabContent() {
    const [tableList, setTableList] = useState(GLOBAL.TabList);
    console.log("---->", tableList, GLOBAL.captureTab);
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

    return (
        <div className="capture-page">
            <div className="top">
                <div className="left-arrow">
                    <ArrowLeftOutlined />
                </div>
                <div className="right-arrow">
                    <ArrowRightOutlined />
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
                                    let msg: Message = {
                                        eventName: "search",
                                        params: { tabID: GLOBAL.captureTab, url: GLOBAL.TabList[GLOBAL.captureTab].search },
                                    };
                                    GLOBAL.ws!.send(JSON.stringify(msg));
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
                    onClick={() => {
                        console.log("开始采集");
                    }}
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
