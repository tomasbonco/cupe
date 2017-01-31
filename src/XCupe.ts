class XCupe extends HTMLElement
{
	controller: XCupeController = null;
	mousedownListener: ()=>{} = null;
	mousemoveListener: ()=>{} = null;
	mouseupListener: ()=>{} = null;
	dropListener: ()=>{} = null;
	
	settings: Settings;
	
	moveImage = null;
	numberX = 0;
	
	/**
	 * Applied when element is created.
	 */
	createdCallback()
	{
		this.controller = new XCupeController( this );
	
		this.mousedownListener = this.mousedown.bind( this )
		this.mousemoveListener = this.mousemove.bind( this )
		this.mouseupListener = this.mouseup.bind( this )
		this.dropListener = this.drop.bind( this )
		
		this.addEventListener( 'mousedown', this.mousedownListener )
		this.addEventListener( 'touchstart', this.mousedownListener )
		
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
		}
		
		this.controller.canvas.setDimensions({ width: this.settings.width, height: this.settings.height });
		
		this.moveImage = {
			applied: false,
			timeout: null,
			position: { x: 0, y: 0 },
			crop: null
		};
		
		this.ondragover = ()=> { return false; }
		this.addEventListener( 'drop', this.dropListener )
		
		this.controller.inputText.name( this.settings.name )
	}
	
	/**
	 * Applied when attribute changes.
	 * @param {string} attribute - name of changed attribute
	 * @param {string} oldVal - old value
	 * @param {string} - new value
	 */
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
				
				
			case 'quality':
							
				this.settings.quality = parseInt( newVal );
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
				
				if ( this.controller.inputText )
				{
					this.controller.inputText.name( newVal )
				}
				
				break;
		}
	}
	
	
	/**
	 * Applied as callback of mousedown event.
	 * @param {MouseEvent} event - mouse event 
	 */
	mousedown( event )
	{
		event.preventDefault();
		
		if ( event.button && event.button !== 1 ) return;
		
		this.numberX = Math.random();
		
		let currentX = ( event.changedTouches && event.changedTouches[0] ) ? event.changedTouches[0].pageX : event.pageX;
		let currentY = ( event.changedTouches && event.changedTouches[0] ) ? event.changedTouches[0].pageY : event.pageY;
		
		this.moveImage =
		{
			applied: false,
			timeout: null,
			position: { x: currentX, y: currentY },
			crop: this.controller.getCrop()
		};
	
		document.addEventListener( 'mouseup', this.mouseupListener )
		document.addEventListener( 'touchend', this.mouseupListener )
		
		if ( this.controller.isImageDrawn && this.settings.allowMove )
		{
			this.moveImage.timeout = setTimeout(()=>
			{
				this.moveImage.applied = true
				document.addEventListener( 'mousemove', this.mousemoveListener )
				document.addEventListener( 'touchmove', this.mousemoveListener )
			}, 150 )
		}
	}
	
	
	/**
	 * Applied as callback of mousemove event.
	 * @param {MouseEvent} event - mouse event 
	 */
	mousemove( event )
	{
		event.preventDefault();
		
		console.log('mouseMOVE!')
		
		if ( event.changedTouches && event.changedTouches.length > 1 ) return;
		
		let currentX = ( event.changedTouches && event.changedTouches[0] ) ? event.changedTouches[0].pageX : event.pageX;
		let currentY = ( event.changedTouches && event.changedTouches[0] ) ? event.changedTouches[0].pageY : event.pageY;
		
		console.log('ZUZUZU')
		
		let newCropTop =  this.moveImage.crop.top - ( currentY - this.moveImage.position.y )
		let newCropLeft =  this.moveImage.crop.left - ( currentX - this.moveImage.position.x )
		
		this.controller.setCrop( newCropTop, newCropLeft )
		console.log( newCropTop, newCropLeft )
		
		let drawCallack = ()=>{ this.controller.redrawImage.call(this.controller, Step.Draw ) }
		requestAnimationFrame( drawCallack )
	}
	
	
	/**
	 * Applied as callback of mouseup event. 
	 */
	mouseup()
	{
		event.preventDefault();
		
		clearTimeout( this.moveImage.timeout )
		
		document.removeEventListener( 'mouseup', this.mouseupListener )
		document.removeEventListener( 'touchend', this.mouseupListener )
		
		if ( this.moveImage.applied )
		{
			document.removeEventListener( 'mousemove', this.mousemoveListener )
			document.removeEventListener( 'touchmove', this.mousemoveListener )
			
			this.moveImage.applied = false
			
			this.controller.redrawImage( Step.Draw );
		}
		
		else
		{
			if ( this.settings.allowSelect )
			{
				this.controller.inputFile.open()
			}
		}
	}
	
	
	/**
	 * Applied as callback of drop event.
	 * @param {Event} event - drop event
	 */
	drop( event )
	{
		event.preventDefault()
		
		if ( this.settings.allowDrop )
		{
			this.controller.readAndDrawImage( event.dataTransfer.files )
		}
		
		return false
	}
	
	
	/**
	 * Returns content of x-cupe element.
	 * @param {OutputType} contentType - type of output (check interface for allowed values)
	 * @param {string} mimeType - if contentType returns image, this param can specify image format
	 * @param {number} quality - quality if image format specified in mimeType supports quality
	 * @return {any} image content in format based on contentType
	 */
	getContent( contentType: OutputType = OutputType.DataUrl, mimeType: string = "image/png", quality: number = 0.92 ): any
	{
		return this.controller.getContent.apply( this.controller, arguments );
	}
}