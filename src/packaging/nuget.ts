import { spawn } from 'child_process';
import * as fs from 'fs';

//TODO: models file
type Dictionary = { [key: string]: string };

const REGEX_TO_UPDATE_PACKAGES = /[\d\.]+/g;
const isWin = process.platform === 'win32';

export async function getOutdated(pathToFind: string) {
    const path = cleanPath(pathToFind);

    let response = {
        currentVersion: {} as Dictionary,
        updatesAvailable: {} as Dictionary,
    };

    return new Promise((resolve, reject) => {
        try {
            const shellOutdated = spawn('dotnet list package --outdated', {
                detached: false,
                cwd: path,
                shell: true,
            });

            shellOutdated.stdout.on('data', data => {
                const matches = data
                    .toString()
                    .split('\n')
                    .map((l: string) => l.trim())
                    .filter((l: string) => l.startsWith('>'))
                    .map((l: string) => l.replace('> ', ''));

                matches.forEach((element: string) => {
                    const [name, version, , updateVersion] = element
                        .split(' ')
                        .filter(l => l);
                    response.currentVersion[name] = version;
                    response.updatesAvailable[name] = updateVersion;
                });
            });

            shellOutdated.stderr.on('data', data => {
                reject(data.toString());
            });

            shellOutdated.on('close', code => {
                resolve(response);
            });
        } catch (error) {
            reject();
        }
    });
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
