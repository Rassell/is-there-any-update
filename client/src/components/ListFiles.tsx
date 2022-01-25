import { useAppState } from '../hooks/useAppState';

export default function ListFiles() {
    const { fileList, removeFile, showContent } = useAppState();

    return (
        <div className="files">
            {fileList.map((file, index) => (
                <>
                    <button onClick={() => removeFile(file)}>Remove</button>
                    <div
                        key={`fileList_${index}`}
                        onClick={() => showContent(file)}>
                        {file}
                    </div>
                </>
            ))}
        </div>
    );
}
