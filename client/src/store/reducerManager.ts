import { combineReducers } from '@reduxjs/toolkit';
import appReducer from './appReducer';
import { todosReducerGenerator } from './fileReducer';

export function reducerManager(initialState: any) {
    const reducers = Object.keys(initialState || {}).reduce(
        (acc: any, key) => {
            if (key !== 'app') acc[key] = todosReducerGenerator(key, 'npm');
            return acc;
        },
        { app: appReducer },
    );

    let combinedReducer = combineReducers(reducers);

    return {
        reduce: (state: any, action: any) => {
            return (combinedReducer as any)(state, action);
        },
        add: (key: string, type: string) => {
            //TODO: Generate custom key or uuid instead of those
            reducers[key] = todosReducerGenerator(key, type);
            combinedReducer = combineReducers(reducers);
        },
        remove: (key: string) => {
            delete reducers[key];
            combinedReducer = combineReducers(reducers);
        },
    };
}
