import { useEffect, useState } from 'react';
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
    const [fileList, setFileList] = useState<string[]>(
        JSON.parse(localStorage.getItem('fileList') || '[]'),
    );
    const [content, setContent] = useState<IPackage>();

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
                console.log(response);
            } catch (error) {
                console.log(error);
            }
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
