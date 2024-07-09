(function () {
    let videoList = document.getElementsByTagName("video");
    let videoUrlList = [];
    for (let index = 0; index < videoList.length; index++) {
        const element = videoList[index];
        const videoUrl = element.src;
        videoUrlList.push(videoUrl);
    }
    return videoUrlList;
})();
