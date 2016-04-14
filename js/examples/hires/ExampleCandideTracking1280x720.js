if(nxtjs == null) {
	throw "ExampleCandideTracking1280x720.js needs a fully initialized Beyond Reality Face Nxt SDK. Make sure to follow the implementation examples of the JS version of the SDK.";
}
if(nxtjs.ExampleCandideTracking == null) {
	throw "ExampleCandideTracking1280x720.js uses ExampleCandideTracking as base class. Make sure to follow the implementation examples of the JS version of the SDK.";
}
if(createjs == null) {
	throw "ExampleCandideTracking1280x720.js uses CreateJS to display its content. Make sure to follow the implementation examples of the JS version of the SDK.";
}

/**
 * Called onload of body.
 */
function initExample() {
	
	// Setup CreateJS: uses the canvas with id '_stage'.
	// See ExampleBase.js
	
	var _stage = nxtjs.initCreateJS("_stage");
	_stage.addChild(new nxtjs.ExampleCandideTracking1280x720());
}

(function(lib) {

	/**
	 * This subclass of ExampleCandideTracking shows how to set custom resolutions.
	 * 
	 * We want to use a 720p camera, also show that 720p video on screen,
	 * but BRF will operate on a 640x480 BitmapData and limit the area it
	 * uses from that image to an even smaller chunk.
	 * 
	 * (And please, don't hide the BRF logo. If you need a 
	 * version without logo, just email us. Thanks!)
	 * 
	 * @author Marcel Klammer, Tastenkunst GmbH, 2014
	 */
	(lib.ExampleCandideTracking1280x720 = function() {

		var _this = this;
		var _super = lib.ExampleCandideTracking1280x720._super;
		
		// 720p camera resolution + 520x400 BRF roi + 320x320 face detection roi + 720p screenRect
		_super.constructor.call(this, 
			new lib.Rectangle(   0,   0, 1280, 720),	// Camera resolution
			new lib.Rectangle(   0,   0,  640, 480),	// BRF BitmapData size
			new lib.Rectangle(  60,  40,  520, 400),	// BRF region of interest within BRF BitmapData size
			new lib.Rectangle( 160,  80,  320, 320),	// BRF face detection region of interest within BRF BitmapData size
			new lib.Rectangle(   0,   0, 1280, 720),	// Shown video screen rectangle
			true,										// Mask the video to exactly match the screenRect area.
			true										// true for webcam input, false for single image input
		);
		
		// All other methods, params etc will be set in and taken from ExampleFaceTracking.
		
		// If you have black areas in your video, your camera may much likely not
		// support a 1280x720 resolution. You can try 1280x960 (which is the same
		// aspect ratio as 640x480)
		// If that's not working either, you might want to use the default 640x480
		// or get a better camera?

		// And btw.: Firefox does not support video constraints yet, so it will most likely
		// init a 640x480 camera image no matter what you set here *sigh*!
		
//		_super.constructor.call(this, 
//			new lib.Rectangle(   0,   0, 1280, 960),	// Camera resolution
//			new lib.Rectangle(   0,   0,  640, 480),	// BRF BitmapData size
//			new lib.Rectangle(  60,  40,  520, 400),	// BRF region of interest within BRF BitmapData size
//			new lib.Rectangle( 160,  80,  320, 320),	// BRF face detection region of interest within BRF BitmapData size
//			new lib.Rectangle(   0,   0, 1280, 960),	// Shown video screen rectangle
//			true,										// Mask the video to exactly match the screenRect area.
//			true										// true for webcam input, false for single image input
//		);

	}).inheritsFrom(lib.ExampleCandideTracking);

})(nxtjs);