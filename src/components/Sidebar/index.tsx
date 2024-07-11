import React from "react";
import "./index.scss";

const Sidebar = (props: { id: number; label: string; icon: JSX.Element; params: any; enterState: any }) => {
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
                props.params[1](props.id);
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
