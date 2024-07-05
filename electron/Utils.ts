import { BrowserWindow, app, dialog, ipcMain, shell } from "electron";
import fs from "node:fs";
let isMaxFrame = false;

export function listenIpcRender(win: BrowserWindow) {
    ipcMain.on("minimize-frame", (event, params) => {
        if (win) {
            win.minimize();
        }
    });
    ipcMain.on("maximize-frame", (event, params) => {
        if (win && !isMaxFrame) {
            win.maximize();
            isMaxFrame = true;
        } else if (win && isMaxFrame) {
            win.restore();
            isMaxFrame = false;
        }
    });
    ipcMain.on("close-frame", (event, params) => {
        win.close();
    });
    ipcMain.handle("change-path", async () => {
        const change = await dialog.showOpenDialog(win, { properties: ["openDirectory"] });
        if (!change.canceled) {
            return change.filePaths[0];
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
}
