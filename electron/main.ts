import {app, BrowserWindow, shell} from "electron";
import {fileURLToPath} from "node:url";
import path from "node:path";
import WSS from "./ws";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env.APP_ROOT = path.join(__dirname, "..");

export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;

let win: BrowserWindow | null;

function createWindow() {
    win = new BrowserWindow({
        width: 1200,
        height: 900,
        icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
        webPreferences: {
            preload: path.join(__dirname, "preload.mjs"),
            devTools: import.meta.env.MODE === "development",
        },
        titleBarStyle: "hidden",
    });

    win.setMinimumSize(1200, 900);

    win.webContents.on("did-finish-load", () => {
        win?.webContents.send("main-process-message", new Date().toLocaleString());
    });
    win.webContents.on("will-navigate", (e) => {
        e.preventDefault();
        if (e.url.includes("qqtg.aiwan.store")) {
            shell.openExternal(e.url);
        }
    });

    if (VITE_DEV_SERVER_URL) {
        console.log("VITE_DEV_SERVER_URL", VITE_DEV_SERVER_URL);
        win.loadURL(VITE_DEV_SERVER_URL);
    } else {
        win.loadFile(path.join(RENDERER_DIST, "index.html"));
    }

    WSS.I.init(win);
}

app.commandLine.appendSwitch("ignore-certificate-errors");
app.commandLine.appendSwitch("allow-insecure-content");
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
        win = null;
    }
});

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

app.whenReady().then(createWindow);
