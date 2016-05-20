class XCupeInputFileElement
{
	element: HTMLInputElement = null;
	controller: XCupeController|XCupeGalleryController = null;
	
	changeListener: ()=>{} = null;
	clickListener: ()=>{} = null;
	
	constructor( element: HTMLInputElement, controller: XCupeController|XCupeGalleryController, multiple: boolean = false )
	{
		this.element = element;
		this.controller = controller;
		
		if ( multiple )
		{
			this.element.setAttribute( 'multiple', 'true' );
		}
		
		this.changeListener = this.onChange.bind( this )
		this.clickListener = this.clicked.bind( this )
		
		this.element.addEventListener('change', this.changeListener )
		this.element.addEventListener('click', this.clickListener )
	}
	
	
	/**
	 * Opens dialog to select image.
	 */
	open()
	{
		this.element.click()
	}
	
	
	/**
	 * Applied when image selected
	 * @param {Event} event - change event
	 */
	onChange( event )
	{
		this.controller.readAndDrawImage( event.target.files )
	}
	
	
	/**
	 * Applied as callback of click event.
	 * @param {MouseEvent} event - click event
	 */
	clicked( event: Event )
	{
		event.stopPropagation()
	}
}