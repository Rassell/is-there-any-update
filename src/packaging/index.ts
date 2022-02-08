import * as npm from './npm';

//TODO: define type of project
type Dictionary = { [key: string]: string };

export default {
    npm,
} as {
    [key: string]: {
        getOutdated(path: string): ReturnType<typeof npm.getOutdated>;
        updatePackages({
            path,
            dependenciesToUpdate,
        }: {
            path: string;
            dependenciesToUpdate: Dictionary;
        }): Promise<unknown>;
    };
};
