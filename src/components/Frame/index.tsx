import {CloseOutlined, DownloadOutlined, ExpandAltOutlined, MinusOutlined, SettingOutlined, SoundOutlined} from "@ant-design/icons";
import "./index.scss";
import React, {useState} from "react";
import {Button} from "antd";
import Sidebar from "../Sidebar";
import Set from "../../pages/Set";
import Ad from "../../pages/Ad";
import Singleton from "../../pages/Singleton";
import GLOBAL from "../../common/global";
import {useDispatch, useSelector} from "react-redux";
import {updateVersion} from "@/features/global/reducer";
import appIcon from "@/assets/img/icon.webp";
function TopBar() {
    console.log("执行了");
    const dispatch = useDispatch();
    const global = useSelector((state: any) => state.globalReducer);
    window.ipcRenderer.invoke("get-version").then((res) => {
        dispatch(updateVersion({version: res}));
    });
    return (
        <div className="top-bar">
            <div className="left">
                <div className="app-icon">
                    <img src={appIcon} alt="" />
                </div>
                <div className="app-title">小鸡电商图文采集器 v{global.version}</div>
            </div>
            <div className="right">
                <Button
                    // @ts-ignore
                    style={{marginLeft: 20, "-webkit-app-region": "no-drag"}}
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
                    style={{marginLeft: 20, "-webkit-app-region": "no-drag"}}
                    type="primary"
                    icon={<ExpandAltOutlined />}
                    onMouseUp={() => {
                        let msg: Message = {
                            eventName: "maximize-frame",
                            params: {tabID: global.captureTab},
                        };
                        GLOBAL.ws!.send(JSON.stringify(msg));
                    }}
                    className={"custom-button"}
                />
                <Button
                    // @ts-ignore
                    style={{marginLeft: 20, "-webkit-app-region": "no-drag"}}
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
    return <div className="bottom-bar">Copyright © 2024 小鸡采集</div>;
}

const menuList = [
    {
        key: 1,
        label: "采集设置",
        icon: <SettingOutlined />,
    },
    {
        label: "内容采集",
        key: 2,
        icon: <DownloadOutlined />,
    },
    {
        label: "交流互助",
        key: 3,
        icon: <SoundOutlined />,
    },
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

export const MidView = React.memo(() => {
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
});

export const Frame = React.memo(() => {
    return (
        <div className="frame-view">
            <TopBar></TopBar>
            <MidView></MidView>
            <BottomBar></BottomBar>
        </div>
    );
});
