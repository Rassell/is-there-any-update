import TrashIcon from '../assets/icons/trash.png';
import { useAppDispatch, useAppSelector } from '../hooks/storeHooks';
import { removePath, setSelectedPath } from '../store/appReducer';

export default function ListFiles() {
    const dispatch = useAppDispatch();
    const { paths, selectedPath } = useAppSelector(appState => appState.app);

    return (
        <div className="flex flex-col gap-4">
            {paths.map((path: string, index: number) => (
                <div
                    key={`fileList_${index}`}
                    className={`flex flex-row gap-2 p-2.5 hover:bg-zinc-400 ${
                        selectedPath === path && 'bg-gray-500'
                    }`}>
                    <button
                        className="bg-red-500 rounded-sm"
                        onClick={() => dispatch(removePath(path))}>
                        <img src={TrashIcon} alt="TrashIcon" width={20} />
                    </button>
                    <div
                        className="cursor-pointer"
                        onClick={() => dispatch(setSelectedPath(path))}>
                        {path}
                    </div>
                </div>
            ))}
        </div>
    );
}
