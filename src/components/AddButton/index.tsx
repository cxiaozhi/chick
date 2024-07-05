import { PlusOutlined } from "@ant-design/icons";
import "./index.scss";
import CapturePageButton from "../CapturePageButton";
import GLOBAL from "../../common/global";

export default function AddButton(params: any) {
    return (
        <div
            className="add-button"
            onClick={() => {
                let id = params.props.tabList[0].length;
                let newList = [
                    ...params.props.tabList[0],
                    {
                        component: <CapturePageButton />,
                        props: {},
                    },
                ];
                GLOBAL.TabList = newList;
                params.props.tabList[1](newList);
                params.props.activeTab[1](id);
            }}
        >
            <PlusOutlined />
        </div>
    );
}
