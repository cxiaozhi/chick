import { ArrowLeftOutlined, ArrowRightOutlined, ReloadOutlined } from "@ant-design/icons";
import "./index.scss";
import { Input, Button, message } from "antd";
import { useState } from "react";

export default function CapturePage() {
    const [url, setUrl] = useState("https://taobao.com");
    const [value, setValue] = useState("");
    window.ipcRenderer.on("go-to", (e, url) => {
        setUrl(url);
    });
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
                            if (value.includes("http")) {
                                console.log(value);

                                setUrl(value);
                            } else {
                                message.warning("您输入的网址不正确");
                            }
                        }}
                        value={value}
                        onChange={(e) => {
                            setValue(e.target.value);
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
            <iframe
                className="iframe-content"
                src={url}
                onClick={(e) => {
                    console.log(e);
                }}
                id="my-iframe"
            ></iframe>
        </div>
    );
}
