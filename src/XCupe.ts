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