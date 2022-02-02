import { Content, ListFiles, SelectFile } from './components';

export default function App() {
    return (
        <div>
            <div>
                <SelectFile />
            </div>
            <div className="flex flex-row grow justify-between gap-10">
                <ListFiles />
                <Content />
            </div>
        </div>
    );
}
