import React from "react";
import "./index.scss";
import { useSelector } from "react-redux";
import { TabContentEnum } from "@/features/global/reducer";
import TabContent from "../TabContent";
import PlatformList from "../Platform";
function CapturePage(param: any) {
    console.log("CapturePage", param);
    const global = useSelector((state: any) => state.globalReducer);
    if (global.TabList[global.captureTab].content == TabContentEnum.platformListContent) {
        return <PlatformList></PlatformList>;
    } else {
        return <TabContent></TabContent>;
    }
}
export default React.memo(CapturePage);
