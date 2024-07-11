import { message } from "antd";
import "./index.scss";
import React from "react";
const Ad = () => {
    return (
        <div className="extension">
            <div className="row">
                <span className="prefix">官方交流①群 :</span>
                <span
                    className="qq-group"
                    onClick={() => {
                        navigator.clipboard.writeText("984296628").then(() => {
                            message.success("复制成功");
                        });
                    }}
                >
                    984296628
                </span>
            </div>
        </div>
    );
};

export default React.memo(Ad);
