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
	crop: boolean;
	align: string;
	allow_move: boolean;
	allow_drop: boolean;
	allow_select: boolean;	
}