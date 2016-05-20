class XCupeInputTextElement
{
	element: HTMLInputElement = null;
	
	constructor( element: HTMLInputElement )
	{
		this.element = element;
	}
	
	/**
	 * Setter/getter for value.
	 * @param {string} newValue - new value
	 * @return {string} value of input element
	 */
	val( newValue?: string ): string
	{
		if ( newValue )
		{
			this.element.value = newValue;
		}
		
		return this.element.value
	}
	
	
	/**
	 * Getter/setter for name.
	 * @param {string} newValue - new name
	 * @return {string} name of input element
	 */
	name( newValue?: string ): string
	{
		if ( newValue )
		{
			this.element.setAttribute( 'name', newValue );
		}
		
		return this.element.getAttribute( 'name' );
	}
}
