import React, { useState } from "react";
import "./index.scss";
import CapturePage from "../../components/CapturePage";
import AddButton from "../../components/AddButton";
import GLOBAL from "../../common/global";

const Singleton = () => {
    const activeTab = useState(0);
    const tabList = useState(GLOBAL.TabList);
    GLOBAL.captureTab = activeTab[0];
    return (
        <div className="singleton">
            <div className="top">
                {tabList[0].map((item, index) => {
                    item.props = { activeTab, id: index, tabList };
                    return <div key={index}>{React.cloneElement(item.tab, item.props)}</div>;
                })}
                <div className="behind">{<AddButton props={{ tabList, activeTab }} />}</div>
            </div>
            <div className="content">{<CapturePage props={{ tabList, activeTab }} />}</div>
        </div>
    );
};
export default Singleton;
