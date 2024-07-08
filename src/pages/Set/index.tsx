import { useEffect, useState } from "react";
import "./index.scss";
import { Button, Alert, message } from "antd";
import GLOBAL from "../../common/global";
const Set = () => {
    let dirPath = localStorage.getItem("save-path");
    let [changePath, setChangePath] = useState("");
    if (dirPath == "undefined" || !dirPath) {
        // GLOBAL.ws!.send("get-default-path");
        // GLOBAL.ws!.on("message", (res) => {
        //     setChangePath("");
        // });
    } else {
        changePath = dirPath;
    }

    return (
        <div className="content-set">
            <div className="row save-path">
                <div className="prefix">保存路径 :</div>
                <div className="preview-box">{changePath}</div>
                <Button
                    className="btn-style"
                    onMouseUp={() => {
                        // GLOBAL.ws!.send("change-path").then((dirPath) => {
                        //     if (dirPath) {
                        //         setChangePath(dirPath);
                        //         localStorage.setItem("save-path", dirPath);
                        //     }
                        // });
                    }}
                >
                    选择
                </Button>
                <Button
                    className="btn-style"
                    onMouseUp={() => {
                        let dirPath = localStorage.getItem("save-path");

                        // if (dirPath) {
                        //     window.ipcRenderer.invoke("open-dir", dirPath);
                        // } else {
                        //     window.ipcRenderer.invoke("get-default-path").then((res) => {
                        //         window.ipcRenderer.invoke("open-dir", res);
                        //     });
                        // }
                    }}
                >
                    查看
                </Button>
            </div>
        </div>
    );
};

export default Set;
