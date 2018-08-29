'use strict';

function autoBind(self, options) {
				options = Object.assign({}, options);
				var filter = function filter(key) {
								var match = function match(pattern) {
												return typeof pattern === 'string' ? key === pattern : pattern.test(key);
								};
								if (options.include) {
												return options.include.some(match);
								}
								if (options.exclude) {
												return !options.exclude.some(match);
								}
								return true;
				};

				var _iteratorNormalCompletion = true;
				var _didIteratorError = false;
				var _iteratorError = undefined;

				try {
								for (var _iterator = Object.getOwnPropertyNames(self.constructor.prototype)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
												var key = _step.value;

												var val = self[key];

												if (key !== 'constructor' && typeof val === 'function' && filter(key)) {
																self[key] = val.bind(self);
												}
								}
				} catch (err) {
								_didIteratorError = true;
								_iteratorError = err;
				} finally {
								try {
												if (!_iteratorNormalCompletion && _iterator.return) {
																_iterator.return();
												}
								} finally {
												if (_didIteratorError) {
																throw _iteratorError;
												}
								}
				}

				return self;
}

function updateObject(oldObject, newValues) {
				return Object.assign({}, oldObject, newValues);
}

function updateItemInArray(array, itemId, updateItemCallback) {
				var updatedItems = array.map(function (item) {
								if (item.id !== itemId) {
												return item;
								}
								var updatedItem = updateItemCallback(item);
								return updatedItem;
				});

				return updatedItems;
}

function updateItemInArrayByIndex(array, index, updateItemCallback) {
				var updatedItems = array.map(function (item, i) {
								if (i !== index) {
												return item;
								}
								var updatedItem = updateItemCallback(item);
								return updatedItem;
				});

				return updatedItems;
}

function getAttributeByNode(targetNode, attrName, upserach, maxDeep) {
				if (upserach == null) upserach = true;
				var tNode = targetNode;
				var count = 0;
				do {
								if (tNode.hasAttribute(attrName)) {
												return tNode.getAttribute(attrName);
								}
								tNode = tNode.parentNode;
								++count;
				} while (tNode && (maxDeep == null || count < maxDeep));
				return null;
}

function extractPropsFromObj(obj, props_arr) {
				var rlt = {};
				props_arr.forEach(function (prop) {
								if (obj && obj[prop.name] != null) rlt[prop.name] = obj[prop.name];else {
												rlt[prop.name] = typeof prop.default == 'function' ? prop.default() : prop.default;
								}
				});
				return rlt;
}