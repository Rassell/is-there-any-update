import { createContext, useContext, useEffect, useState } from 'react';

import { Dictionary, FileListItem, IPackage } from '../models';

const AppState = {
    fileList: JSON.parse(
        localStorage.getItem('fileList') || '[]',
    ) as FileListItem[],
    content: undefined as IPackage | undefined,
    packagesToUpdate: {} as Dictionary,
    selectPath: {
        path: '',
        type: '',
    } as FileListItem,
    addFilePath: (path: string, type: string) => {},
    removeFilePath: (fileListItem: FileListItem) => {},
    showContent: (fileListItem: FileListItem) => {},
    setPackagesToUpdate: (packagesToUpdate: Dictionary) => {},
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
    const [content, setContent] = useState<IPackage>();
    const [packagesToUpdate, setPackagesToUpdate] = useState<Dictionary>({});
    const [selectPath, setSelectedPath] = useState<FileListItem>({
        path: '',
        type: '',
    });

    useEffect(() => {
        localStorage.setItem('fileList', JSON.stringify(fileList));
    }, [fileList]);

    function addFilePath(path: string, type: string) {
        setFileList([...fileList, { path, type }]);
    }

    function removeFilePath(fileItem: FileListItem) {
        setFileList(fileList.filter(file => file.path !== fileItem.path));
    }

    async function showContent(filePath: FileListItem) {
        // TODO: show loading
        setPackagesToUpdate({});
        setSelectedPath(filePath);
        const resultConentString = await window.Api.call(
            'readFile',
            filePath.path,
        );

        if (resultConentString) {
            const resultContent: IPackage = JSON.parse(resultConentString);
            setContent(resultContent);

            try {
                var response = await window.Api.call('checkVersions', filePath);
                setPackagesToUpdate(response);
            } catch (error) {
                console.log(error);
            }
        }
    }

    return {
        fileList,
        content,
        packagesToUpdate,
        selectPath,
        addFilePath,
        removeFilePath,
        showContent,
        setPackagesToUpdate,
    };
}
