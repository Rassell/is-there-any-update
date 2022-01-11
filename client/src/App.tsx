import { useState } from 'react';
import './App.scss';

function App() {
    const [fileList, setFileList] = useState<string[]>([]);

    async function openFileDialog() {
        var response = await (window as any).Api.call('openFileDialog');

        if (response) setFileList([...fileList, response]);
    }

    return (
        <div className="App">
            <div className="top">
                <button onClick={openFileDialog}>select file</button>
            </div>
            <div className="body">
                <div className="files">
                    {fileList.map((file, index) => (
                        <div key={file}>{file}</div>
                    ))}
                </div>
                <div className="fileContent">content of file</div>
            </div>
        </div>
    );
}

export default App;
