const fs = require('fs');
const isUUID = require('is-uuid');
const uuid = require('uuid');
const moment = require('moment');

const Category = require('./categoryModel');
const categoryController = require('../controllers/categoryController');
const ingredientController = require('../controllers/ingredientController');
const recipeController = require('../controllers/recipeController');
const Tag = require('./tagModel');
const tagController = require('../controllers/tagController');

const DB_PATH = (process.env.NODE_ENV === 'test') ? 'tests/data' : 'data';

/*----------  Private Recipe Variables  ----------*/

const _recipeID = new WeakMap();
const _evernoteGUID = new WeakMap();
const _dateCreated = new WeakMap();
const _dateUpdated = new WeakMap();

const _title = new WeakMap();
const _source = new WeakMap();
const _image = new WeakMap();

const _categories = new WeakMap();
const _tags = new WeakMap();

const _ingredients = new WeakMap();
const _instructions = new WeakMap();

/*===================================================
=            Recipe Class Definition            =
===================================================*/
class Recipe {
	constructor(value) {
		if (!(this instanceof Recipe)) {
	    throw new Error("Recipe needs to be called with the new keyword");
	  }
		try {
			// if we didn't pass a value parameter, just create an empty object
			if ((typeof value === 'undefined') || !value) {
				_recipeID.set(this, uuid.v1());
				_evernoteGUID.set(this, null);
				_dateCreated.set(this, moment());
				_dateUpdated.set(this, moment());

				_title.set(this, null);
				_source.set(this, null);
				_image.set(this, "images/default.png");

				_categories.set(this, new Map());
				_tags.set(this, new Map());

				// TODO fill in ingredients and instructions later

				return true;
			}

			// if we have a value, ensure that it at least has an associated recipeID
			if (value && (typeof value === 'object') && value.hasOwnProperty('recipeID')) {
				_recipeID.set(this, value.recipeID);
				_evernoteGUID.set(this, value.evernoteGUID || null);
				_dateCreated.set(this, moment(value.dateCreated) || moment());
				_dateUpdated.set(this, moment(value.dateUpdated) || moment());

				_title.set(this, value.title || null);
				_source.set(this, value.source || null);
				_image.set(this, value.image || null);

				// translate our 2D arrays back into a Maps
				const categories = new Map();
				for (let cat of value.categories) {
					categories.set(cat[0], cat[1]);
				}

				const tags = new Map();
				for (let tag of value.tags) {
					tags.set(tag[0], tag[1]);
				}

				_categories.set(this, categories);
				_tags.set(this, tags);

				// TODO fill in ingredients and instructions later
				return true;
			}

			throw new Error('Invalid constructor for Recipe');
		} catch (ex) {
			throw new Error('Invalid constructor for Recipe');
		}
	}

	/*=========================================
	=            Getters / Setters            =
	=========================================*/

	/*----------  recipeID  ----------*/
	get recipeID() {
		return _recipeID.get(this);
	}

	set recipeID(value) {
		if (value && value !== '' && isUUID.v1(value)) {
			_dateUpdated.set(this, moment());
			return _recipeID.set(this, value);
		}
		throw new Error('Invalid recipeID provided');
	}

	/*----------  evernoteGUID  ----------*/
	get evernoteGUID() {
		return _evernoteGUID.get(this);
	}

	set evernoteGUID(value) {
		if ((typeof value === 'string' || value instanceof String) && (value !== '')) {
			_dateUpdated.set(this, moment());
			return _evernoteGUID.set(this, value);
		}
		throw new Error('Invalid evernoteGUID provided');
	}

	/*----------  dateCreated  ----------*/
	get dateCreated() {
		return _dateCreated.get(this);
	}

	set dateCreated(value) {
		throw new Error('Cannot update dateCreated value');
	}

	/*----------  dateUpdated  ----------*/
	get dateUpdated() {
		return _dateUpdated.get(this);
	}

	set dateUpdated(value) {
		if (value && moment(value).isValid()) {
			return _dateUpdated.set(this, moment(value));
		}
		throw new Error('Invalid dateUpdated provided');
	}

	/*----------  title  ----------*/
	get title() {
		return _title.get(this);
	}

	set title(value) {
		if ((typeof value === 'string' || value instanceof String) && (value !== '')) {
			_dateUpdated.set(this, moment());
			return _title.set(this, value);
		}
		throw new Error('Invalid title provided');
	}

	/*----------  source  ----------*/
	get source() {
		return _source.get(this);
	}

	set source(value) {
		if ((typeof value === 'string' || value instanceof String) && (value !== '') || (value === null)) {
			_dateUpdated.set(this, moment());
			return _source.set(this, value);
		}
		throw new Error('Invalid source provided');
	}

	/*----------  image  ----------*/
	get image() {
		return _image.get(this);
	}

	set image(value) {
		if ((typeof value === 'string' || value instanceof String) && (value !== '') || (value === null)) {
			// if we didn't provide an image, set the default placeholder
			if (value === null) {
				value = "images/default.png";
			}

			// verify that this is a valid image format
			const isValid = recipeController.isValidImageFormat(value);
			if (!isValid) {
				throw new Error('Invalid image format');
			}

			_dateUpdated.set(this, moment());
			return _image.set(this, value);
		}
		throw new Error('Invalid image provided');
	}

	/*----------  categories  ----------*/
	get categories() {
		return _categories.get(this);
	}

	set categories(value) {
		if (value && (value instanceof Map)) {
			// clear out the prior set of categories since we're going to replace it wholesale
			// if you just want to append new values use addCategory instead
			_categories.set(this, new Map());

			// go through the items in our Map to ensure that they've valid
			for (let [name, id] of value) {
				try {
					// accept it if it passes validation
					this.addCategory(name, id);
				} catch (ex) {
					// or remove it from the map
					value.delete(name);
				}
			}

			_dateUpdated.set(this, moment());
			return _categories.get(this);
		}
		throw new Error('Invalid categories provided');
	}

	/*----------  tags  ----------*/
	get tags() {
		return _tags.get(this);
	}

	set tags(value) {
		if (value && (value instanceof Map)) {
			// clear out the prior set of tags since we're going to replace it wholesale
			// if you just want to append new values use addTag instead
			_tags.set(this, new Map());

			// go through the items in our Map to ensure that they've valid
			for (let [name, id] of value) {
				try {
					// accept it if it passes validation
					this.addTag(name, id);
				} catch (ex) {
					// or remove it from the map
					value.delete(name);
				}
			}

			_dateUpdated.set(this, moment());
			return _tags.get(this);
		}
		throw new Error('Invalid tags provided');
	}

	/*----------  ingredients  ----------*/
	get ingredients() {
		// TODO
	}

	set ingredients(value) {
		// TODO
	}

	/*----------  instructions  ----------*/
	get instructions() {
		// TODO
	}

	set instructions(value) {
		// TODO
	}
	/*=====  End of Getters / Setters  ======*/


	/*==========================================
	=            Recipe Methods            =
	==========================================*/
	getRecipe() {
		return {
			recipeID: _recipeID.get(this),
			dateCreated: _dateCreated.get(this),
			dateUpdated: _dateUpdated.get(this),

			title: _title.get(this),
			source: _source.get(this),
			image: _image.get(this),

			categories: _categories.get(this),
			tags: _tags.get(this),

			// TODO ingredients: _ingredients.get(this),
			// TODO instructions: _instructions.get(this)
		};
	}

	encodeRecipe() {
		return {
			recipeID: _recipeID.get(this),
			dateCreated: _dateCreated.get(this),
			dateUpdated: _dateUpdated.get(this),

			title: _title.get(this),
			source: _source.get(this),
			image: _image.get(this),

			// convert Maps to Arrays
			categories: [ ..._categories.get(this) ],
			tags: [ ..._tags.get(this) ],

			// TODO ingredients: [ ...ingredients.get(this) ],
			// TODO instructions: [ ...instructions.get(this) ]
		};
	}

	saveRecipe() {
		let recipes = [];

		try {
			recipes = JSON.parse(fs.readFileSync(`${DB_PATH}/recipes.json`, 'utf8'));
		} catch (ex) {
			throw new Error('Error reading recipes.json');
		}

		// determine if this is an existing recipe or not
		const existingRecipe = recipeController.findRecipes('recipeID', _recipeID.get(this));

		// add this recipe if it hasn't been added before
		if (existingRecipe && existingRecipe.length === 0) {
			recipes.push(this.encodeRecipe());
		} else {
			// otherwise update the exisiting record
			recipes.forEach((rp, index) => {
		    if (rp.recipeID === _recipeID.get(this)) {
		      recipes[index] = this.encodeRecipe();
		    }
			});
		}

		// save recipes
		fs.writeFileSync(`${DB_PATH}/recipes.json`, JSON.stringify(recipes, null, 2), 'utf-8', (err) => {
			if (err) throw new Error(`An error occurred while writing recipes data`);
		});
	}

	addCategory(name, id = null) {
		// if we aren't providing a name, or our id is something other than a valid UUID or null
		if (!name || (typeof name !== 'string') || (name.length === 0) || (!isUUID.v1(id) && id !== null)) {
			// remove this item
			_categories.get(this).delete(name);
		} else {
			let category = null;
			// look up this category reference
			if (id !== null) {
				category = categoryController.findCategories('categoryID', id);
			}

			if (!category || (category && category.length === 0)) {
				category = categoryController.findCategories('name', name);
			}

			// if we found a match, make sure we're saving only the category name in our list
			if (category && category.length === 1) {
				_categories.get(this).delete(name);
				_categories.get(this).set(category[0].name, category[0].categoryID);
			}

			// if we didn't find an existing category either by id or name
			if (!category || (category && category.length === 0)) {
				// create the category
				category = new Category();
				category.name = name;
				category.saveCategory();
				_categories.get(this).delete(name);
				_categories.get(this).set(name, category.categoryID);
			}

			return _categories.get(this);
		}

		throw new Error('Invalid categories parameter for Recipe');
	}

	removeCategory(value) {
		if (_categories.get(this).has(value)) {
			_categories.get(this).delete(value);
		}
	}

	addTag(name, id = null) {
		// if we aren't providing a name, or our id is something other than a valid UUID or null
		if (!name || (typeof name !== 'string') || (name.length === 0) || (!isUUID.v1(id) && id !== null)) {
			// remove this item
			_tags.get(this).delete(name);
		} else {
			let tag = null;
			// look up this tag reference
			if (id !== null) {
				tag = tagController.findTags('tagID', id);
			}

			if (!tag || (tag && tag.length === 0)) {
				tag = tagController.findTags('name', name);
			}

			// if we found a match, make sure we're saving only the tag name in our list
			if (tag && tag.length === 1) {
				_tags.get(this).delete(name);
				_tags.get(this).set(tag[0].name, tag[0].tagID);
			}

			// if we didn't find an existing tag either by id or name
			if (!tag || (tag && tag.length === 0)) {
				// create the tag
				tag = new Tag();
				tag.name = name;
				tag.saveTag();
				_tags.get(this).delete(name);
				_tags.get(this).set(name, tag.tagID);
			}

			return _tags.get(this);
		}

		throw new Error('Invalid tags parameter for Recipe');
	}

	removeTag(value) {
		if (_tags.get(this).has(value)) {
			_tags.get(this).delete(value);
		}
	}

	addIngredient() {
		// TODO
	}

	removeIngredient() {
		// TODO
	}

	addInstruction() {
		// TODO
	}

	removeInstruction() {
		// TODO
	}
	/*=====  End of Recipe Methods  ======*/
};
/*=====  End of Recipe Class Definition  ======*/

module.exports = Recipe;
