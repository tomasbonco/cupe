var controller = null;
var stubElement = {
	createShadowRoot: function()
	{
		var x = document.createElement( 'div' );
		x.innerHTML = '<canvas></canvas><input type="file"><input type="text">';
		x.appendChild = function(){};
		return x;
	},
	appendChild: function(){}
}

var owner = { querySelector: function(){ return { content: { cloneNode: function(){} }}}}

describe( 'XCupeController', function()
{
	beforeEach( function()
	{
		controller = new XCupeController( stubElement );
	})
	
	describe( '#getResizeDimensions', function()
	{
		it( 'image is bigger then canvas and should scale down (crop: on)', function()
		{
			var image = { width: 300, height: 150 };
			var canvas = { width: 100, height: 100 };
			
			var result = controller.getResizeDimensions( image, canvas, true );
			
			result.image.height.should.equals( 100 );
			result.image.width.should.equals( 200 );  
		})
		
		it( 'image is bigger then canvas and should scale down (crop: off)', function()
		{
			var image = { width: 300, height: 150 };
			var canvas = { width: 100, height: 100 };
			
			var result = controller.getResizeDimensions( image, canvas, false );
			
			result.image.height.should.equals( 50 );
			result.image.width.should.equals( 100 );  
		})
		
		it( 'image is smaller then canvas and should scale up (crop: on)', function()
		{
			var image = { width: 50, height: 75 };
			var canvas = { width: 100, height: 100 };
			
			var result = controller.getResizeDimensions( image, canvas, true );
			
			result.image.width.should.equals( 100 );  
			result.image.height.should.equals( 150 );
		})
		
		it( 'image is smaller then canvas and should scale up (crop: off)', function()
		{
			var image = { width: 50, height: 75 };
			var canvas = { width: 100, height: 100 };
			
			var result = controller.getResizeDimensions( image, canvas, false );
			
			result.image.width.should.equals( 67 );
			result.image.height.should.equals( 100 );
		})
		
		it( 'image is bigger then canvas and canvas should scale up - width is not fixed', function()
		{
			var image = { width: 600, height: 300 };
			var canvas = { width: -1, height: 200 };
			
			var result = controller.getResizeDimensions( image, canvas, false );
			
			result.image.width.should.equals( 400 );
			result.image.height.should.equals( 200 );
			result.canvas.width.should.equals( 400 );
			result.canvas.height.should.equals( 200 );
		})
		
		it( 'image is bigger then canvas and canvas should scale up - height is not fixed', function()
		{
			var image = { width: 300, height: 600 };
			var canvas = { width: 150, height: -1 };
			
			var result = controller.getResizeDimensions( image, canvas, false );
			
			result.image.width.should.equals( 150 );
			result.image.height.should.equals( 300 );
			result.canvas.width.should.equals( 150 );
			result.canvas.height.should.equals( 300 );
		})
	})
	
	describe( '#crop', function()
	{
		it( 'should calculate correct coordinates', function()
		{
			var image = { width: 300, height: 600 };
			var canvas = { width: 150, height: -1 };
			
			var result = controller.getResizeDimensions( image, canvas, false );	
		})
	})
})