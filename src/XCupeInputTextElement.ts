class XCupeInputTextElement
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
	
	name( newValue?: string ): string
	{
		if ( newValue )
		{
			this.element.setAttribute( 'name', newValue );
		}
		
		return this.element.getAttribute( 'name' );
	}
}
