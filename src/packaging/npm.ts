import { spawn } from 'child_process';
import * as fs from 'fs';

//TODO: models file
type Dictionary = { [key: string]: string };

const REGEX_TO_DETECT_PACKAGES =
    /([a-z|\@|\/|\-]+)\s+([0-9]+\.?[0-9]+\.?[0-9]+)\s+([0-9]+\.?[0-9]+\.?[0-9]+)\s+([0-9]+\.?[0-9]+\.?[0-9]+)/gi;
var isWin = process.platform === 'win32';

export function getOutdated(pathToFind: string): Promise<Dictionary> {
    const path = pathToFind.substring(
        0,
        pathToFind.lastIndexOf(isWin ? '\\' : '/'),
    );

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
    let response = {};
    return new Promise((resolve, reject) => {
        const content = JSON.parse(fs.readFileSync(path).toString());
        console.log(path, packagesToUpdate);
        console.log(content);

        Object.entries(content.dependencies).forEach(
            (value: [string, string]) => {
                if (packagesToUpdate.hasOwnProperty(value[0])) {
                    content.dependencies[value[0]] = packagesToUpdate[value[1]];
                }
            },
        );

        resolve(true);
    });
}
