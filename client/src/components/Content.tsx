import { useState } from 'react';

import { useAppState } from '../hooks/useAppState';
import { Dictionary } from '../models';

export default function Content() {
    const { content, packagesToUpdate, selectPath } = useAppState();
    const [dependenciesToUpdate, setDependenciesToUpdate] =
        useState<Dictionary>({});

    if (!content) {
        return <></>;
    }

    const totalDepedencies = Object.entries(content.dependencies || {})
        .concat(Object.entries(content.devDependencies || {}))
        .concat(Object.entries(content.peerDependencies || {}));

    async function updatePackages() {
        var path = await window.Api.call('updateVersions', {
            ...selectPath,
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
