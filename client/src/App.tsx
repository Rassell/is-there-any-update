import { Content, ListFiles, SelectFile } from './components';

export default function App() {
    return (
        <div className="p-2.5 h-screen">
            <div className="p-2.5 border-b border-solid border-black h-fit">
                <SelectFile />
            </div>
            <div className="flex flex-row grow justify-between gap-5 p-2.5 h-5/6">
                <ListFiles />
                <Content />
            </div>
        </div>
    );
}
