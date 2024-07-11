import globalReducer from "@/features/global/reducer";
import { configureStore } from "@reduxjs/toolkit";

export default configureStore({
    reducer: { globalReducer },
});
