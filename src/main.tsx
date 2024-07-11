import "./main.scss";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./common/global";
import store from "@/app/store";
import { Provider } from "react-redux";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <Provider store={store}>
        <App />
    </Provider>,
);
