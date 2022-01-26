import { Content, ListFiles, SelectFile } from './components';

import './App.scss';

function App() {
    return (
        <div className="App">
            <div className="top">
                <SelectFile />
            </div>
            <div className="body">
                <ListFiles />
                <Content />
            </div>
        </div>
    );
}

export default App;
