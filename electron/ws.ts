import { WebSocketServer } from "ws";
import { BrowserWindow, WebContentsView, app, dialog, ipcMain, shell } from "electron";
import fs from "node:fs";
import { MyWebview } from "./type";
import GLOBAL from "../src/common/global";

export default class WSS {
    private static _instance: WSS;
    private wss: WebSocketServer;
    private _isMaxFrame: boolean = false;
    private _win: BrowserWindow | null = null;
    private _ws: any = null;
    private _webViewList: MyWebview[] = [];
    constructor() {
        this.wss = new WebSocketServer({ port: 8080 });
        this.initWebSocketServer();
    }

    private initWebSocketServer() {
        this.wss.on("connection", (ws) => {
            console.log("服务器socket连接成功--->");
            this._ws = ws;
            ws.on("error", (err) => {
                console.log("ws-->err-->", err);
            });
            ws.on("message", (data) => {
                const message = JSON.parse(data.toString());
                console.log("来自客户端", message);
                this.matchFuc(message);
            });
        });
    }

    static get I(): WSS {
        if (!WSS._instance) {
            WSS._instance = new WSS();
        }
        return WSS._instance;
    }

    matchFuc(message: Message) {
        switch (message.eventName) {
            case "minimize-frame":
                this.minimizeFrame();
                break;
            case "maximize-frame":
                if (message.params) {
                    this.maximizeFrame(message.params);
                }
                break;
            case "close-frame":
                this.closeFrame();
                break;
            case "change-frame":
                this.changePath();
                break;
            case "open-dir":
                if (message.params) {
                    this.openDir(message.params);
                }
                break;
            case "get-default-path":
                this.getDefaultPath();
                break;
            case "create-webview":
                this.createWebContentsView(message.params);
                break;
            case "show-webview":
                this.showWebView(message.params);
                break;
            case "search":
                this.search(message.params);
                break;
            case "update-webview":
                this.updateWebView(message.params);
                break;
            case "del-webview":
                this.delCaptureTab(message.params);
                break;
            case "hide-all-webview":
                this.hideAllWebview();
                break;
        }
    }

    init(params: BrowserWindow) {
        this._win = params;
        this.listenIpcRender();
    }

    listenIpcRender() {
        ipcMain.handle("change-path", async () => {
            if (this._win) {
                const change = await dialog.showOpenDialog(this._win, { properties: ["openDirectory"] });
                if (!change.canceled) {
                    return change.filePaths[0];
                }
            }
        });
        ipcMain.handle("open-dir", (event, dirPath) => {
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath);
            }
            shell.showItemInFolder(dirPath);
        });
        ipcMain.handle("get-default-path", () => {
            return app.getPath("desktop") + "\\采集结果";
        });

        ipcMain.handle("back", (event, params) => {
            return this.back(params);
        });

        ipcMain.handle("next", (event, params) => {
            return this.next(params);
        });
    }

    minimizeFrame() {
        if (this._win) {
            this._win.minimize();
        }
    }

    maximizeFrame(params: Params) {
        if (this._win) {
            if (this._win.isMaximized()) {
                this._win.restore();
            } else {
                this._win.maximize();
            }
        }
    }

    closeFrame() {
        if (this._win) {
            this._win.close();
        }
    }

    async changePath() {
        if (this._win) {
            const change = await dialog.showOpenDialog(this._win, { properties: ["openDirectory"] });
            if (!change.canceled) {
                return change.filePaths[0];
            }
        }
    }

    openDir(dirPath: Params) {
        if (dirPath.dirPath) {
            if (!fs.existsSync(dirPath.dirPath)) {
                fs.mkdirSync(dirPath.dirPath);
            }
            shell.showItemInFolder(dirPath.dirPath);
        }
    }

    getDefaultPath() {
        return app.getPath("desktop") + "\\采集结果";
    }

    send(message: Message) {
        this._ws.send(JSON.stringify(message));
    }

    createWebContentsView(params: any) {
        if (this._webViewList.length == 0) {
        }
        const view = new WebContentsView();
        let item: MyWebview = {
            webView: view,
            tabID: params.tabID,
        };

        view.webContents.setWindowOpenHandler((detail) => {
            console.log(detail);
            view.webContents.loadURL(detail.url);
            this.send({ eventName: "navigation" });
            return { action: "deny" };
        });
        this._webViewList.push(item);
        this._win!.contentView.addChildView(view);
        if (params.url) {
            view.webContents.loadURL(params.url);
        }
        view.setBounds({ x: params.x, y: params.y, width: params.width, height: params.height });
    }

    updateWebView(params: any) {
        console.log("更新View", params);
        this._webViewList.forEach((item) => {
            if (item.tabID == params.tabID) {
                item.webView.setBounds({ x: params.x, y: params.y, width: params.width, height: params.height });
            }
        });
    }

    showWebView(params: any) {
        console.log("showWebView--->", this._webViewList, params);
        if (params.tabID == 0) {
            this._webViewList.forEach((item) => {
                item.webView.setBounds({ x: params.x, y: params.y, width: 0, height: 0 });
            });
        } else {
            this._webViewList.forEach((item, index) => {
                if (item.tabID != params.tabID) {
                    item.webView.setBounds({ x: params.x, y: params.y, width: 0, height: 0 });
                } else {
                    console.log("显示");
                    item.webView.setBounds({ x: params.x, y: params.y, width: params.width, height: params.height });
                }
            });
        }
    }

    search(params: any) {
        console.log("search", params);
        this._webViewList.forEach((item) => {
            if (item.tabID == params.tabID) {
                item.webView.webContents.loadURL(params.url);
            }
        });
    }

    /** 删除采集页页签 */
    delCaptureTab(params: any) {
        console.log("删除采集页页签", params);
        this._webViewList.forEach((item) => {
            if (item.tabID == params.tabID) {
                if (!item.webView.webContents.isDestroyed()) {
                    this._win!.contentView.removeChildView(item.webView);
                }
            }
        });
        this._webViewList.splice(params.tabID - 1, 1);
        console.log("webview剩余:", this._webViewList.length);
    }

    /** 隐藏所有webview */
    hideAllWebview() {
        console.log("隐藏所有webview");
        this._webViewList.forEach((item) => {
            item.webView.setBounds({ x: 0, y: 0, width: 0, height: 0 });
        });
    }

    /** 后退 */
    back(params: any) {
        console.log("后退");

        let canGoBack: boolean = false;
        let canGoForward: boolean = false;
        this._webViewList.forEach((item) => {
            if (item.tabID == params.tabID) {
                item.webView.webContents.goBack();
                canGoBack = item.webView.webContents.canGoBack();
                canGoForward = item.webView.webContents.canGoForward();
            }
        });

        return { canGoBack, canGoForward };
    }
    /** 前进 */
    next(params: any) {
        let canGoBack: boolean = false;
        let canGoForward: boolean = false;
        this._webViewList.forEach((item) => {
            if (item.tabID == params.tabID) {
                item.webView.webContents.goForward();
                canGoBack = item.webView.webContents.canGoBack();
                canGoForward = item.webView.webContents.canGoForward();
            }
        });
        return { canGoBack, canGoForward };
    }
}
