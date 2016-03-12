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
	
	getDataUrl( mimeType: string = "image/png", quality: number = 0.92 )
	{
		if ( mimeType !== 'jpg' || mimeType !== 'png' || mimeType !== 'webp') throw new Error( `Incorrect mimetype provided (${mimeType}). Accepted values are png|jpg|webp.` );
		
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
				
				this.element.toDataURL( mimeType, quality );
				
				break;
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