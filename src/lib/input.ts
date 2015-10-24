export class XCupeInputTextElement
{
	element: HTMLInputElement = null;
	
	constructor( element: HTMLInputElement )
	{
		this.element = element;
	}
	
	val( newValue?: string ): string
	{
		if ( newValue )
		{
			this.element.value = newValue;
		}
		
		return this.element.value
	}
}


export class XCupeInputFileElement
{
	element: HTMLInputElement = null;
	controller: XCupeController|XCupeGalleryController = null;
	
	changeListener: ()=>{} = null;
	
	constructor( element: HTMLInputElement, controller: XCupeController|XCupeGalleryController )
	{
		this.element = element;
		this.controller = controller;
		
		this.changeListener = this.onChange.bind( this )
		
		this.element.addEventListener('change', this.changeListener )
	}
	
	open()
	{
		this.element.dispatchEvent( new MouseEvent( 'click', { 'bubbles': false, 'cancelable': true }))
	}
	
	onChange( event )
	{
		this.controller.readFile( event.target.files )
	}
}