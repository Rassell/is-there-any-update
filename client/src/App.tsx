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
    const [dependencieToUpdate, setDependencieToUpdate] = useState<Dictionary>(
        {},
    );

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
        // TODO: show loading
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
                <button onClick={() => {}}>Update selected packages</button>
                {totalDepedencies.map(([key, value]) => (
                    <div key={key} className="fileContent-row">
                        <div className="fileContent-row-key">{key}</div>
                        <div className="fileContent-row-version">{value}</div>
                        <div className="fileContent-row-newVersion">
                            {packagesToUpdate[key]}
                        </div>
                        <div className="fileContent-row-checkbox">
                            {packagesToUpdate[key] && (
                                <input
                                    onChange={() => {
                                        if (dependencieToUpdate[key]) {
                                            const newDependencies = {
                                                ...dependencieToUpdate,
                                            };
                                            delete newDependencies[key];
                                            setDependencieToUpdate(
                                                newDependencies,
                                            );
                                        } else {
                                            setDependencieToUpdate({
                                                ...dependencieToUpdate,
                                                [key]: packagesToUpdate[key],
                                            });
                                        }
                                    }}
                                    type="checkbox"
                                    checked={!!dependencieToUpdate[key]}
                                />
                            )}
                        </div>
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
