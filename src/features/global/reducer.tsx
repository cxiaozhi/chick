import GLOBAL from "@/common/global";
import {createSlice, PayloadAction} from "@reduxjs/toolkit";

export enum Tab {
    platformListTab,
    newTab,
    addTab,
}

export enum TabContentEnum {
    platformListContent,
    searchContent,
}

// 为 slice state 定义一个类型
interface CounterState {
    ws: WebSocket | null;
    TabList: {
        props: {};
        tab: Tab;
        content: TabContentEnum;
        search: string;
        loadFinish: boolean;
    }[];
    captureTab: number;
    rect: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    version: string;
}

// 使用该类型定义初始 state
const initialState: CounterState = {
    TabList: [
        {
            props: {},
            tab: Tab.platformListTab,
            content: TabContentEnum.platformListContent,
            search: "",
            loadFinish: false,
        },
    ],
    ws: null,
    captureTab: 0,
    rect: {x: 0, y: 0, width: 0, height: 0},
    version: "",
};

export const counterSlice = createSlice({
    name: "global",
    // `createSlice` 将从 `initialState` 参数推断 state 类型
    initialState,
    reducers: {
        updateTabBar: (state, action: PayloadAction<{search?: string; tabID: number; loadFinish?: boolean}>) => {
            if (action.payload.search) {
                state.TabList[action.payload.tabID].search = action.payload.search;
            }
            if (action.payload.loadFinish) {
                state.TabList[action.payload.tabID].loadFinish = action.payload.loadFinish;
            }
            return state;
        },

        addTabBar: (state, action: PayloadAction<{search: string}>) => {
            console.log(state, action);
            let id = state.TabList.length;
            let tab = {
                tab: Tab.newTab,
                props: {},
                content: TabContentEnum.searchContent,
                search: action.payload.search,
                loadFinish: false,
            };
            state.TabList.push(tab);
            state.captureTab = id;
            let msg: Message = {
                eventName: "create-webview",
                params: {tabID: id, x: 0, y: 0, width: 0, height: 0, url: action.payload.search},
            };
            GLOBAL.ws!.send(JSON.stringify(msg));
            GLOBAL.ws!.send(JSON.stringify({eventName: "hide-all-webview"}));
            return state;
        },

        activeTabBar: (state, action: PayloadAction<{id: number}>) => {
            console.log(state, action);
            state.captureTab = action.payload.id;
            GLOBAL.ws!.send(JSON.stringify({eventName: "hide-all-webview"}));
            let msg: Message = {
                eventName: "show-webview",
                params: {x: state.rect.x, y: state.rect.y, width: state.rect.width, height: state.rect.height, tabID: state.captureTab},
            };
            GLOBAL.ws!.send(JSON.stringify(msg));
            return state;
        },

        delTabBar: (state, action: PayloadAction<{id: number}>) => {
            console.log(state.captureTab, action);
            if (state.captureTab == action.payload.id) {
                state.captureTab--;
            }
            state.TabList.splice(action.payload.id, 1);
            let msg2: Message = {
                eventName: "show-webview",
                params: {x: state.rect.x, y: state.rect.y, width: state.rect.width, height: state.rect.height, tabID: state.captureTab},
            };
            GLOBAL.ws!.send(JSON.stringify(msg2));
            return state;
        },

        // 更新搜索内容节点位置
        updateNodePos(state, action: PayloadAction<{x: number; y: number}>) {
            console.log("// 更新搜索内容节点位置", state, action);
            state.rect.x = action.payload.x;
            state.rect.y = action.payload.y;
            let msg: Message = {
                eventName: "update-webview",
                params: {x: state.rect.x, y: state.rect.y, width: state.rect.width, height: state.rect.height, tabID: state.captureTab},
            };

            let msg2: Message = {
                eventName: "show-webview",
                params: {x: state.rect.x, y: state.rect.y, width: state.rect.width, height: state.rect.height, tabID: state.captureTab},
            };
            GLOBAL.ws!.send(JSON.stringify(msg));
            GLOBAL.ws!.send(JSON.stringify(msg2));
            return state;
        },

        // 更新搜索内容节点大小
        updateRect(state, action: PayloadAction<{width: number; height: number}>) {
            console.log("// 更新搜索内容节点大小", state, action);
            state.rect.width = action.payload.width;
            state.rect.height = action.payload.height;
            let msg: Message = {
                eventName: "update-webview",
                params: {x: state.rect.x, y: state.rect.y, width: state.rect.width, height: state.rect.height, tabID: state.captureTab},
            };

            let msg2: Message = {
                eventName: "show-webview",
                params: {x: state.rect.x, y: state.rect.y, width: state.rect.width, height: state.rect.height, tabID: state.captureTab},
            };
            GLOBAL.ws!.send(JSON.stringify(msg));
            GLOBAL.ws!.send(JSON.stringify(msg2));
            return state;
        },

        updateVersion(state, action: PayloadAction<{version: string}>) {
            state.version = action.payload.version;
            return state;
        },
    },
});

export const {updateTabBar, addTabBar, activeTabBar, delTabBar, updateRect, updateNodePos, updateVersion} = counterSlice.actions;
// 选择器等其他代码可以使用导入的 `RootState` 类型
export const selectCount = (state: any) => state.counter;

export default counterSlice.reducer;
