import { useState } from 'react';
import './App.scss';

interface IPackage {
    dependencies: {};
    devDependencies: {};
}

function dependencyColumn(packageProps: IPackage | undefined) {
    if (!packageProps) {
        return null;
    }

    const totalDepedencies = Object.entries(
        packageProps.dependencies || {},
    ).concat(Object.entries(packageProps.devDependencies || {}));

    return (
        <div className="fileContent">
            {totalDepedencies.map(([key, value]) => (
                <div key={key}>
                    {key}: {value}
                </div>
            ))}
        </div>
    );
}

function App() {
    const [fileList, setFileList] = useState<string[]>([]);
    const [content, setContent] = useState<IPackage>();

    async function openFileDialog() {
        var response = await (window as any).Api.call('openFileDialog');

        if (response) {
            setFileList([...fileList, response]);
        }
    }

    async function showContent(filePath: string) {
        const resultConentString = localStorage.getItem(filePath);
        const resultContent = JSON.parse(
            resultConentString || '{}',
        ) as IPackage;
        setContent(resultContent);

        const path = filePath.substring(0, filePath.lastIndexOf('/'));
        try {
            var response = await (window as any).Api.call('checkVersions', {
                path,
            });
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <div className="App">
            <div className="top">
                <button onClick={openFileDialog}>select file</button>
            </div>
            <div className="body">
                <div className="files">
                    {fileList.map((file, index) => (
                        <div onClick={() => showContent(file)} key={file}>
                            {file}
                        </div>
                    ))}
                </div>
                {dependencyColumn(content)}
            </div>
        </div>
    );
}

export default App;
