const GLOBAL: {
    ws: WebSocket | null;
} = {
    ws: null,
};

if (!GLOBAL.ws) {
    const ws = new WebSocket("ws://localhost:8080");
    GLOBAL.ws = ws;
    if (GLOBAL.ws) {
        GLOBAL.ws.onopen = () => {
            console.log("客户端socket连接成功");
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
