export type Dictionary = { [key: string]: string };
export type FileListItem = { path: string; type: string };
export interface IPackage {
    dependencies: Dictionary;
    devDependencies: Dictionary;
    peerDependencies: Dictionary;
}
