import { spawn } from 'child_process';
import * as fs from 'fs';

//TODO: models file
type Dictionary = { [key: string]: string };

const REGEX_TO_DETECT_PACKAGES =
    /([a-z|\@|\/|\-]+)\s+([0-9]+\.?[0-9]+\.?[0-9]+)\s+([0-9]+\.?[0-9]+\.?[0-9]+)\s+([0-9]+\.?[0-9]+\.?[0-9]+)/gi;
const REGEX_TO_UPDATE_PACKAGES = /[\d\.]+/g;
const isWin = process.platform === 'win32';

export function getOutdated(pathToFind: string): Promise<Dictionary> {
    const path = cleanPath(pathToFind);

    let response = {};
    return new Promise((resolve, reject) => {
        var shell = spawn(`npm outdated`, {
            detached: false,
            cwd: path,
            shell: true,
        });

        shell.stdout.on('data', data => {
            const matches: RegExpExecArray[] = data
                .toString()
                .split('\n')
                .map((l: string) => REGEX_TO_DETECT_PACKAGES.exec(l))
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
}

export function updatePackages({
    path,
    packagesToUpdate,
    doInstall,
}: {
    path: string;
    packagesToUpdate: Dictionary;
    doInstall: boolean;
}) {
    return new Promise(resolve => {
        const content = JSON.parse(fs.readFileSync(path).toString());
        const mainUpdate = updateDep(packagesToUpdate);

        mainUpdate(content.dependencies);
        mainUpdate(content.devDependencies);
        mainUpdate(content.peerDependencies);

        fs.writeFileSync(path, JSON.stringify(content, null, 2));

        var shell = spawn(`npm i`, {
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
    });
}

function updateDep(packagesToUpdate: Dictionary) {
    return function (deps: any) {
        if (deps)
            Object.entries(deps).forEach((value: [string, string]) => {
                if (packagesToUpdate.hasOwnProperty(value[0])) {
                    deps[value[0]] = deps[value[0]].replace(
                        REGEX_TO_UPDATE_PACKAGES,
                        packagesToUpdate[value[0]],
                    );
                }
            });
    };
}

function cleanPath(pathToFind: string) {
    return pathToFind.substring(0, pathToFind.lastIndexOf(isWin ? '\\' : '/'));
}
