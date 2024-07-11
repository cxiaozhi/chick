import { PlusOutlined } from "@ant-design/icons";
import "./index.scss";
import { message } from "antd";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { addTabBar } from "@/features/global/reducer";

function AddButton() {
    const dispatch = useDispatch();
    const global = useSelector((state: any) => state.globalReducer);

    return (
        <div
            className="add-button"
            onClick={(event) => {
                console.log(event);

                if (global.TabList.length >= 6) return message.warning("当前页签创建已达最大值");
                dispatch(addTabBar({ search: "" }));
            }}
        >
            <PlusOutlined />
        </div>
    );
}

export default React.memo(AddButton);
