class XCupeGallery extends HTMLElement
{
	controller: XCupeGalleryController = null;
	clickListener: ()=>{} = null;
	dropListener: ()=>{} = null;
	
	settings: Settings;
	
	createdCallback()
	{
		this.controller = new XCupeGalleryController( this );
		
		this.clickListener = this.clicked.bind( this )
		this.dropListener = this.drop.bind( this )
		
        this.addEventListener( 'click', this.clickListener )
		this.addEventListener( 'drop', this.dropListener )
		
		this.ondragover = ()=> { return false; }
		
		this.settings = {
			height: this.getAttribute('height') ? parseInt(this.getAttribute('height')) : 500,
			width: this.getAttribute('width') ? parseInt(this.getAttribute('width')) : 500,
			crop: this.getAttribute('crop') ? this.getAttribute('crop').trim().toLowerCase() === 'true' : true,
			align: this.getAttribute('align') || 'center',
			allow_move: this.getAttribute('allow-move') ? this.getAttribute('allow-move').trim().toLowerCase() === 'true' : true,
			allow_drop: this.getAttribute('allow-drop') ? this.getAttribute('allow-drop').trim().toLowerCase() === 'true' : true,
			allow_select: this.getAttribute('allow-select') ? this.getAttribute('allow-select').trim().toLowerCase() === 'true' : true,
		}
	}

	attributeChangedCallback(attribute, oldVal, newVal)
	{
		let applyOnChildren = true; // when true attribute change will be applied to children - <x-cupe> elements
		
		switch ( attribute )
		{
			case 'height':
			
				this.settings.height = parseInt( newVal )
				break;
				
				
			case 'width':
			
				this.settings.width = parseInt( newVal )
				break;
				
				
			case 'crop':
				
				this.settings.crop = newVal.trim().toLowerCase() === 'true';
				break;
				
				
			case 'align':
			
				this.settings.align = newVal.toLowerCase().trim();
				break;
				
				
			case 'allow-move':
			
				this.settings.allow_move = newVal.trim().toLowerCase() === 'true';
				break;
				
				
			case 'allow-select':
			
				this.settings.allow_select = newVal.trim().toLowerCase() === 'true';
				applyOnChildren = false
				break;
				
				
			case 'allow-drop':
			
				this.settings.allow_drop = newVal.trim().toLowerCase() === 'true';
				applyOnChildren = false
				break;
		}
		
		if ( applyOnChildren )
		{
			this.controller.updateChildAttribute( attribute, oldVal, newVal )
		}
	}
	
	clicked( event )
    {
        event.stopPropagation()
		event.preventDefault()

		if ( event.path[0] === this && this.settings.allow_select )
		{
			this.controller.inputFile.open()
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