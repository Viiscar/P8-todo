/*global qs, qsa, $on, $parent, $delegate */

(function (window) {
	'use strict';

	/**
	 * View that abstracts away the browser's DOM completely.
	 * It has two simple entry points:
	 *
	 *   - bind(eventName, handler)
	 *     Takes a todo application event and registers the handler
	 *   - render(command, parameterObject)
	 *     Renders the given command with the options
	 *
	 * Defines {@link Template} values
	 * @constructor
	 * @param {object} template - 
	 */
	function View(template) {
		this.template = template;

		this.ENTER_KEY = 13;
		this.ESCAPE_KEY = 27;

		this.$todoList = qs('.todo-list');
		this.$todoItemCounter = qs('.todo-count');
		this.$clearCompleted = qs('.clear-completed');
		this.$main = qs('.main');
		this.$footer = qs('.footer');
		this.$toggleAll = qs('.toggle-all');
		this.$newTodo = qs('.new-todo');
	}

	/**
	 * Removes a Todo
	 * @param {number} id - item's ID to be removed 
	 */
	View.prototype._removeItem = function (id) {
		var elem = qs('[data-id="' + id + '"]');

		if (elem) {
			this.$todoList.removeChild(elem);
		}
	};

	/**
	 * Hides completed todos
	 * @param {number} completedCount - Completed  todos number
	 * @param {boolean} visible - True if visible
	 */
	View.prototype._clearCompletedButton = function (completedCount, visible) {
		this.$clearCompleted.innerHTML = this.template.clearCompletedButton(completedCount);
		this.$clearCompleted.style.display = visible ? 'block' : 'none';
	};

	/**
	 * Indicates current page (All, active, completed)
	 * @param {string} currentPage - value can be '', active or completed
	 */
	View.prototype._setFilter = function (currentPage) {
		qs('.filters .selected').className = '';
		qs('.filters [href="#/' + currentPage + '"]').className = 'selected';
	};

	/**
	 * Tests if the todo is completed
	 * @param {number} id - Todo's ID
	 * @param {boolean} completed - True if completed
	 */
	View.prototype._elementComplete = function (id, completed) {
		var listItem = qs('[data-id="' + id + '"]');

		if (!listItem) {
			return;
		}

		listItem.className = completed ? 'completed' : '';

		// In case it was toggled from an event and not by clicking the checkbox
		qs('input', listItem).checked = completed;
	};
	
	/**
	 * Allows todo's editing
	 * @param {number} id - Todo's ID
	 * @param {string} title - Todo's title
	 */
	View.prototype._editItem = function (id, title) {
		var listItem = qs('[data-id="' + id + '"]');

		if (!listItem) {
			return;
		}

		listItem.className = listItem.className + ' editing';

		var input = document.createElement('input');
		input.className = 'edit';

		listItem.appendChild(input);
		input.focus();
		input.value = title;
	};

	/**
	 * Edits a todo
	 * @param {number} id - Todo's ID
	 * @param {string} title - Edited todo's title
	 */
	View.prototype._editItemDone = function (id, title) {
		var listItem = qs('[data-id="' + id + '"]');

		if (!listItem) {
			return;
		}

		var input = qs('input.edit', listItem);
		listItem.removeChild(input);

		listItem.className = listItem.className.replace('editing', '');

		qsa('label', listItem).forEach(function (label) {
			label.textContent = title;
		});
	};

	/**
	 * Renders the elements
	 * @param {string} viewCmd - Active command 
	 * @param {object} parameter - Active parameter
	 */
	View.prototype.render = function (viewCmd, parameter) {

		var self = this;
		var viewCommands = {
			/**
			 * Shows todos
			 */
			showEntries: function () {
				self.$todoList.innerHTML = self.template.show(parameter);
			},
			/**
			 * Removes a todo
			 */
			removeItem: function () {
				self._removeItem(parameter);
			},
			/**
			 * Updates todos count
			 */
			updateElementCount: function () {
				self.$todoItemCounter.innerHTML = self.template.itemCounter(parameter);
			},
			/**
			 * Displays "Clear Completed" button
			 */
			clearCompletedButton: function () {
				self._clearCompletedButton(parameter.completed, parameter.visible);
			},
			/**
			 * Verifies todos' visibility
			 */
			contentBlockVisibility: function () {
				self.$main.style.display = self.$footer.style.display = parameter.visible ? 'block' : 'none';
			},
			/**
			 * Displays all todos to completed
			 */
			toggleAll: function () {
				self.$toggleAll.checked = parameter.checked;
			},
			/**
			 * Filters todos
			 */
			setFilter: function () {
				self._setFilter(parameter);
			},
			/**
			 * Clears the input field when a new todo is added
			 */
			clearNewTodo: function () {
				self.$newTodo.value = '';
			},
			/**
			 * Diplays completed todos
			 */
			elementComplete: function () {
				self._elementComplete(parameter.id, parameter.completed);
			},
			/**
			 * Allows todo's edition
			 */
			editItem: function () {
				self._editItem(parameter.id, parameter.title);
			},
			/**
			 * Saves todo's edition
			 */
			editItemDone: function () {
				self._editItemDone(parameter.id, parameter.title);
			}
		};

		viewCommands[viewCmd]();
	};

	/**
	 * Reads todo's ID and parses it
	 * @param {object} element - active todo
	 */
	View.prototype._itemId = function (element) {
		var li = $parent(element, 'li');
		return parseInt(li.dataset.id, 10);
	};

	/**
	 * EventListner on todo's edition validation
	 * @param {function} handler - Callback 
	 */
	View.prototype._bindItemEditDone = function (handler) {
		var self = this;
		$delegate(self.$todoList, 'li .edit', 'blur', function () {
			if (!this.dataset.iscanceled) {
				handler({
					id: self._itemId(this),
					title: this.value
				});
			}
		});

		$delegate(self.$todoList, 'li .edit', 'keypress', function (event) {
			if (event.keyCode === self.ENTER_KEY) {
				// Remove the cursor from the input when you hit enter just like if it
				// were a real form
				this.blur();
			}
		});
	};

	/**
	 * EventListner on todo's edition cancellation
	 * @param {function} handler - Callback
	 */
	View.prototype._bindItemEditCancel = function (handler) {
		var self = this;
		$delegate(self.$todoList, 'li .edit', 'keyup', function (event) {
			if (event.keyCode === self.ESCAPE_KEY) {
				this.dataset.iscanceled = true;
				this.blur();

				handler({id: self._itemId(this)});
			}
		});
	};

	/**
	 * Links {@link Controller} methods with {@link View} elements 
	 * @param {string} event - Active event
	 * @param {function} handler - Callback
	 */
	View.prototype.bind = function (event, handler) {
		var self = this;
		if (event === 'newTodo') {
			$on(self.$newTodo, 'change', function () {
				handler(self.$newTodo.value);
			});

		} else if (event === 'removeCompleted') {
			$on(self.$clearCompleted, 'click', function () {
				handler();
			});

		} else if (event === 'toggleAll') {
			$on(self.$toggleAll, 'click', function () {
				handler({completed: this.checked});
			});

		} else if (event === 'itemEdit') {
			$delegate(self.$todoList, 'li label', 'dblclick', function () {
				handler({id: self._itemId(this)});
			});

		} else if (event === 'itemRemove') {
			$delegate(self.$todoList, '.destroy', 'click', function () {
				handler({id: self._itemId(this)});
			});

		} else if (event === 'itemToggle') {
			$delegate(self.$todoList, '.toggle', 'click', function () {
				handler({
					id: self._itemId(this),
					completed: this.checked
				});
			});

		} else if (event === 'itemEditDone') {
			self._bindItemEditDone(handler);

		} else if (event === 'itemEditCancel') {
			self._bindItemEditCancel(handler);
		}
	};

	// Export to window
	window.app = window.app || {};
	window.app.View = View;
}(window));