import { createContext, useContext, useEffect, useState } from 'react';

import { FileListItem } from '../models';

const fileListItemEmpty = {
    path: '',
    type: '',
};

const appStateContext = createContext(
    {} as ReturnType<typeof useAppStateProvider>,
);

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

function useAppStateProvider() {
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
