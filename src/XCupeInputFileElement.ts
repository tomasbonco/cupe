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
	
	open()
	{
		this.element.click()
	}
	
	onChange( event )
	{
		this.controller.readAndDrawImage( event.target.files )
	}
	
	clicked( event: Event )
	{
		event.stopPropagation()
	}
}