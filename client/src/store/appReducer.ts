import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AppState {
    selectedPath: string;
    pathList: string[];
}

const initialState: AppState = {
    selectedPath: '',
    pathList: [],
};

export const appSlice = createSlice({
    name: 'app',
    initialState,
    reducers: {
        addPath: (state, action: PayloadAction<string>) => {
            state.pathList.push(action.payload);
            state.selectedPath = action.payload;
        },
        removePath: (state, action: PayloadAction<string>) => {
            state.pathList = state.pathList.filter(path => path !== action.payload);
            state.selectedPath = '';
        },
        setSelectedPath: (state, action: PayloadAction<string>) => {
            state.selectedPath = action.payload;
        },
    },
});

export const { addPath, removePath, setSelectedPath } = appSlice.actions;

export default appSlice.reducer;
