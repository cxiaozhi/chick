import { BrowserWindow, app, dialog, ipcMain, shell } from "electron";
import fs from "node:fs";

export function listenIpcRender(win: BrowserWindow) {
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
