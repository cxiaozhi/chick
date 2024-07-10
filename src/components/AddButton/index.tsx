import { PlusOutlined } from "@ant-design/icons";
import "./index.scss";
import CapturePageButton from "../CapturePageButton";
import GLOBAL from "../../common/global";
import TabContent from "../TabContent";
import { message } from "antd";

export default function AddButton(params: any) {
    const addButton = (event: any) => {
        if (GLOBAL.TabList.length >= 6) return message.warning("当前页签创建已达最大值");
        let search = "";
        if (event.detail.message) {
            search = event.detail.message;
        }
        let id = params.props.tabList[0].length;
        let newList = [
            ...params.props.tabList[0],
            {
                tab: <CapturePageButton />,
                props: {},
                content: <TabContent />,
                search,
                loadFinish: false,
            },
        ];
        GLOBAL.TabList = newList;
        params.props.tabList[1](newList);
        params.props.activeTab[1](id);
        let msg: Message = {
            eventName: "create-webview",
            params: { tabID: id, x: 0, y: 0, width: 0, height: 0, url: search },
        };
        GLOBAL.ws!.send(JSON.stringify(msg));
        GLOBAL.ws!.send(JSON.stringify({ eventName: "hide-all-webview" }));
    };

    document.addEventListener("add-button", addButton);
    return (
        <div
            className="add-button"
            onClick={(event) => {
                addButton(event);
            }}
        >
            <PlusOutlined />
        </div>
    );
}
