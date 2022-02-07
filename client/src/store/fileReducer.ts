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

function DependencyUpdater(deps: Dictionary, dependenciesToUpdate: Dictionary) {
    if (!deps || !dependenciesToUpdate) return {};
    return Object.entries(deps).reduce((acc, [key, value]) => {
        acc[key] = dependenciesToUpdate[key] || value;

        return acc;
    }, {} as Dictionary);
}

function PackageCleaner(
    packagesToUpdate: Dictionary,
    dependenciesToUpdate: Dictionary,
) {
    if (!packagesToUpdate || !dependenciesToUpdate) return {};
    return Object.entries(packagesToUpdate).reduce((acc, [key, value]) => {
        if (dependenciesToUpdate[key] !== acc[key]) delete acc[key];
        else acc[key] = value;
        return acc;
    }, {} as Dictionary);
}

export const updatePackagesAsync = (path: string) =>
    createAsyncThunk(
        `${path}/updatePackages`,
        async (dependenciesToUpdate: Dictionary) => {
            var success = await window.Api.call('updatePackages', {
                path,
                type: 'npm',
                dependenciesToUpdate,
            });

            if (!success) throw new Error('Failed to update packages');

            return {
                dependenciesToUpdate,
            };
        },
    );

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
        builder.addCase(updatePackagesAsync(path).pending, state => {
            state.isLoading = true;
        });
        builder.addCase(
            updatePackagesAsync(path).fulfilled,
            (state, { payload }) => {
                const content = state.content as IPackage;
                state.content = {
                    ...content,
                    dependencies: DependencyUpdater(
                        content.dependencies,
                        payload.dependenciesToUpdate,
                    ),
                    devDependencies: DependencyUpdater(
                        content.devDependencies,
                        payload.dependenciesToUpdate,
                    ),
                    peerDependencies: DependencyUpdater(
                        content.peerDependencies,
                        payload.dependenciesToUpdate,
                    ),
                };
                state.isLoading = false;
                state.updatesAvailable = PackageCleaner(
                    state.updatesAvailable,
                    payload.dependenciesToUpdate,
                );
            },
        );
        builder.addCase(updatePackagesAsync(path).rejected, state => {
            state.isLoading = false;
        });
    });
