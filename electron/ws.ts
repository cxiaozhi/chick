import { WebSocketServer } from "ws";
import { BrowserWindow, WebContentsView, app, dialog, ipcMain, session, shell } from "electron";
import fs from "node:fs";
import { MyWebview } from "./type";
import downloadXHS from "./downloadXHS";

enum PlatFromEnum {
    "taobao",
    "tmall",
    "xhs",
}

const errorInfo = {
    taobaoDetail: "请采集淘宝详情页",
    tmallDetail: "请采集天猫详情页",
    params: "参数错误",
    nonsupport: "不支持的平台",
};

export default class WSS {
    private static _instance: WSS;
    private wss: WebSocketServer;
    private _isMaxFrame: boolean = false;
    private _win: BrowserWindow | null = null;
    private _dirname: string = "";
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

        ipcMain.handle("start-collection", async (event, params) => {
            return await this.startCollection(params);
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

        view.webContents.addListener("did-finish-load", () => {
            let msg: Message = {
                eventName: "finish-load",
                params: { tabID: params.tabID },
            };
            this.send(msg);
        });

        view.webContents.setWindowOpenHandler((detail) => {
            console.log(detail);
            view.webContents.loadURL(detail.url);
            let msg: Message = {
                eventName: "navigation",
                params: { url: detail.url },
            };
            this.send(msg);
            return { action: "deny" };
        });
        this._webViewList.push(item);
        this._win!.contentView.addChildView(view);
        if (params.url) {
            view.webContents.loadURL(params.url);
        }
        view.setBounds({ x: params.x, y: params.y, width: params.width, height: params.height });
        console.log("webview剩余:", this._webViewList.length, this._webViewList);
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
                this.showWebView(params);
            }
        });
    }

    /** 删除采集页页签 */
    delCaptureTab(params: any) {
        console.log("删除采集页页签", params);
        this._webViewList.forEach((item) => {
            if (item.tabID == params.tabID) {
                if (!item.webView.webContents.isDestroyed()) {
                    item.webView.webContents.close();
                    this._win!.contentView.removeChildView(item.webView);
                }
            }
        });
        this._webViewList.splice(params.tabID - 1, 1);
        console.log("webview剩余:", this._webViewList.length, this._webViewList);
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

    /** 查找webView */
    findWebViewByTabID(params: Message): WebContentsView | null {
        for (let index = 0; index < this._webViewList.length; index++) {
            const element = this._webViewList[index];
            if (element.tabID == params.params?.tabID) return element.webView;
        }
        return null;
    }

    /** 判断采集链接属于哪个平台 */
    isWherePlatform(url: string) {
        if (url.includes("taobao.com") && (url.includes("itemIds") || url.includes("item.taobao.com"))) {
            return { data: PlatFromEnum.taobao, msg: null };
        } else if (url.includes("tmall.com") && url.includes("detail.tmall.com")) {
            return { data: PlatFromEnum.tmall, msg: null };
        } else if (url.includes("taobao.com") && !url.includes("item.taobao.com")) {
            return { data: null, msg: errorInfo.taobaoDetail };
        } else if (url.includes("tmall.com") && !url.includes("detail.tmall.com")) {
            return { data: null, msg: errorInfo.tmallDetail };
        } else if (url.includes("xhslink.com")) {
            return { data: PlatFromEnum.xhs, msg: null };
        } else {
            return { data: null, msg: errorInfo.nonsupport };
        }
    }

    /** 校验采集信息 */
    checkCollectionInfo(params: Message) {
        console.log("开始采集--->", params);
        if (params.params) {
            let platfrom = this.isWherePlatform(params.params.search);
            if (platfrom.data === null) {
                return { data: false, msg: platfrom.msg };
            } else {
                return { data: true, msg: platfrom.data };
            }
        } else {
            return { data: false, msg: errorInfo.params };
        }
    }

    /** 开始采集 */
    startCollection(params: Message) {
        let checkRes = this.checkCollectionInfo(params);
        if (!checkRes.data) return checkRes;
        switch (checkRes.msg) {
            case PlatFromEnum.taobao:
                return this.collectionTaobao(params);
            case PlatFromEnum.tmall:
                return this.collectionTMall(params);
            case PlatFromEnum.xhs:
                return this.collectionXHS(params);
        }
    }

    /** 获取保存路径 */
    getSavePath(params: Message) {
        let savePath = params.params?.savePath;
        if (!savePath) {
            savePath = app.getPath("desktop") + "\\采集结果\\";
        }
        return savePath;
    }

    /** 采集淘宝 */
    async collectionTaobao(params: Message) {
        let webView: WebContentsView | null = this.findWebViewByTabID(params);
        if (!webView) return null;
        webView.webContents.on("console-message", (event, level, message, line, sourceId) => {
            if (message.includes("测试")) {
                console.log("event: %s, level: %s, message: %s, line: %s, sourceId: %s", event, level, message, line, sourceId);
            }
        });

        let jsScript = fs.readFileSync("./electron/tbJS.ts", "utf8");
        const res = await webView.webContents.executeJavaScript(`${jsScript}`);
        for (let index = 0; index < res.length; index++) {
            const url = res[index];
            await this.downloadRes(webView, this.getSavePath(params), url);
        }
        return { data: true, msg: "采集完成" };
    }

    /** 采集天猫 */
    collectionTMall(params: Message) {
        let webView: WebContentsView | null = this.findWebViewByTabID(params);
        if (!webView) return null;
        webView.webContents;
        return { data: true, msg: "采集完成" };
    }

    /** 给weiview添加事件 */
    addLoadListener(view: WebContentsView) {}

    /** 切换标签 */

    /** 下载视频 图片 */
    downloadRes(view: WebContentsView, savePath: string, downloadURL: string): Promise<void> {
        return new Promise((resolve, reject) => {
            view.webContents.session.on("will-download", (e, item, webContents) => {
                item.getMimeType();
                savePath = savePath + item.getFilename();
                item.setSavePath(savePath);
                resolve();
            });

            view.webContents.downloadURL(downloadURL);
        });
    }

    /** 下载图片 */

    /** 采集小红书 */
    async collectionXHS(params: Message) {
        console.log("采集小红书");
        let webView: WebContentsView | null = this.findWebViewByTabID(params);
        if (!webView) return null;
        if (params.params) {
            let urlList = await downloadXHS.downloadImage(params.params.search);
            for (let index = 0; index < urlList.length; index++) {
                const url = urlList[index];
                await this.downloadRes(webView, this.getSavePath(params), url);
            }
            return { data: true, msg: "采集完成" };
        }
    }
}
