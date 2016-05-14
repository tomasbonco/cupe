var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var owner = (document['_currentScript'] || document['currentScript']).ownerDocument;
var Step;
(function (Step) {
    Step[Step["Resize"] = 0] = "Resize";
    Step[Step["Crop"] = 1] = "Crop";
    Step[Step["Draw"] = 2] = "Draw";
})(Step || (Step = {}));
var OutputType;
(function (OutputType) {
    OutputType[OutputType["Context"] = 0] = "Context";
    OutputType[OutputType["DataUrl"] = 1] = "DataUrl";
    OutputType[OutputType["Blob"] = 2] = "Blob";
})(OutputType || (OutputType = {}));
var XCupeInputFileElement = (function () {
    function XCupeInputFileElement(element, controller, multiple) {
        if (multiple === void 0) { multiple = false; }
        this.element = null;
        this.controller = null;
        this.changeListener = null;
        this.clickListener = null;
        this.element = element;
        this.controller = controller;
        if (multiple) {
            this.element.setAttribute('multiple', 'true');
        }
        this.changeListener = this.onChange.bind(this);
        this.clickListener = this.clicked.bind(this);
        this.element.addEventListener('change', this.changeListener);
        this.element.addEventListener('click', this.clickListener);
    }
    XCupeInputFileElement.prototype.open = function () {
        this.element.click();
    };
    XCupeInputFileElement.prototype.onChange = function (event) {
        this.controller.readAndDrawImage(event.target.files);
    };
    XCupeInputFileElement.prototype.clicked = function (event) {
        event.stopPropagation();
    };
    return XCupeInputFileElement;
})();
var XCupeInputTextElement = (function () {
    function XCupeInputTextElement(element) {
        this.element = null;
        this.element = element;
    }
    XCupeInputTextElement.prototype.val = function (newValue) {
        if (newValue) {
            this.element.value = newValue;
        }
        return this.element.value;
    };
    XCupeInputTextElement.prototype.name = function (newValue) {
        if (newValue) {
            this.element.setAttribute('name', newValue);
        }
        return this.element.getAttribute('name');
    };
    return XCupeInputTextElement;
})();
var XCupeCanvasElement = (function () {
    function XCupeCanvasElement(element) {
        this.element = null;
        this.context = null;
        this.element = element ? element : document.createElement('canvas');
        this.context = this.element.getContext('2d');
    }
    XCupeCanvasElement.prototype.setDimensions = function (newDimensions, height) {
        this.element.width = newDimensions.width;
        this.element.height = newDimensions.height;
    };
    XCupeCanvasElement.prototype.getDimensions = function () {
        return { width: this.element.width, height: this.element.height };
    };
    // HTMLImageElement|HTMLVideoElement|HTMLCanvasElement|ImageBitmap
    XCupeCanvasElement.prototype.drawImage = function (source, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight) {
        if (sx === void 0) { sx = 0; }
        if (sy === void 0) { sy = 0; }
        if (sWidth === void 0) { sWidth = -1; }
        if (sHeight === void 0) { sHeight = -1; }
        if (dx === void 0) { dx = 0; }
        if (dy === void 0) { dy = 0; }
        if (dWidth === void 0) { dWidth = -1; }
        if (dHeight === void 0) { dHeight = -1; }
        if (sWidth === -1)
            sWidth = source.width ? source.width : 0;
        if (sHeight === -1)
            sHeight = source.height ? source.height : 0;
        if (dWidth === -1)
            dWidth = this.element.width;
        if (dHeight === -1)
            dHeight = this.element.height;
        this.context.drawImage(source, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
    };
    XCupeCanvasElement.prototype.getDataUrl = function (mimeType, quality) {
        if (mimeType === void 0) { mimeType = "image/png"; }
        if (quality === void 0) { quality = 0.92; }
        if (mimeType !== 'image/jpg' && mimeType !== 'image/png' && mimeType !== 'image/webp') {
            throw new Error("Incorrect mimetype provided (" + mimeType + "). Accepted values are png|jpg|webp.");
        }
        switch (mimeType) {
            case 'image/png':
                return this.element.toDataURL();
            default:
                if (quality < 0 || quality > 1) {
                    console.error("Image quality must be between 0 and 1. Provided " + quality + ". Setting quality to 1.");
                    quality = 1;
                }
                return this.element.toDataURL(mimeType, quality);
        }
    };
    return XCupeCanvasElement;
})();
var XCupe = (function (_super) {
    __extends(XCupe, _super);
    function XCupe() {
        _super.apply(this, arguments);
        this.controller = null;
        this.mousedownListener = null;
        this.mousemoveListener = null;
        this.mouseupListener = null;
        this.dropListener = null;
        this.moveImage = null;
        this.numberX = 0;
    }
    XCupe.prototype.createdCallback = function () {
        this.controller = new XCupeController(this);
        this.mousedownListener = this.mousedown.bind(this);
        this.mousemoveListener = this.mousemove.bind(this);
        this.mouseupListener = this.mouseup.bind(this);
        this.dropListener = this.drop.bind(this);
        this.addEventListener('mousedown', this.mousedownListener);
        this.addEventListener('touchstart', this.mousedownListener);
        this.settings = {
            height: this.getAttribute('height') ? parseInt(this.getAttribute('height')) : 500,
            width: this.getAttribute('width') ? parseInt(this.getAttribute('width')) : 500,
            crop: this.getAttribute('crop') ? this.getAttribute('crop').trim().toLowerCase() === 'true' : true,
            align: this.getAttribute('align') || 'center',
            allowMove: this.getAttribute('allow-move') ? this.getAttribute('allow-move').trim().toLowerCase() === 'true' : true,
            allowDrop: this.getAttribute('allow-drop') ? this.getAttribute('allow-drop').trim().toLowerCase() === 'true' : true,
            allowSelect: this.getAttribute('allow-select') ? this.getAttribute('allow-select').trim().toLowerCase() === 'true' : true,
            name: this.getAttribute('name') || ''
        };
        this.controller.canvas.setDimensions({ width: this.settings.width, height: this.settings.height });
        this.moveImage = {
            applied: false,
            timeout: null,
            position: { x: 0, y: 0 },
            crop: null
        };
        this.ondragover = function () { return false; };
        this.addEventListener('drop', this.dropListener);
        console.log(this.settings.name);
        this.controller.inputText.name(this.settings.name);
    };
    XCupe.prototype.attributeChangedCallback = function (attribute, oldVal, newVal) {
        switch (attribute) {
            case 'height':
                this.settings.height = parseInt(newVal);
                this.controller.redrawImage(Step.Resize);
                break;
            case 'width':
                this.settings.width = parseInt(newVal);
                this.controller.redrawImage(Step.Resize);
                break;
            case 'crop':
                this.settings.crop = newVal.trim().toLowerCase() === 'true';
                this.controller.redrawImage(Step.Resize);
                break;
            case 'align':
                this.settings.align = newVal.toLowerCase();
                this.controller.redrawImage(Step.Crop);
                break;
            case 'allow-move':
                this.settings.allowMove = newVal.trim().toLowerCase() === 'true';
                break;
            case 'allow-select':
                this.settings.allowSelect = newVal.trim().toLowerCase() === 'true';
                break;
            case 'allow-drop':
                this.settings.allowDrop = newVal.trim().toLowerCase() === 'true';
                break;
            case 'name':
                this.settings.name = newVal;
                if (this.controller.inputText) {
                    this.controller.inputText.name(newVal);
                }
                break;
        }
    };
    XCupe.prototype.mousedown = function (event) {
        var _this = this;
        event.preventDefault();
        this.numberX = Math.random();
        var currentX = (event.changedTouches && event.changedTouches[0]) ? event.changedTouches[0].pageX : event.pageX;
        var currentY = (event.changedTouches && event.changedTouches[0]) ? event.changedTouches[0].pageY : event.pageY;
        this.moveImage =
            {
                applied: false,
                timeout: null,
                position: { x: currentX, y: currentY },
                crop: this.controller.getCrop()
            };
        document.addEventListener('mouseup', this.mouseupListener);
        document.addEventListener('touchend', this.mouseupListener);
        if (this.controller.isImageDrawn && this.settings.allowMove) {
            this.moveImage.timeout = setTimeout(function () {
                _this.moveImage.applied = true;
                document.addEventListener('mousemove', _this.mousemoveListener);
                document.addEventListener('touchmove', _this.mousemoveListener);
            }, 150);
        }
    };
    XCupe.prototype.mousemove = function (event) {
        var _this = this;
        event.preventDefault();
        console.log('mouseMOVE!');
        if (event.changedTouches && event.changedTouches.length > 1)
            return;
        var currentX = (event.changedTouches && event.changedTouches[0]) ? event.changedTouches[0].pageX : event.pageX;
        var currentY = (event.changedTouches && event.changedTouches[0]) ? event.changedTouches[0].pageY : event.pageY;
        console.log('ZUZUZU');
        var newCropTop = this.moveImage.crop.top - (currentY - this.moveImage.position.y);
        var newCropLeft = this.moveImage.crop.left - (currentX - this.moveImage.position.x);
        this.controller.setCrop(newCropTop, newCropLeft);
        console.log(newCropTop, newCropLeft);
        var drawCallack = function () { _this.controller.redrawImage.call(_this.controller, Step.Draw); };
        requestAnimationFrame(drawCallack);
    };
    XCupe.prototype.mouseup = function () {
        event.preventDefault();
        console.log('mouseUP!');
        clearTimeout(this.moveImage.timeout);
        document.removeEventListener('mouseup', this.mouseupListener);
        document.removeEventListener('touchend', this.mouseupListener);
        if (this.moveImage.applied) {
            document.removeEventListener('mousemove', this.mousemoveListener);
            document.removeEventListener('touchmove', this.mousemoveListener);
            this.moveImage.applied = false;
            this.controller.redrawImage(Step.Draw);
        }
        else {
            if (this.settings.allowSelect) {
                this.controller.inputFile.open();
            }
        }
    };
    XCupe.prototype.drop = function (event) {
        event.preventDefault();
        if (this.settings.allowDrop) {
            this.controller.readAndDrawImage(event.dataTransfer.files);
        }
        return false;
    };
    XCupe.prototype.getContent = function (contentType, mimeType, quality) {
        if (contentType === void 0) { contentType = OutputType.DataUrl; }
        if (mimeType === void 0) { mimeType = "image/png"; }
        if (quality === void 0) { quality = 0.92; }
        return this.controller.getContent.apply(this.controller, arguments);
    };
    return XCupe;
})(HTMLInputElement);
var XCupeController = (function () {
    function XCupeController(xcupe) {
        this.element = null;
        this.shadow = null;
        this.inputText = null;
        this.inputFile = null;
        this.canvas = null;
        this.originalImage = null;
        this.workingImage = null;
        this.crop = { top: 0, left: 0 };
        this.isImageDrawn = false;
        this.element = xcupe;
        this.setupComponent();
    }
    XCupeController.prototype.setupComponent = function () {
        // Create a shadow root
        this.shadow = this.element['createShadowRoot']();
        // stamp out our template in the shadow dom
        var template = owner.querySelector("#template").content.cloneNode(true);
        this.shadow.appendChild(template);
        // Create input[type="text"] for saving result and easy sending in form;
        // cannot be inside of element because of web compontents's encapsulation
        var inputText = document.createElement('input');
        inputText.style.display = 'none';
        this.element.appendChild(inputText);
        this.canvas = new XCupeCanvasElement(this.shadow.querySelector('canvas'));
        this.inputText = new XCupeInputTextElement(inputText);
        this.inputFile = new XCupeInputFileElement(this.shadow.querySelector('input[type="file"]'), this);
    };
    XCupeController.prototype.redrawImage = function (step, newOriginal, reverse) {
        if (step === void 0) { step = Step.Resize; }
        if (reverse === void 0) { reverse = false; }
        if (newOriginal) {
            this.originalImage = newOriginal;
            step = Step.Resize;
        }
        if (!this.originalImage)
            return; // there's nothing to process
        // resize
        if ((step <= Step.Resize && !reverse) || (step >= Step.Resize && reverse)) {
            var newDimensions = this.getResizeDimensions({ width: this.originalImage.width, height: this.originalImage.height }, { width: this.element.settings.width, height: this.element.settings.height }, this.element.settings.crop);
            this.canvas.setDimensions(newDimensions.canvas);
            this.workingImage = this.scaleImage(this.originalImage, newDimensions.image);
        }
        // crop
        if ((step <= Step.Crop && this.element.settings.crop && !reverse) || (step >= Step.Crop && reverse)) {
            var crop = this.convertCropToPx({ width: this.workingImage.width, height: this.workingImage.height }, this.canvas.getDimensions(), this.element.settings.align);
            this.setCrop(crop.top, crop.left);
        }
        // draw
        if ((step <= Step.Draw && !reverse) || (step >= Step.Draw && reverse)) {
            this.draw();
        }
    };
    XCupeController.prototype.readFile = function (file) {
        return new Promise(function (resolve, reject) {
            if (file[0]) {
                file = file[0]; // can read only first file
            }
            if (file instanceof Blob) {
                if (!file.type.match(/image.*/)) {
                    reject('Unsupported file type.');
                }
                var fileReader = new FileReader();
                fileReader.onerror = function () { }; // TODO
                fileReader.onprogress = function () { }; // TODO
                fileReader.onload = function () {
                    resolve(fileReader.result);
                };
                fileReader.readAsArrayBuffer(file);
            }
        });
    };
    XCupeController.prototype.loadImage = function (data) {
        return new Promise(function (resolve, reject) {
            var arrayBufferView = new Uint8Array(data);
            var imageBlob = window.URL.createObjectURL(new Blob([arrayBufferView], { type: "image/jpeg" }));
            var image = new Image();
            image.onload = function () { return resolve(image); };
            image.src = imageBlob;
        });
    };
    /**
     * Shorthand. It reads image file, loads image and draws resized & cropped image.
     */
    XCupeController.prototype.readAndDrawImage = function (file) {
        var _this = this;
        return this.readFile(file)
            .then(function (fileContent) {
            return _this.loadImage(fileContent);
        })
            .then(function (image) {
            _this.redrawImage(Step.Resize, image);
            window.URL.revokeObjectURL(image.src);
        });
    };
    /**
     * There is dropped image and canvas with fixed dimensions. This function calculates new image and canvas dimensions.
     * Possible scenarios:
     * 	- Image is bigger then canvas and should scale down (with and without cropping)
     *  - Image is bigger then canvas and canvas should scale up
     *  - Image is smaller then canvas and should scale up (with and without cropping)
     *  - Image is smaller then canvas and canvas should scale down
     *
     * @param {object} image - width and height of dropped image
     * @param {object} canvas - width and height of canvas
     * @return {object} - new dimensions for image and canvas
     */
    XCupeController.prototype.getResizeDimensions = function (image, canvas, crop) {
        var imageToCanvasRatio = {
            width: image.width / canvas.width,
            height: image.height / canvas.height
        };
        // scaling canvas
        if (canvas.width === -1 || canvas.height === -1) {
            if (canvas.width === -1 && canvas.height === -1) {
                canvas = image;
            }
            else if (canvas.width === -1) {
                canvas.width = Math.round(image.width / imageToCanvasRatio.height);
            }
            else if (canvas.height === -1) {
                canvas.height = Math.round(image.height / imageToCanvasRatio.width);
            }
            image = canvas;
        }
        else {
            if ((crop && imageToCanvasRatio.width < imageToCanvasRatio.height) // width fixed, height has to be adjusted
                || (!crop && imageToCanvasRatio.width > imageToCanvasRatio.height)) {
                image.width = canvas.width;
                image.height = Math.round(image.height / imageToCanvasRatio.width);
            }
            else {
                image.width = Math.round(image.width / imageToCanvasRatio.height); // height fixed, width has to be adjusted
                image.height = canvas.height;
            }
        }
        return { image: image, canvas: crop ? canvas : image };
    };
    /**
     * Resizes image as many times as needed (based on quality) to match specified dimensions.
     *
     * @param {object} image - image to be scaled
     * @param {object} dimensions - final dimensions of image
     * @param {number} quality - how many re-renders should happen
     * @return {object} - canvas element with image
     */
    XCupeController.prototype.scaleImage = function (image, dimensions, quality) {
        if (quality === void 0) { quality = 3; }
        var step = {
            width: (dimensions.width - image.width) * (1 / quality),
            height: (dimensions.height - image.height) * (1 / quality)
        };
        var lastSize = { width: image.width, height: image.height };
        var newSize = lastSize;
        // one canvas huge, for fast redrawing
        var tempNewSize = { width: image.width + step.width, height: image.height + step.height };
        var offScreenCanvas = new XCupeCanvasElement();
        offScreenCanvas.setDimensions({
            width: dimensions.width > tempNewSize.width ? dimensions.width : tempNewSize.width,
            height: dimensions.height > tempNewSize.height ? dimensions.height : tempNewSize.height });
        // one canvas small, for final image
        var workingCanvas = new XCupeCanvasElement();
        workingCanvas.setDimensions(dimensions);
        for (var i = 1; i < quality; i++) {
            newSize =
                {
                    width: lastSize.width + step.width,
                    height: lastSize.height + step.height
                };
            offScreenCanvas.drawImage(i === 1 ? image : offScreenCanvas.element, 0, 0, lastSize.width, lastSize.height, 0, 0, newSize.width, newSize.height);
            lastSize = newSize;
        }
        workingCanvas.drawImage(offScreenCanvas.element, 0, 0, lastSize.width, lastSize.height);
        return workingCanvas.element;
    };
    /**
     * Set crops limits
     */
    XCupeController.prototype.convertCropToPx = function (image, canvas, cropString) {
        var parts = cropString.split(' ');
        var crop = { top: 'center', left: 'center' };
        if (parts.indexOf('left') >= 0)
            crop.left = 'left';
        if (parts.indexOf('right') >= 0)
            crop.left = 'right';
        if (parts.indexOf('top') >= 0)
            crop.top = 'top';
        if (parts.indexOf('bottom') >= 0)
            crop.top = 'bottom';
        switch (crop.top) {
            case 'top':
                crop.top = 0;
                break;
            case 'center':
                crop.top = image.height > canvas.height ? image.height / 2 - canvas.height / 2 : 0;
                break;
            case 'bottom':
                crop.top = image.height > canvas.height ? image.height - canvas.height : 0;
                break;
        }
        switch (crop.left) {
            case 'left':
                crop.left = 0;
                break;
            case 'center':
                crop.left = image.width > canvas.width ? image.width / 2 - canvas.width / 2 : 0;
                break;
            case 'right':
                crop.left = image.width > canvas.width ? image.width - canvas.width : 0;
                break;
        }
        return crop;
    };
    XCupeController.prototype.getCrop = function () {
        return { top: 0 - this.crop.top, left: 0 - this.crop.left };
    };
    XCupeController.prototype.setCrop = function (top, left) {
        if (top < 0) {
            top = 0;
        }
        if (left < 0) {
            left = 0;
        }
        if (this.workingImage.height <= this.canvas.getDimensions().height + top) {
            top = this.workingImage.height - this.canvas.getDimensions().height;
        }
        if (this.workingImage.width <= this.canvas.getDimensions().width + left) {
            left = this.workingImage.width - this.canvas.getDimensions().width;
        }
        this.crop = { left: 0 - left, top: 0 - top };
    };
    XCupeController.prototype.draw = function () {
        var crop = this.element.settings.crop;
        this.isImageDrawn = true;
        this.canvas.context.clearRect(0, 0, this.canvas.getDimensions().width, this.canvas.getDimensions().height);
        this.canvas.context.drawImage(this.workingImage, crop ? this.crop.left : 0, crop ? this.crop.top : 0);
        if (!this.element.moveImage.applied) {
            this.saveToInput();
        }
    };
    XCupeController.prototype.getContent = function (contentType, mimeType, quality) {
        if (contentType === void 0) { contentType = OutputType.DataUrl; }
        if (mimeType === void 0) { mimeType = "image/png"; }
        if (quality === void 0) { quality = 0.92; }
        switch (contentType) {
            case OutputType.Context:
                return this.canvas.context;
            case OutputType.DataUrl:
                return this.canvas.getDataUrl(mimeType, quality);
            case OutputType.Blob:
                throw new Error('Getting content as Blob isn\'t implemented yet, as it is currenty supported just by Firefox.');
            // return this.canvas.getBlob( mimeType, quality );
            // break;
            default:
                throw new Error('Incorrect contentType.');
        }
    };
    XCupeController.prototype.saveToInput = function () {
        if (this.element.settings.name) {
            this.inputText.val(this.getContent());
        }
    };
    return XCupeController;
})();
var XCupeGallery = (function (_super) {
    __extends(XCupeGallery, _super);
    function XCupeGallery() {
        _super.apply(this, arguments);
        this.controller = null;
        this.clickListener = null;
        this.dropListener = null;
    }
    XCupeGallery.prototype.createdCallback = function () {
        this.controller = new XCupeGalleryController(this);
        this.clickListener = this.clicked.bind(this);
        this.dropListener = this.drop.bind(this);
        this.addEventListener('click', this.clickListener);
        this.addEventListener('drop', this.dropListener);
        this.ondragover = function () { return false; };
        this.settings = {
            height: this.getAttribute('height') ? parseInt(this.getAttribute('height')) : 500,
            width: this.getAttribute('width') ? parseInt(this.getAttribute('width')) : 500,
            crop: this.getAttribute('crop') ? this.getAttribute('crop').trim().toLowerCase() === 'true' : true,
            align: this.getAttribute('align') || 'center',
            allowMove: this.getAttribute('allow-move') ? this.getAttribute('allow-move').trim().toLowerCase() === 'true' : true,
            allowDrop: this.getAttribute('allow-drop') ? this.getAttribute('allow-drop').trim().toLowerCase() === 'true' : true,
            allowSelect: this.getAttribute('allow-select') ? this.getAttribute('allow-select').trim().toLowerCase() === 'true' : true,
            name: this.getAttribute('name') ? this.getAttribute('name') + '[]' : ''
        };
    };
    XCupeGallery.prototype.attributeChangedCallback = function (attribute, oldVal, newVal) {
        var applyOnChildren = true; // when true attribute change will be applied to children - <x-cupe> elements
        switch (attribute) {
            case 'height':
                this.settings.height = parseInt(newVal);
                break;
            case 'width':
                this.settings.width = parseInt(newVal);
                break;
            case 'crop':
                this.settings.crop = newVal.trim().toLowerCase() === 'true';
                break;
            case 'align':
                this.settings.align = newVal.toLowerCase().trim();
                break;
            case 'allow-move':
                this.settings.allowMove = newVal.trim().toLowerCase() === 'true';
                break;
            case 'allow-select':
                this.settings.allowSelect = newVal.trim().toLowerCase() === 'true';
                applyOnChildren = false;
                break;
            case 'allow-drop':
                this.settings.allowDrop = newVal.trim().toLowerCase() === 'true';
                applyOnChildren = false;
                break;
            case 'name':
                newVal = newVal + '[]';
                this.settings.name = newVal;
                break;
        }
        if (applyOnChildren) {
            this.controller.updateChildAttribute(attribute, oldVal, newVal);
        }
    };
    XCupeGallery.prototype.clicked = function (event) {
        event.stopPropagation();
        event.preventDefault();
        if (event.path[0] === this && this.settings.allowSelect) {
            this.controller.inputFile.open();
        }
    };
    XCupeGallery.prototype.drop = function (event) {
        event.preventDefault();
        if (this.settings.allowDrop) {
            this.controller.readAndDrawImage(event.dataTransfer.files);
        }
        return false;
    };
    XCupeGallery.prototype.getContent = function () {
        return this.controller.getContent.apply(this.controller, arguments);
    };
    return XCupeGallery;
})(HTMLElement);
var XCupeGalleryController = (function () {
    function XCupeGalleryController(xcupegallery) {
        this.element = null;
        this.shadow = null;
        this.inputFile = null;
        this.element = xcupegallery;
        this.setupComponent();
        this.shadow.removeChild(this.shadow.querySelector('canvas'));
    }
    XCupeGalleryController.prototype.setupComponent = function () {
        // Create a shadow root
        this.shadow = this.element['createShadowRoot']();
        // stamp out our template in the shadow dom
        var template = owner.querySelector("#template").content.cloneNode(true);
        this.shadow.appendChild(template);
        this.inputFile = new XCupeInputFileElement(this.shadow.querySelector('input[type="file"]'), this, true);
    };
    XCupeGalleryController.prototype.readAndDrawImage = function (files) {
        for (var _i = 0; _i < files.length; _i++) {
            var file = files[_i];
            var element = new window['HTMLXCupeElement']();
            var galleryAttributes = this.element.attributes;
            for (var i = 0; i < galleryAttributes.length; i++) {
                if (~['allow-drop', 'allow-select'].indexOf(galleryAttributes[i].name)) {
                    continue;
                }
                element.setAttribute(galleryAttributes[i].name, galleryAttributes[i].value);
            }
            element.controller.readAndDrawImage(file);
            this.element.appendChild(element);
        }
    };
    XCupeGalleryController.prototype.updateChildAttribute = function (attribute, oldVal, newVal) {
        this.getChildrenAsArray().forEach(function (xcupe) {
            xcupe.setAttribute(attribute, newVal);
        });
    };
    XCupeGalleryController.prototype.getContent = function (type, contentType, mimeType, quality) {
        if (type === void 0) { type = "Array"; }
        if (mimeType === void 0) { mimeType = "image/png"; }
        if (quality === void 0) { quality = 0.92; }
        type = type.toLowerCase();
        if (type !== 'map' || type !== 'array')
            throw new Error("Incorrect type for CupeGallery.getContent provided (" + type + "). Allowed values are Map|Array");
        var contentMap = new Map();
        var contentArray = [];
        this.getChildrenAsArray().forEach(function (xcupe) {
            var content = xcupe.getContent(contentType, mimeType, quality);
            if (type === 'map') {
                contentMap.set(xcupe, content);
            }
            else {
                contentArray.push(content);
            }
        });
        return (type === 'map') ? contentMap : contentArray;
    };
    XCupeGalleryController.prototype.getChildrenAsArray = function () {
        var children = this.element.querySelectorAll('x-cupe');
        return Array.prototype.slice.call(children, 0);
    };
    return XCupeGalleryController;
})();
window['HTMLXCupeElement'] = document['registerElement']('x-cupe', XCupe);
window['HTMLXCupeGalleryElement'] = document['registerElement']('x-cupe-gallery', XCupeGallery);
