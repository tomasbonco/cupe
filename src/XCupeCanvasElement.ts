class XCupeCanvasElement
{
	element: HTMLCanvasElement = null;
	context: CanvasRenderingContext2D = null;
	
    constructor( element?: HTMLCanvasElement )
	{
        this.element = element ? element : document.createElement('canvas');
        this.context = this.element.getContext('2d');
    }
	
	/**
	 * Sets canvas dimensions.
	 * @param {Dimensions} newDimensions - new dimensions
	 */
    setDimensions( newDimensions: Dimensions ): void
	{
        this.element.width = newDimensions.width;
        this.element.height = newDimensions.height;
    }
	
	
	/**
	 * Returns dimensions of canvas
	 * @return {Dimensions} dimensions of canvas 
	 */
    getDimensions(): Dimensions
	{
        return { width: this.element.width, height: this.element.height };
    }
	
	
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
	drawImage( source: HTMLImageElement|HTMLVideoElement|HTMLCanvasElement, sx: number = 0, sy: number = 0, sWidth: number = -1, sHeight: number = -1, dx: number = 0, dy: number = 0, dWidth: number = -1, dHeight: number = -1 ): void
	{
		if ( sWidth === -1 ) sWidth = source.width ? source.width : 0;
		if ( sHeight === -1 ) sHeight = source.height ? source.height : 0;
		
		if ( dWidth === -1 ) dWidth = this.element.width;
		if ( dHeight === -1 ) dHeight = this.element.height;
		
		this.context.drawImage( source, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight )
	}
	
	
	/**
	 * Saves image as DataURL (Base64 string).
	 * @param {string} mimeType - format of image
	 * @param {number} quality - quality of image
	 * @return {string} Base64 representation of image
	 */
	getDataUrl( mimeType: string = "image/png", quality: number = 0.92 ): string
	{
		if ( mimeType !== 'image/jpg' && mimeType !== 'image/png' && mimeType !== 'image/webp')
		{
			throw new Error( `Incorrect mimetype provided (${mimeType}). Accepted values are png|jpg|webp.` );
		}
		
		switch( mimeType )
		{
			case 'image/png':
				
				return this.element.toDataURL();
				
				
			default:
			
				if ( quality < 0 || quality > 1 )
				{
					console.error( `Image quality must be between 0 and 1. Provided ${ quality }. Setting quality to 1.` );
					quality = 1;
				}
				
				return this.element.toDataURL( mimeType, quality );
		}
	}
	
	/* - toBlob is not standard yet.

	getBlob( mimeType: string = "image/png", quality: number = 0.92 )
	{
		return new Promise( ( resolved: ()=>void, rejected )=>
		{
			this.element.toBlob( resolved, mimeType, quality )
		})
	}
	
	*/
}