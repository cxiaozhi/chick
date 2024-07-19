import { WebSocketServer } from "ws";
import { BrowserWindow, WebContentsView, app, dialog, ipcMain, shell } from "electron";
import fs from "node:fs";
import { MyWebview } from "./type";
import { injectXHS } from "./xhs";
import { injectTB } from "./tbJS";
import { injectTMall } from "./tmall";

enum PlatFromEnum {
    "taobao",
    "tmall",
    "xhs",
    "error",
}

const errorInfo = {
    taobaoDetail: "请采集淘宝详情页",
    tmallDetail: "请采集天猫详情页",
    params: "参数错误",
    nonsupport: "不支持的平台",
    xhsError: "仅支持笔记详情页",
};

interface CheckRes {
    data: PlatFromEnum | null;
    msg: string | null;
}

export default class WSS {
    private static _instance: WSS;
    private wss: WebSocketServer;

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
            console.log(event);

            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath);
            }
            shell.showItemInFolder(dirPath);
        });
        ipcMain.handle("get-default-path", () => {
            return app.getPath("desktop") + "\\采集结果";
        });

        ipcMain.handle("back", (event, params) => {
            console.log(event);

            return this.back(params);
        });

        ipcMain.handle("next", (event, params) => {
            console.log(event);

            return this.next(params);
        });

        /** 开始采集 */
        ipcMain.handle("start-collection", async (_event, params) => {
            return await this.startCollection(params);
        });

        /** 注入脚本 */
        ipcMain.handle("inject-script", async (_event, params) => {
            return await this.injectJS(params);
        });

        /** 获取版本号 */
        ipcMain.handle("get-version", async (_event) => {
            return this._version;
        });
    }

    minimizeFrame() {
        if (this._win) {
            this._win.minimize();
        }
    }

    maximizeFrame(params: Params) {
        console.log(params);

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
            console.log("---->", detail);
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
                console.log(index);
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
        if (this.ifFromTaoBao(url)) {
            return this.checkTaoBaoUrl(url);
        } else if (this.ifFromXhs(url)) {
            return this.checkXhsUrl(url);
        } else if (this.ifFromTmall(url)) {
            return this.checkTmallUrl(url);
        }
        return this.noSupport();
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
    getSavePath(params: Message, title: string) {
        let savePath = params.params?.savePath;
        if (!savePath) {
            savePath = app.getPath("desktop") + "\\采集结果\\" + title + "\\";
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
        const res: TBLinkItem = await webView.webContents.executeJavaScript("injectTB()");
        console.log("淘宝脚本注入", res);
        for (let index = 0; index < res.urls.length; index++) {
            const urlItem = res.urls[index];
            if (urlItem.type == "video") {
                await this.downloadVideo(webView, this.getSavePath(params, res.title), urlItem.url);
            } else {
                await this.downloadImage(webView, this.getSavePath(params, res.title), urlItem.url);
            }
        }
        return { data: true, msg: "采集完成" };
    }

    /** 采集天猫 */
    async collectionTMall(params: Message) {
        let webView: WebContentsView | null = this.findWebViewByTabID(params);
        if (!webView) return null;
        const res: TBLinkItem = await webView.webContents.executeJavaScript("injectTMall()");
        console.log("天猫脚本注入", res);
        for (let index = 0; index < res.urls.length; index++) {
            const urlItem = res.urls[index];
            if (urlItem.type == "video") {
                await this.downloadVideo(webView, this.getSavePath(params, res.title), urlItem.url);
            } else {
                await this.downloadImage(webView, this.getSavePath(params, res.title), urlItem.url);
            }
        }
        return { data: true, msg: "采集完成" };
    }

    /** 下载视频 */
    downloadVideo(view: WebContentsView, savePath: string, downloadURL: string): Promise<void> {
        return new Promise((resolve) => {
            console.log("下载地址:", downloadURL);
            view.webContents.session.on("will-download", (e, item) => {
                let mimeType = item.getMimeType();
                // let resSuffix = mimeType.split("/")[1];
                let fimeName = item.getFilename();
                // if (!fimeName.includes("." + resSuffix)) {
                //     savePath = savePath + "." + resSuffix;
                // }
                savePath = savePath + fimeName;
                item.setSavePath(savePath);
                // console.log(e, item, mimeType);
                resolve();
            });

            view.webContents.downloadURL(downloadURL);
        });
    }

    /** 下载图片 */
    downloadImage(view: WebContentsView, savePath: string, downloadURL: string): Promise<void> {
        return new Promise((resolve) => {
            console.log("下载地址:", downloadURL);

            view.webContents.session.on("will-download", (e, item) => {
                let mimeType = item.getMimeType();
                let suffix = "." + mimeType.split("/")[1];
                let fimeName = item.getFilename();
                savePath = savePath + fimeName;
                if (suffix == ".octet-stream") {
                    savePath = savePath + ".jpg";
                } else if (!savePath.endsWith(suffix)) {
                    savePath = savePath + suffix;
                }
                item.setSavePath(savePath);
                // console.log(e, item, mimeType);
                item.once("done", (_event, state) => {
                    if (state == "completed") {
                        resolve();
                    }
                });
            });

            view.webContents.downloadURL(downloadURL);
        });
    }

    /** 采集小红书 */
    async collectionXHS(params: Message) {
        console.log("采集小红书");
        let webView: WebContentsView | null = this.findWebViewByTabID(params);
        if (!webView) return null;
        webView.webContents.on("console-message", (event, level, message, line, sourceId) => {
            if (message.includes("测试")) {
                console.log("event: %s, level: %s, message: %s, line: %s, sourceId: %s", event, level, message, line, sourceId);
            }
        });

        const res: {
            type: string;
            links: string[];
            title: string;
        } = await webView.webContents.executeJavaScript("injectXHS()");
        if (params.params) {
            console.log(res);
            for (let index = 0; index < res.links.length; index++) {
                const url = res.links[index];
                if (res.type == "video") {
                    await this.downloadVideo(webView, this.getSavePath(params, res.title), url);
                } else {
                    await this.downloadImage(webView, this.getSavePath(params, res.title), url);
                }
            }
            return { data: true, msg: "采集完成" };
        }
    }

    ifFromTaoBao(url: string): boolean {
        if (url.includes("taobao.com")) return true;
        return false;
    }

    ifFromXhs(url: string): boolean {
        if (url.includes("xhslink.com") || url.includes("xiaohongshu.com")) return true;
        return false;
    }

    ifFromTmall(url: string): boolean {
        if (url.includes("tmall.com")) return true;
        return false;
    }

    noSupport() {
        return { data: null, msg: errorInfo.nonsupport };
    }

    /** 检测淘宝链接 */
    checkTaoBaoUrl(url: string): CheckRes {
        if (url.startsWith("https://item.taobao.com") || url.startsWith("http://click.mz.simba.taobao.com")) {
            return { data: PlatFromEnum.taobao, msg: null };
        } else {
            return { data: null, msg: errorInfo.taobaoDetail };
        }
    }

    /** 检测天猫链接 */
    checkTmallUrl(url: string): CheckRes {
        if (url.includes("tmall.com") && url.includes("detail.tmall.com")) {
            return { data: PlatFromEnum.tmall, msg: null };
        } else {
            return { data: null, msg: errorInfo.tmallDetail };
        }
    }

    /** 检测小红书链接 */
    checkXhsUrl(url: string): CheckRes {
        if (url.includes("xhslink") || url.startsWith("https://www.xiaohongshu.com/explore/")) {
            return { data: PlatFromEnum.xhs, msg: null };
        } else {
            return { data: null, msg: errorInfo.xhsError };
        }
    }

    /** 注入脚本 */
    async injectJS(params: Message) {
        console.log("注入脚本", params);
        let webView: WebContentsView | null = this.findWebViewByTabID(params);
        if (webView && params.params) {
            let url = params.params.url;
            if (this.ifFromTaoBao(url)) {
                await webView.webContents.executeJavaScript(injectTB.toString());
            } else if (this.ifFromXhs(url)) {
                console.log("小红书注入脚本");
                await webView.webContents.executeJavaScript(injectXHS.toString());
                return true;
            } else if (this.ifFromTmall(url)) {
                await webView.webContents.executeJavaScript(injectTMall.toString());
            }
        }
    }

    private _version: string = "0.0.3";
    public get version(): string {
        return this._version;
    }
    public set version(v: string) {
        this._version = v;
    }
}
