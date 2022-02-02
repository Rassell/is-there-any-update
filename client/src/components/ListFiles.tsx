import { useAppState } from '../hooks/useAppState';

export default function ListFiles() {
    const { fileList, removeFilePath, showContent } = useAppState();

    return (
        <div className="flex flex-col gap-4">
            {fileList.map((file, index) => (
                <div key={`fileList_${index}`} className="flex flex-row gap-2">
                    <button
                        className="bg-red-500 rounded-sm font-semibold text-white px-10"
                        onClick={() => removeFilePath(file)}>
                        Remove
                    </button>
                    <div
                        className="cursor-pointer"
                        onClick={() => showContent(file)}>
                        {file.path}
                    </div>
                </div>
            ))}
        </div>
    );
}
