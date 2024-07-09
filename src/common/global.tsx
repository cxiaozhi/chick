import PlatformList from "../components/Platform";
import PlatformButton from "../components/PlatformButton";
const GLOBAL: {
    ws: WebSocket | null;
    TabList: {
        props: {};
        tab: JSX.Element;
        content: JSX.Element;
        search: string;
        loadFinish: boolean;
    }[];
    captureTab: number;
} = {
    TabList: [
        {
            props: {},
            tab: <PlatformButton />,
            content: <PlatformList />,
            search: "",
            loadFinish: false,
        },
    ],
    ws: null,
    captureTab: 0,
};

if (!GLOBAL.ws) {
    const ws = new WebSocket("ws://localhost:8080");
    GLOBAL.ws = ws;
    if (GLOBAL.ws) {
        GLOBAL.ws.onopen = () => {
            console.log("客户端socket连接成功");
            const message: Message = {
                eventName: "Hello from renderer!",
            };
            GLOBAL.ws!.send(JSON.stringify(message));
        };

        GLOBAL.ws.onmessage = (event) => {
            console.log("来自服务器:", event.data);
        };

        GLOBAL.ws.onclose = () => {
            console.log("WebSocket connection closed");
        };
    }
}

export default GLOBAL;
