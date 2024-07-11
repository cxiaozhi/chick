import React, { useState } from "react";
import "./index.scss";
import CapturePage from "../../components/CapturePage";
import AddButton from "../../components/AddButton";
import { useSelector } from "react-redux";
import { Tab } from "@/features/global/reducer";
import PlatformButton from "@/components/PlatformButton";
import CapturePageButton from "@/components/CapturePageButton";

const Singleton = () => {
    console.log("Singleton");
    const global = useSelector((state: any) => state.globalReducer);
    console.log(global);

    const tapButton = (item: any, index: number) => {
        if (item.tab == Tab.platformListTab) {
            return <PlatformButton id={index}></PlatformButton>;
        } else {
            return <CapturePageButton id={index}></CapturePageButton>;
        }
    };

    return (
        <div className="singleton">
            <div className="top">
                {global.TabList.map((item: any, index: any) => {
                    return <div key={index}>{tapButton(item, index)}</div>;
                })}
                <div className="behind">{<AddButton />}</div>
            </div>
            <div className="content">{<CapturePage />}</div>
        </div>
    );
};
export default React.memo(Singleton);
