import "./index.scss";

export default function PlatformButton(params: any) {
    return (
        <div
            className={params.activeTab[0] == params.id ? "platform-button active" : "platform-button"}
            onClick={(e) => {
                params.activeTab[1](params.id);
            }}
        >
            平台列表
        </div>
    );
}
