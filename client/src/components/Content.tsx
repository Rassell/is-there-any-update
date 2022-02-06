import { useCallback, useEffect, useState } from 'react';

import { useAppState } from '../hooks/useAppState';
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
    const { selectedPath } = useAppState();
    const [content, setContent] = useState<IPackage>();
    const [loading, setLoading] = useState<boolean>(false);
    const [packagesWithNewVersions, setPackagesWithNewVersions] =
        useState<Dictionary>({});
    const [dependenciesToUpdate, setDependenciesToUpdate] =
        useState<Dictionary>({});

    const loadContent = useCallback(async () => {
        if (!selectedPath || !selectedPath.path) return;
        setLoading(true);

        const resultConentString = await window.Api.call(
            'readFile',
            selectedPath.path,
        );

        if (resultConentString) {
            const resultContent: IPackage = JSON.parse(resultConentString);
            setContent(resultContent);

            try {
                var response = await window.Api.call(
                    'checkVersions',
                    selectedPath,
                );
                setPackagesWithNewVersions(response);
            } catch (error) {
                console.log(error);
            }
        }

        setLoading(false);
    }, [selectedPath]);

    useEffect(() => {
        loadContent();
    }, [loadContent]);

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
                    className="bg-green-500 rounded-sm font-semibold text-white px-10 disabled:bg-green-300"
                    onClick={loadContent}>
                    Refresh
                </button>
                <button
                    disabled={loading}
                    className="bg-indigo-500 rounded-sm font-semibold text-white px-10 disabled:bg-indigo-300"
                    onClick={updatePackages}>
                    Update selected packages
                </button>
            </div>
            {loading ? (
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