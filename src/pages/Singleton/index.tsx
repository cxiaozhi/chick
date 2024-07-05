import React, { useState } from "react";
import "./index.scss";
import PlatformList from "../../components/Platform";
import CapturePage from "../../components/CapturePage";
import AddButton from "../../components/AddButton";
import GLOBAL from "../../common/global";

const ContentList = [
    {
        id: 0,
        component: <PlatformList />,
    },
    {
        id: 1,
        component: <CapturePage />,
    },
];

const Singleton = () => {
    const activeTab = useState(0);
    const tabList = useState(GLOBAL.TabList);
    return (
        <div className="singleton">
            <div className="top">
                {tabList[0].map((item, index) => {
                    item.props = { activeTab, id: index, tabList };
                    return <div key={index}>{React.cloneElement(item.component, item.props)}</div>;
                })}
                <div className="behind">{<AddButton props={{ tabList, activeTab }} />}</div>
            </div>
            <div className="content">{activeTab[0] <= 1 ? ContentList[activeTab[0]].component : <CapturePage />}</div>
        </div>
    );
};
export default Singleton;
