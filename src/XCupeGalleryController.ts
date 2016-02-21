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
			this.shadow.appendChild( element );
		}
	}
	
	updateChildAttribute( attribute, oldVal, newVal ): void
	{
		for ( let xcupe in this.shadow.querySelectorAll('x-cupe') )
		{
			xcupe.setAttribute( attribute, newVal )
		}
	}
}