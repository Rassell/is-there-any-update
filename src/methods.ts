import { dialog, ipcMain } from 'electron';
import { exec, spawn } from 'child_process';
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
            var child = spawn(`npm outdated`, {
                detached: true,
                cwd: path,
                shell: true,
            });

            child.stdout.on('data', data => {
                console.log(`stdout: ${data}`);
            });

            child.stderr.on('data', data => {
                console.error(`stderr: ${data}`);
            });

            child.on('close', code => {
                console.log(`child process exited with code ${code}`);
            });
        },
    );
}
