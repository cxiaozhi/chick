import { WebContentsView } from "electron";

export interface MyWebview {
    webView: WebContentsView;
    tabID: number;
}
