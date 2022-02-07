import { Action, configureStore, MiddlewareAPI } from '@reduxjs/toolkit';
import logger from 'redux-logger';

import { addPath, removePath } from './appReducer';
import { reducerManager as rM } from './reducerManager';

function localStorageMiddleware({ getState }: MiddlewareAPI) {
    return (next: (action: Action) => void) => (action: Action) => {
        const result = next(action);
        localStorage.setItem('appState', JSON.stringify(getState()));
        return result;
    };
}

function loadSavedStore() {
    const appState = localStorage.getItem('appState');
    if (appState !== null) return JSON.parse(appState);
}

const preloadedState = loadSavedStore();

export const reducerManager = rM(preloadedState);

export function reducerManagerMiddleware({ getState }: MiddlewareAPI) {
    return (next: (action: Action) => void) => (action: Action) => {
        const result = next(action);

        if (addPath.match(action)) {
            reducerManager.add(action.payload);
        }

        if (removePath.match(action)) {
            reducerManager.remove(action.payload);
        }

        return result;
    };
}

export const store = configureStore({
    reducer: reducerManager.reduce,
    preloadedState,
    middleware: getDefaultMiddleware =>
        getDefaultMiddleware().concat([
            logger,
            localStorageMiddleware,
            reducerManagerMiddleware,
        ]),
});

export type RootState = ReturnType<typeof store.getState>;
