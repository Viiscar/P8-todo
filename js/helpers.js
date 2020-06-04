/*global NodeList */
(function (window) {
	'use strict';

	/**
	 * Get element by CSS selector
	 * qs = querySelector()
	 * Used in {@link View}
	 */
	window.qs = function (selector, scope) {
		return (scope || document).querySelector(selector);
		console.log(indexOf(querySelector()));
	};

	/**
	 * Get elements by CSS selector
	 * qsa = querySelectorAll()
	 * Used in {@link View}
	 */
	window.qsa = function (selector, scope) {
		return (scope || document).querySelectorAll(selector);
	};
 
	/**
	 * addEventListener wrapper:
	 * @param {object} target - The targeted element
	 * @param {string} type - The event type (change, dblclick, blur, keypress, keyup, click, load, hashchange)
	 * @param {function} callback - Callback function
	 * @param {boolean} useCapture - Will blur or focus the targeted element
	 * Used in {@link View} and {@link App}
	 */
	window.$on = function (target, type, callback, useCapture) {
		target.addEventListener(type, callback, !!useCapture);
	};

	/**
	 * Attach a handler to event for all elements that match the selector
	 * @param {object} target - The targeted element
	 * @param {string} selector - The css class (.destroy, .toggle, li .edit)
	 * @param {string} type -  The event type (blur, click)
	 * @param {function} handler - Callback function
	 * Used in {@link View}
	 */
	window.$delegate = function (target, selector, type, handler) {
		function dispatchEvent(event) {
			var targetElement = event.target; //targets the element
			var potentialElements = window.qsa(selector, target); //querySelectorAll on targeted element and css class 
			var hasMatch = Array.prototype.indexOf.call(potentialElements, targetElement) >= 0; // if targetElement is a child of potentialElements there is a match

			if (hasMatch) { // if there is a match targetElement is called

				handler.call(targetElement, event);
			}
		}

		/**
		 * useCapture can be blur or focus
		 * @type {bolean}
		 */
		var useCapture = type === 'blur' || type === 'focus';

		/**
		 * addEventListener
		 * See {@link window.$on}
		 */
		window.$on(target, type, dispatchEvent, useCapture);
	};


	/**
	 * Find the element's parent with the given tag name: $parent(qs('a'), 'div');
	 * @param {object} element - Element
	 * @param {string} tagName - Element tagName
	 * @returns {object} - Parent's element
	 * Used in {@link View}
	 */
	window.$parent = function (element, tagName) {
		if (!element.parentNode) {// if there is no parent element nothing occurs
			return; 
		}

		if (element.parentNode.tagName.toLowerCase() === tagName.toLowerCase()) { // if the parent element's tagName is stricly equal to this tagName 
			return element.parentNode; // it returns the parent's element
		}
		return window.$parent(element.parentNode, tagName);
	};

	// Allow for looping on nodes by chaining:
	// qsa('.foo').forEach(function () {})
	NodeList.prototype.forEach = Array.prototype.forEach;
})(window);
