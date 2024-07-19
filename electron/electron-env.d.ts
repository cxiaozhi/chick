/// <reference types="vite-plugin-electron/electron-env" />

declare namespace NodeJS {
    interface ProcessEnv {
        /**
         * The built directory structure
         *
         * ```tree
         * ├─┬─┬ dist
         * │ │ └── index.html
         * │ │
         * │ ├─┬ dist-electron
         * │ │ ├── main.js
         * │ │ └── preload.js
         * │
         * ```
         */
        APP_ROOT: string;
        /** /dist/ or /public/ */
        VITE_PUBLIC: string;
    }
}

// Used in Renderer process, expose in `preload.ts`
interface Window {
    ipcRenderer: import("electron").IpcRenderer;
}

interface Message {
    eventName: string;
    params?: Params;
}

interface Params {
    tabID?: number;
    [key: string]: any;
}

interface LinkItem {
    type: string;
    links: string[];
    title: string;
}

interface TBLinkItem {
    urls: UrlItem[];
    title: string;
}

interface UrlItem {
    type: string;
    url: string;
}
