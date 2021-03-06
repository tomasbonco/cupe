class XCupeGallery extends HTMLElement
{
	controller: XCupeGalleryController = null;
	clickListener: ()=>{} = null;
	dropListener: ()=>{} = null;
	
	settings: Settings;
	
	
	/**
	 * Applied when element is created.
	 */
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
			quality: this.getAttribute('quality') ? parseInt(this.getAttribute('quality')) : 3,
			crop: this.getAttribute('crop') ? this.getAttribute('crop').trim().toLowerCase() === 'true' : true,
			align: this.getAttribute('align') || 'center',
			allowMove: this.getAttribute('allow-move') ? this.getAttribute('allow-move').trim().toLowerCase() === 'true' : true,
			allowDrop: this.getAttribute('allow-drop') ? this.getAttribute('allow-drop').trim().toLowerCase() === 'true' : true,
			allowSelect: this.getAttribute('allow-select') ? this.getAttribute('allow-select').trim().toLowerCase() === 'true' : true,
			name: this.getAttribute('name') ? this.getAttribute('name') + '[]' : '',
		}
	}
	
	
	/**
	 * Applied when attribute changes.
	 * @param {string} attribute - name of changed attribute
	 * @param {string} oldVal - old value
	 * @param {string} - new value
	 */
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
				
			case 'quality':
			
				this.settings.quality = parseInt( newVal )
				break;
				
				
			case 'crop':
				
				this.settings.crop = newVal.trim().toLowerCase() === 'true';
				break;
				
				
			case 'align':
			
				this.settings.align = newVal.toLowerCase().trim();
				break;
				
				
			case 'allow-move':
			
				this.settings.allowMove = newVal.trim().toLowerCase() === 'true';
				break;
				
				
			case 'allow-select':
			
				this.settings.allowSelect = newVal.trim().toLowerCase() === 'true';
				applyOnChildren = false
				break;
				
				
			case 'allow-drop':
			
				this.settings.allowDrop = newVal.trim().toLowerCase() === 'true';
				applyOnChildren = false
				break;
				
			
			case 'name':
				
				newVal = newVal + '[]';
				this.settings.name = newVal;
				break;
		}
		
		if ( applyOnChildren )
		{
			this.controller.updateChildAttribute( attribute, oldVal, newVal )
		}
	}
	
	
	/**
	 * Applied as callback of click event.
	 * @param {MouseEvent} event - click event
	 */
	clicked( event )
    {
        event.stopPropagation()
		event.preventDefault()

		if ( event.path[0] === this && this.settings.allowSelect )
		{
			this.controller.inputFile.open()
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
	getContent()
	{
		return this.controller.getContent.apply( this.controller, arguments );
	}
}