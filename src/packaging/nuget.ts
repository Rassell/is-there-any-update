import { spawn } from 'child_process';
import * as fs from 'fs';

//TODO: models file
type Dictionary = { [key: string]: string };

const REGEX_TO_DETECT_PACKAGES_UPDATE =
    /([a-z|\@|\/|\-]+)\s+([0-9]+\.?[0-9]+\.?[0-9]+)\s+([0-9]+\.?[0-9]+\.?[0-9]+)\s+([0-9]+\.?[0-9]+\.?[0-9]+)/gi;
const REGEX_TO_UPDATE_PACKAGES = /[\d\.]+/g;
const isWin = process.platform === 'win32';

function getPackages(path: string) {
    return new Promise((resolve, reject) => {
        try {
            const response = {} as any;

            const shellList = spawn('npm list', {
                detached: false,
                cwd: path,
                shell: true,
            });

            shellList.stdout.on('data', data => {
                const matches: string[] = data.toString().split(/├──|└──/g);
                matches.shift();
                matches.forEach(l => {
                    const pack = l.trim();
                    var lastIndexOf = pack.lastIndexOf('@');
                    response[pack.substring(0, lastIndexOf)] =
                        pack.substring(lastIndexOf + 1);
                });
            });

            shellList.stderr.on('data', data => {
                reject(data.toString());
            });

            shellList.on('close', () => {
                resolve(response);
            });
        } catch (error) {
            reject();
        }
    });
}

function getUpdates(path: string) {
    return new Promise((resolve, reject) => {
        try {
            const response = {} as any;

            const shellOutdated = spawn('npm outdated', {
                detached: false,
                cwd: path,
                shell: true,
            });

            shellOutdated.stdout.on('data', data => {
                const matches: RegExpExecArray[] = data
                    .toString()
                    .split('\n')
                    .map((l: string) => REGEX_TO_DETECT_PACKAGES_UPDATE.exec(l))
                    .filter((m: RegExpExecArray) => m !== null);
                matches.forEach(element => {
                    const [, name, , , latestVersion, ..._] = element;
                    response[name] = latestVersion;
                });
            });

            shellOutdated.stderr.on('data', data => {
                reject(data);
            });

            shellOutdated.on('close', code => {
                if (code === 1) {
                    resolve(response);
                } else {
                    reject(code);
                }
            });
        } catch (error) {
            reject();
        }
    });
}

export async function getOutdated(pathToFind: string) {
    const path = cleanPath(pathToFind);

    let response = {
        currentVersion: {} as Dictionary,
        updatesAvailable: {} as Dictionary,
    };

    try {
        response.currentVersion = (await getPackages(path)) as Dictionary;
        response.updatesAvailable = (await getUpdates(path)) as Dictionary;
    } catch (error) {
        console.log(error);
    }

    return response;
}

export function updatePackages({
    path,
    dependenciesToUpdate,
}: {
    path: string;
    dependenciesToUpdate: Dictionary;
}) {
    if (!dependenciesToUpdate) return;
    return new Promise(resolve => {
        try {
            const content = JSON.parse(fs.readFileSync(path).toString());
            const mainUpdate = updateDep(dependenciesToUpdate);

            mainUpdate(content.dependencies);
            mainUpdate(content.devDependencies);
            mainUpdate(content.peerDependencies);

            fs.writeFileSync(path, JSON.stringify(content, null, 2));

            var shell = spawn('npm i', {
                detached: false,
                cwd: cleanPath(path),
                shell: true,
            });

            shell.stderr.on('data', data => {
                resolve(false);
            });

            shell.on('close', code => {
                resolve(true);
            });
        } catch (error) {
            resolve(false);
        }
    });
}

function updateDep(dependenciesToUpdate: Dictionary) {
    return function (deps: any) {
        if (deps)
            Object.entries(deps).forEach((value: [string, string]) => {
                if (dependenciesToUpdate.hasOwnProperty(value[0])) {
                    deps[value[0]] = deps[value[0]].replace(
                        REGEX_TO_UPDATE_PACKAGES,
                        dependenciesToUpdate[value[0]],
                    );
                }
            });
    };
}

function cleanPath(pathToFind: string) {
    return pathToFind.substring(0, pathToFind.lastIndexOf(isWin ? '\\' : '/'));
}
