import { useEffect } from 'react';
import { useSelector } from 'react-redux';

import { Content, ListFiles, SelectFile } from './components';
import { useAppDispatch } from './hooks/storeHooks';
import { loadContentAsync, selectFilesKeys } from './store/fileReducer';

export default function App() {
    const dispatch = useAppDispatch();
    const paths = useSelector(selectFilesKeys);

    useEffect(() => {
        paths.forEach(key => {
            dispatch(loadContentAsync(key)());
        });
        //TODO: fix this
    }, [dispatch, paths.length]);

    return (
        <div className="h-screen flex flex-row">
            <div className="p-2.5 border-r border-solid border-black">
                <SelectFile />
                <ListFiles />
            </div>
            <div className="grow justify-between gap-5 p-2.5 h-full">
                <Content />
            </div>
        </div>
    );
}
