import { createContext, useContext, useEffect, useState } from 'react';

type Dictionary = { [key: string]: string };

interface IPackage {
    dependencies: Dictionary;
    devDependencies: Dictionary;
    peerDependencies: Dictionary;
}

const AppState = {
    fileList: JSON.parse(localStorage.getItem('fileList') || '[]') as string[],
    content: undefined as IPackage | undefined,
    packagesToUpdate: {} as Dictionary,
    addFile: (path: string) => {},
    removeFile: (filePath: string) => {},
    showContent: (filePath: string) => {},
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
    const [fileList, setFileList] = useState<string[]>(
        JSON.parse(localStorage.getItem('fileList') || '[]'),
    );
    const [content, setContent] = useState<IPackage>();
    const [packagesToUpdate, setPackagesToUpdate] = useState<Dictionary>({});

    useEffect(() => {
        localStorage.setItem('fileList', JSON.stringify(fileList));
    }, [fileList]);

    function addFile(path: string) {
        setFileList([...fileList, path]);
    }

    function removeFile(filePath: string) {
        setFileList(fileList.filter(file => file !== filePath));
    }

    async function showContent(filePath: string) {
        // TODO: show loading
        setPackagesToUpdate({});
        const pathToFind = filePath.replaceAll('\\', '/');
        const resultConentString = localStorage.getItem(pathToFind);

        if (resultConentString) {
            const resultContent: IPackage = JSON.parse(resultConentString);
            setContent(resultContent);

            const path = pathToFind
                .substring(0, pathToFind.lastIndexOf('/'))
                .replaceAll('/', '\\');
            try {
                var response = await (window as any).Api.call('checkVersions', {
                    path,
                });
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
        addFile,
        removeFile,
        showContent,
        setPackagesToUpdate,
    };
}
