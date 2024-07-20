import React from "react";
import "./index.scss";
import GLOBAL from "@/common/global";
import { useSelector } from "react-redux";

const Sidebar = (props: { id: number; label: string; icon: JSX.Element; params: any; enterState: any }) => {
    const global = useSelector((state: any) => state.globalReducer);
    const setClassName = () => {
        let className;
        if (props.id == props.params[0]) {
            className = "side-bar active";
        } else {
            className = "side-bar";
        }
        if (props.enterState[0] == props.id && props.enterState[0] != props.params[0]) {
            className = className + " hover";
        }
        return className;
    };

    return (
        <div
            className={setClassName()}
            onMouseUp={() => {
                if (props.params[0] !== props.id) {
                    props.params[1](props.id);
                    GLOBAL.ws!.send(JSON.stringify({ eventName: "hide-all-webview" }));
                }
            }}
            onMouseEnter={() => {
                props.enterState[1](props.id);
            }}
            onMouseLeave={() => {
                props.enterState[1](0);
            }}
        >
            {props.icon}
            <span className="label">{props.label}</span>
        </div>
    );
};

export default React.memo(Sidebar);
