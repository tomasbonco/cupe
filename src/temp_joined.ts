let owner = (document['_currentScript'] || document['currentScript']).ownerDocument;

enum Step { Resize, Crop, Draw }

interface Dimensions
{
	width: number;
	height: number;
}
class XCupeInputFileElement
{
	element: HTMLInputElement = null;
	controller: XCupeController|XCupeGalleryController = null;
	
	changeListener: ()=>{} = null;
	clickListener: ()=>{} = null;
	
	constructor( element: HTMLInputElement, controller: XCupeController|XCupeGalleryController, multiple: boolean = false )
	{
		this.element = element;
		this.controller = controller;
		
		if ( multiple )
		{
			this.element.setAttribute( 'multiple', 'true' );
		}
		
		this.changeListener = this.onChange.bind( this )
		this.clickListener = this.clicked.bind( this )
		
		this.element.addEventListener('change', this.changeListener )
		this.element.addEventListener('click', this.clickListener )
	}
	
	open()
	{
		this.element.click()
	}
	
	onChange( event )
	{
		this.controller.readFile( event.target.files )
	}
	
	clicked( event: Event )
	{
		event.stopPropagation()
	}
}
class XCupeInputTextElement
{
	element: HTMLInputElement = null;
	
	constructor( element: HTMLInputElement )
	{
		this.element = element;
	}
	
	val( newValue?: string ): string
	{
		if ( newValue )
		{
			this.element.value = newValue;
		}
		
		return this.element.value
	}
}

class XCupeCanvasElement
{
	element: HTMLCanvasElement = null;
	context: CanvasRenderingContext2D = null;
	
    constructor( element?: HTMLCanvasElement )
	{
        this.element = element ? element : document.createElement('canvas');
        this.context = this.element.getContext('2d');
    }
	
    setDimensions( newDimensions: Dimensions, height?: number ): void
	{
        this.element.width = newDimensions.width;
        this.element.height = newDimensions.height;
    }
	
    getDimensions(): Dimensions
	{
        return { width: this.element.width, height: this.element.height };
    }
	
	// HTMLImageElement|HTMLVideoElement|HTMLCanvasElement|ImageBitmap
	drawImage( source: HTMLImageElement|HTMLVideoElement|HTMLCanvasElement, sx: number = 0, sy: number = 0, sWidth: number = -1, sHeight: number = -1, dx: number = 0, dy: number = 0, dWidth: number = -1, dHeight: number = -1 ): void
	{
		if ( sWidth === -1 ) sWidth = source.width ? source.width : 0;
		if ( sHeight === -1 ) sHeight = source.height ? source.height : 0;
		
		if ( dWidth === -1 ) dWidth = this.element.width;
		if ( dHeight === -1 ) dHeight = this.element.height;
		
		this.context.drawImage( source, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight )
	}
}
class XCupe extends HTMLElement
{
	controller: XCupeController = null;
	mousedownListener: ()=>{} = null;
	mousemoveListener: ()=>{} = null;
	mouseupListener: ()=>{} = null;
	dropListener: ()=>{} = null;
	
	moveImage = null;
	
	createdCallback()
	{
		this.controller = new XCupeController( this );
		
		this.controller.canvas.setDimensions( { width: 500, height: 500} );
	
		this.mousedownListener = this.mousedown.bind( this )
		this.mousemoveListener = this.mousemove.bind( this )
		this.mouseupListener = this.mouseup.bind( this )
		this.dropListener = this.drop.bind( this )
		
		this.addEventListener( 'mousedown', this.mousedownListener )
		this.addEventListener( 'touchstart', this.mousedownListener )
		
		
		this.ondragover = ()=> { return false; }
		this.addEventListener( 'drop', this.dropListener )
		
		this.style.display = 'inline-block'
	}

	attributeChangedCallback(attribute, oldVal, newVal)
	{
		switch ( attribute )
		{
			case 'crop':
			
				// this.controller.convertCropToPx( newVal );
		}
	}
	
	mousedown( event )
	{
		this.moveImage =
		{
			applied: false,
			timeout: null,
			position: { x: event.pageX, y: event.pageY },
			crop: this.controller.getCrop()
		};
	
		document.addEventListener( 'mouseup', this.mouseupListener )
		document.addEventListener( 'touchend', this.mouseupListener )
		
		this.moveImage.timeout = setTimeout(()=>
		{
			this.moveImage.applied = true
			document.addEventListener( 'mousemove', this.mousemoveListener )
			document.addEventListener( 'touchmove', this.mousemoveListener )
		}, 150 )
	}
	
	mousemove( event )
	{		
		let newCropTop =  this.moveImage.crop.top - ( event.pageY - this.moveImage.position.y )
		let newCropLeft =  this.moveImage.crop.left - ( event.pageX - this.moveImage.position.x )
		
		this.controller.setCrop( newCropTop, newCropLeft )
		
		let drawCallack = this.controller.draw.bind(this.controller)
		requestAnimationFrame( drawCallack )
	}
	
	mouseup()
	{
		clearTimeout( this.moveImage.timeout )
		
		document.removeEventListener( 'mouseup', this.mouseupListener )
		document.removeEventListener( 'touchend', this.mouseupListener )
		
		if ( this.moveImage.applied )
		{
			document.removeEventListener( 'mousemove', this.mousemoveListener )
			document.removeEventListener( 'touchmove', this.mousemoveListener )
		}
		
		else
		{
			this.controller.inputFile.open()
		}
	}
	
	drop( event )
	{
		event.preventDefault()
		
		this.controller.readFile( event.dataTransfer.files )
		
		return false
	}
}
class XCupeController
{
	element: XCupe = null;
	shadow: HTMLElement = null;
	inputText: XCupeInputTextElement = null;
	inputFile: XCupeInputFileElement = null;
	canvas: XCupeCanvasElement = null;
	
	originalImage = <HTMLImageElement|HTMLCanvasElement> null;
	workingImage: HTMLCanvasElement = null;
	
	crop = { top: 0, left: 0, apply: true }
	
	settings = {
		crop: 'center'
	}; // TODO: Interface
	
	constructor( xcupe: XCupe )
	{
		this.element = xcupe;
		this.setupComponent();
	}

	setupComponent()
	{
		// Create a shadow root
		this.shadow = this.element['createShadowRoot']();
		
		// stamp out our template in the shadow dom
		let template = owner.querySelector("#template").content.cloneNode(true);
		this.shadow.appendChild(template);
		
		this.canvas = new XCupeCanvasElement( <HTMLCanvasElement> this.shadow.querySelector('canvas') )
		this.inputText = new XCupeInputTextElement( <HTMLInputElement> this.shadow.querySelector('input[type="text"]') )
		this.inputFile = new XCupeInputFileElement( <HTMLInputElement> this.shadow.querySelector('input[type="file"]'), this )
	}
	
	
	redrawImage( step: Step = Step.Resize, newOriginal?: HTMLImageElement|HTMLCanvasElement )
	{
		if ( newOriginal )
		{
			this.originalImage = newOriginal;
			step = Step.Resize;
		}
		
		if ( ! this.originalImage ) return; // there's nothing to process
		
		
		// resize
		if ( step <= Step.Resize )
		{
			let newDimensions = this.getResizeDimensions( { width: this.originalImage.width, height: this.originalImage.height}, this.canvas.getDimensions(), this.crop.apply);
		
			this.canvas.setDimensions( newDimensions.canvas )
			
			this.workingImage = this.scaleImage( this.originalImage, newDimensions.image )
		}
		
		// crop
		if ( step <= Step.Crop )
		{
			let crop = this.convertCropToPx( { width: this.workingImage.width, height: this.workingImage.height }, this.canvas.getDimensions(), this.settings.crop )
			this.setCrop( crop.top, crop.left );
		}
		
		// draw
		if ( step <= Step.Draw )
		{
			this.draw()
		}
	}
	
	
	readFile( file )
	{
        if ( file[0] )
        {
            file = file[0]; // can read only first file
        }
		
		if ( ! file.type.match(/image.*/)) return;
		
		let fileReader = new FileReader()
		
		fileReader.onerror = ()=>{} // TODO
		fileReader.onprogress = ()=>{} // TODO
		
		fileReader.onload = ()=>
		{
			this.loadImage( fileReader.result ).then(( image: HTMLImageElement )=>
			{
				this.redrawImage( Step.Resize, image );
				window.URL.revokeObjectURL( image.src )
			})
		}
		
		fileReader.readAsArrayBuffer( file )
	}
	
	
	loadImage( data )
	{
		return new window['Promise'](( resolve, reject )=>
		{
			let arrayBufferView = new Uint8Array( data )
			let imageBlob = window.URL.createObjectURL( new Blob([ arrayBufferView ], { type: "image/jpeg" } ));
			let image = new Image()
			
			image.onload = ()=> resolve( image )
			image.src = imageBlob
		});
	}
	
	
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
	getResizeDimensions( image: Dimensions, canvas: Dimensions, crop: boolean )
	{
		let imageToCanvasRatio =
		{
			width: image.width / canvas.width,
			height: image.height / canvas.height
		}
		
		// scaling canvas
		if ( canvas.width === -1 || canvas.height === -1 )
		{
			if ( canvas.width === -1 && canvas.height === -1 )
			{
				canvas = image
			}
			
			else if ( canvas.width === -1 )
			{
				canvas.width = Math.round( image.width / imageToCanvasRatio.height )
			}
			
			else if ( canvas.height === -1 )
			{
				canvas.height = Math.round( image.height / imageToCanvasRatio.width )
			}
		}
		
		// scaling image
		else
		{
			if ( ( crop && imageToCanvasRatio.width < imageToCanvasRatio.height )  // width fixed, height has to be adjusted
			|| ( ! crop && imageToCanvasRatio.width > imageToCanvasRatio.height ))
			{
				image.width = canvas.width
				image.height = Math.round( image.height / imageToCanvasRatio.width )
			}
			
			else
			{
				image.width = Math.round( image.width / imageToCanvasRatio.height ) // height fixed, width has to be adjusted
				image.height = canvas.height
			}
		}
		
		return { image: image, canvas: canvas }
	}
	
	/**
	 * Resizes image as many times as needed (based on quality) to match specified dimensions.
	 * 
	 * @param {object} image - image to be scaled
	 * @param {object} dimensions - final dimensions of image
	 * @param {number} quality - how many re-renders should happen
	 * @return {object} - canvas element with image
	 */
	scaleImage( image: HTMLImageElement|HTMLCanvasElement, dimensions: Dimensions, quality: number = 3 ): HTMLCanvasElement
	{
		let step: Dimensions =
		{
			width: (dimensions.width - image.width) * ( 1 / quality ),
			height: (dimensions.height - image.height) * ( 1 / quality )
		}
		
		let lastSize: Dimensions = { width: image.width, height: image.height }
		let newSize: Dimensions = lastSize;
		
		
		// one canvas huge, for fast redrawing
		let tempNewSize: Dimensions = { width: image.width + step.width, height: image.height + step.height }
		
		let offScreenCanvas: XCupeCanvasElement = new XCupeCanvasElement()
		offScreenCanvas.setDimensions({
			width: dimensions.width > tempNewSize.width ? dimensions.width : tempNewSize.width,
			height: dimensions.height > tempNewSize.height ? dimensions.height : tempNewSize.height })
		
		// one canvas small, for final image
		let workingCanvas: XCupeCanvasElement = new XCupeCanvasElement()
		workingCanvas.setDimensions( dimensions )
		
		for( let i = 1; i < quality; i++ )
		{
			newSize = 
			{
				width: lastSize.width + step.width,
				height: lastSize.height + step.height
			}
		
			offScreenCanvas.drawImage( i === 1 ? image : offScreenCanvas.element, 0, 0, lastSize.width, lastSize.height, 0, 0, newSize.width, newSize.height)
			
			lastSize = newSize;
		}
		
		workingCanvas.drawImage( offScreenCanvas.element, 0, 0, lastSize.width, lastSize.height )
		
		return workingCanvas.element
	}
	
	
	/**
	 * Set crops limits
	 */
	
	convertCropToPx( image: Dimensions, canvas: Dimensions, cropString: string )
	{
		let parts = cropString.split(' ');
		let crop = { top: <any> 'center', left: <any> 'center' }
		
		if ( parts.indexOf( 'left' ) >= 0 ) crop.left = 'left';
		if ( parts.indexOf( 'right' ) >= 0 ) crop.left = 'right';
		if ( parts.indexOf( 'top' ) >= 0 ) crop.top = 'top';
		if ( parts.indexOf( 'bottom' ) >= 0 ) crop.top = 'bottom';
		
		switch ( crop.top )
		{
			case 'top':
			
				crop.top = 0;
				break;
			
			case 'center':
				
				crop.top = image.height > canvas.height ? image.height / 2 - canvas.height / 2 : 0
				break;
				
			case 'bottom':
			
				crop.top = image.height > canvas.height ? image.height - canvas.height : 0
				break;
		}
		
		
		switch ( crop.left )
		{
			case 'left':
			
				crop.left = 0;
				break;
			
			case 'center':
				
				crop.left = image.width > canvas.width ? image.width / 2 - canvas.width / 2 : 0
				break;
				
			case 'right':
			
				crop.left = image.width > canvas.width ? image.width - canvas.width : 0
				break;
		}
		
		return crop;
	}
	
	getCrop()
	{
		return { top: 0 - this.crop.top, left: 0 - this.crop.left }
	}
	
	setCrop( top: number, left: number ): void
	{
		if ( top < 0 )
		{
			top = 0;
		}
		
		if ( left < 0 )
		{
			left = 0;
		}
		
		if ( this.workingImage.height <= this.canvas.getDimensions().height + top )
		{
			top = this.workingImage.height - this.canvas.getDimensions().height;
		}
		
		if ( this.workingImage.width <= this.canvas.getDimensions().width + left )
		{
			left = this.workingImage.width - this.canvas.getDimensions().width;
		}
		
		this.crop = { left: 0 - left, top: 0 - top, apply: this.crop.apply }
	}
	
	draw()
	{
		this.canvas.context.clearRect( 0, 0, this.canvas.getDimensions().width, this.canvas.getDimensions().height )
		this.canvas.context.drawImage( this.workingImage, this.crop.left, this.crop.top )
	}
}
class XCupeGallery extends HTMLElement
{
	controller: XCupeGalleryController = null;
	clickListener: ()=>{} = null;
	dropListener: ()=>{} = null;
	
	createdCallback()
	{
		this.controller = new XCupeGalleryController( this );
		
		this.clickListener = this.clicked.bind( this )
		this.dropListener = this.drop.bind( this )
		
        this.addEventListener( 'click', this.clickListener )
		this.addEventListener( 'drop', this.dropListener )
		
		this.ondragover = ()=> { return false; }
	}

	attributeChangedCallback(attribute, oldVal, newVal)
	{
		switch ( attribute )
		{
			case 'crop':
			
				// this.controller.convertCropToPx( newVal );
		}
	}
	
	clicked( event )
    {
        event.stopPropagation()
		event.preventDefault()

		if ( event.path[0] === this )
		{
			console.log( event, event.path[0] )
			this.controller.inputFile.open()
		}
    }
	
	drop( event )
	{
		event.preventDefault()
		this.controller.readFile( event.dataTransfer.files )
		
		return false
	}
}
class XCupeGalleryController
{
	element: XCupeGallery = null;
	shadow: HTMLElement = null;
	inputFile: XCupeInputFileElement = null;
	
	constructor( xcupe: XCupeGallery )
	{
		this.element = xcupe;
		this.setupComponent();
		
		this.shadow.removeChild( this.shadow.querySelector('input[type="text"]') );
		this.shadow.removeChild( this.shadow.querySelector('canvas') );
	}

	setupComponent()
	{
		// Create a shadow root
		this.shadow = this.element['createShadowRoot']();
		
		// stamp out our template in the shadow dom
		let template = owner.querySelector("#template").content.cloneNode(true);
		this.shadow.appendChild(template);
		
		this.inputFile = new XCupeInputFileElement( <HTMLInputElement> this.shadow.querySelector('input[type="file"]'), this, true )
	}
	
	readFile( files )
	{
		for ( let file of files )
		{
			let element = new window['HTMLXCupeElement']()
		
			element.controller.readFile( file )
			this.shadow.appendChild( element );
		}
	}
}
window['HTMLXCupeElement'] = document['registerElement']('x-cupe', XCupe);
window['HTMLXCupeGalleryElement'] = document['registerElement']('x-cupe-gallery', XCupeGallery);