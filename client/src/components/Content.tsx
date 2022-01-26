import { useEffect, useState } from 'react';

import { useAppState } from '../hooks/useAppState';
import { Dictionary, IPackage } from '../models';

export default function Content() {
    const { selectedPath } = useAppState();
    const [content, setContent] = useState<IPackage>();
    const [packagesToUpdate, setPackagesToUpdate] = useState<Dictionary>({});
    const [dependenciesToUpdate, setDependenciesToUpdate] =
        useState<Dictionary>({});

    useEffect(() => {
        async function loadContent() {
            if (!selectedPath || !selectedPath.path) return;
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
        <div className="fileContent">
            <button onClick={updatePackages}>Update selected packages</button>
            {totalDepedencies.map(([key, value]) => (
                <div key={key} className="fileContent-row">
                    <div className="fileContent-row-key">{key}</div>
                    <div className="fileContent-row-version">{value}</div>
                    <div className="fileContent-row-newVersion">
                        {packagesToUpdate[key]}
                    </div>
                    <div className="fileContent-row-checkbox">
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
                                            [key]: packagesToUpdate[key],
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
    );
}
