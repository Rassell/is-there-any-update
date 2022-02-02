import { useEffect, useState } from 'react';

import { useAppState } from '../hooks/useAppState';
import { Dictionary, IPackage } from '../models';

export default function Content() {
    const { selectedPath } = useAppState();
    const [content, setContent] = useState<IPackage>();
    const [loading, setLoading] = useState<boolean>(false);
    const [packagesToUpdate, setPackagesToUpdate] = useState<Dictionary>({});
    const [dependenciesToUpdate, setDependenciesToUpdate] =
        useState<Dictionary>({});

    useEffect(() => {
        async function loadContent() {
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
                    setPackagesToUpdate(response);
                } catch (error) {
                    console.log(error);
                }
            }

            setLoading(false);
        }

        loadContent();
    }, [selectedPath]);

    if (!content) {
        return <></>;
    }

    const totalDepedencies = Object.entries(content.dependencies || {})
        .concat(Object.entries(content.devDependencies || {}))
        .concat(Object.entries(content.peerDependencies || {}));

    async function updatePackages() {
        var path = await window.Api.call('updateVersions', {
            ...selectedPath,
            packagesToUpdate,
        });
    }

    return (
        <div className="flex flex-col gap-1 grow overflow-y-scroll">
            {loading ? (
                <div className="border-t-4 border-red-500 border-solid rounded-full w-24 h-24 animate-spin m-auto" />
            ) : (
                <>
                    <button
                        className="bg-indigo-500 rounded-sm font-semibold text-white px-10 w-48"
                        onClick={updatePackages}>
                        Update selected packages
                    </button>
                    <div className="flex flex-col gap-1">
                        {totalDepedencies.map(([key, value]) => (
                            <div
                                key={key}
                                className="flex flex-row grow justify-between">
                                <div className="flex flex-1">{key}</div>
                                <div className="flex flex-1 justify-center">
                                    {value}
                                </div>
                                <div className="flex flex-1 justify-center">
                                    {packagesToUpdate[key]}
                                </div>
                                <div className="flex flex-1 justify-center">
                                    {packagesToUpdate[key] && (
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
                                                        [key]: packagesToUpdate[
                                                            key
                                                        ],
                                                    });
                                                }
                                            }}
                                            type="checkbox"
                                            checked={
                                                !!dependenciesToUpdate[key]
                                            }
                                        />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
