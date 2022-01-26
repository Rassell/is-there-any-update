import { useState } from 'react';
import { useAppState } from '../hooks/useAppState';

//TODO: make enum for types
export default function SelectFile() {
    const { addFilePath } = useAppState();
    const [path, setSelectedPath] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [type, setType] = useState('npm');

    async function openFileDialog() {
        try {
            var path = await window.Api.call('openFileDialog');

            if (path) setSelectedPath(path);
        } catch (e) {
            console.log(e);
        }
    }

    async function save() {
        try {
            addFilePath(path, type);
            setShowModal(false);
        } catch (e) {
            console.log(e);
        }
    }

    return (
        <>
            <button
                onClick={() => {
                    setSelectedPath('');
                    setShowModal(true);
                }}>
                select file
            </button>
            {showModal && (
                <div>
                    <b>piensa que soy un modal</b>
                    <button onClick={openFileDialog}>select file</button>
                    <b>selected path: {path}</b>
                    <label>
                        <select
                            value={type}
                            onChange={e => setType(e.target.value)}>
                            <option value="npm">npm</option>
                            <option value="dotnet">dotnet</option>
                        </select>
                    </label>
                    <button onClick={save}>save</button>
                </div>
            )}
        </>
    );
}
