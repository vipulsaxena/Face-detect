if(nxtjs == null) {
	throw "ExampleFaceTrackingImage.js needs a fully initialized Beyond Reality Face Nxt SDK. Make sure to follow the implementation examples of the JS version of the SDK.";
}
if(nxtjs.ExampleBase == null) {
	throw "ExampleFaceTrackingImage.js uses ExampleBase as base class. Make sure to follow the implementation examples of the JS version of the SDK.";
}
if(createjs == null) {
	throw "ExampleFaceTrackingImage.js uses CreateJS to display its content. Make sure to follow the implementation examples of the JS version of the SDK.";
}

/**
 * Called onload of body.
 */
function initExample() {
	
	// Setup CreateJS: uses the canvas with id '_stage'.
	// See ExampleBase.js
	
	var _stage = nxtjs.initCreateJS("_stage");
	_stage.addChild(new nxtjs.ExampleFaceTrackingImage());
}

(function(lib, cjs) {

	/**
	 * v3.0.10: Added a new method: _brfManager.updateByEyes(...);
	 * It takes the BitmapData, left and right eye position and numOfUpdates.
	 * This method skips face detection and starts FaceShape Tracking based
	 * on the eyes. The only thing you have to do: click on the eyes.
	 * 
	 * This works better than the automatic face detection, but again:
	 * Getting a correct face shape from a single image is a bit of a lucky shot.
	 * 
	 * @author Marcel Klammer, Tastenkunst GmbH, 2014
	 */
	(lib.ExampleFaceTrackingImage = function(
			cameraResolution, brfResolution, brfRoi,
			faceDetectionRoi, screenRect, maskContainer, webcamInput
			) {

		var _this = this;
		var _super = lib.ExampleFaceTrackingImage._super;
		
		// Some images of some nice guys ;)
		_this._imageURLs = [
			"media/images/brf_example_image_marcel.jpg",
			"media/images/brf_example_image_chris.jpg"
		];
		_this._imageBMDs = [];
		_this._images = [];
		_this._image = null;
		_this._imageBMD = null;
		
		_this._leftEye = null;
		_this._rightEye = null;

		// That will change based on the input image size.
		cameraResolution	= cameraResolution	|| new lib.Rectangle(0, 0, 640, 480);
		// Squared.
		brfResolution		= brfResolution		|| new lib.Rectangle(0, 0, 480, 480);
		// Analyse it all.
		brfRoi				= brfRoi			|| new lib.Rectangle(0, 0, 480, 480);
		// Analyse it all.
		faceDetectionRoi	= faceDetectionRoi	|| new lib.Rectangle(0, 0, 480, 480);
		// Show it all.
		screenRect			= screenRect		|| new lib.Rectangle(0, 0, 640, 640);
		// Show it all.
		maskContainer 		= maskContainer		|| false;
		// No webcam this time.
		webcamInput 		= webcamInput		|| false;
		
		/**
		 * We use the Rectangles that are preselected in ExampleBase.
		 */
		_super.constructor.call(this, cameraResolution, brfResolution, brfRoi,
			faceDetectionRoi, screenRect, maskContainer, webcamInput);

		// Load the images and store them.
		
		_this._preloader = new cjs.LoadQueue(false);
		
		_this._preloader.on("fileload", function(event) {
			console.log("loaded image");
			// Get a reference to the loaded image (<img/>)
			var bmd = new cjs.BitmapData(event.result);
			var image = new cjs.Bitmap(bmd.canvas);
			
			_this._imageBMDs.push(bmd);
	        _this._images.push(image);
	        _this._image = _this._images[_this._images.length - 1];
	        _this._imageBMD = _this._imageBMDs[_this._imageBMDs.length - 1];
	        
		}, _this);
		
		_this._preloader.on("complete", function(event) {
	        if(_this._images.length == _this._imageURLs.length) {
	        	if(_this._brfReady) {
	        		_this.changeImage();
	        	}
	        }
		}, _this);
		
		_this._preloader.on("error", function(event) {
			console.log("error loading image");
		}, _this);
		
		_this._preloader.setMaxConnections(10);

		var i = 0;
		var l = _this._imageURLs.length;
		
		while(i < l) {
			_this._preloader.loadFile(_this._imageURLs[i]);
			++i;
		}
		
		/**
		 * We are working with single image in this example.
		 * So no need for a Camera or Video.
		 */
		_this.init = function() {
			_this.initGUIImage();
			_this.initBRF();
			//_this.initCamera();
		};
		
		/**
		 * We need to add the eye markers, 2 simple orange points.
		 * Just click on the eyes to set them.
		 */
		_this.initGUIImage = function() {
			_this.initGUI();

			_this._clickArea.cursor='pointer';
			
			_this._leftEye = new lib.Point(-1, -1);
			_this._rightEye = new lib.Point(-1, -1);
		};
		
		/**
		 * When BRF is ready, we can set its params and BRFMode.
		 * 
		 * In this example we want to do face tracking, 
		 * so we set tracking mode to BRFMode.FACE_TRACKING.
		 */
		_this.onReadyBRF = function(event) {

			// Set the basic face detection parameters.
			_this._brfManager.setFaceDetectionVars(4.0, 1.0, 30.0, 0.04, 12, false);
			_this._brfManager.setFaceDetectionROI(
					_this._faceDetectionRoi.x, _this._faceDetectionRoi.y,
					_this._faceDetectionRoi.width, _this._faceDetectionRoi.height);
			
			// Set the face tracking parameters. 0 for the less strickt reset behavior.
			_this._brfManager.setFaceTrackingVars(80, 500, 0);

			// We don't need CandideShape tracking here.
			// (Only if you want to build your own 3D engine single image example.)
			_this._brfManager.candideEnabled = false;
			_this._brfManager.candideActionUnitsEnabled = false;

			_this._brfManager.mode = lib.BRFMode.FACE_TRACKING;
			
			// Set BRF ready and start, if camera is ready, too.
			_this._brfReady = true;

			// Don't add an ENTER_FRAME listener here.
			
			// Change the input image.
	        if(_this._images.length == _this._imageURLs.length) {
	        	_this.changeImage();
	        }
		};
		
		/**
		 * Just to demonstrate how to switch images, you can change them by click. 
		 */
		_this.changeImage = function(event) {

			_this._draw.clear();

			// Remove click listener until we are finished with the current image.
			_this._clickArea.removeEventListener("click", _this.changeImage);
			
			// Remove old image and reset its size.
			if(_this._container.contains(_this._image)) {
				_this._image.setTransform(0.0, 0.0, 1.0, 1.0);
				_this._container.removeChild(_this._image);
			}
			
			// Get next index and image.
			var i = _this._images.indexOf(_this._image) + 1;
			
			if(i >= _this._images.length) {
				i = 0;
			}
			
			_this._image = _this._images[i];
			_this._imageBMD = _this._imageBMDs[i];
			
			// Add it in the container.
			_this._container.addChildAt(_this._image, 0);
			
			// Update input size to get the correct results.
			// true:  update _screenRect also to view the whole image
			// false: don't update _screenRect.
			_this.updateCameraResolution(_this._imageBMD.width, _this._imageBMD.height, true);
			
			// Set the image like the video to match screenRect.
			_this._image.image.getContext("2d").setTransform(
				_this._videoToScreenMatrix.a,
				_this._videoToScreenMatrix.b,
				_this._videoToScreenMatrix.c,
				_this._videoToScreenMatrix.d,
				_this._videoToScreenMatrix.tx,
				_this._videoToScreenMatrix.ty
			);
			
			_this._clickArea.addEventListener("click", _this.onClickedDots);
		};

		/**
		 * After switching the image, click on the eyes to start the tracking.
		 */
		_this.onClickedDots = function(event) {
			var x = event.localX;
			var y = event.localY;

			if(_this._leftEye.x == -1) {
				_this._leftEye.x = x;
				_this._leftEye.y = y;
				
				lib.DrawingUtils.drawPoint(_this._draw, _this._leftEye, 5, false, "#ff7900", 1.0);
			} else if(_this._rightEye.x == -1) {
				_this._rightEye.x = x;
				_this._rightEye.y = y;	

				lib.DrawingUtils.drawPoint(_this._draw, _this._rightEye, 5, false, "#ff7900", 1.0);
				
				_this._clickArea.removeEventListener("click", _this.onClickedDots);
				
				// That timeout is just to see the set marker first.
				setTimeout(_this.update, 100);
			}
		};

		/**
		 * Instead of the _video we need to fill the image into BRF.
		 */
		_this.updateInput = function() {			
			_this._image.cache(0, 0, _this._imageBMD.width, _this._imageBMD.height);
			_this._brfBmd.drawImage(_this._image, 0, 0, _this._cameraResolution.width, _this._cameraResolution.height);
		};
		
		/**
		 * And BRF needs to skip face detection and use updateByEyes
		 * instead of update.
		 */
		_this.updateBRF = function() {
			_this._brfManager.updateByEyes(_this._brfBmd.getPixels(_this._brfResolution),
					_this._leftEye, _this._rightEye, 35);
		};
		
		/**
		 * Now draw the results for BRFMode.FACE_TRACKING.
		 */
		_this.updateGUI = function() {

			_this._draw.clear();

			lib.DrawingUtils.drawPoint(_this._draw, _this._leftEye, 5, false, "#ff7900", 1.0);
			lib.DrawingUtils.drawPoint(_this._draw, _this._rightEye, 5, false, "#ff7900", 1.0);
			
			// Get the current BRFState and faceShape.
			var state = _this._brfManager.state;
			var faceShape = _this._brfManager.faceShape;
			var rect = _this._brfManager.lastDetectedFace;

			// Draw BRFs region of interest, that got analysed:
			lib.DrawingUtils.drawRect(_this._draw, _this._brfRoi, false, 1.0, "#acfeff", 1.0);

			if(state == lib.BRFState.FACE_DETECTION) {
				// Draw the face detection roi.
				lib.DrawingUtils.drawRect(_this._draw, _this._faceDetectionRoi, false, 1.0, "#ffff00", 1.0);

				// Draw all found face regions:
				lib.DrawingUtils.drawRects(_this._draw, _this._brfManager.lastDetectedFaces);
				
				// And draw the one result, that got calculated from all the lastDetectedFaces.
				if(rect != null && rect.width != 0) {
					lib.DrawingUtils.drawRect(_this._draw, rect, false, 3.0, "#ff7900", 1.0);
				}
			} else if(state == lib.BRFState.FACE_TRACKING_START || state == lib.BRFState.FACE_TRACKING) {
				// Draw the morphed face shape and its bounds.
				lib.DrawingUtils.drawTrianglesAsPoints(_this._draw, faceShape.faceShapeVertices);
				lib.DrawingUtils.drawRect(_this._draw, faceShape.bounds);

				// And draw the one result, that got calculated from leftEye, rightEye
				if(rect != null && rect.width != 0) {
					lib.DrawingUtils.drawRect(_this._draw, rect, false, 1.0, "#ff7900", 1.0);
				}
			}
			
			// Reset the points.
			_this._leftEye.x = -1.0;
			_this._leftEye.y = -1.0;
			_this._rightEye.x = -1.0;
			_this._rightEye.y = -1.0;
			
			_this._clickArea.addEventListener("click", _this.changeImage);
		};
	}).inheritsFrom(lib.ExampleBase);

})(nxtjs, createjs);