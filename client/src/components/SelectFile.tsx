import { useState } from 'react';
import { useAppState } from '../hooks/useAppState';

//TODO: make enum for types
export default function SelectFile() {
    const { addFilePath } = useAppState();
    const [path, setPath] = useState('');
    const [type, setType] = useState('');

    async function openFileDialog() {
        try {
            var path = await window.Api.call('openFileDialog');

            if (path) setPath(path);

            //TODO: change type depending on file extension?
        } catch (e) {
            console.log(e);
        }
    }

    async function save() {
        try {
            addFilePath(path, type);
            setPath('');
        } catch (e) {
            console.log(e);
        }
    }

    return (
        <div className="flex flex-row gap-5 border-b border-solid border-black pb-5">
            <label>
                <button
                    className="bg-gray-500 rounded-sm font-semibold text-white px-10"
                    onClick={openFileDialog}>
                    Select file
                </button>
                {path}
            </label>
            <label>
                Type:
                <select value={type} onChange={e => setType(e.target.value)}>
                    <option value=""></option>
                    <option value="npm">npm</option>
                    <option value="dotnet">dotnet</option>
                </select>
            </label>
            <button
                className="bg-green-700 rounded-sm font-semibold text-white px-10 disabled:opacity-50"
                disabled={!path || !type}
                onClick={save}>
                Add
            </button>
        </div>
    );
}
