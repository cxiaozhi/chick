import { useDispatch } from "react-redux";
import "./index.scss";
import { addTabBar } from "@/features/global/reducer";
import tb from "@/assets/img/tb.webp";
import xhs from "@/assets/img/xhs.webp";
import tmall from "@/assets/img/tmall.webp";

const platformList = [
    { url: xhs, nav: "https://www.xiaohongshu.com/explore" },
    { url: tb, nav: "https://taobao.com/" },
    { url: tmall, nav: "https://tmall.com/" },
];

function PlatformList() {
    const dispatch = useDispatch();

    return (
        <div className="platform-list">
            {platformList.map((item, index) => {
                return (
                    <div className="platform-icon" key={index}>
                        <img
                            src={item.url}
                            onClick={(event) => {
                                console.log(event);
                                dispatch(addTabBar({ search: item.nav }));
                            }}
                        />
                    </div>
                );
            })}
        </div>
    );
}

export default PlatformList;
