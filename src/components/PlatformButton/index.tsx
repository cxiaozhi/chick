import "./index.scss";
import { useDispatch, useSelector } from "react-redux";
import { activeTabBar } from "@/features/global/reducer";
import GLOBAL from "@/common/global";
function PlatformButton(params: any) {
    const dispatch = useDispatch();
    const global = useSelector((state: any) => state.globalReducer);
    return (
        <div
            className={global.captureTab == params.id ? "platform-button active" : "platform-button"}
            onClick={(e) => {
                if (global.captureTab !== params.id) {
                    GLOBAL.ws!.send(JSON.stringify({ eventName: "hide-all-webview" }));
                    dispatch(activeTabBar({ id: params.id }));
                }
            }}
        >
            平台列表
        </div>
    );
}

export default PlatformButton;
