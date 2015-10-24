import {XCupeInputTextElement, XCupeInputFileElement} from 'lib/input'

// Register the element in the document
export class XCupeGallery extends HTMLElement
{
	controller: XCupeController = null;
	
	clickListener: ()=>{} = null;
	
	createdCallback()
	{
		// this.controller = new XCupeController( this );
		this.clickListener = this.clicked.bind( this );
		this.addEventListener( 'click', this.clickListener )
	}

	attributeChangedCallback(attribute, oldVal, newVal)
	{
		switch ( attribute )
		{
			case 'crop':
			
				// this.controller.convertCropToPx( newVal );
		}
	}
	
	clicked()
	{
		
	}
}

class XCupeGalleryController
{
	element: XCupeGallery = null;
	shadow: HTMLElement = null;
	inputText: XCupeInputTextElement = null;
	inputFile: XCupeInputFileElement = null;
	
	constructor( xcupe: XCupeGallery )
	{
		this.element = xcupe;
		this.setupComponent();
	}

	setupComponent()
	{
		// Create a shadow root
		this.shadow = this.element.createShadowRoot();
		
		// stamp out our template in the shadow dom
		let template = owner.querySelector("#template").content.cloneNode(true);
		this.shadow.appendChild(template);
		
		this.inputFile = new XCupeInputFileElement( <HTMLInputElement> this.shadow.querySelector('input[type="file"]'), this )
	}
	
	readFile( files )
	{
		
	}
}