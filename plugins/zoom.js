function zoomable( element, userSettings )
{
	if ( ! element || ! element.controller ) return;
	
	var originalRnDImg = element.controller.readAndDrawImage;
	var originalResizeDimensions = element.controller.getResizeDimensions;
	var eventAttached = false;
	
	var settings = 
	{
		zoom: 1, // current, actual zoom
		minZoom: 1,
		maxZoom: 1, // calculated dynamically
		step: 0.1
	}
	
	Object.assign( settings, userSettings );
	
	
	// Zoom function. It calculates zoom ratio.
	var zoom = function( event )
	{
		if ( ! element.settings.crop )
		{
			return;
		}
		
		var delta = Math.max( -1, Math.min( 1, (event.wheelDelta || -event.detail))); // returns direction 1 (up) or -1 (down) of mouse wheel movement
		var nextZoom = Math.round( (settings.zoom + (delta * settings.step)) * 10 ) / 10; // nextZoom = delta * settings.step; rest is solving float inaccuracy; returns zoom like: 1.1 ~> 1.7 ~> 2.3
		
		
		if ( nextZoom < settings.minZoom || nextZoom > settings.maxZoom )
		{
			return;
		}
		
		settings.zoom = nextZoom;
		
		var crop = element.controller.getCrop();
		
		element.controller.redrawImage( 0, undefined, true ); // Resize
		element.controller.setCrop( crop.top, crop.left ) // Crop; it solves problem of empty space while unzooming
		element.controller.redrawImage( 2 ); // Draw
	}
	
	
	// Attach to readAndWriteImage, so after image is selected and displayed, we:
	// * add events for mouse wheel actions
	// * calculate maxZoom
	element.controller.readAndDrawImage = function()
	{
		return originalRnDImg.apply( element.controller, arguments )
		.then( function()
		{
			if ( ! eventAttached )
			{
				element.addEventListener( 'mousewheel', zoom, false );
				element.addEventListener( 'DOMMouseScroll', zoom, false );
				eventAttached = true;
			}
			
			var originalImage = element.controller.originalImage;
			var workingImage = element.controller.workingImage;
			
			var widthZoom = Math.ceil( (originalImage.width / workingImage.width) * 10 ) / 10;
			var heightZoom = Math.ceil( (originalImage.height / workingImage.height) * 10 ) / 10;
			
			settings.maxZoom = widthZoom < heightZoom ? widthZoom : heightZoom;
		})
	}
	
	
	// Attach to getResizeDimensions, so after image was resized, we multiply each dimension with current zoom. 
	element.controller.getResizeDimensions = function()
	{
		var dimensions = originalResizeDimensions.apply( element.controller, arguments );
		
		if ( element.settings.crop ) // if crop is not allowed, zoom is not allowed too and we don't want to conutinue when zoom is not allowed
		{
			dimensions.image.width = Math.round( dimensions.image.width * settings.zoom );
			dimensions.image.height = Math.round( dimensions.image.height * settings.zoom );
		}
		
		return dimensions;
	}
}