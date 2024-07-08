import { CloseOutlined, DownloadOutlined, ExpandAltOutlined, MinusOutlined, SettingOutlined } from "@ant-design/icons";
import "./index.scss";
import { useState } from "react";
import { Button } from "antd";
import Sidebar from "../Sidebar";
import Set from "../../pages/Set";
import Ad from "../../pages/Ad";
import Singleton from "../../pages/Singleton";
import GLOBAL from "../../common/global";

function TopBar() {
    return (
        <div className="top-bar">
            <div className="left">小鸡采集</div>
            <div className="right">
                <Button
                    // @ts-ignore
                    style={{ marginLeft: 20, "-webkit-app-region": "no-drag" }}
                    type="primary"
                    icon={<MinusOutlined />}
                    onMouseUp={() => {
                        let message: Message = {
                            eventName: "minimize-frame",
                        };
                        GLOBAL.ws!.send(JSON.stringify(message));
                    }}
                    className={"custom-button"}
                />
                <Button
                    // @ts-ignore
                    style={{ marginLeft: 20, "-webkit-app-region": "no-drag" }}
                    type="primary"
                    icon={<ExpandAltOutlined />}
                    onMouseUp={() => {
                        let msg: Message = {
                            eventName: "maximize-frame",
                            params: { tabID: GLOBAL.captureTab },
                        };
                        GLOBAL.ws!.send(JSON.stringify(msg));
                    }}
                    className={"custom-button"}
                />
                <Button
                    // @ts-ignore
                    style={{ marginLeft: 20, "-webkit-app-region": "no-drag" }}
                    type="primary"
                    icon={<CloseOutlined />}
                    onMouseUp={() => {
                        let message: Message = {
                            eventName: "close-frame",
                        };
                        GLOBAL.ws!.send(JSON.stringify(message));
                    }}
                    className={"close-button"}
                />
            </div>
        </div>
    );
}

function BottomBar() {
    return <div className="bottom-bar">小鸡采集</div>;
}

const menuList = [
    {
        key: 1,
        label: "设置",
        icon: <SettingOutlined />,
    },
    {
        label: "采集",
        key: 2,
        icon: <DownloadOutlined />,
    },
    // {
    //     label: "推广",
    //     key: 3,
    //     icon: <SoundOutlined />,
    // },
];

function showContent(resState: [number, React.Dispatch<React.SetStateAction<number>>]) {
    switch (resState[0]) {
        case 1:
            return <Set></Set>;
        case 2:
            return <Singleton></Singleton>;
        case 3:
            return <Ad></Ad>;
        default:
            return <Set></Set>;
    }
}

export function MidView() {
    const resState = useState(1);
    const enterState = useState(0);
    return (
        <div className="mid-view">
            <div className="mid-left">
                {menuList.map((item) => (
                    <Sidebar label={item.label} id={item.key} icon={item.icon} params={resState} key={item.key} enterState={enterState}></Sidebar>
                ))}
            </div>
            <div className="mid-right">{showContent(resState)}</div>
        </div>
    );
}

export function Frame() {
    return (
        <div className="frame-view">
            <TopBar></TopBar>
            <MidView></MidView>
            <BottomBar></BottomBar>
        </div>
    );
}
