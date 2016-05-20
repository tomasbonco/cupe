class XCupeGalleryController
{
	element: XCupeGallery = null;
	shadow: HTMLElement = null;
	inputFile: XCupeInputFileElement = null;
	
	constructor( xcupegallery: XCupeGallery )
	{
		this.element = xcupegallery;
		this.setupComponent();
		
		this.shadow.removeChild( this.shadow.querySelector('canvas') );
	}


	/**
	 * Custom Element setup.
	 */
	setupComponent()
	{
		// Create a shadow root
		this.shadow = this.element['createShadowRoot']();
		
		// stamp out our template in the shadow dom
		let template = owner.querySelector("#template").content.cloneNode(true);
		this.shadow.appendChild(template);
		
		this.inputFile = new XCupeInputFileElement( <HTMLInputElement> this.shadow.querySelector('input[type="file"]'), this, true )
	}
	
	
	/**
	 * It reads image files loads image and creates x-cupe elements.
	 * @param {any} files - data to be converted
	 * @param {Promise} promise of converted image
	 */
	readAndDrawImage( files )
	{
		for ( let file of files )
		{
			let element = new window['HTMLXCupeElement']()
			let galleryAttributes = this.element.attributes;
			
			for ( let i = 0; i < galleryAttributes.length; i++ ) // TODO: check this, if it works
			{
				if ( ~[ 'allow-drop', 'allow-select' ].indexOf( galleryAttributes[i].name ) )
				{
					continue;
				}
				
				element.setAttribute( galleryAttributes[i].name, galleryAttributes[i].value )
			}
		
			element.controller.readAndDrawImage( file )
			this.element.appendChild( element );
		}
	}
	
	
	/**
	 * Updates attibutes to children X-Cupe elements.
	 * @param {string} attribute - name of changed attribute
	 * @param {string} oldVal - old value
	 * @param {string} - new value
	 */
	updateChildAttribute( attribute, oldVal, newVal ): void
	{
		this.getChildrenAsArray().forEach( xcupe =>
		{
			( <Element> xcupe).setAttribute( attribute, newVal )
		})
	}
	
	
	/**
	 * Returns content of x-cupe elements.
	 * @param {string} type - Array or Map
	 * @param {OutputType} contentType - type of output (check interface for allowed values)
	 * @param {string} mimeType - if contentType returns image, this param can specify image format
	 * @param {number} quality - quality if image format specified in mimeType supports quality
	 * @return {any} image content in format based on contentType
	 */
	getContent( type: string = "Array", contentType: OutputType, mimeType: string = "image/png", quality: number = 0.92 )
	{
		type = type.toLowerCase();
		
		if ( type !== 'map' || type !== 'array' ) throw new Error( `Incorrect type for CupeGallery.getContent provided (${type}). Allowed values are Map|Array` );
		
		let contentMap = new Map<XCupe, any>();
		let contentArray: XCupe[] = [];
		
		this.getChildrenAsArray().forEach( xcupe =>
		{
			let content = xcupe.getContent( contentType, mimeType, quality );
			
			if ( type === 'map')
			{
				contentMap.set( xcupe, content );
			}
			
			else
			{
				contentArray.push( content )
			}
		})
		
		return ( type === 'map' ) ? contentMap : contentArray;
	}
	
	
	/**
	 * Returns children X-Cupe elements as array.
	 * @return {XCupe[]} X-Cupe elements
	 */
	getChildrenAsArray(): XCupe[]
	{
		var children = this.element.querySelectorAll('x-cupe');
		return Array.prototype.slice.call( children, 0 );
	}
}