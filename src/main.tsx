import "./main.scss";
import ReactDOM from "react-dom/client";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);

// Use contextBridge
window.ipcRenderer.on("main-process-message", (_event, message) => {
    console.log(message);
});
