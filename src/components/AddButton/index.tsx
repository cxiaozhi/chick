import { PlusOutlined } from "@ant-design/icons";
import "./index.scss";
import CapturePageButton from "../CapturePageButton";
import GLOBAL from "../../common/global";
import TabContent from "../TabContent";

export default function AddButton(params: any) {
    return (
        <div
            className="add-button"
            onClick={() => {
                let id = params.props.tabList[0].length;
                let newList = [
                    ...params.props.tabList[0],
                    {
                        tab: <CapturePageButton />,
                        props: {},
                        content: <TabContent />,
                        search: "",
                    },
                ];
                GLOBAL.TabList = newList;
                params.props.tabList[1](newList);
                params.props.activeTab[1](id);
                let msg: Message = {
                    eventName: "create-webview",
                    params: { tabID: id, x: 0, y: 0, width: 0, height: 0 },
                };
                GLOBAL.ws!.send(JSON.stringify(msg));
                GLOBAL.ws!.send(JSON.stringify({ eventName: "hide-all-webview" }));
            }}
        >
            <PlusOutlined />
        </div>
    );
}
