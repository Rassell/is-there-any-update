import { useEffect } from 'react';

import TrashIcon from '../assets/icons/trash.png';
import { useAppDispatch, useAppSelector } from '../hooks/storeHooks';
import { removePath, setSelectedPath } from '../store/appReducer';
import { loadContentAsync } from '../store/fileReducer';

export default function ListFiles() {
    const dispatch = useAppDispatch();
    const paths = useAppSelector(appState =>
        Object.entries(appState)
            .filter(([key]) => key !== 'app')
            .map(([key, value]) => ({ key, value })),
    );
    const { selectedPath } = useAppSelector(appState => appState.app);

    useEffect(() => {
        if (selectedPath) dispatch(loadContentAsync(selectedPath)());
    }, [dispatch, selectedPath]);

    return (
        <div className="flex flex-col gap-4">
            {paths.map(({ key, value }: any, index: number) => (
                <div
                    key={`fileList_${index}`}
                    className={`flex flex-row gap-2 p-2.5 hover:bg-zinc-400 ${
                        selectedPath === key && 'bg-gray-500'
                    }`}>
                    <button
                        className="bg-red-500 rounded-sm"
                        onClick={() => dispatch(removePath(key))}>
                        <img src={TrashIcon} alt="TrashIcon" width={20} />
                    </button>
                    <div
                        className="cursor-pointer"
                        onClick={() => dispatch(setSelectedPath(key))}>
                        {value.isLoading ? 'Loading...' : value.path}
                    </div>
                </div>
            ))}
        </div>
    );
}
