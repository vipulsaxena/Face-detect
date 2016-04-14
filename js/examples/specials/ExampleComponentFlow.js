if(nxtjs == null) {
	throw "ExampleComponentFlow.js needs a fully initialized Beyond Reality Face Nxt SDK. Make sure to follow the implementation examples of the JS version of the SDK.";
}
if(nxtjs.ExampleFaceTracking == null) {
	throw "ExampleComponentFlow.js uses ExampleFaceTracking as base class. Make sure to follow the implementation examples of the JS version of the SDK.";
}
if(createjs == null) {
	throw "ExampleComponentFlow.js uses CreateJS to display its content. Make sure to follow the implementation examples of the JS version of the SDK.";
}

/**
 * Called onload of body.
 */
function initExample() {
	
	// Setup CreateJS: uses the canvas with id '_stage'.
	// See ExampleBase.js
	
	var _stage = nxtjs.initCreateJS("_stage");
	_stage.addChild(new nxtjs.ExampleComponentFlow());
}

(function(lib) {

	/**
	 * This subclass of ExampleFaceTracking shows how to set custom resolutions.
	 * And it shows order of algorithm steps on click.
	 * 
	 * (And please, don't hide the BRF logo. If you need a 
	 * version without logo, just email us. Thanks!)
	 * 
	 * @author Marcel Klammer, Tastenkunst GmbH, 2014
	 */
	(lib.ExampleComponentFlow = function() {

		var _this = this;
		var _super = lib.ExampleComponentFlow._super;
		
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

		/**
		 * When BRF is ready, we can set its params and BRFMode.
		 * 
		 * In this example we want to do face detection and face tracking, 
		 * so we set tracking mode to BRFMode.FACE_DETECTION first.
		 */
		_this.onReadyBRF = function(event) {

			_this._brfManager.setFaceDetectionVars(5.0, 1.0, 14.0, 0.06, 6, false);
			_this._brfManager.setFaceDetectionROI(
					_this._faceDetectionRoi.x, _this._faceDetectionRoi.y,
					_this._faceDetectionRoi.width, _this._faceDetectionRoi.height);
			_this._brfManager.setFaceTrackingVars(80, 500, 1);
			_this._brfManager.candideEnabled = false;
			_this._brfManager.candideActionUnitsEnabled = false;

			_this._brfManager.mode = lib.BRFMode.FACE_DETECTION;
			
			_this._brfReady = true;
			_this.start();
			
			_this._clickArea.cursor='pointer';
			_this._clickArea.addEventListener("click", onClicked);
		};

		/**
		 * Clicking on the webcam image will change the BRFMode to demonstrate 
		 * the different steps BRF walks through.
		 */
		var onClicked = function(event) {
			if(_this._brfManager.mode == lib.BRFMode.FACE_DETECTION) {
				_this._brfManager.mode = lib.BRFMode.FACE_TRACKING;
				_this._brfManager.candideEnabled = false;
				_this._brfManager.candideActionUnitsEnabled = false;
			} else if(_this._brfManager.candideEnabled == false) {
				_this._brfManager.candideEnabled = true;
				_this._brfManager.candideActionUnitsEnabled = true;
			} else {
				_this._brfManager.mode = lib.BRFMode.FACE_DETECTION;	
			}
		};
		
		/**
		 * We don't need to overwrite the updateInput and updateBRF, but we
		 * need to draw the results for BRFMode.FACE_TRACKING.
		 */
		_this.updateGUI = function() {
			
			_this._draw.clear();

			var state = _this._brfManager.state;
			var faceShape = _this._brfManager.faceShape;
			var rect = _this._brfManager.lastDetectedFace;
			
			lib.DrawingUtils.drawRect(_this._draw, _this._brfRoi, false, 1.0, "#acfeff", 1.0);

			if(state == lib.BRFState.FACE_DETECTION) {
				lib.DrawingUtils.drawRect(_this._draw, _this._faceDetectionRoi, false, 1.0, "#ffff00", 1.0);
				lib.DrawingUtils.drawRects(_this._draw, _this._brfManager.lastDetectedFaces);
				
				if(rect != null && rect.width != 0) {
					lib.DrawingUtils.drawRect(_this._draw, rect, false, 3.0, "#ff7900", 1.0);
				}
			} else if(state == lib.BRFState.FACE_TRACKING_START || state == lib.BRFState.FACE_TRACKING) {
				if(!_this._brfManager.candideEnabled) {
					lib.DrawingUtils.drawTriangles(_this._draw, faceShape.faceShapeVertices, faceShape.faceShapeTriangles);
					lib.DrawingUtils.drawTrianglesAsPoints(_this._draw, faceShape.faceShapeVertices);
					lib.DrawingUtils.drawRect(_this._draw, faceShape.bounds);
				} else {
					 if(state == lib.BRFState.FACE_TRACKING_START) {
						lib.DrawingUtils.drawTriangles(_this._draw, faceShape.faceShapeVertices, faceShape.faceShapeTriangles);
						lib.DrawingUtils.drawTrianglesAsPoints(_this._draw, faceShape.faceShapeVertices);
						lib.DrawingUtils.drawRect(_this._draw, faceShape.bounds);
					} else if(state == lib.BRFState.FACE_TRACKING) {
						lib.DrawingUtils.drawTriangles(_this._draw, faceShape.candideShapeVertices, faceShape.candideShapeTriangles);
						lib.DrawingUtils.drawTrianglesAsPoints(_this._draw, faceShape.candideShapeVertices);
					}
				}
			}
		}
	}).inheritsFrom(lib.ExampleFaceTracking);

})(nxtjs);