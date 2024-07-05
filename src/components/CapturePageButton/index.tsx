import { CloseOutlined } from "@ant-design/icons";
import "./index.scss";

export default function CapturePageButton(params: any) {
    return (
        <div
            className={params.activeTab[0] == params.id ? "capture-page-button active" : "capture-page-button"}
            onClick={(e) => {
                // @ts-ignore
                if (e.target.nodeName !== "svg" && e.target.nodeName !== "path") {
                    params.activeTab[1](params.id);
                }
            }}
        >
            <div className="desc">新建采集页</div>
            <CloseOutlined
                onClick={(e) => {
                    params.tabList[0].splice(params.id, 1);
                    let id = params.tabList[0].length - 1;
                    params.activeTab[1](id);
                    params.tabList[1](params.tabList[0]);
                }}
                className="capture-close"
            />
        </div>
    );
}
