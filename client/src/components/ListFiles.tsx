import { useAppState } from '../hooks/useAppState';
import TrashIcon from '../assets/icons/trash.png';

export default function ListFiles() {
    const { fileList, selectedPath, removeFilePath, showContent } =
        useAppState();

    return (
        <div className="flex flex-col gap-4">
            {fileList.map((file, index) => (
                <div
                    key={`fileList_${index}`}
                    className={`flex flex-row gap-2 p-2.5 hover:bg-zinc-400 ${
                        selectedPath.path === file.path && 'bg-gray-500'
                    }`}>
                    <button
                        className="bg-red-500 rounded-sm"
                        onClick={() => removeFilePath(file)}>
                        <img src={TrashIcon} alt="TrashIcon" width={20} />
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
