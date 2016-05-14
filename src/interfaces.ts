let owner = (document['_currentScript'] || document['currentScript']).ownerDocument;

enum Step { Resize, Crop, Draw }

interface Dimensions
{
	width: number;
	height: number;
}

interface Settings
{
	height: number;
	width: number;
	quality: number;
	crop: boolean;
	align: string;
	allowMove: boolean;
	allowDrop: boolean;
	allowSelect: boolean;
	name: string;
}

enum OutputType { Context, DataUrl, Blob }