import "./index.scss";
export default function CapturePage(param: any) {
    console.log("CapturePage", param);
    return param.props.tabList[0][param.props.activeTab[0]].content;
}
