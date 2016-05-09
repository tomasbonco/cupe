function XCupeZoom( elementOrController, userSettings )
{
	if ( ! elementOrController ) elementOrController = XCupeController;
	
	if ( ! ( elementOrController instanceof XCupe ) && ! ( elementOrController === XCupeController))
	{
		throw new Error('Neither element, nor controller supplied!');
	}
	
	
	var controller =  ( elementOrController instanceof XCupe ) ? elementOrController.controller : elementOrController.prototype; 
	
	var originalRnDImg = controller.readAndDrawImage;
	var originalResizeDimensions = controller.getResizeDimensions;
	
	var settings = 
	{
		attached: false, // don't change this, private property used to determine if current element have mouswheel events attached or not
		zoom: 1, // current, actual zoom
		minZoom: 1,
		maxZoom: 1, // calculated dynamically
		step: 0.1
	}
	
	
	// Zoom function. It calculates zoom ratio.
	var zoom = function( event )
	{
		if ( ! this.element.settings.crop )
		{
			return;
		}
		
		var direction = Math.max( -1, Math.min( 1, (event.wheelDelta || -event.detail))); // returns direction 1 (up) or -1 (down) of mouse wheel movement
		var nextZoom = Math.round( (this.element.settings.zoom.zoom + (direction * this.element.settings.zoom.step)) * 10 ) / 10; // nextZoom = direction * settings.step; rest is solving float inaccuracy; returns zoom like: 1.1 ~> 1.7 ~> 2.3
		
		
		if ( nextZoom < this.element.settings.zoom.minZoom || nextZoom > this.element.settings.zoom.maxZoom )
		{
			return;
		}
		
		this.element.settings.zoom.zoom = nextZoom;
		
		var crop = this.getCrop();
		
		this.redrawImage( 0, undefined, true ); // Resize
		this.setCrop( crop.top, crop.left ) // Crop; it solves problem of empty space while unzooming
		this.redrawImage( 2 ); // Draw
	}
	
	
	// Attach to readAndWriteImage, so after image is selected and displayed, we:
	// * add events for mouse wheel actions
	// * calculate maxZoom
	controller.readAndDrawImage = function()
	{
		var self = this;
		
		if ( ! self.element.settings.zoom )
		{
			self.element.settings.zoom = Object.assign( {}, settings, userSettings );
		}
		
		return originalRnDImg.apply( self, arguments )
		.then( function()
		{
			if ( ! self.element.settings.zoom.attached )
			{
				self.element.addEventListener( 'mousewheel', zoom.bind(self), false );
				self.element.addEventListener( 'DOMMouseScroll', zoom.bind(self), false );
				self.element.settings.zoom.attached = true;
			}
			
			var originalImage = self.originalImage;
			var workingImage = self.workingImage;
			
			var widthZoom = Math.floor( (originalImage.width / workingImage.width) * 10 ) / 10;
			var heightZoom = Math.floor( (originalImage.height / workingImage.height) * 10 ) / 10;
			
			self.element.settings.zoom.maxZoom = widthZoom < heightZoom ? widthZoom : heightZoom;
		})
	}
	
	
	// Attach to getResizeDimensions, so after image was resized, we multiply each dimension with current zoom. 
	controller.getResizeDimensions = function()
	{
		var dimensions = originalResizeDimensions.apply( this, arguments );
		
		if ( this.element.settings.crop ) // if crop is not allowed, zoom is not allowed too and we don't want to continue when zoom is not allowed
		{
			dimensions.image.width = Math.round( dimensions.image.width * this.element.settings.zoom.zoom );
			dimensions.image.height = Math.round( dimensions.image.height * this.element.settings.zoom.zoom );
		}
		
		return dimensions;
	}
}