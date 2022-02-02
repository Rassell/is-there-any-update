import { createContext, useContext, useEffect, useState } from 'react';

import { FileListItem } from '../models';

const fileListItemEmpty = {
    path: '',
    type: '',
};

const AppState = {
    fileList: JSON.parse(
        localStorage.getItem('fileList') || '[]',
    ) as FileListItem[],
    selectedPath: fileListItemEmpty as FileListItem,
    addFilePath: (path: string, type: string) => {},
    removeFilePath: (fileListItem: FileListItem) => {},
    showContent: (fileListItem: FileListItem) => {},
};

const appStateContext = createContext(AppState);

export function useAppState() {
    return useContext(appStateContext);
}

export function AppStateProvider({ children }: { children: React.ReactNode }) {
    const state = useAppStateProvider();
    return (
        <appStateContext.Provider value={state}>
            {children}
        </appStateContext.Provider>
    );
}

function useAppStateProvider(): typeof AppState {
    const [fileList, setFileList] = useState<FileListItem[]>(
        JSON.parse(localStorage.getItem('fileList') || '[]'),
    );
    const [selectedPath, setSelectedPath] =
        useState<FileListItem>(fileListItemEmpty);

    useEffect(() => {
        localStorage.setItem('fileList', JSON.stringify(fileList));
    }, [fileList]);

    function addFilePath(path: string, type: string) {
        setFileList([...fileList, { path, type }]);
    }

    function removeFilePath(fileItem: FileListItem) {
        setFileList(fileList.filter(file => file.path !== fileItem.path));
        if (selectedPath.path === fileItem.path) {
            setSelectedPath(fileListItemEmpty);
        }
    }

    function showContent(filePath: FileListItem) {
        setSelectedPath(filePath);
    }

    return {
        fileList,
        selectedPath,
        addFilePath,
        removeFilePath,
        showContent,
    };
}
