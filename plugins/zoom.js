function XCupeZoom( elementOrController, userSettings )
{
	// If first argument is empty, it means plugin should be applied to all elements.
	
	if ( ! elementOrController ) elementOrController = XCupeController;
	
	if ( ! ( elementOrController instanceof XCupe ) && ! ( elementOrController === XCupeController))
	{
		throw new Error('Neither element, nor controller supplied!');
	}
	
	var controller =  ( elementOrController instanceof XCupe ) ? elementOrController.controller : elementOrController.prototype; 
	
	
	// We save references to original functions, we're going to rewrite.
	var originalRnDImg = controller.readAndDrawImage;
	var originalResizeDimensions = controller.getResizeDimensions;
	
	// Settings for this plugin
	var settings = 
	{
		attached: false, // don't change this, private property used to determine if current element have mouswheel events attached or not
		zoom: 1, // current, actual zoom
		minZoom: 1,
		maxZoom: 1, // calculated dynamically
		step: 0.1
	}
	
	
	/**
	 * Zooms image. Applied when user uses middle mouse button to zoom.
	 * @param {MouseEvent} event - mouse event
	 */
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
		
		
		// Calculate crop ratios
		var crop = this.getCrop();
		var mouseLeft = event.offsetX;
		var mouseTop = event.offsetY;
		crop.left += mouseLeft * direction * this.element.settings.zoom.step
		crop.top += mouseTop * direction * this.element.settings.zoom.step
		
		// Resize
		this.redrawImage( 0, undefined, true );
		
		this.setCrop( crop.top, crop.left ) // Crop; it solves problem of empty space while unzooming
		this.redrawImage( 2 ); // Draw
	}
	
	
	// Attach to readAndWriteImage, so after image is selected and displayed, we:
	// * add events for mouse wheel actions
	// * calculate maxZoom
	controller.readAndDrawImage = function()
	{
		var self = this;
		
		// Applies zoom settings
		if ( ! self.element.settings.zoom )
		{
			self.element.settings.zoom = Object.assign( {}, settings, userSettings );
		}
		
		
		// We run original readAndDrawImage function. This step is very important, because our reference might already be changed by other extensions.
		return originalRnDImg.apply( self, arguments )
		.then( function() // Then we apply our extension
		{
			// Attach to mouse wheel events, and fire zoom function
			if ( ! self.element.settings.zoom.attached )
			{
				self.element.addEventListener( 'mousewheel', zoom.bind(self), false );
				self.element.addEventListener( 'DOMMouseScroll', zoom.bind(self), false );
				self.element.settings.zoom.attached = true;
			}
			
			// Calculate max zoom
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