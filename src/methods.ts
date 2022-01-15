import { dialog, ipcMain } from 'electron';
import { exec } from 'child_process';
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

        const path = file.filePaths[0];
        const content = JSON.stringify(fs.readFileSync(path).toString());

        mainWindow.webContents.executeJavaScript(
            `localStorage.setItem("${path}", ${content});`,
        );

        return path;
    });
    // TODO: Define type of project
    // TODO: change to spawn for each new project added
    ipcMain.handle(
        'checkVersions',
        async (_, { path, type }: { path: string; type: string }) => {
            console.log(path);
            console.log(process.env.PATH);
            exec(`cd ${path} && npm outdated`, (err, stdout, stderr) => {
                // TODO: show error?
                if (err || stderr) {
                    console.error('err');
                    console.error(err);
                    console.error('stderr');
                    console.error(stderr);
                    return;
                }

                console.log(stdout);
            });
        },
    );
}
