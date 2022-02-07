import { createAsyncThunk, createReducer } from '@reduxjs/toolkit';
import { Dictionary, IPackage } from '../models';

interface FileState {
    path: string;
    type: string;
    content: IPackage | null;
    updatesAvailable: Dictionary;
    isLoading: boolean;
}

const initialState: FileState = {
    path: '',
    type: '',
    updatesAvailable: {},
    content: null,
    isLoading: false,
};

export const loadContentAsync = (path: string) =>
    createAsyncThunk(`${path}/loadContentAsync`, async () => {
        const selectedPath = { path, type: 'npm' };
        let updatesAvailable = {} as Dictionary;

        const resultConentString = await window.Api.call(
            'readFile',
            selectedPath.path,
        );

        if (resultConentString) {
            try {
                updatesAvailable = await window.Api.call(
                    'checkVersions',
                    selectedPath,
                );
            } catch (error) {
                console.log(error);
            }
        }

        return { updatesAvailable, resultConentString };
    });

export const updatePackagesAsync = (path: string) =>
    createAsyncThunk(`${path}/updatePackages`, async () => {
        // var success = await window.Api.call('updatePackages', {
        //     ...selectedPath,
        //     dependenciesToUpdate,
        // });
//
        // if (success && content) {
        //     setContent({
        //         ...content,
        //         dependencies: DependencyUpdater(
        //             content.dependencies,
        //             dependenciesToUpdate,
        //         ),
        //         devDependencies: DependencyUpdater(
        //             content.devDependencies,
        //             dependenciesToUpdate,
        //         ),
        //         peerDependencies: DependencyUpdater(
        //             content.peerDependencies,
        //             dependenciesToUpdate,
        //         ),
        //     });
        //     setPackagesWithNewVersions(
        //         PackageCleaner(packagesWithNewVersions, dependenciesToUpdate),
        //     );
        //     setDependenciesToUpdate({});

        return { };
    });

export const todosReducerGenerator = (path: string) =>
    createReducer({ ...initialState, path }, builder => {
        builder.addCase(loadContentAsync(path).pending, state => {
            state.isLoading = true;
        });
        builder.addCase(
            loadContentAsync(path).fulfilled,
            (state, { payload }) => {
                state.content =
                    payload.resultConentString &&
                    JSON.parse(payload.resultConentString);
                state.updatesAvailable = payload.updatesAvailable;
                state.isLoading = false;
            },
        );
        builder.addCase(loadContentAsync(path).rejected, state => {
            state.isLoading = false;
        });
    });
