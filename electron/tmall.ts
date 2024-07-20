export function injectTMall() {
    let title = document.getElementsByTagName("h1");
    let item: TBLinkItem = {
        urls: [],
        title: "",
    };
    item.title = title[0].textContent ? title[0].textContent : "";

    const getVideoUrl = () => {
        let videoList = document.getElementsByTagName("video");
        for (let index = 0; index < videoList.length; index++) {
            const videoElement = videoList[index];
            let url = videoElement.src;
            if (!url.startsWith("https:")) {
                url = "https:" + url;
            }
            let urlItem: UrlItem = {
                url,
                type: "video",
            };
            item.urls.push(urlItem);
        }
    };

    const getImgUrl = () => {
        let imgUrls: HTMLCollection = document.getElementsByClassName("PicGallery--mainPic--34u4Jrw");
        for (let index = 0; index < imgUrls.length; index++) {
            const img = imgUrls[index];
            let url = img.getAttribute("src");

            if (url) {
                if (!url.startsWith("https:")) {
                    url = "https:" + url;
                }
                if (url.endsWith("_.webp")) {
                    url = url.replace("_.webp", "");
                }
                let urlItem: UrlItem = {
                    url,
                    type: "img",
                };
                item.urls.push(urlItem);
            }
        }
    };

    getVideoUrl();
    getImgUrl();
    return item;
}
