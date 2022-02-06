import * as npm from './npm';

//TODO: define type of project
type Dictionary = { [key: string]: string };

export default {
    npm,
} as {
    [key: string]: {
        getOutdated(path: string): Promise<Dictionary>;
        updatePackages({
            path,
            dependenciesToUpdate,
            doInstall,
        }: {
            path: string;
            dependenciesToUpdate: Dictionary;
            doInstall: boolean;
        }): Promise<unknown>;
    };
};
