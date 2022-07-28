import { segment } from "koishi";
import path from "path";
import { pathToFileURL } from "url";
export function getSegmentImage(url: string) {
	return segment("image", { url });
}

export function getImagePath(paths: string) {
	const url = path.normalize(paths).split(path.sep).join("/");
	return pathToFileURL(url).toString();
}
export function getImage(filename: string) {
	const image = getImagePath(`H:/_Yunbot/data/images/${filename}`);
	return getSegmentImage(image);
}
