import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface FileState {
    id: number;
    path: string;
    type: string;
    isLoading: boolean;
}

const initialState: FileState = {
    id: 0,
    path: '',
    type: '',
    isLoading: false,
};

export const fileSlice = createSlice({
    name: 'file',
    initialState,
    reducers: {
        setPath: (
            state,
            action: PayloadAction<{ path: string; type: string }>,
        ) => {
            state.path = action.payload.path;
            state.type = action.payload.type;
        },
    },
});

export const { setPath } = fileSlice.actions;

export default fileSlice.reducer;
