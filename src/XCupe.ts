class XCupe extends HTMLElement
{
	controller: XCupeController = null;
	mousedownListener: ()=>{} = null;
	mousemoveListener: ()=>{} = null;
	mouseupListener: ()=>{} = null;
	dropListener: ()=>{} = null;
	
	settings: Settings;
	
	moveImage = null;
	
	createdCallback()
	{
		this.controller = new XCupeController( this );
		this.controller.canvas.setDimensions({ width: 500, height: 500 });
	
		this.mousedownListener = this.mousedown.bind( this )
		this.mousemoveListener = this.mousemove.bind( this )
		this.mouseupListener = this.mouseup.bind( this )
		this.dropListener = this.drop.bind( this )
		
		this.addEventListener( 'mousedown', this.mousedownListener )
		this.addEventListener( 'touchstart', this.mousedownListener )
		
		this.settings = {
			height: this.getAttribute('height') ? parseInt(this.getAttribute('height')) : 500,
			width: this.getAttribute('width') ? parseInt(this.getAttribute('width')) : 500,
			crop: this.getAttribute('crop') ? this.getAttribute('crop').trim().toLowerCase() === 'true' : true,
			align: this.getAttribute('align') || 'center',
			allow_move: this.getAttribute('allow-move') ? this.getAttribute('allow-move').trim().toLowerCase() === 'true' : true,
			allow_drop: this.getAttribute('allow-drop') ? this.getAttribute('allow-drop').trim().toLowerCase() === 'true' : true,
			allow_select: this.getAttribute('allow-select') ? this.getAttribute('allow-select').trim().toLowerCase() === 'true' : true,
		}
		
		this.ondragover = ()=> { return false; }
		this.addEventListener( 'drop', this.dropListener )
		
		this.style.display = 'inline-block'
	}

	attributeChangedCallback( attribute, oldVal, newVal )
	{
		switch ( attribute )
		{
			case 'height':
			
				this.settings.height = parseInt( newVal )
				this.controller.redrawImage( Step.Resize )
				break;
				
			
			case 'width':
			
				this.settings.width = parseInt( newVal )
				this.controller.redrawImage( Step.Resize )
				break;
				
				
			case 'crop':
			
				this.settings.crop = newVal.trim().toLowerCase() === 'true';
				this.controller.redrawImage( Step.Resize )
				break;
				
				
			case 'align':
			
				this.settings.align = newVal.toLowerCase();
				this.controller.redrawImage( Step.Crop )
				break;
			
				
			case 'allow-move':
			
				this.settings.allow_move = newVal.trim().toLowerCase() === 'true';
				break;
				
			
			case 'allow-select':
			
				this.settings.allow_select = newVal.trim().toLowerCase() === 'true';
				break;
				
				
			case 'allow-drop':
			
				this.settings.allow_drop = newVal.trim().toLowerCase() === 'true';
				break;
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
		}, 100 )
	}
	
	mousemove( event )
	{		
		let newCropTop =  this.moveImage.crop.top - ( event.pageY - this.moveImage.position.y )
		let newCropLeft =  this.moveImage.crop.left - ( event.pageX - this.moveImage.position.x )
		
		this.controller.setCrop( newCropTop, newCropLeft )
		
		let drawCallack = ()=>{ this.controller.redrawImage.call(this.controller, Step.Draw ) }
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
			if ( this.settings.allow_select )
			{
				this.controller.inputFile.open()
			}
		}
	}
	
	drop( event )
	{
		event.preventDefault()
		
		if ( this.settings.allow_drop )
		{
			this.controller.readAndDrawImage( event.dataTransfer.files )
		}
		
		return false
	}
}