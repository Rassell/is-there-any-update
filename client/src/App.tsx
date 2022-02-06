import { Content, ListFiles, SelectFile } from './components';

export default function App() {
    return (
        <div className="h-screen flex flex-row">
            <div className="p-2.5 border-r border-solid border-black">
                <SelectFile />
                <ListFiles />
            </div>
            <div className="grow justify-between gap-5 p-2.5 h-full">
                <Content />
            </div>
        </div>
    );
}
