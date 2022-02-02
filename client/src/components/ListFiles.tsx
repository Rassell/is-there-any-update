import { useAppState } from '../hooks/useAppState';

export default function ListFiles() {
    const { fileList, selectedPath, removeFilePath, showContent } =
        useAppState();

    return (
        <div className="flex flex-col gap-4 pr-5 border-r border-solid border-black">
            {fileList.map((file, index) => (
                <div
                    key={`fileList_${index}`}
                    className={`flex flex-row gap-2 p-2.5 hover:bg-zinc-400 ${
                        selectedPath.path === file.path && 'bg-gray-500'
                    }`}>
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
