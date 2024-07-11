import { useDispatch } from "react-redux";
import "./index.scss";
import { addTabBar } from "@/features/global/reducer";

const platformList = [
    { url: "src/assets/img/xhs.webp", nav: "https://www.xiaohongshu.com/explore" },
    { url: "src/assets/img/tb.webp", nav: "https://taobao.com/" },
    { url: "src/assets/img/tmall.webp", nav: "https://tmall.com/" },
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
