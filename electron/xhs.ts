export async function injectXHS() {
    // @ts-ignore
    const unsafeWindow = window.wrappedJSObject || window;
    const extractNoteInfo = () => {
        const regex = /\/explore\/([^?]+)/;
        const match = window.location.href.match(regex);
        if (match) {
            // let note = Object.values(unsafeWindow.__INITIAL_STATE__.note.noteDetailMap);
            return unsafeWindow.__INITIAL_STATE__.note.noteDetailMap[match[1]];
        } else {
            console.error("使用当前链接提取作品 ID 失败", window.location.href);
        }
    };

    const generateImageUrl = (note: any) => {
        let images = note.imageList;
        const regex = /http:\/\/sns-webpic-qc\.xhscdn.com\/\d+\/[0-9a-z]+\/(\S+)!/;
        let urls: any = [];
        try {
            images.forEach((item: any) => {
                let match = item.urlDefault.match(regex);
                if (match && match[1]) {
                    urls.push(`https://ci.xiaohongshu.com/${match[1]}?imageView2/2/w/format/png`);
                }
            });
            return urls;
        } catch (error) {
            console.error("Error generating image URLs:", error);
            return [];
        }
    };

    const generateVideoUrl = (note: any) => {
        return [`https://sns-video-bd.xhscdn.com/${note.video.consumer.originVideoKey}`];
    };

    const exploreDeal = async (note: any) => {
        let item: LinkItem = {
            type: "",
            links: [],
            title: "",
        };
        if (note.type === "normal") {
            item.type = "img";
            item.links = generateImageUrl(note);
        } else {
            item.type = "video";
            item.links = generateVideoUrl(note);
        }
        item.title = note.title;
        return item;
    };
    let note = extractNoteInfo();
    if (note.note) {
        let result = await exploreDeal(note.note);
        return result;
    }
}
