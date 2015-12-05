let owner = (document['_currentScript'] || document['currentScript']).ownerDocument;

enum Step { Resize, Crop, Draw }

interface Dimensions
{
	width: number;
	height: number;
}