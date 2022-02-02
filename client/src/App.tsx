import { Content, ListFiles, SelectFile } from './components';

export default function App() {
    return (
        <div>
            <div className='p-2.5'>
                <SelectFile />
            </div>
            <div className="flex flex-row grow justify-between gap-10 p-2.5">
                <ListFiles />
                <Content />
            </div>
        </div>
    );
}
