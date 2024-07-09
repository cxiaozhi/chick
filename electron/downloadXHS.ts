import fs from "fs";
import axios from "axios";
import path from "path";

let headers = {
    Cookie: "abRequestId=4c3817d8-42a5-5b33-a443-50ade325f551; a1=18aa12d7640zq4sw5x7e86ixj2plwq5jtg49jdruz50000789373; webId=840f0304567057d32fb18b7180ea0322; gid=yY00yJfWdf9SyY00yJfWKkfF48uA4ME2CWdY47uK3CVJUj281EA2VV888WYjqWq8248424W2; OUTFOX_SEARCH_USER_ID_NCOO=1867730402.8184483; xsecappid=xhs-pc-web; webBuild=3.22.3; websectiga=10f9a40ba454a07755a08f27ef8194c53637eba4551cf9751c009d9afb564467; sec_poison_id=ff835aa9-6676-4e72-9fb5-15d4409cf92a; cache_feeds=[]; unread={%22ub%22:%22657fc01200000000090198be%22%2C%22ue%22:%2265654d15000000003a00dd1c%22%2C%22uc%22:25}",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
};

const reqInstance = axios.create({ headers });

function decodeUnicodeString(unicodeString: string) {
    return decodeURIComponent(JSON.parse('"' + unicodeString.replace(/"/g, '\\"') + '"'));
}

function generate_image_url(source: string) {
    const regex = /"urlDefault":\s*"http:\\u002F\\u002Fsns-webpic-qc\.xhscdn\.com\\u002F\d+?\\u002F\S+?\\u002F(\S+?)!/g;
    let matches;
    let urls = [];
    try {
        while ((matches = regex.exec(source)) !== null) {
            if (matches[1]) {
                urls.push(decodeUnicodeString(`https://sns-img-bd.xhscdn.com/${matches[1]}`));
            }
        }
        return urls;
    } catch (error) {
        console.error("Error generating image URLs:", error);
        return [];
    }
}

function createDirPath() {
    const baseUrl = Math.floor(Math.random()) * 9 + 1 + "_" + Date.now().toString();
    const dirPath = path.join(process.cwd(), `/src/static/${baseUrl}/`);
    fs.mkdirSync(dirPath);
    return { dirPath, baseUrl };
}

async function downloadSaveImage(url: string, rootPath: string, imagePathList: string[], baseUrl: string) {
    try {
        const res = await reqInstance.get(url, {
            responseType: "arraybuffer",
        });
        const tempPath = Date.now().toString() + ".png";
        const savePath = rootPath + tempPath;
        fs.writeFileSync(savePath, res.data);
        imagePathList.push(`https://xhs-api.aiwan.store/${baseUrl}/` + tempPath);
    } catch (error) {}
}

async function downloadImage(url: string) {
    const html = await reqInstance.get(url);
    const urlList = generate_image_url(html.data);
    const { dirPath: rootPath, baseUrl } = createDirPath();
    const imagePathList: string[] = [];
    try {
        for (let index = 0; index < urlList.length; index++) {
            const imageUrl = urlList[index];
            await downloadSaveImage(imageUrl, rootPath, imagePathList, baseUrl);
        }
        return imagePathList;
    } catch (error) {
        console.log(error);
    }
}

export default { downloadImage };
