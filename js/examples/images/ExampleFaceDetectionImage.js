if(nxtjs == null) {
	throw "ExampleFaceDetectionImage.js needs a fully initialized Beyond Reality Face Nxt SDK. Make sure to follow the implementation examples of the JS version of the SDK.";
}
if(nxtjs.ExampleBase == null) {
	throw "ExampleFaceDetectionImage.js uses ExampleBase as base class. Make sure to follow the implementation examples of the JS version of the SDK.";
}
if(createjs == null) {
	throw "ExampleFaceDetectionImage.js uses CreateJS to display its content. Make sure to follow the implementation examples of the JS version of the SDK.";
}

/**
 * Called onload of body.
 */
function initExample() {
	
	// Setup CreateJS: uses the canvas with id '_stage'.
	// See ExampleBase.js
	
	var _stage = nxtjs.initCreateJS("_stage");
	_stage.addChild(new nxtjs.ExampleFaceDetectionImage());
}

(function(lib, cjs) {

	/**
	 * Automatic face detection on a single image.
	 *
	 * This is a bit of a lucky shot. There is no moving or changing face,
	 * which would be much easier to find.
	 * 
	 * So face detection can fail on a still image and even if
	 * the face detection finds a face, it is likely, that the face shape
	 * morphes into something, that's just wrong.
	 * 
	 * Anyway. The automatic face detection works by altering the 
	 * params until a face was detected (might fail though).
	 * 
	 * @author Marcel Klammer, Tastenkunst GmbH, 2014
	 */
	(lib.ExampleFaceDetectionImage = function(
			cameraResolution, brfResolution, brfRoi,
			faceDetectionRoi, screenRect, maskContainer, webcamInput
			) {

		var _this = this;
		var _super = lib.ExampleFaceDetectionImage._super;
		
		// Some images of some nice guys ;)
		_this._imageURLs = [
			"media/images/brf_example_image_marcel.jpg",
			"media/images/brf_example_image_chris.jpg"
		];
		_this._imageBMDs = [];
		_this._images = [];
		_this._image = null;
		_this._imageBMD = null;

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
		 * Make it a handcursor.
		 */
		_this.initGUIImage = function() {
			_this.initGUI();

			_this._clickArea.cursor='pointer';
		};

		/**
		 * When BRF is ready, we can set its params and BRFMode.
		 * 
		 * In this example we want to do just face detection, a simple rectangle
		 * around a found face, so we set tracking mode to BRFMode.FACE_DETECTION.
		 */
		_this.onReadyBRF = function(event) {

			// Set the basic face detection parameters.
			_this._brfManager.setFaceDetectionVars(4.0, 1.0, 30.0, 0.04, 12, false);
			_this._brfManager.setFaceDetectionROI(
					_this._faceDetectionRoi.x, _this._faceDetectionRoi.y,
					_this._faceDetectionRoi.width, _this._faceDetectionRoi.height);

			_this._brfManager.mode = lib.BRFMode.FACE_DETECTION;
			
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

			// Start auto detection on that new image.
			_this.autoDetect();
		};
		
		/**
		 * Try to auto detect a face in a single image.
		 */
		_this.autoDetect = function() {

			// Draw the image.
			_this.updateInput();
			
			// Now we go through the image several times with different settings
			// to eventually find a face in it.
			
			var foundFace = false;
			var baseScale = 4.0;			// Start with 4.0 and increase it by 0.05 up to 5.0.
			var scaleIncrement = 1.0;		// Make bigger steps, but decrease stepsize by 0.1, if nothing was found.
			
//			for(; baseScale < 5.0 && !foundFace; baseScale += 0.05) {
				
				scaleIncrement = 1.0;
				
				for(; scaleIncrement >= 0.1 && !foundFace; scaleIncrement -= 0.2) {
			
					_this._brfManager.setFaceDetectionVars(baseScale, scaleIncrement, 30.0, 0.04, 12, false);
					
					_this.updateBRF();
					
					var rect = _this._brfManager.lastDetectedFace;
					if(rect != null && rect.width != 0) {
						foundFace = true;
						console.log("face detected: ", baseScale, scaleIncrement);
					}
				}
//			}
			
			// Draw the results.
			_this.updateGUI();
			
			// Add the click listener again to switch to the next image.
			_this._clickArea.addEventListener("click", _this.changeImage);
		};

		/**
		 * Instead of the _video we need to fill the image into BRF.
		 */
		_this.updateInput = function() {			
			_this._image.cache(0, 0, _this._imageBMD.width, _this._imageBMD.height);
			_this._brfBmd.drawImage(_this._image, 0, 0, _this._cameraResolution.width, _this._cameraResolution.height);
		};
		
		/**
		 * Now draw the results for BRFMode.FACE_DETECTION.
		 */
		_this.updateGUI = function() {

			_this._draw.clear();
			
			// Get the current BRFState and faceShape.
			var state = _this._brfManager.state;
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
			}
		};
	}).inheritsFrom(lib.ExampleBase);

})(nxtjs, createjs);