'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// This set of controls performs orbiting, dollying (zooming), and panning.
// Unlike TrackballControls, it maintains the "up" direction object.up (+Y by default).
//
//    Orbit - left mouse / touch: one-finger move
//    Zoom - middle mouse, or mousewheel / touch: two-finger spread or squish
//    Pan - right mouse, or left mouse + ctrl/meta/shiftKey, or arrow keys / touch: two-finger move

var _changeEvent = { type: 'change' };
var _startEvent = { type: 'start' };
var _endEvent = { type: 'end' };

var ERPEventDispatcher = function () {
	function ERPEventDispatcher() {
		_classCallCheck(this, ERPEventDispatcher);
	}

	_createClass(ERPEventDispatcher, [{
		key: 'addEventListener',
		value: function addEventListener(type, listener) {
			if (this._listeners === undefined) this._listeners = {};
			var listeners = this._listeners;

			if (listeners[type] === undefined) {
				listeners[type] = [];
			}

			if (listeners[type].indexOf(listener) === -1) {
				listeners[type].push(listener);
			}
		}
	}, {
		key: 'hasEventListener',
		value: function hasEventListener(type, listener) {
			if (this._listeners === undefined) return false;
			var listeners = this._listeners;
			return listeners[type] !== undefined && listeners[type].indexOf(listener) !== -1;
		}
	}, {
		key: 'removeEventListener',
		value: function removeEventListener(type, listener) {
			if (this._listeners === undefined) return;
			var listeners = this._listeners;
			var listenerArray = listeners[type];

			if (listenerArray !== undefined) {
				var index = listenerArray.indexOf(listener);

				if (index !== -1) {
					listenerArray.splice(index, 1);
				}
			}
		}
	}, {
		key: 'dispatchEvent',
		value: function dispatchEvent(event) {
			if (this._listeners === undefined) return;
			var listeners = this._listeners;
			var listenerArray = listeners[event.type];

			if (listenerArray !== undefined) {
				event.target = this; // Make a copy, in case listeners are removed while iterating.

				var array = listenerArray.slice(0);

				for (var i = 0, l = array.length; i < l; i++) {
					array[i].call(this, event);
				}

				event.target = null;
			}
		}
	}]);

	return ERPEventDispatcher;
}();

var OrbitControls = function (_ERPEventDispatcher) {
	_inherits(OrbitControls, _ERPEventDispatcher);

	function OrbitControls(object, domElement) {
		_classCallCheck(this, OrbitControls);

		var _this = _possibleConstructorReturn(this, (OrbitControls.__proto__ || Object.getPrototypeOf(OrbitControls)).call(this));

		if (domElement === undefined) console.warn('THREE.OrbitControls: The second parameter "domElement" is now mandatory.');
		if (domElement === document) console.error('THREE.OrbitControls: "document" should not be used as the target "domElement". Please use "renderer.domElement" instead.');

		_this.object = object;
		_this.domElement = domElement;
		_this.domElement.style.touchAction = 'none'; // disable touch scroll

		// Set to false to disable this control
		_this.enabled = true;

		// "target" sets the location of focus, where the object orbits around
		_this.target = new THREE.Vector3();

		// How far you can dolly in and out ( PerspectiveCamera only )
		_this.minDistance = 0;
		_this.maxDistance = Infinity;

		// How far you can zoom in and out ( OrthographicCamera only )
		_this.minZoom = 0;
		_this.maxZoom = Infinity;

		// How far you can orbit vertically, upper and lower limits.
		// Range is 0 to Math.PI radians.
		_this.minPolarAngle = 0; // radians
		_this.maxPolarAngle = Math.PI; // radians

		// How far you can orbit horizontally, upper and lower limits.
		// If set, the interval [ min, max ] must be a sub-interval of [ - 2 PI, 2 PI ], with ( max - min < 2 PI )
		_this.minAzimuthAngle = -Infinity; // radians
		_this.maxAzimuthAngle = Infinity; // radians

		// Set to true to enable damping (inertia)
		// If damping is enabled, you must call controls.update() in your animation loop
		_this.enableDamping = false;
		_this.dampingFactor = 0.05;

		// This option actually enables dollying in and out; left as "zoom" for backwards compatibility.
		// Set to false to disable zooming
		_this.enableZoom = true;
		_this.zoomSpeed = 1.0;

		// Set to false to disable rotating
		_this.enableRotate = true;
		_this.rotateSpeed = 1.0;

		// Set to false to disable panning
		_this.enablePan = true;
		_this.panSpeed = 1.0;
		_this.screenSpacePanning = true; // if false, pan orthogonal to world-space direction camera.up
		_this.keyPanSpeed = 7.0; // pixels moved per arrow key push

		// Set to true to automatically rotate around the target
		// If auto-rotate is enabled, you must call controls.update() in your animation loop
		_this.autoRotate = false;
		_this.autoRotateSpeed = 2.0; // 30 seconds per orbit when fps is 60

		// The four arrow keys
		_this.keys = { LEFT: 'ArrowLeft', UP: 'ArrowUp', RIGHT: 'ArrowRight', BOTTOM: 'ArrowDown' };

		// Mouse buttons
		_this.mouseButtons = { LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN };

		// Touch fingers
		_this.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN };

		// for reset
		_this.target0 = _this.target.clone();
		_this.position0 = _this.object.position.clone();
		_this.zoom0 = _this.object.zoom;

		// the target DOM element for key events
		_this._domElementKeyEvents = null;

		//
		// public methods
		//

		_this.cameraZoomChanged = function () {
			zoomChanged = true;
		};

		_this.clearspherical = function () {
			sphericalDelta.theta = 0;
			sphericalDelta.phi = 0;

			spherical.theta = 0;
			spherical.phi = 0;
		};

		_this.getPolarAngle = function () {

			return spherical.phi;
		};

		_this.getAzimuthalAngle = function () {

			return spherical.theta;
		};

		_this.getDistance = function () {

			return this.object.position.distanceTo(this.target);
		};

		_this.listenToKeyEvents = function (domElement) {

			domElement.addEventListener('keydown', onKeyDown);
			this._domElementKeyEvents = domElement;
		};

		_this.saveState = function () {

			scope.target0.copy(scope.target);
			scope.position0.copy(scope.object.position);
			scope.zoom0 = scope.object.zoom;
		};

		_this.reset = function () {

			scope.target.copy(scope.target0);
			scope.object.position.copy(scope.position0);
			scope.object.zoom = scope.zoom0;

			scope.object.updateProjectionMatrix();
			scope.dispatchEvent(_changeEvent);

			scope.update();

			state = STATE.NONE;
		};

		// this method is exposed, but perhaps it would be better if we can make it private...
		_this.update = function () {

			var offset = new THREE.Vector3();

			// so camera.up is the orbit axis
			var quat = new THREE.Quaternion().setFromUnitVectors(object.up, new THREE.Vector3(0, 1, 0));
			var quatInverse = quat.clone().invert();

			var lastPosition = new THREE.Vector3();
			var lastQuaternion = new THREE.Quaternion();

			var twoPI = 2 * Math.PI;

			return function update() {

				var position = scope.object.position;

				offset.copy(position).sub(scope.target);

				// rotate offset to "y-axis-is-up" space
				offset.applyQuaternion(quat);

				// angle from z-axis around y-axis
				spherical.setFromVector3(offset);

				if (scope.autoRotate && state === STATE.NONE) {

					rotateLeft(getAutoRotationAngle());
				}

				if (scope.enableDamping) {

					spherical.theta += sphericalDelta.theta * scope.dampingFactor;
					spherical.phi += sphericalDelta.phi * scope.dampingFactor;
				} else {

					spherical.theta += sphericalDelta.theta;
					spherical.phi += sphericalDelta.phi;
				}

				// restrict theta to be between desired limits

				var min = scope.minAzimuthAngle;
				var max = scope.maxAzimuthAngle;

				if (isFinite(min) && isFinite(max)) {

					if (min < -Math.PI) min += twoPI;else if (min > Math.PI) min -= twoPI;

					if (max < -Math.PI) max += twoPI;else if (max > Math.PI) max -= twoPI;

					if (min <= max) {

						spherical.theta = Math.max(min, Math.min(max, spherical.theta));
					} else {

						spherical.theta = spherical.theta > (min + max) / 2 ? Math.max(min, spherical.theta) : Math.min(max, spherical.theta);
					}
				}

				// restrict phi to be between desired limits
				spherical.phi = Math.max(scope.minPolarAngle, Math.min(scope.maxPolarAngle, spherical.phi));

				spherical.makeSafe();

				spherical.radius *= scale;

				// restrict radius to be between desired limits
				spherical.radius = Math.max(scope.minDistance, Math.min(scope.maxDistance, spherical.radius));

				// move target to panned location

				if (scope.enableDamping === true) {

					scope.target.addScaledVector(panOffset, scope.dampingFactor);
				} else {

					scope.target.add(panOffset);
				}

				offset.setFromSpherical(spherical);

				// rotate offset back to "camera-up-vector-is-up" space
				offset.applyQuaternion(quatInverse);

				position.copy(scope.target).add(offset);

				// console.log('---------');
				// console.log(scope.object.position);
				// console.log(scope.target);
				scope.object.lookAt(scope.target);

				if (scope.enableDamping === true) {

					sphericalDelta.theta *= 1 - scope.dampingFactor;
					sphericalDelta.phi *= 1 - scope.dampingFactor;

					panOffset.multiplyScalar(1 - scope.dampingFactor);
				} else {

					sphericalDelta.set(0, 0, 0);

					panOffset.set(0, 0, 0);
				}

				scale = 1;

				// update condition is:
				// min(camera displacement, camera rotation in radians)^2 > EPS
				// using small-angle approximation cos(x/2) = 1 - x^2 / 8

				if (zoomChanged || lastPosition.distanceToSquared(scope.object.position) > EPS || 8 * (1 - lastQuaternion.dot(scope.object.quaternion)) > EPS) {

					scope.dispatchEvent(_changeEvent);

					lastPosition.copy(scope.object.position);
					lastQuaternion.copy(scope.object.quaternion);
					zoomChanged = false;

					return true;
				}

				return false;
			};
		}();

		_this.dispose = function () {

			scope.domElement.removeEventListener('contextmenu', onContextMenu);

			scope.domElement.removeEventListener('pointerdown', onPointerDown);
			scope.domElement.removeEventListener('pointercancel', onPointerCancel);
			scope.domElement.removeEventListener('wheel', onMouseWheel);

			scope.domElement.removeEventListener('pointermove', onPointerMove);
			scope.domElement.removeEventListener('pointerup', onPointerUp);

			if (scope._domElementKeyEvents !== null) {

				scope._domElementKeyEvents.removeEventListener('keydown', onKeyDown);
			}

			//scope.dispatchEvent( { type: 'dispose' } ); // should this be added here?
		};

		//
		// internals
		//

		var scope = _this;

		var STATE = {
			NONE: -1,
			ROTATE: 0,
			DOLLY: 1,
			PAN: 2,
			TOUCH_ROTATE: 3,
			TOUCH_PAN: 4,
			TOUCH_DOLLY_PAN: 5,
			TOUCH_DOLLY_ROTATE: 6
		};

		var state = STATE.NONE;

		var EPS = 0.000001;

		// current position in spherical coordinates
		var spherical = new THREE.Spherical();
		var sphericalDelta = new THREE.Spherical();

		var scale = 1;
		var panOffset = new THREE.Vector3();
		var zoomChanged = false;

		var rotateStart = new THREE.Vector2();
		var rotateEnd = new THREE.Vector2();
		var rotateDelta = new THREE.Vector2();

		var panStart = new THREE.Vector2();
		var panEnd = new THREE.Vector2();
		var panDelta = new THREE.Vector2();

		var dollyStart = new THREE.Vector2();
		var dollyEnd = new THREE.Vector2();
		var dollyDelta = new THREE.Vector2();

		var pointers = [];
		var pointerPositions = {};

		function getAutoRotationAngle() {

			return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;
		}

		function getZoomScale() {

			return Math.pow(0.95, scope.zoomSpeed);
		}

		function rotateLeft(angle) {

			sphericalDelta.theta -= angle;
		}

		function rotateUp(angle) {

			sphericalDelta.phi -= angle;
		}

		var panLeft = function () {

			var v = new THREE.Vector3();

			return function panLeft(distance, objectMatrix) {

				v.setFromMatrixColumn(objectMatrix, 0); // get X column of objectMatrix
				v.multiplyScalar(-distance);

				panOffset.add(v);
			};
		}();

		var panUp = function () {

			var v = new THREE.Vector3();

			return function panUp(distance, objectMatrix) {

				if (scope.screenSpacePanning === true) {

					v.setFromMatrixColumn(objectMatrix, 1);
				} else {

					v.setFromMatrixColumn(objectMatrix, 0);
					v.crossVectors(scope.object.up, v);
				}

				v.multiplyScalar(distance);

				panOffset.add(v);
			};
		}();

		// deltaX and deltaY are in pixels; right and down are positive
		var pan = function () {

			var offset = new THREE.Vector3();

			return function pan(deltaX, deltaY) {

				var element = scope.domElement;

				if (scope.object.isPerspectiveCamera) {

					// perspective
					var position = scope.object.position;
					offset.copy(position).sub(scope.target);
					var targetDistance = offset.length();

					// half of the fov is center to top of screen
					targetDistance *= Math.tan(scope.object.fov / 2 * Math.PI / 180.0);

					// we use only clientHeight here so aspect ratio does not distort speed
					panLeft(2 * deltaX * targetDistance / element.clientHeight, scope.object.matrix);
					panUp(2 * deltaY * targetDistance / element.clientHeight, scope.object.matrix);
				} else if (scope.object.isOrthographicCamera) {

					// orthographic
					panLeft(deltaX * (scope.object.right - scope.object.left) / scope.object.zoom / element.clientWidth, scope.object.matrix);
					panUp(deltaY * (scope.object.top - scope.object.bottom) / scope.object.zoom / element.clientHeight, scope.object.matrix);
				} else {

					// camera neither orthographic nor perspective
					console.warn('WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.');
					scope.enablePan = false;
				}
			};
		}();

		function dollyOut(dollyScale) {

			if (scope.object.isPerspectiveCamera) {

				scale /= dollyScale;
			} else if (scope.object.isOrthographicCamera) {

				scope.object.zoom = Math.max(scope.minZoom, Math.min(scope.maxZoom, scope.object.zoom * dollyScale));
				scope.object.updateProjectionMatrix();
				zoomChanged = true;
			} else {

				console.warn('WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.');
				scope.enableZoom = false;
			}
		}

		function dollyIn(dollyScale) {

			if (scope.object.isPerspectiveCamera) {

				scale *= dollyScale;
			} else if (scope.object.isOrthographicCamera) {

				scope.object.zoom = Math.max(scope.minZoom, Math.min(scope.maxZoom, scope.object.zoom / dollyScale));
				scope.object.updateProjectionMatrix();
				zoomChanged = true;
			} else {

				console.warn('WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.');
				scope.enableZoom = false;
			}
		}

		//
		// event callbacks - update the object state
		//

		function handleMouseDownRotate(event) {

			rotateStart.set(event.clientX, event.clientY);
		}

		function handleMouseDownDolly(event) {

			dollyStart.set(event.clientX, event.clientY);
		}

		function handleMouseDownPan(event) {

			panStart.set(event.clientX, event.clientY);
		}

		function handleMouseMoveRotate(event) {

			rotateEnd.set(event.clientX, event.clientY);

			rotateDelta.subVectors(rotateEnd, rotateStart).multiplyScalar(scope.rotateSpeed);

			var element = scope.domElement;

			rotateLeft(2 * Math.PI * rotateDelta.x / element.clientHeight); // yes, height

			rotateUp(2 * Math.PI * rotateDelta.y / element.clientHeight);

			rotateStart.copy(rotateEnd);

			scope.update();
		}

		function handleMouseMoveDolly(event) {

			dollyEnd.set(event.clientX, event.clientY);

			dollyDelta.subVectors(dollyEnd, dollyStart);

			if (dollyDelta.y > 0) {

				dollyOut(getZoomScale());
			} else if (dollyDelta.y < 0) {

				dollyIn(getZoomScale());
			}

			dollyStart.copy(dollyEnd);

			scope.update();
		}

		function handleMouseMovePan(event) {

			panEnd.set(event.clientX, event.clientY);

			panDelta.subVectors(panEnd, panStart).multiplyScalar(scope.panSpeed);

			pan(panDelta.x, panDelta.y);

			panStart.copy(panEnd);

			scope.update();
		}

		function handleMouseWheel(event) {

			if (event.deltaY < 0) {

				dollyIn(getZoomScale());
			} else if (event.deltaY > 0) {

				dollyOut(getZoomScale());
			}

			scope.update();
		}

		function handleKeyDown(event) {

			var needsUpdate = false;

			switch (event.code) {

				case scope.keys.UP:
					pan(0, scope.keyPanSpeed);
					needsUpdate = true;
					break;

				case scope.keys.BOTTOM:
					pan(0, -scope.keyPanSpeed);
					needsUpdate = true;
					break;

				case scope.keys.LEFT:
					pan(scope.keyPanSpeed, 0);
					needsUpdate = true;
					break;

				case scope.keys.RIGHT:
					pan(-scope.keyPanSpeed, 0);
					needsUpdate = true;
					break;

			}

			if (needsUpdate) {

				// prevent the browser from scrolling on cursor keys
				event.preventDefault();

				scope.update();
			}
		}

		function handleTouchStartRotate() {

			if (pointers.length === 1) {

				rotateStart.set(pointers[0].pageX, pointers[0].pageY);
			} else {

				var x = 0.5 * (pointers[0].pageX + pointers[1].pageX);
				var y = 0.5 * (pointers[0].pageY + pointers[1].pageY);

				rotateStart.set(x, y);
			}
		}

		function handleTouchStartPan() {

			if (pointers.length === 1) {

				panStart.set(pointers[0].pageX, pointers[0].pageY);
			} else {

				var x = 0.5 * (pointers[0].pageX + pointers[1].pageX);
				var y = 0.5 * (pointers[0].pageY + pointers[1].pageY);

				panStart.set(x, y);
			}
		}

		function handleTouchStartDolly() {

			var dx = pointers[0].pageX - pointers[1].pageX;
			var dy = pointers[0].pageY - pointers[1].pageY;

			var distance = Math.sqrt(dx * dx + dy * dy);

			dollyStart.set(0, distance);
		}

		function handleTouchStartDollyPan() {

			if (scope.enableZoom) handleTouchStartDolly();

			if (scope.enablePan) handleTouchStartPan();
		}

		function handleTouchStartDollyRotate() {

			if (scope.enableZoom) handleTouchStartDolly();

			if (scope.enableRotate) handleTouchStartRotate();
		}

		function handleTouchMoveRotate(event) {

			if (pointers.length == 1) {

				rotateEnd.set(event.pageX, event.pageY);
			} else {

				var position = getSecondPointerPosition(event);

				var x = 0.5 * (event.pageX + position.x);
				var y = 0.5 * (event.pageY + position.y);

				rotateEnd.set(x, y);
			}

			rotateDelta.subVectors(rotateEnd, rotateStart).multiplyScalar(scope.rotateSpeed);

			var element = scope.domElement;

			rotateLeft(2 * Math.PI * rotateDelta.x / element.clientHeight); // yes, height

			rotateUp(2 * Math.PI * rotateDelta.y / element.clientHeight);

			rotateStart.copy(rotateEnd);
		}

		function handleTouchMovePan(event) {

			if (pointers.length === 1) {

				panEnd.set(event.pageX, event.pageY);
			} else {

				var position = getSecondPointerPosition(event);

				var x = 0.5 * (event.pageX + position.x);
				var y = 0.5 * (event.pageY + position.y);

				panEnd.set(x, y);
			}

			panDelta.subVectors(panEnd, panStart).multiplyScalar(scope.panSpeed);

			pan(panDelta.x, panDelta.y);

			panStart.copy(panEnd);
		}

		function handleTouchMoveDolly(event) {

			var position = getSecondPointerPosition(event);

			var dx = event.pageX - position.x;
			var dy = event.pageY - position.y;

			var distance = Math.sqrt(dx * dx + dy * dy);

			dollyEnd.set(0, distance);

			dollyDelta.set(0, Math.pow(dollyEnd.y / dollyStart.y, scope.zoomSpeed));

			dollyOut(dollyDelta.y);

			dollyStart.copy(dollyEnd);
		}

		function handleTouchMoveDollyPan(event) {

			if (scope.enableZoom) handleTouchMoveDolly(event);

			if (scope.enablePan) handleTouchMovePan(event);
		}

		function handleTouchMoveDollyRotate(event) {

			if (scope.enableZoom) handleTouchMoveDolly(event);

			if (scope.enableRotate) handleTouchMoveRotate(event);
		}

		//
		// event handlers - FSM: listen for events and reset state
		//

		function onPointerDown(event) {

			if (scope.enabled === false) return;

			if (pointers.length === 0) {

				scope.domElement.setPointerCapture(event.pointerId);

				scope.domElement.addEventListener('pointermove', onPointerMove);
				scope.domElement.addEventListener('pointerup', onPointerUp);
			}

			//

			addPointer(event);

			if (event.pointerType === 'touch') {

				onTouchStart(event);
			} else {

				onMouseDown(event);
			}
		}

		function onPointerMove(event) {

			if (scope.enabled === false) return;

			if (event.pointerType === 'touch') {

				onTouchMove(event);
			} else {

				onMouseMove(event);
			}
		}

		function onPointerUp(event) {

			removePointer(event);

			if (pointers.length === 0) {

				scope.domElement.releasePointerCapture(event.pointerId);

				scope.domElement.removeEventListener('pointermove', onPointerMove);
				scope.domElement.removeEventListener('pointerup', onPointerUp);
			}

			scope.dispatchEvent(_endEvent);

			state = STATE.NONE;
		}

		function onPointerCancel(event) {

			removePointer(event);
		}

		function onMouseDown(event) {

			var mouseAction = void 0;

			switch (event.button) {

				case 0:

					mouseAction = scope.mouseButtons.LEFT;
					break;

				case 1:

					mouseAction = scope.mouseButtons.MIDDLE;
					break;

				case 2:

					mouseAction = scope.mouseButtons.RIGHT;
					break;

				default:

					mouseAction = -1;

			}

			switch (mouseAction) {

				case THREE.MOUSE.DOLLY:

					if (scope.enableZoom === false) return;

					handleMouseDownDolly(event);

					state = STATE.DOLLY;

					break;

				case THREE.MOUSE.ROTATE:

					if (event.ctrlKey || event.metaKey || event.shiftKey) {

						if (scope.enablePan === false) return;

						handleMouseDownPan(event);

						state = STATE.PAN;
					} else {

						if (scope.enableRotate === false) return;

						handleMouseDownRotate(event);

						state = STATE.ROTATE;
					}

					break;

				case THREE.MOUSE.PAN:

					if (event.ctrlKey || event.metaKey || event.shiftKey) {

						if (scope.enableRotate === false) return;

						handleMouseDownRotate(event);

						state = STATE.ROTATE;
					} else {

						if (scope.enablePan === false) return;

						handleMouseDownPan(event);

						state = STATE.PAN;
					}

					break;

				default:

					state = STATE.NONE;

			}

			if (state !== STATE.NONE) {

				scope.dispatchEvent(_startEvent);
			}
		}

		function onMouseMove(event) {

			if (scope.enabled === false) return;

			switch (state) {

				case STATE.ROTATE:

					if (scope.enableRotate === false) return;

					handleMouseMoveRotate(event);

					break;

				case STATE.DOLLY:

					if (scope.enableZoom === false) return;

					handleMouseMoveDolly(event);

					break;

				case STATE.PAN:

					if (scope.enablePan === false) return;

					handleMouseMovePan(event);

					break;

			}
		}

		function onMouseWheel(event) {

			if (scope.enabled === false || scope.enableZoom === false || state !== STATE.NONE) return;

			event.preventDefault();

			scope.dispatchEvent(_startEvent);

			handleMouseWheel(event);

			scope.dispatchEvent(_endEvent);
		}

		function onKeyDown(event) {

			if (scope.enabled === false || scope.enablePan === false) return;

			handleKeyDown(event);
		}

		function onTouchStart(event) {

			trackPointer(event);

			switch (pointers.length) {

				case 1:

					switch (scope.touches.ONE) {

						case THREE.TOUCH.ROTATE:

							if (scope.enableRotate === false) return;

							handleTouchStartRotate();

							state = STATE.TOUCH_ROTATE;

							break;

						case THREE.TOUCH.PAN:

							if (scope.enablePan === false) return;

							handleTouchStartPan();

							state = STATE.TOUCH_PAN;

							break;

						default:

							state = STATE.NONE;

					}

					break;

				case 2:

					switch (scope.touches.TWO) {

						case THREE.TOUCH.DOLLY_PAN:

							if (scope.enableZoom === false && scope.enablePan === false) return;

							handleTouchStartDollyPan();

							state = STATE.TOUCH_DOLLY_PAN;

							break;

						case THREE.TOUCH.DOLLY_ROTATE:

							if (scope.enableZoom === false && scope.enableRotate === false) return;

							handleTouchStartDollyRotate();

							state = STATE.TOUCH_DOLLY_ROTATE;

							break;

						default:

							state = STATE.NONE;

					}

					break;

				default:

					state = STATE.NONE;

			}

			if (state !== STATE.NONE) {

				scope.dispatchEvent(_startEvent);
			}
		}

		function onTouchMove(event) {

			trackPointer(event);

			switch (state) {

				case STATE.TOUCH_ROTATE:

					if (scope.enableRotate === false) return;

					handleTouchMoveRotate(event);

					scope.update();

					break;

				case STATE.TOUCH_PAN:

					if (scope.enablePan === false) return;

					handleTouchMovePan(event);

					scope.update();

					break;

				case STATE.TOUCH_DOLLY_PAN:

					if (scope.enableZoom === false && scope.enablePan === false) return;

					handleTouchMoveDollyPan(event);

					scope.update();

					break;

				case STATE.TOUCH_DOLLY_ROTATE:

					if (scope.enableZoom === false && scope.enableRotate === false) return;

					handleTouchMoveDollyRotate(event);

					scope.update();

					break;

				default:

					state = STATE.NONE;

			}
		}

		function onContextMenu(event) {

			if (scope.enabled === false) return;

			event.preventDefault();
		}

		function addPointer(event) {

			pointers.push(event);
		}

		function removePointer(event) {

			delete pointerPositions[event.pointerId];

			for (var i = 0; i < pointers.length; i++) {

				if (pointers[i].pointerId == event.pointerId) {

					pointers.splice(i, 1);
					return;
				}
			}
		}

		function trackPointer(event) {

			var position = pointerPositions[event.pointerId];

			if (position === undefined) {

				position = new THREE.Vector2();
				pointerPositions[event.pointerId] = position;
			}

			position.set(event.pageX, event.pageY);
		}

		function getSecondPointerPosition(event) {

			var pointer = event.pointerId === pointers[0].pointerId ? pointers[1] : pointers[0];

			return pointerPositions[pointer.pointerId];
		}

		//

		scope.domElement.addEventListener('contextmenu', onContextMenu);

		scope.domElement.addEventListener('pointerdown', onPointerDown);
		scope.domElement.addEventListener('pointercancel', onPointerCancel);
		scope.domElement.addEventListener('wheel', onMouseWheel, { passive: false });

		// force an update at start

		_this.update();

		return _this;
	}

	return OrbitControls;
}(ERPEventDispatcher);

// This set of controls performs orbiting, dollying (zooming), and panning.
// Unlike TrackballControls, it maintains the "up" direction object.up (+Y by default).
// This is very similar to OrbitControls, another set of touch behavior
//
//    Orbit - right mouse, or left mouse + ctrl/meta/shiftKey / touch: two-finger rotate
//    Zoom - middle mouse, or mousewheel / touch: two-finger spread or squish
//    Pan - left mouse, or arrow keys / touch: one-finger move

var MapControls = function (_OrbitControls) {
	_inherits(MapControls, _OrbitControls);

	function MapControls(object, domElement) {
		_classCallCheck(this, MapControls);

		var _this2 = _possibleConstructorReturn(this, (MapControls.__proto__ || Object.getPrototypeOf(MapControls)).call(this, object, domElement));

		_this2.screenSpacePanning = false; // pan orthogonal to world-space direction camera.up

		_this2.mouseButtons.LEFT = THREE.MOUSE.PAN;
		_this2.mouseButtons.RIGHT = THREE.MOUSE.ROTATE;

		_this2.touches.ONE = THREE.TOUCH.PAN;
		_this2.touches.TWO = THREE.TOUCH.DOLLY_ROTATE;
		return _this2;
	}

	return MapControls;
}(OrbitControls);

/* Rhino loader */


var _taskCache = new WeakMap();

var ERPLoader = function () {
	function ERPLoader(manager) {
		_classCallCheck(this, ERPLoader);

		this.manager = manager !== undefined ? manager : THREE.DefaultLoadingManager;
		this.crossOrigin = 'anonymous';
		this.withCredentials = false;
		this.path = '';
		this.resourcePath = '';
		this.requestHeader = {};
	}

	_createClass(ERPLoader, [{
		key: 'load',
		value: function load()
		/* url, onLoad, onProgress, onError */
		{}
	}, {
		key: 'loadAsync',
		value: function loadAsync(url, onProgress) {
			var scope = this;
			return new Promise(function (resolve, reject) {
				scope.load(url, resolve, onProgress, reject);
			});
		}
	}, {
		key: 'parse',
		value: function parse()
		/* data */
		{}
	}, {
		key: 'setCrossOrigin',
		value: function setCrossOrigin(crossOrigin) {
			this.crossOrigin = crossOrigin;
			return this;
		}
	}, {
		key: 'setWithCredentials',
		value: function setWithCredentials(value) {
			this.withCredentials = value;
			return this;
		}
	}, {
		key: 'setPath',
		value: function setPath(path) {
			this.path = path;
			return this;
		}
	}, {
		key: 'setResourcePath',
		value: function setResourcePath(resourcePath) {
			this.resourcePath = resourcePath;
			return this;
		}
	}, {
		key: 'setRequestHeader',
		value: function setRequestHeader(requestHeader) {
			this.requestHeader = requestHeader;
			return this;
		}
	}]);

	return ERPLoader;
}();

var Rhino3dmLoader = function (_ERPLoader) {
	_inherits(Rhino3dmLoader, _ERPLoader);

	function Rhino3dmLoader(manager) {
		_classCallCheck(this, Rhino3dmLoader);

		var _this3 = _possibleConstructorReturn(this, (Rhino3dmLoader.__proto__ || Object.getPrototypeOf(Rhino3dmLoader)).call(this, manager));

		_this3.libraryPath = '';
		_this3.libraryPending = null;
		_this3.libraryBinary = null;
		_this3.libraryConfig = {};

		_this3.url = '';

		_this3.workerLimit = 4;
		_this3.workerPool = [];
		_this3.workerNextTaskID = 1;
		_this3.workerSourceURL = '';
		_this3.workerConfig = {};

		_this3.materials = [];
		_this3.warnings = [];

		return _this3;
	}

	_createClass(Rhino3dmLoader, [{
		key: 'setLibraryPath',
		value: function setLibraryPath(path) {

			this.libraryPath = path;

			return this;
		}
	}, {
		key: 'setWorkerLimit',
		value: function setWorkerLimit(workerLimit) {

			this.workerLimit = workerLimit;

			return this;
		}
	}, {
		key: 'load',
		value: function load(url, onLoad, onProgress, onError) {
			var _this4 = this;

			var loader = new THREE.FileLoader(this.manager);

			loader.setPath(this.path);
			loader.setResponseType('arraybuffer');
			loader.setRequestHeader(this.requestHeader);

			this.url = url;

			loader.load(url, function (buffer) {

				// Check for an existing task using this buffer. A transferred buffer cannot be transferred
				// again from this thread.
				if (_taskCache.has(buffer)) {

					var cachedTask = _taskCache.get(buffer);

					return cachedTask.promise.then(onLoad).catch(onError);
				}

				_this4.decodeObjects(buffer, url).then(function (result) {

					result.userData.warnings = _this4.warnings;
					onLoad(result);
				}).catch(function (e) {
					return onError(e);
				});
			}, onProgress, onError);
		}
	}, {
		key: 'debug',
		value: function debug() {

			console.log('Task load: ', this.workerPool.map(function (worker) {
				return worker._taskLoad;
			}));
		}
	}, {
		key: 'decodeObjects',
		value: function decodeObjects(buffer, url) {
			var _this5 = this;

			var worker = void 0;
			var taskID = void 0;

			var taskCost = buffer.byteLength;

			var objectPending = this._getWorker(taskCost).then(function (_worker) {

				worker = _worker;
				taskID = _this5.workerNextTaskID++;

				return new Promise(function (resolve, reject) {

					worker._callbacks[taskID] = { resolve: resolve, reject: reject };

					worker.postMessage({ type: 'decode', id: taskID, buffer: buffer }, [buffer]);

					// this.debug();
				});
			}).then(function (message) {
				return _this5._createGeometry(message.data);
			}).catch(function (e) {

				throw e;
			});

			// Remove task from the task list.
			// Note: replaced '.finally()' with '.catch().then()' block - iOS 11 support (#19416)
			objectPending.catch(function () {
				return true;
			}).then(function () {

				if (worker && taskID) {

					_this5._releaseTask(worker, taskID);

					//this.debug();
				}
			});

			// Cache the task result.
			_taskCache.set(buffer, {

				url: url,
				promise: objectPending

			});

			return objectPending;
		}
	}, {
		key: 'parse',
		value: function parse(data, onLoad, onError) {
			var _this6 = this;

			this.decodeObjects(data, '').then(function (result) {

				result.userData.warnings = _this6.warnings;
				onLoad(result);
			}).catch(function (e) {
				return onError(e);
			});
		}
	}, {
		key: '_compareMaterials',
		value: function _compareMaterials(material) {

			var mat = {};
			mat.name = material.name;
			mat.color = {};
			mat.color.r = material.color.r;
			mat.color.g = material.color.g;
			mat.color.b = material.color.b;
			mat.type = material.type;

			for (var i = 0; i < this.materials.length; i++) {

				var m = this.materials[i];
				var _mat = {};
				_mat.name = m.name;
				_mat.color = {};
				_mat.color.r = m.color.r;
				_mat.color.g = m.color.g;
				_mat.color.b = m.color.b;
				_mat.type = m.type;

				if (JSON.stringify(mat) === JSON.stringify(_mat)) {

					return m;
				}
			}

			this.materials.push(material);

			return material;
		}
	}, {
		key: '_createMaterial',
		value: function _createMaterial(material) {

			if (material === undefined) {

				return new THREE.MeshStandardMaterial({
					color: new THREE.Color(1, 1, 1),
					metalness: 0.8,
					name: 'default',
					side: 2
				});
			}

			var _diffuseColor = material.diffuseColor;

			var diffusecolor = new THREE.Color(_diffuseColor.r / 255.0, _diffuseColor.g / 255.0, _diffuseColor.b / 255.0);

			if (_diffuseColor.r === 0 && _diffuseColor.g === 0 && _diffuseColor.b === 0) {

				diffusecolor.r = 1;
				diffusecolor.g = 1;
				diffusecolor.b = 1;
			}

			// console.log( material );

			var mat = new THREE.MeshStandardMaterial({
				color: diffusecolor,
				name: material.name,
				side: 2,
				transparent: material.transparency > 0 ? true : false,
				opacity: 1.0 - material.transparency
			});

			var textureLoader = new THREE.TextureLoader();

			for (var i = 0; i < material.textures.length; i++) {

				var texture = material.textures[i];

				if (texture.image !== null) {

					var map = textureLoader.load(texture.image);

					switch (texture.type) {

						case 'Diffuse':

							mat.map = map;

							break;

						case 'Bump':

							mat.bumpMap = map;

							break;

						case 'Transparency':

							mat.alphaMap = map;
							mat.transparent = true;

							break;

						case 'Emap':

							mat.envMap = map;

							break;

					}

					map.wrapS = texture.wrapU === 0 ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
					map.wrapT = texture.wrapV === 0 ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
					map.repeat.set(texture.repeat[0], texture.repeat[1]);
				}
			}

			return mat;
		}
	}, {
		key: '_createGeometry',
		value: function _createGeometry(data) {

			// console.log(data);

			var object = new THREE.Object3D();
			var instanceDefinitionObjects = [];
			var instanceDefinitions = [];
			var instanceReferences = [];
			var texts_arr = [];

			object.userData['layers'] = data.layers;
			object.userData['groups'] = data.groups;
			object.userData['settings'] = data.settings;
			object.userData['objectType'] = 'File3dm';
			object.userData['materials'] = null;
			object.userData['texts'] = texts_arr;
			object.name = this.url;

			var objects = data.objects;
			var materials = data.materials;

			for (var i = 0; i < objects.length; i++) {

				var obj = objects[i];
				var attributes = obj.attributes;

				switch (obj.objectType) {

					case 'InstanceDefinition':

						instanceDefinitions.push(obj);

						break;

					case 'InstanceReference':

						instanceReferences.push(obj);

						break;

					default:

						var _object = void 0;

						if (attributes.materialIndex >= 0) {

							var rMaterial = materials[attributes.materialIndex];
							var material = this._createMaterial(rMaterial);
							material = this._compareMaterials(material);
							_object = this._createObject(obj, material);
						} else {

							var _material = this._createMaterial();
							_object = this._createObject(obj, _material);
						}

						if (_object === undefined) {
							if (obj.objectType == "TextDot") {
								texts_arr.push(obj.geometry);
							}
							continue;
						}

						var layer = data.layers[attributes.layerIndex];

						_object.visible = layer ? data.layers[attributes.layerIndex].visible : true;

						if (attributes.isInstanceDefinitionObject) {

							instanceDefinitionObjects.push(_object);
						} else {

							object.add(_object);
						}

						break;

				}
			}

			for (var _i = 0; _i < instanceDefinitions.length; _i++) {

				var iDef = instanceDefinitions[_i];

				objects = [];

				for (var j = 0; j < iDef.attributes.objectIds.length; j++) {

					var objId = iDef.attributes.objectIds[j];

					for (var p = 0; p < instanceDefinitionObjects.length; p++) {

						var idoId = instanceDefinitionObjects[p].userData.attributes.id;

						if (objId === idoId) {

							objects.push(instanceDefinitionObjects[p]);
						}
					}
				}

				// Currently clones geometry and does not take advantage of instancing

				for (var _j = 0; _j < instanceReferences.length; _j++) {

					var iRef = instanceReferences[_j];

					if (iRef.geometry.parentIdefId === iDef.attributes.id) {

						var iRefObject = new THREE.Object3D();
						var xf = iRef.geometry.xform.array;

						var matrix = new THREE.Matrix4();
						matrix.set(xf[0], xf[1], xf[2], xf[3], xf[4], xf[5], xf[6], xf[7], xf[8], xf[9], xf[10], xf[11], xf[12], xf[13], xf[14], xf[15]);

						iRefObject.applyMatrix4(matrix);

						for (var _p = 0; _p < objects.length; _p++) {

							iRefObject.add(objects[_p].clone(true));
						}

						object.add(iRefObject);
					}
				}
			}

			object.userData['materials'] = this.materials;
			return object;
		}
	}, {
		key: '_createObject',
		value: function _createObject(obj, mat) {

			var loader = new THREE.BufferGeometryLoader();

			var attributes = obj.attributes;

			var geometry = void 0,
			    material = void 0,
			    _color = void 0,
			    color = void 0;

			switch (obj.objectType) {

				case 'Point':
				case 'PointSet':

					geometry = loader.parse(obj.geometry);

					if (geometry.attributes.hasOwnProperty('color')) {

						material = new THREE.PointsMaterial({ vertexColors: true, sizeAttenuation: false, size: 2 });
					} else {

						_color = attributes.drawColor;
						color = new THREE.Color(_color.r / 255.0, _color.g / 255.0, _color.b / 255.0);
						material = new THREE.PointsMaterial({ color: color, sizeAttenuation: false, size: 2 });
					}

					material = this._compareMaterials(material);

					var points = new THREE.Points(geometry, material);
					points.userData['attributes'] = attributes;
					points.userData['objectType'] = obj.objectType;

					if (attributes.name) {

						points.name = attributes.name;
					}

					return points;

				case 'Mesh':
				case 'Extrusion':
				case 'SubD':
				case 'Brep':

					if (obj.geometry === null) return;

					geometry = loader.parse(obj.geometry);

					if (geometry.attributes.hasOwnProperty('color')) {

						mat.vertexColors = true;
					}

					if (mat === null) {

						mat = this._createMaterial();
						mat = this._compareMaterials(mat);
					}

					var mesh = new THREE.Mesh(geometry, mat);
					mesh.castShadow = attributes.castsShadows;
					mesh.receiveShadow = attributes.receivesShadows;
					mesh.userData['attributes'] = attributes;
					mesh.userData['objectType'] = obj.objectType;

					if (attributes.name) {

						mesh.name = attributes.name;
					}

					return mesh;

				case 'Curve':

					geometry = loader.parse(obj.geometry);

					_color = attributes.drawColor;
					color = new THREE.Color(_color.r / 255.0, _color.g / 255.0, _color.b / 255.0);

					material = new THREE.LineBasicMaterial({ color: color });
					material = this._compareMaterials(material);

					var lines = new THREE.Line(geometry, material);
					lines.userData['attributes'] = attributes;
					lines.userData['objectType'] = obj.objectType;

					if (attributes.name) {

						lines.name = attributes.name;
					}

					return lines;

				case 'TextDot':

					return undefined;
					geometry = obj.geometry;

					var ctx = document.createElement('canvas').getContext('2d');
					var font = geometry.fontHeight + 'px ' + geometry.fontFace;
					ctx.font = font;
					var width = ctx.measureText(geometry.text).width + 10;
					var height = geometry.fontHeight + 10;

					var r = window.devicePixelRatio;

					ctx.canvas.width = width * r;
					ctx.canvas.height = height * r;
					ctx.canvas.style.width = width + 'px';
					ctx.canvas.style.height = height + 'px';
					ctx.setTransform(r, 0, 0, r, 0, 0);

					ctx.font = font;
					ctx.textBaseline = 'middle';
					ctx.textAlign = 'center';
					color = attributes.drawColor;
					ctx.fillStyle = 'rgba(' + color.r + ',' + color.g + ',' + color.b + ',' + color.a + ')';
					ctx.fillRect(0, 0, width, height);
					ctx.fillStyle = 'white';
					ctx.fillText(geometry.text, width / 2, height / 2);

					var texture = new THREE.CanvasTexture(ctx.canvas);
					texture.minFilter = THREE.LinearFilter;
					texture.wrapS = THREE.ClampToEdgeWrapping;
					texture.wrapT = THREE.ClampToEdgeWrapping;

					material = new THREE.SpriteMaterial({ map: texture, depthTest: false });
					var sprite = new THREE.Sprite(material);
					sprite.position.set(geometry.point[0], geometry.point[1], geometry.point[2]);
					sprite.scale.set(width / 10, height / 10, 1.0);

					sprite.userData['attributes'] = attributes;
					sprite.userData['objectType'] = obj.objectType;

					if (attributes.name) {

						sprite.name = attributes.name;
					}

					return sprite;

				case 'Light':

					geometry = obj.geometry;

					var light = void 0;

					switch (geometry.lightStyle.name) {

						case 'LightStyle_WorldPoint':

							light = new THREE.PointLight();
							light.castShadow = attributes.castsShadows;
							light.position.set(geometry.location[0], geometry.location[1], geometry.location[2]);
							light.shadow.normalBias = 0.1;

							break;

						case 'LightStyle_WorldSpot':

							light = new THREE.SpotLight();
							light.castShadow = attributes.castsShadows;
							light.position.set(geometry.location[0], geometry.location[1], geometry.location[2]);
							light.target.position.set(geometry.direction[0], geometry.direction[1], geometry.direction[2]);
							light.angle = geometry.spotAngleRadians;
							light.shadow.normalBias = 0.1;

							break;

						case 'LightStyle_WorldRectangular':

							light = new THREE.RectAreaLight();
							var _width = Math.abs(geometry.width[2]);
							var _height = Math.abs(geometry.length[0]);
							light.position.set(geometry.location[0] - _height / 2, geometry.location[1], geometry.location[2] - _width / 2);
							light.height = _height;
							light.width = _width;
							light.lookAt(new THREE.Vector3(geometry.direction[0], geometry.direction[1], geometry.direction[2]));

							break;

						case 'LightStyle_WorldDirectional':

							light = new THREE.DirectionalLight();
							light.castShadow = attributes.castsShadows;
							light.position.set(geometry.location[0], geometry.location[1], geometry.location[2]);
							light.target.position.set(geometry.direction[0], geometry.direction[1], geometry.direction[2]);
							light.shadow.normalBias = 0.1;

							break;

						case 'LightStyle_WorldLinear':
							// not conversion exists, warning has already been printed to the console
							break;

						default:
							break;

					}

					if (light) {

						light.intensity = geometry.intensity;
						_color = geometry.diffuse;
						color = new THREE.Color(_color.r / 255.0, _color.g / 255.0, _color.b / 255.0);
						light.color = color;
						light.userData['attributes'] = attributes;
						light.userData['objectType'] = obj.objectType;
					}

					return light;

			}
		}
	}, {
		key: '_initLibrary',
		value: function _initLibrary() {
			var _this7 = this;

			if (!this.libraryPending) {

				// Load rhino3dm wrapper.
				// const jsLoader = new THREE.FileLoader( this.manager );
				// jsLoader.setPath( this.libraryPath );
				// const jsContent = new Promise( ( resolve, reject ) => {

				// 	jsLoader.load( 'rhino3dm.js', resolve, undefined, reject );

				// } );

				// Load rhino3dm WASM binary.
				var binaryLoader = new THREE.FileLoader(this.manager);
				binaryLoader.setPath(this.libraryPath);
				binaryLoader.setResponseType('arraybuffer');
				var binaryContent = new Promise(function (resolve, reject) {
					binaryLoader.load('rhino3dm.wasm', resolve, undefined, reject);
				});

				this.libraryPending = Promise.all([binaryContent]).then(function (_ref) {
					var _ref2 = _slicedToArray(_ref, 1),
					    binaryContent = _ref2[0];

					//this.libraryBinary = binaryContent;
					_this7.libraryConfig.wasmBinary = binaryContent;
					// const fn = Rhino3dmWorker.toString();
					// const body = [
					// 	'/* rhino3dm.js */',
					// 	jsContent,
					// 	'/* worker */',
					// 	fn.substring( fn.indexOf( '{' ) + 1, fn.lastIndexOf( '}' ) )
					// ].join( '\n' );

					// this.workerSourceURL = URL.createObjectURL( new Blob( [ body ] ) );
					_this7.workerSourceURL = "/js/threeD/rhinoWorker1.js";
				});
			}

			return this.libraryPending;
		}
	}, {
		key: '_getWorker',
		value: function _getWorker(taskCost) {
			var _this8 = this;

			return this._initLibrary().then(function () {

				if (_this8.workerPool.length < _this8.workerLimit) {

					var _worker2 = new Worker(_this8.workerSourceURL);

					_worker2._callbacks = {};
					_worker2._taskCosts = {};
					_worker2._taskLoad = 0;

					_worker2.postMessage({
						type: 'init',
						libraryConfig: _this8.libraryConfig
					});

					_worker2.onmessage = function (e) {

						var message = e.data;

						switch (message.type) {

							case 'warning':
								_this8.warnings.push(message.data);
								console.warn(message.data);
								break;

							case 'decode':
								_worker2._callbacks[message.id].resolve(message);
								break;

							case 'error':
								_worker2._callbacks[message.id].reject(message);
								break;

							default:
								console.error('THREE.Rhino3dmLoader: Unexpected message, "' + message.type + '"');

						}
					};

					_this8.workerPool.push(_worker2);
				} else {

					_this8.workerPool.sort(function (a, b) {

						return a._taskLoad > b._taskLoad ? -1 : 1;
					});
				}

				var worker = _this8.workerPool[_this8.workerPool.length - 1];

				worker._taskLoad += taskCost;

				return worker;
			});
		}
	}, {
		key: '_releaseTask',
		value: function _releaseTask(worker, taskID) {

			worker._taskLoad -= worker._taskCosts[taskID];
			delete worker._callbacks[taskID];
			delete worker._taskCosts[taskID];
		}
	}, {
		key: 'dispose',
		value: function dispose() {

			for (var i = 0; i < this.workerPool.length; ++i) {

				this.workerPool[i].terminate();
			}

			this.workerPool.length = 0;

			return this;
		}
	}]);

	return Rhino3dmLoader;
}(ERPLoader);