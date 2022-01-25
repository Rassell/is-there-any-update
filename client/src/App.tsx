import { Content, ListFiles } from './components';
import { useAppState } from './hooks/useAppState';

import './App.scss';

function App() {
    const { addFile } = useAppState();

    async function openFileDialog() {
        try {
            var path = await (window as any).Api.call('openFileDialog');

            if (path) addFile(path);
        } catch (e) {
            console.log(e);
        }
    }

    return (
        <div className="App">
            <div className="top">
                <button onClick={openFileDialog}>select file</button>
            </div>
            <div className="body">
                <ListFiles />
                <Content />
            </div>
        </div>
    );
}

export default App;
