const fs = require('fs');
const isUUID = require('is-uuid');
const uuid = require('uuid');
const moment = require('moment');

const categoryController = require('../controllers/categoryController');

const DB_PATH = (process.env.NODE_ENV === 'test') ? 'tests/data' : 'data';

/*----------  Private Recipe Variables  ----------*/

const _categoryID = new WeakMap();
const _dateCreated = new WeakMap();
const _evernoteGUID = new WeakMap();
const _name = new WeakMap();

/*===================================================
=            Category Class Definition            =
===================================================*/
class Category {
	constructor(value) {
		if (!(this instanceof Category)) {
	    throw new Error("Category needs to be called with the new keyword");
	  }
		try {
			// if we didn't pass a value parameter, just create an empty object
			if ((typeof value === 'undefined') || !value) {
				_categoryID.set(this, uuid.v1());
				_dateCreated.set(this, moment());
				_evernoteGUID.set(this, null);
				_name.set(this, null);

				return true;
			}

			// if we have a value, ensure that it at least has an associated categoryID
			if (value && (typeof value === 'object')) {
				_categoryID.set(this, value.categoryID || uuid.v1());
				_dateCreated.set(this, moment(value.dateCreated) || moment());
				_evernoteGUID.set(this, value.evernoteGUID || null);
				_name.set(this, value.name || null);

				return true;
			}

			throw new Error('Invalid constructor for Category');
		} catch (ex) {
			throw new Error('Invalid constructor for Category');
		}
	}

	/*=========================================
	=            Getters / Setters            =
	=========================================*/

	/*----------  categoryID  ----------*/
	get categoryID() {
		return _categoryID.get(this);
	}

	set categoryID(value) {
		if (value && value !== '' && isUUID.v1(value)) {
			return _categoryID.set(this, value);
		}
		throw new Error('Invalid categoryID provided');
	}

	/*----------  dateCreated  ----------*/
	get dateCreated() {
		return _dateCreated.get(this);
	}

	set dateCreated(value) {
		throw new Error('Cannot update dateCreated value');
	}

	/*----------  evernoteGUID  ----------*/
	get evernoteGUID() {
		return _evernoteGUID.get(this);
	}

	set evernoteGUID(value) {
		if ((typeof value === 'string' || value instanceof String) && (value !== '')) {
			return _evernoteGUID.set(this, value);
		}
		throw new Error('Invalid evernoteGUID provided');
	}

	/*----------  name  ----------*/
	get name() {
		return _name.get(this);
	}

	set name(value) {
		if ((typeof value === 'string' || value instanceof String) && (value !== '')) {
			return _name.set(this, value);
		}
		throw new Error('Invalid name provided');
	}

	/*=====  End of Getters / Setters  ======*/


	/*==========================================
	=            Category Methods            =
	==========================================*/
	getCategory() {
		return {
			categoryID: _categoryID.get(this),
			dateCreated: _dateCreated.get(this),
			evernoteGUID: _evernoteGUID.get(this),
			name: _name.get(this)
		};
	}

	saveCategory() {
		let categories = [];

		try {
			categories = JSON.parse(fs.readFileSync(`${DB_PATH}/categories.json`, 'utf8'));
		} catch (ex) {
			throw new Error('Error reading categories.json');
		}

		// determine if this is an existing category or not
		let existingCategory = categoryController.findCategories('categoryID', _categoryID.get(this));

		// add this category if it hasn't been added before
		if (existingCategory && existingCategory.length === 0) {
			categories.push(this.getCategory());
		} else {
			// otherwise update the exisiting record
			categories.forEach((cat, index) => {
		    if (cat.categoryID === _categoryID.get(this)) {
		      categories[index] = this.getCategory();
		    }
			});
		}

		// save categories
		fs.writeFileSync(`${DB_PATH}/categories.json`, JSON.stringify(categories, null, 2), 'utf-8', (err) => {
			if (err) throw new Error(`An error occurred while writing categories data`);
		});
	}

	/*=====  End of Category Methods  ======*/
};
/*=====  End of Category Class Definition  ======*/

module.exports = Category;
