import { CloseOutlined } from "@ant-design/icons";
import "./index.scss";
import GLOBAL from "../../common/global";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { activeTabBar, delTabBar } from "@/features/global/reducer";

function CapturePageButton(params: any) {
    const global = useSelector((state: any) => state.globalReducer);
    const dispatch = useDispatch();
    return (
        <div
            className={global.captureTab == params.id ? "capture-page-button active" : "capture-page-button"}
            onClick={(e) => {
                // @ts-ignore
                if (e.target.nodeName !== "svg" && e.target.nodeName !== "path" && global.captureTab !== params.id) {
                    dispatch(activeTabBar({ id: params.id }));
                }
            }}
        >
            <div className="desc">新建采集页</div>
            <CloseOutlined
                onClick={(e) => {
                    console.log("删除页签iD", params.id, e);
                    dispatch(delTabBar({ id: params.id }));
                    let msg: Message = {
                        eventName: "del-webview",
                        params: { tabID: params.id },
                    };
                    GLOBAL.ws!.send(JSON.stringify(msg));
                }}
                className="capture-close"
            />
        </div>
    );
}

export default React.memo(CapturePageButton);
