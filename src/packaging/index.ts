import * as npm from './npm';
import * as nuget from './nuget';

//TODO: define type of project
type Dictionary = { [key: string]: string };

export default {
    npm,
    nuget,
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
