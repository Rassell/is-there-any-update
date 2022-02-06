/// <reference types="react-scripts" />

interface Window {
    Api: {
        call: (mehtod: string, params?: any) => Promise<any> | any;
    };
}
