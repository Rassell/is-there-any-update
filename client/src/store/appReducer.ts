import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AppState {
    selectedPath: string;
}

const initialState: AppState = {
    selectedPath: '',
};

export const appSlice = createSlice({
    name: 'app',
    initialState,
    reducers: {
        addPath: (state, action: PayloadAction<string>) => {
            state.selectedPath = action.payload;
        },
        removePath: (state, action: PayloadAction<string>) => {
            state.selectedPath = '';
        },
        setSelectedPath: (state, action: PayloadAction<string>) => {
            state.selectedPath = action.payload;
        },
    },
});

export const { addPath, removePath, setSelectedPath } = appSlice.actions;

export default appSlice.reducer;
