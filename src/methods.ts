import { dialog, ipcMain } from 'electron';
import { spawn } from 'child_process';
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
            let response = {};
            return new Promise((resolve, reject) => {
                var shell = spawn(`npm outdated`, {
                    detached: true,
                    cwd: path,
                    shell: true,
                });

                shell.stdout.on('data', data => {
                    const regex =
                        /([a-z|\@|\/|\-]+)\s+([0-9]+\.?[0-9]+\.?[0-9]+)\s+([0-9]+\.?[0-9]+\.?[0-9]+)\s+([0-9]+\.?[0-9]+\.?[0-9]+)/gi;
                    const matches: RegExpExecArray[] = data
                        .toString()
                        .split('\n')
                        .map((l: string) => regex.exec(l))
                        .filter((m: RegExpExecArray) => m !== null);
                    matches.forEach(element => {
                        response = {
                            ...response,
                            [element[1]]: element[4],
                        };
                    });
                });

                shell.stderr.on('data', data => {
                    reject(data);
                });

                shell.on('close', code => {
                    if (code === 1) {
                        resolve(response);
                    } else {
                        reject(code);
                    }
                });
            });
        },
    );
}
