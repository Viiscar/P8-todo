/*global app, $on */
(function () {
	'use strict';

	/**
	 * Sets up a brand new Todo list.
	 * @constructor
	 * @param {string} name - The name of the new todo list.
	 */
	function Todo(name) {
		this.storage = new app.Store(name);
		this.model = new app.Model(this.storage);
		this.template = new app.Template();
		this.view = new app.View(this.template);
		this.controller = new app.Controller(this.model, this.view);
	}

	/**
	 * Creating a new Todo
	 */
	var todo = new Todo('todos-vanillajs');

	/**
	 * Routing the url to ''|| active || completed
	 */
	function setView() {
		todo.controller.setView(document.location.hash);
	}
	/**
	 * addEventListener
	 * Calls setView on load and on route changes
	 */
	$on(window, 'load', setView);
	$on(window, 'hashchange', setView);
})();
