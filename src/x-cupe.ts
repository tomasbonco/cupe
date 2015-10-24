import {XCupe} from 'lib/x-cupe'
import {XCupeGallery} from 'lib/x-cupe-gallery'

// Shim & native-safe ownerDocument lookup
let owner = (document._currentScript || document.currentScript).ownerDocument;

enum Step { Resize, Crop, Draw }

interface Dimensions
{
	width: number;
	height: number;
}


// Register our todo-item tag with the document
document.registerElement('x-cupe', XCupe);
document.registerElement('x-cupe-gallery', XCupeGallery);