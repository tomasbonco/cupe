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
    /**
     * Opens dialog to select image.
     */
    XCupeInputFileElement.prototype.open = function () {
        this.element.click();
    };
    /**
     * Applied when image selected
     * @param {Event} event - change event
     */
    XCupeInputFileElement.prototype.onChange = function (event) {
        this.controller.readAndDrawImage(event.target.files);
    };
    /**
     * Applied as callback of click event.
     * @param {MouseEvent} event - click event
     */
    XCupeInputFileElement.prototype.clicked = function (event) {
        event.stopPropagation();
    };
    return XCupeInputFileElement;
}());
var XCupeInputTextElement = (function () {
    function XCupeInputTextElement(element) {
        this.element = null;
        this.element = element;
    }
    /**
     * Setter/getter for value.
     * @param {string} newValue - new value
     * @return {string} value of input element
     */
    XCupeInputTextElement.prototype.val = function (newValue) {
        if (newValue) {
            this.element.value = newValue;
        }
        return this.element.value;
    };
    /**
     * Getter/setter for name.
     * @param {string} newValue - new name
     * @return {string} name of input element
     */
    XCupeInputTextElement.prototype.name = function (newValue) {
        if (newValue) {
            this.element.setAttribute('name', newValue);
        }
        return this.element.getAttribute('name');
    };
    return XCupeInputTextElement;
}());
var XCupeCanvasElement = (function () {
    function XCupeCanvasElement(element) {
        this.element = null;
        this.context = null;
        this.element = element ? element : document.createElement('canvas');
        this.context = this.element.getContext('2d');
    }
    /**
     * Sets canvas dimensions.
     * @param {Dimensions} newDimensions - new dimensions
     */
    XCupeCanvasElement.prototype.setDimensions = function (newDimensions) {
        this.element.width = newDimensions.width;
        this.element.height = newDimensions.height;
    };
    /**
     * Returns dimensions of canvas
     * @return {Dimensions} dimensions of canvas
     */
    XCupeCanvasElement.prototype.getDimensions = function () {
        return { width: this.element.width, height: this.element.height };
    };
    /**
     * Draws source to canvas.
     * @param {HTMLImageElement|HTMLVideoElement|HTMLCanvasElement} source - source images
     * @param {number} sx - x of source where to start
     * @param {number} sy - y of source where to start
     * @param {number} sWidth - width of source that will be drawn
     * @param {number} sHeight - height of source that will be drawn
     * @param {number} dx - x of destination where to start
     * @param {number} dy - y of destination where to start
     * @param {number} dWidth - width of destination box where source will be drawn
     * @param {number} dHeight - height of destination box where source will be drawn
     */
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
    /**
     * Saves image as DataURL (Base64 string).
     * @param {string} mimeType - format of image
     * @param {number} quality - quality of image
     * @return {string} Base64 representation of image
     */
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
}());
var XCupe = (function (_super) {
    __extends(XCupe, _super);
    function XCupe() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.controller = null;
        _this.mousedownListener = null;
        _this.mousemoveListener = null;
        _this.mouseupListener = null;
        _this.dropListener = null;
        _this.moveImage = null;
        _this.numberX = 0;
        return _this;
    }
    /**
     * Applied when element is created.
     */
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
            quality: this.getAttribute('quality') ? parseInt(this.getAttribute('quality')) : 3,
            crop: this.getAttribute('crop') ? this.getAttribute('crop').trim().toLowerCase() === 'true' : true,
            align: this.getAttribute('align') || 'center',
            allowMove: this.getAttribute('allow-move') ? this.getAttribute('allow-move').trim().toLowerCase() === 'true' : true,
            allowDrop: this.getAttribute('allow-drop') ? this.getAttribute('allow-drop').trim().toLowerCase() === 'true' : true,
            allowSelect: this.getAttribute('allow-select') ? this.getAttribute('allow-select').trim().toLowerCase() === 'true' : true,
            name: this.getAttribute('name') || '',
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
        this.controller.inputText.name(this.settings.name);
    };
    /**
     * Applied when attribute changes.
     * @param {string} attribute - name of changed attribute
     * @param {string} oldVal - old value
     * @param {string} - new value
     */
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
            case 'quality':
                this.settings.quality = parseInt(newVal);
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
    /**
     * Applied as callback of mousedown event.
     * @param {MouseEvent} event - mouse event
     */
    XCupe.prototype.mousedown = function (event) {
        var _this = this;
        event.preventDefault();
        if (event.button && event.button !== 1)
            return;
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
    /**
     * Applied as callback of mousemove event.
     * @param {MouseEvent} event - mouse event
     */
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
    /**
     * Applied as callback of mouseup event.
     */
    XCupe.prototype.mouseup = function () {
        event.preventDefault();
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
    /**
     * Applied as callback of drop event.
     * @param {Event} event - drop event
     */
    XCupe.prototype.drop = function (event) {
        event.preventDefault();
        if (this.settings.allowDrop) {
            this.controller.readAndDrawImage(event.dataTransfer.files);
        }
        return false;
    };
    /**
     * Returns content of x-cupe element.
     * @param {OutputType} contentType - type of output (check interface for allowed values)
     * @param {string} mimeType - if contentType returns image, this param can specify image format
     * @param {number} quality - quality if image format specified in mimeType supports quality
     * @return {any} image content in format based on contentType
     */
    XCupe.prototype.getContent = function (contentType, mimeType, quality) {
        if (contentType === void 0) { contentType = OutputType.DataUrl; }
        if (mimeType === void 0) { mimeType = "image/png"; }
        if (quality === void 0) { quality = 0.92; }
        return this.controller.getContent.apply(this.controller, arguments);
    };
    return XCupe;
}(HTMLElement));
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
    /**
     * Custom Element setup.
     */
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
    /**
     * Runs procedure of drawing (resizing, caluclating crop, drawing) from specified step in given order.
     * @param {Step} step - step to start with
     * @param {HTMLImageElement|HTMLCanvasElement} newOriginal - new image to processed; not required
     * @param {boolean} reverse - direction of procedure
     */
    XCupeController.prototype.redrawImage = function (step, newOriginal, reverse) {
        if (step === void 0) { step = Step.Resize; }
        if (reverse === void 0) { reverse = false; }
        if (newOriginal) {
            this.originalImage = newOriginal;
            step = Step.Resize;
        }
        if (!this.originalImage) {
            this.canvas.setDimensions({ width: this.element.settings.width, height: this.element.settings.height });
            return; // there's nothing to process
        }
        // resize
        if ((step <= Step.Resize && !reverse) || (step >= Step.Resize && reverse)) {
            var newDimensions = this.getResizeDimensions({ width: this.originalImage.width, height: this.originalImage.height }, { width: this.element.settings.width, height: this.element.settings.height }, this.element.settings.crop);
            this.canvas.setDimensions(newDimensions.canvas);
            this.workingImage = this.scaleImage(this.originalImage, newDimensions.image, this.element.settings.quality);
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
    /**
     * Reads image.
     * @param {Blobl|Blob[]} file - file to be read
     */
    XCupeController.prototype.readFile = function (file) {
        return new Promise(function (resolve, reject) {
            if (Array.isArray(file) || '0' in file) {
                file = file[0]; // can read only first file
            }
            if (file instanceof Blob) {
                if (!file.type.match(/image.*/)) {
                    reject('Unsupported file type.');
                }
                var fileReader_1 = new FileReader();
                fileReader_1.onerror = function () { }; // TODO
                fileReader_1.onprogress = function () { }; // TODO
                fileReader_1.onload = function () {
                    resolve(fileReader_1.result);
                };
                fileReader_1.readAsArrayBuffer(file);
            }
        });
    };
    /**
     * Converts image data into image.
     * @param {any} data - data to be converted
     * @return {Promise} promise of converted image
     */
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
     * @param {any} data - data to be converted
     * @param {Promise} promise of converted image
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
        if (quality < 1)
            quality = 1;
        if (quality > 25)
            quality = 5; // You crazy man?
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
            height: dimensions.height > tempNewSize.height ? dimensions.height : tempNewSize.height
        });
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
     * Converts align text into pixels.
     * @param {Dimensions} image - dimensions of original image
     * @param {Dimensions} canvas - dimensions of target (canvas) iumage
     * @param {string} cropString - alignment
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
    /**
     * Getter for crop.
     * @return {top: number, left: number} crop
     */
    XCupeController.prototype.getCrop = function () {
        return { top: 0 - this.crop.top, left: 0 - this.crop.left };
    };
    /**
     * Sets crop.
     * @param {number} top - top crop
     * @param {number} left - left crop
     */
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
    /**
     * Draws image into canvas.
     */
    XCupeController.prototype.draw = function () {
        var crop = this.element.settings.crop;
        this.isImageDrawn = true;
        this.canvas.context.clearRect(0, 0, this.canvas.getDimensions().width, this.canvas.getDimensions().height);
        this.canvas.context.drawImage(this.workingImage, crop ? this.crop.left : 0, crop ? this.crop.top : 0);
        if (!this.element.moveImage.applied) {
            this.saveToInput();
        }
    };
    /**
     * Returns content of x-cupe element.
     * @param {OutputType} contentType - type of output (check interface for allowed values)
     * @param {string} mimeType - if contentType returns image, this param can specify image format
     * @param {number} quality - quality if image format specified in mimeType supports quality
     * @return {any} image content in format based on contentType
     */
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
    /**
     * Saves Base64 represention of image into input.
     */
    XCupeController.prototype.saveToInput = function () {
        if (this.element.settings.name) {
            this.inputText.val(this.getContent());
        }
    };
    return XCupeController;
}());
var XCupeGallery = (function (_super) {
    __extends(XCupeGallery, _super);
    function XCupeGallery() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.controller = null;
        _this.clickListener = null;
        _this.dropListener = null;
        return _this;
    }
    /**
     * Applied when element is created.
     */
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
            quality: this.getAttribute('quality') ? parseInt(this.getAttribute('quality')) : 3,
            crop: this.getAttribute('crop') ? this.getAttribute('crop').trim().toLowerCase() === 'true' : true,
            align: this.getAttribute('align') || 'center',
            allowMove: this.getAttribute('allow-move') ? this.getAttribute('allow-move').trim().toLowerCase() === 'true' : true,
            allowDrop: this.getAttribute('allow-drop') ? this.getAttribute('allow-drop').trim().toLowerCase() === 'true' : true,
            allowSelect: this.getAttribute('allow-select') ? this.getAttribute('allow-select').trim().toLowerCase() === 'true' : true,
            name: this.getAttribute('name') ? this.getAttribute('name') + '[]' : '',
        };
    };
    /**
     * Applied when attribute changes.
     * @param {string} attribute - name of changed attribute
     * @param {string} oldVal - old value
     * @param {string} - new value
     */
    XCupeGallery.prototype.attributeChangedCallback = function (attribute, oldVal, newVal) {
        var applyOnChildren = true; // when true attribute change will be applied to children - <x-cupe> elements
        switch (attribute) {
            case 'height':
                this.settings.height = parseInt(newVal);
                break;
            case 'width':
                this.settings.width = parseInt(newVal);
                break;
            case 'quality':
                this.settings.quality = parseInt(newVal);
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
    /**
     * Applied as callback of click event.
     * @param {MouseEvent} event - click event
     */
    XCupeGallery.prototype.clicked = function (event) {
        event.stopPropagation();
        event.preventDefault();
        if (event.path[0] === this && this.settings.allowSelect) {
            this.controller.inputFile.open();
        }
    };
    /**
     * Applied as callback of drop event.
     * @param {Event} event - drop event
     */
    XCupeGallery.prototype.drop = function (event) {
        event.preventDefault();
        if (this.settings.allowDrop) {
            this.controller.readAndDrawImage(event.dataTransfer.files);
        }
        return false;
    };
    /**
     * Returns content of x-cupe element.
     * @param {OutputType} contentType - type of output (check interface for allowed values)
     * @param {string} mimeType - if contentType returns image, this param can specify image format
     * @param {number} quality - quality if image format specified in mimeType supports quality
     * @return {any} image content in format based on contentType
     */
    XCupeGallery.prototype.getContent = function () {
        return this.controller.getContent.apply(this.controller, arguments);
    };
    return XCupeGallery;
}(HTMLElement));
var XCupeGalleryController = (function () {
    function XCupeGalleryController(xcupegallery) {
        this.element = null;
        this.shadow = null;
        this.inputFile = null;
        this.element = xcupegallery;
        this.setupComponent();
        this.shadow.removeChild(this.shadow.querySelector('canvas'));
    }
    /**
     * Custom Element setup.
     */
    XCupeGalleryController.prototype.setupComponent = function () {
        // Create a shadow root
        this.shadow = this.element['createShadowRoot']();
        // stamp out our template in the shadow dom
        var template = owner.querySelector("#template").content.cloneNode(true);
        this.shadow.appendChild(template);
        this.inputFile = new XCupeInputFileElement(this.shadow.querySelector('input[type="file"]'), this, true);
    };
    /**
     * It reads image files loads image and creates x-cupe elements.
     * @param {any} files - data to be converted
     * @param {Promise} promise of converted image
     */
    XCupeGalleryController.prototype.readAndDrawImage = function (files) {
        if (!Array.isArray(files)) {
            files = [files];
        }
        for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
            var file = files_1[_i];
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
    /**
     * Updates attibutes to children X-Cupe elements.
     * @param {string} attribute - name of changed attribute
     * @param {string} oldVal - old value
     * @param {string} - new value
     */
    XCupeGalleryController.prototype.updateChildAttribute = function (attribute, oldVal, newVal) {
        this.getChildrenAsArray().forEach(function (xcupe) {
            xcupe.setAttribute(attribute, newVal);
        });
    };
    /**
     * Returns content of x-cupe elements.
     * @param {string} type - Array or Map
     * @param {OutputType} contentType - type of output (check interface for allowed values)
     * @param {string} mimeType - if contentType returns image, this param can specify image format
     * @param {number} quality - quality if image format specified in mimeType supports quality
     * @return {any} image content in format based on contentType
     */
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
    /**
     * Returns children X-Cupe elements as array.
     * @return {XCupe[]} X-Cupe elements
     */
    XCupeGalleryController.prototype.getChildrenAsArray = function () {
        var children = this.element.querySelectorAll('x-cupe');
        return Array.prototype.slice.call(children, 0);
    };
    return XCupeGalleryController;
}());
window['HTMLXCupeElement'] = document['registerElement']('x-cupe', XCupe);
window['HTMLXCupeGalleryElement'] = document['registerElement']('x-cupe-gallery', XCupeGallery);
