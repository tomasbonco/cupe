# Cupe

Cupe is Web Component that allows client-side image manipulation (resizing and cropping). It's rendering image in canvas so you have access to pixels all the time. It's also easily extensible and fastest kid in the town!


## Example

```html
<script src="bower_components/webcomponentsjs/webcomponents.js"></script> <!-- Compatibility -->
<link rel="import" href="x-cupe.html">

<x-cupe width="450" height="450"></x-cupe>
```


## Benefits

* Support for usage in `<form>`
* Does image resizing and image cropping
* Sends only resized and cropped image (you can save money when using cellular data!)
* Instant image preview
* Support for multiupload (or gallery, if you want)
* Mobile devices supported
* Super-fast image manipulation
* Web Component (doesn't require 3rd-party libraries)
* Supports Drag&Drop
* Easily extensible
* Written in TypeScript (doesn't limit you, but you can benefit, if you use TS too)


## Installation

You might want to add [webcomponents.js](https://github.com/webcomponents/webcomponentsjs) polyfill to support older browsers. Then, all you need to do is to link `x-cupe.html` file as shown in example.


## Attributes

* **height** - height of final image (default: `500`)
* **width** - width of final image (default: `500`)
* **crop** - set to `true`, if you want your image cropped (default: `true`)
* **align** - default align of crop; can be combination of words `top`, `bottom`, `left`, `right`, `center` (default: `center`)
* **allowMove** - set to `true`, if you want to allow user to set crop using mouse (default: `true`)
* **allowDrop** - set to `true`, if you want to allow Drag&Drop (default: `true`)
* **allowSelect** - set to `true`, if you want to allow user to select an image using modal window after click (default: `true`)
* **name** - use only inside `<form>`, when you **don't** want to use `XMLHttpRequest`; works as expected
* **quality** - how many time should be image redrawn when resizing image; higher number - better quality, but it takes longer (default 3, recommended max. is 5)


## Usage in forms

You can send images in forms. They'll be transferred as Base64 strings in POST. Don't forget to add `name` attribute. 

```html
<form action="process.php" method="POST">
	
	<x-cupe width="450" height="450" name="cupe"></x-cupe>

</form>
```


## Usage with XMLHttpRequest (or in script)

You can get image data by selecting image and calling `getContent( contentType, mimeType, quality )` method on it.

```javascript
let xcupe = document.querySelector( 'x-cupe' );
xcupe.getContent();


// -- or --

xcupe.getContent( 0, 'image/png', 0.92 ); // does same as above


// -- or --

xcupe.getContent( 1 ); // returns canvas's context


// -- or --

xcupe.getContent( 2 ); // returns Blob. Not implemented yet.

```


## Multiupload

If you want multiupload, use `<x-cupe-gallery>` element. Settings are the same. Element does not support sending images through `<form>` yet.

```html
<x-cupe-gallery width="300" height="300"></x-cupe-gallery>
```


## Server manipulation

For sample server implementations follow to `server/` directory.


## How to write extensions

See sample extension (plugins/zoom.js). When you write your own extension, create a PR to be listed in list below.


## Available extensions
* [zoom.js (tomasbonco/cupe)](https://github.com/tomasbonco/cupe/blob/master/plugins/zoom.js) - allows zoom, not working on touch devices
