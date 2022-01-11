import { dialog, ipcMain } from 'electron';
import * as fs from 'fs';

let mainWindow: Electron.BrowserWindow;

export function setMainWindow(win: Electron.BrowserWindow) {
    mainWindow = win;
}

export function setMethods() {
    ipcMain.handle('openFileDialog', async () => {
        const file = await dialog.showOpenDialog({
            properties: ['openFile'],
            filters: [{ name: 'npm', extensions: ['.json'] }],
        });

        if (file.canceled) {
            return;
        }

        const content = fs.readFileSync(file.filePaths[0]).toString();

        console.log(content);

        return file.filePaths[0];
    });
}
