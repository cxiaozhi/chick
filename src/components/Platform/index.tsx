import "./index.scss";
const platformList = [
    { url: "src/assets/img/xhs.webp", nav: "https://www.xiaohongshu.com/explore" },
    { url: "src/assets/img/tb.webp", nav: "https://taobao.com/" },
    { url: "src/assets/img/tmall.webp", nav: "https://tmall.com/" },
];

export default function PlatformList() {
    return (
        <div className="platform-list">
            {platformList.map((item, index) => {
                return (
                    <div className="platform-icon" key={index}>
                        <img
                            src={item.url}
                            onClick={() => {
                                const event = new CustomEvent("add-button", { detail: { message: item.nav } });
                                document.dispatchEvent(event);
                            }}
                        />
                    </div>
                );
            })}
        </div>
    );
}
