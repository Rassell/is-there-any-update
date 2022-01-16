import { useEffect, useState } from 'react';
import './App.scss';

type Dictionary = { [key: string]: string };

interface IPackage {
    dependencies: Dictionary;
    devDependencies: Dictionary;
    peerDependencies: Dictionary;
}

function App() {
    const [fileList, setFileList] = useState<string[]>(
        JSON.parse(localStorage.getItem('fileList') || '[]'),
    );
    const [content, setContent] = useState<IPackage>();
    const [packagesToUpdate, setPackagesToUpdate] = useState<Dictionary>({});

    useEffect(() => {
        localStorage.setItem('fileList', JSON.stringify(fileList));
    }, [fileList]);

    async function openFileDialog() {
        try {
            var response = await (window as any).Api.call('openFileDialog');

            if (response) {
                setFileList([...fileList, response]);
            }
        } catch (e) {
            console.log(e);
        }
    }

    async function showContent(filePath: string) {
        const resultConentString = localStorage.getItem(filePath);

        if (resultConentString) {
            const resultContent: IPackage = JSON.parse(resultConentString);
            setContent(resultContent);

            const path = filePath.substring(0, filePath.lastIndexOf('/'));
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

    function removeFile(filePath: string) {
        setFileList(fileList.filter(file => file !== filePath));
    }

    function dependencyColumn(packageProps: IPackage | undefined) {
        if (!packageProps) {
            return null;
        }

        const totalDepedencies = Object.entries(packageProps.dependencies || {})
            .concat(Object.entries(packageProps.devDependencies || {}))
            .concat(Object.entries(packageProps.peerDependencies || {}));

        return (
            <div className="fileContent">
                {totalDepedencies.map(([key, value]) => (
                    <div key={key}>
                        <div>{key}</div>
                        <div>{value}</div>
                        {packagesToUpdate[key] && (
                            <div>{packagesToUpdate[key]}</div>
                        )}
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="App">
            <div className="top">
                <button onClick={openFileDialog}>select file</button>
            </div>
            <div className="body">
                <div className="files">
                    {fileList.map((file, index) => (
                        <div key={file}>
                            <button onClick={() => removeFile(file)}>
                                Remove
                            </button>
                            <div onClick={() => showContent(file)}>{file}</div>
                        </div>
                    ))}
                </div>
                {dependencyColumn(content)}
            </div>
        </div>
    );
}

export default App;
