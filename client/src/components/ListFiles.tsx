import { useAppState } from '../hooks/useAppState';

export default function ListFiles() {
    const { fileList, removeFilePath, showContent } = useAppState();

    return (
        <div className="files">
            {fileList.map((file, index) => (
                <div key={`fileList_${index}`}>
                    <button onClick={() => removeFilePath(file)}>Remove</button>
                    <div onClick={() => showContent(file)}>{file.path}</div>
                </div>
            ))}
        </div>
    );
}
