import { useState } from 'react';
import { useAppSelector } from '../hooks/storeHooks';

import { Dictionary, IPackage } from '../models';

function DependencyUpdater(deps: Dictionary, dependenciesToUpdate: Dictionary) {
    if (!deps || !dependenciesToUpdate) return {};
    return Object.entries(deps).reduce((acc, [key, value]) => {
        acc[key] = dependenciesToUpdate[key] || value;

        return acc;
    }, {} as Dictionary);
}

function PackageCleaner(
    packagesToUpdate: Dictionary,
    dependenciesToUpdate: Dictionary,
) {
    if (!packagesToUpdate || !dependenciesToUpdate) return {};
    return Object.entries(packagesToUpdate).reduce((acc, [key, value]) => {
        if (dependenciesToUpdate[key] !== acc[key]) delete acc[key];
        else acc[key] = value;
        return acc;
    }, {} as Dictionary);
}

export default function Content() {
    const { selectedPath } = useAppSelector(appState => appState.app);
    const paths = useAppSelector(appState =>
        Object.entries(appState).find(([key]) => key === selectedPath),
    );
    const [content, setContent] = useState<IPackage>(
        paths && (paths[1] as any).content,
    );
    const [loading, setLoading] = useState<boolean>(false);
    const [packagesWithNewVersions, setPackagesWithNewVersions] =
        useState<Dictionary>({});
    const [dependenciesToUpdate, setDependenciesToUpdate] =
        useState<Dictionary>({});

    if (!content) {
        return <></>;
    }

    async function updatePackages() {
        setLoading(true);
        var success = await window.Api.call('updatePackages', {
            ...selectedPath,
            dependenciesToUpdate,
        });
        setLoading(false);

        if (success && content) {
            setContent({
                ...content,
                dependencies: DependencyUpdater(
                    content.dependencies,
                    dependenciesToUpdate,
                ),
                devDependencies: DependencyUpdater(
                    content.devDependencies,
                    dependenciesToUpdate,
                ),
                peerDependencies: DependencyUpdater(
                    content.peerDependencies,
                    dependenciesToUpdate,
                ),
            });
            setPackagesWithNewVersions(
                PackageCleaner(packagesWithNewVersions, dependenciesToUpdate),
            );
            setDependenciesToUpdate({});
            //TODO: show success message?
        }
    }

    const totalDepedencies = Object.entries(content.dependencies || {})
        .concat(Object.entries(content.devDependencies || {}))
        .concat(Object.entries(content.peerDependencies || {}));

    return (
        <div className="flex flex-col gap-1 h-full">
            <div className="flex flex-row gap-5 border-b border-solid border-black pb-5 justify-end">
                <button
                    disabled={loading}
                    className="bg-green-500 rounded-sm font-semibold text-white px-10 disabled:bg-green-300">
                    Refresh
                </button>
                <button
                    disabled={loading}
                    className="bg-indigo-500 rounded-sm font-semibold text-white px-10 disabled:bg-indigo-300"
                    onClick={updatePackages}>
                    Update selected packages
                </button>
            </div>
            {paths && (paths[1] as any).isLoading ? (
                <div className="m-auto w-24 h-24 border-4 border-solid border-red-500 border-t-transparent rounded-full animate-spin" />
            ) : (
                <div className="flex flex-col gap-1 grow overflow-y-auto">
                    {totalDepedencies.map(([key, value]) => (
                        <div
                            key={key}
                            className="flex flex-row grow justify-between">
                            <div className="flex flex-1">{key}</div>
                            <div className="flex flex-1 justify-center">
                                {value}
                            </div>
                            <div className="flex flex-1 justify-center">
                                {packagesWithNewVersions[key]}
                            </div>
                            <div className="flex flex-1 justify-center">
                                {packagesWithNewVersions[key] && (
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
                                                    [key]: packagesWithNewVersions[
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
