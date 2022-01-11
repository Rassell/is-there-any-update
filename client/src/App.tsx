import { useState } from 'react';
import './App.css';

function App() {
    const [fileList, setFileList] = useState<string[]>([]);

    async function openFileDialog() {
        var response = await (window as any).Api.call('openFileDialog');

        if (response) setFileList([...fileList, response]);
    }

    return (
        <div className="App">
            <button onClick={openFileDialog}>select file</button>

            <div>
                {fileList.map((file, index) => (
                    <div key={file}>{file}</div>
                ))}
            </div>
        </div>
    );
}

export default App;
