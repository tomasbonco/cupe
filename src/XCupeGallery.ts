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