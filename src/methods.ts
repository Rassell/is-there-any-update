import { dialog, ipcMain } from 'electron';
import * as fs from 'fs';

import packaging from './packaging';

let mainWindow: Electron.BrowserWindow;

export function setMainWindow(win: Electron.BrowserWindow) {
    mainWindow = win;
}

//TODO: change responses to (err, data)
export function setMethods() {
    // TODO: Check if file is valid (package.json etc)
    ipcMain.handle('openFileDialog', async () => {
        const file = await dialog.showOpenDialog({
            properties: ['treatPackageAsDirectory'],
        });

        if (file.canceled) {
            return;
        }

        let path = file.filePaths[0];

        return path;
    });

    ipcMain.handle('readFile', (_, path: string) => {
        const content = fs.readFileSync(path).toString();

        return content;
    });

    // TODO: Define type of project
    // TODO: change to spawn for each new project added
    ipcMain.handle(
        'checkVersions',
        (_, { path, type }: { path: string; type: string }) => {
            return packaging[type].getOutdated(path);
        },
    );

    ipcMain.handle(
        'updatePackages',
        (
            _,
            {
                path,
                dependenciesToUpdate,
                doInstall,
                type,
            }: {
                path: string;
                dependenciesToUpdate: { [key: string]: string };
                doInstall: boolean;
                type: string;
            },
        ) => {
            return packaging[type].updatePackages({
                path,
                dependenciesToUpdate,
                doInstall,
            });
        },
    );
}
