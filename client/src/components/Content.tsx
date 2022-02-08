import { useState } from 'react';

import { useAppDispatch, useAppSelector } from '../hooks/storeHooks';
import { Dictionary } from '../models';
import { loadContentAsync, updatePackagesAsync } from '../store/fileReducer';

export default function Content() {
    const dispatch = useAppDispatch();
    const { selectedPath } = useAppSelector(appState => appState.app);
    const { content, updatesAvailable, isLoading } = useAppSelector(
        appState =>
            Object.entries(appState).find(
                ([key]) => key === selectedPath,
            )![1] as any,
    );
    const [dependenciesToUpdate, setDependenciesToUpdate] =
        useState<Dictionary>({});

    if (!content) {
        return <></>;
    }

    async function updateDependencies() {
        const action = updatePackagesAsync(selectedPath);
        const result = await dispatch(action(dependenciesToUpdate));

        if (action.fulfilled.match(result as any)) {
            setDependenciesToUpdate({});
        }
    }

    async function refreshDependencies() {
        const action = loadContentAsync(selectedPath);
        await dispatch(action());

        setDependenciesToUpdate({});
    }

    const totalDepedencies = Object.entries(content.dependencies || {})
        .concat(Object.entries(content.devDependencies || {}))
        .concat(Object.entries(content.peerDependencies || {}));

    return (
        <div className="flex flex-col gap-1 h-full">
            <div className="flex flex-row gap-5 border-b border-solid border-black pb-5 justify-end">
                <button
                    disabled={isLoading}
                    className="bg-green-500 rounded-sm font-semibold text-white px-10 disabled:bg-green-300"
                    onClick={refreshDependencies}>
                    Refresh
                </button>
                <button
                    disabled={isLoading}
                    className="bg-indigo-500 rounded-sm font-semibold text-white px-10 disabled:bg-indigo-300"
                    onClick={updateDependencies}>
                    Update selected packages
                </button>
            </div>
            {isLoading ? (
                <div className="m-auto w-24 h-24 border-4 border-solid border-red-500 border-t-transparent rounded-full animate-spin" />
            ) : (
                <div className="flex flex-col gap-1 grow overflow-y-auto">
                    {totalDepedencies.map(([key, value]: any) => (
                        <div
                            key={key}
                            className="flex flex-row grow justify-between">
                            <div className="flex flex-1">{key}</div>
                            <div className="flex flex-1 justify-center">
                                {value}
                            </div>
                            <div className="flex flex-1 justify-center">
                                {updatesAvailable[key]}
                            </div>
                            <div className="flex flex-1 justify-center">
                                {updatesAvailable[key] && (
                                    <input
                                        onChange={() => {
                                            if (dependenciesToUpdate[key]) {
                                                const newDependencies = {
                                                    ...dependenciesToUpdate,
                                                };
                                                delete newDependencies[key];
                                                setDependenciesToUpdate(
                                                    newDependencies,
                                                );
                                            } else {
                                                setDependenciesToUpdate({
                                                    ...dependenciesToUpdate,
                                                    [key]: updatesAvailable[
                                                        key
                                                    ],
                                                });
                                            }
                                        }}
                                        type="checkbox"
                                        checked={!!dependenciesToUpdate[key]}
                                    />
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
