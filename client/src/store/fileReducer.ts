import {
    createAsyncThunk,
    createReducer,
    createSelector,
} from '@reduxjs/toolkit';

import { Dictionary } from '../models';
import { RootState } from './store';

interface FileState {
    path: string;
    type: string;
    currentVersion: Dictionary;
    updatesAvailable: Dictionary;
    isLoading: boolean;
}

const initialState: FileState = {
    path: '',
    type: '',
    currentVersion: {},
    updatesAvailable: {},
    isLoading: false,
};

export const loadContentAsync = (path: string) =>
    createAsyncThunk(`${path}/loadContentAsync`, async (_, thunkAPi) => {
        let currentVersion = {} as Dictionary;
        let updatesAvailable = {} as Dictionary;

        try {
            const response = await window.Api.call('checkVersions', {
                path,
                type: getTypeByPath(thunkAPi.getState(), path),
            });
            currentVersion = response.currentVersion;
            updatesAvailable = response.updatesAvailable;
        } catch (error) {
            console.log(error);
        }

        return { currentVersion, updatesAvailable };
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
        async (dependenciesToUpdate: Dictionary, thunkAPi) => {
            var success = await window.Api.call('updatePackages', {
                path,
                type: getTypeByPath(thunkAPi.getState(), path),
                dependenciesToUpdate,
            });

            if (!success) throw new Error('Failed to update packages');

            return {
                dependenciesToUpdate,
            };
        },
    );

export const todosReducerGenerator = (path: string, type: string) =>
    createReducer({ ...initialState, path, type }, builder => {
        builder.addCase(loadContentAsync(path).pending, state => {
            state.isLoading = true;
        });
        builder.addCase(
            loadContentAsync(path).fulfilled,
            (state, { payload }) => {
                state.currentVersion = payload.currentVersion;
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
                state.currentVersion = DependencyUpdater(
                    state.currentVersion,
                    payload.dependenciesToUpdate,
                );
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

const selectSelf = (state: RootState) => state;
const getTypeByPath = (state: RootState, path: string) => {
    const found = Object.entries(state).find(([key]) => key === path);

    return ((found ? found[1] : initialState) as FileState).type;
};
export const selectFiles = createSelector(selectSelf, items =>
    Object.entries(items).filter(([key]) => key !== 'app'),
);
export const selectSelectedFile = createSelector(selectSelf, state => {
    const found = Object.entries(state).find(
        ([key]) => key === state.app.selectedPath,
    );

    return (found ? found[1] : initialState) as FileState;
});
export const selectFilesKeys = createSelector(selectFiles, items =>
    items.map(([key]) => key),
);
export const selectFilesAsKV = createSelector(selectFiles, items =>
    items.map(([key, value]) => ({ key, value })),
);
