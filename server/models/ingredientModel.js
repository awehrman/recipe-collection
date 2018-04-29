const fs = require('fs');
const isUUID = require('is-uuid');
const uuid = require('uuid');
const moment = require('moment');

const ingredientController = require('../controllers/ingredientController');
const recipeController = require('../controllers/recipeController');

const DB_PATH = (process.env.NODE_ENV === 'test') ? 'tests/data' : 'data';

/*----------  Private Ingredient Variables  ----------*/

const _ingredientID = new WeakMap();
const _parentIngredientID = new WeakMap();
const _dateCreated = new WeakMap();
const _dateUpdated = new WeakMap();

const _name = new WeakMap();
const _plural = new WeakMap();
const _properties = new WeakMap();

const _alternateNames = new WeakMap();
const _parsingExpressions = new WeakMap();
const _relatedIngredients = new WeakMap();
const _substitutes = new WeakMap();
const _references = new WeakMap();

const _isValidated = new WeakMap();

/*===================================================
=            Ingredient Class Definition            =
===================================================*/
class Ingredient {
	constructor(value) {
		if (!(this instanceof Ingredient)) {
	    throw new Error("Ingredient needs to be called with the new keyword");
	  }
		try {
			// if we're just passing a string for the name
			if ((typeof value === 'string' || value instanceof String) && (value !== '')) {
				_ingredientID.set(this, uuid.v1());
				_parentIngredientID.set(this, null);
				_dateCreated.set(this, moment());
				_dateUpdated.set(this, moment());

				_name.set(this, value);
				_plural.set(this, null);

				_properties.set(this, {
					'meat': false,
				  'poultry': false,
				  'fish': false,
				  'dairy': false,
				  'soy': false,
				  'gluten': false
				});

				_alternateNames.set(this, new Set());
				_parsingExpressions.set(this, new Set());

				_relatedIngredients.set(this, new Map());
				_substitutes.set(this, new Map());
				_references.set(this, new Map());

				_isValidated.set(this, false);
				return true;
			}

			// if we're passing an encoded object, just ensure that we have at least the ingredientID and name
			if (value && (typeof value === 'object') && value.hasOwnProperty('ingredientID') && value.hasOwnProperty('name')) {
				_ingredientID.set(this, value.ingredientID);
				_parentIngredientID.set(this, value.parentIngredientID || null);
				_dateCreated.set(this, moment(value.dateCreated) || moment());
				_dateUpdated.set(this, moment(value.dateUpdated) || moment());

				_name.set(this, value.name);
				_plural.set(this, value.plural || null);

				_properties.set(this, Object.assign({
					'meat': false,
				  'poultry': false,
				  'fish': false,
				  'dairy': false,
				  'soy': false,
				  'gluten': false
				}, value.properties));

				_alternateNames.set(this, new Set([ ...value.alternateNames ]));
				_parsingExpressions.set(this, new Set([ ...value.parsingExpressions ]));

				// translate our 2D arrays back into a Maps
				const relatedIngredients = new Map();
				for (let rel of value.relatedIngredients) {
					relatedIngredients.set(rel[0], rel[1]);
				}

				const substitutes = new Map();
				for (let sub of value.substitutes) {
					substitutes.set(sub[0], sub[1]);
				}

				const references = new Map();
				for (let sub of value.references) {
					references.set(sub[0], sub[1]);
				}

				_relatedIngredients.set(this, relatedIngredients);
				_substitutes.set(this, substitutes);
				_references.set(this, references);

				_isValidated.set(this, value.isValidated || false);

				return true;
			} else if (value && (typeof value === 'object') && !value.hasOwnProperty('ingredientID') || !value.hasOwnProperty('name')) {
				throw new Error('Decoded ingredient object missing one or more required fields');
			}
		} catch (ex) {
			throw new Error('Invalid constructor for Ingredient');
		}
	}

	/*=========================================
	=            Getters / Setters            =
	=========================================*/

	/*----------  ingredientID  ----------*/
	get ingredientID() {
		return _ingredientID.get(this);
	}

	set ingredientID(value) {
		if (value && value !== '' && isUUID.v1(value)) {
			_dateUpdated.set(this, moment());
			return _ingredientID.set(this, value);
		}
		throw new Error('Invalid ingredientID parameter for Ingredient');
	}

	/*----------  parentIngredientID  ----------*/
	get parentIngredientID() {
		return _parentIngredientID.get(this);
	}

	set parentIngredientID(value) {
		if (value && value !== '' && isUUID.v1(value)) {
			_dateUpdated.set(this, moment());
			return _parentIngredientID.set(this, value);
		}
		throw new Error('Invalid parentIngredientID parameter for Ingredient');
	}

	/*----------  dateCreated  ----------*/
	get dateCreated() {
		return _dateCreated.get(this);
	}

	set dateCreated(value) {
		throw new Error('Updating dateCreated is not allowed');
	}

	/*----------  dateUpdated  ----------*/
	get dateUpdated() {
		return _dateUpdated.get(this);
	}

	set dateUpdated(value) {
		// TODO expand date validation for date-like strings
		if (value && moment(value).isValid()) {
			return _dateUpdated.set(this, moment(value));
		}
		throw new Error('Invalid dateUpdated parameter for Ingredient');
	}

	/*----------  name  ----------*/
	get name() {
		return _name.get(this);
	}

	set name(value) {
		if ((typeof value === 'string' || value instanceof String) && (value !== '')) {
			const name = _name.get(this);

			// handle matching plural value
			if (value === _plural.get(this)) {
				_plural.set(this, null);
				_alternateNames.get(this).add(name);
			}

			// handle alt names matching instance
			if (_alternateNames.get(this).has(value)) {
				_alternateNames.get(this).delete(value);
				_alternateNames.get(this).add(name);
			}

			// handle parsing expressions matching instance
			if (_parsingExpressions.get(this).has(value)) {
				_parsingExpressions.get(this).delete(value);
				_alternateNames.get(this).add(name);
			}

			// TODO do we need to do anything special if this matches a relatedIngredient or substitute?

			_dateUpdated.set(this, moment());
			return _name.set(this, value);
		}
		throw new Error('Invalid name parameter for Ingredient');
	}

	/*----------  plural  ----------*/
	get plural() {
		return _plural.get(this);
	}

	set plural(value) {
		if ((typeof value === 'string' || value instanceof String) && (value !== '')) {
			const plural = _plural.get(this);

			// don't allow plural values that match our name
			if (value === _name.get(this)) {
				throw new Error('Cannot assign current name value to plural');
			}

			// handle alt names matching instance
			if (_alternateNames.get(this).has(value)) {
				_alternateNames.get(this).delete(value);
				_alternateNames.get(this).add(plural);
			}

			// handle parsing expressions matching instance
			if (_parsingExpressions.get(this).has(value)) {
				_parsingExpressions.get(this).delete(value);
				_alternateNames.get(this).add(plural);
			}

			// TODO do we need to do anything special if this matches a relatedIngredient or substitute?

			_dateUpdated.set(this, moment());
			return _plural.set(this, value);
		}
		throw new Error('Invalid plural parameter for Ingredient');
	}

	/*----------  properties  ----------*/
	get properties() {
		return _properties.get(this);
	}

	set properties(value) {
		if (value && typeof value === 'object' && value.constructor === Object) {
			for (let key in value) {
				// delete any properties in value that doesn't exist in our properties object
				if (!_properties.get(this).hasOwnProperty(key)) {
					delete value[key];
				}
			}

			_dateUpdated.set(this, moment());
			return _properties.set(this, Object.assign(_properties.get(this), value));
		}
		throw new Error('Invalid properties parameter for Ingredient');
	}

	/*----------  alternateNames  ----------*/
	get alternateNames() {
		return _alternateNames.get(this);
	}

	set alternateNames(value) {
		if (value && (value instanceof Set)) {
			// clear out the prior set of alternate names since we're going to replace it wholesale
			// if you just want to append new values use addAlternateName instead
			_alternateNames.set(this, new Set());

			// for each item in our set
			for (let item of value) {
				try {
					// accept it if it passes validation
					this.addAlternateName(item);
				} catch (ex) {
					// or remove it from the set
					value.delete(item);
				}
			}

			_dateUpdated.set(this, moment());
			return _alternateNames.get(this);
		}
		throw new Error('Invalid alternateNames parameter for Ingredient');
	}

	/*----------  parsingExpressions  ----------*/
	get parsingExpressions() {
		return _parsingExpressions.get(this);
	}

	set parsingExpressions(value) {
		if (value && (value instanceof Set)) {
			// loop through the items in our set to validate contents
			for (let item of value) {
				// don't allow non-string values
				if (typeof item !== 'string' || item.length === 0) {
					value.delete(item);
					break;
				}

				// don't allow values that match our name
				if (item === _name.get(this)) {
					throw new Error('Cannot assign current Ingredient name to parsingExpressions');
				}

				// handle plural name matching instance
				if (item === _plural.get(this)) {
					_plural.set(this, null);
				}

				// handle alternate name matching instance
				if (_alternateNames.get(this).has(item)) {
					_alternateNames.get(this).delete(item);
				}

				// TODO do we need to do anything special if this matches a relatedIngredient or substitute?
			}

			_dateUpdated.set(this, moment());
			return _parsingExpressions.set(this, value);
		}
		throw new Error('Invalid parsingExpressions parameter for Ingredient');
	}

	/*----------  relatedIngredients  ----------*/
	get relatedIngredients() {
		return _relatedIngredients.get(this);
	}

	set relatedIngredients(value) {
		if (value && (value instanceof Map)) {
			// ensure that each ingredient in here is valid or setup as another ingredient
			value = this.validateMapIngredients(value);

			_dateUpdated.set(this, moment());
			return _relatedIngredients.set(this, value);
		}
		throw new Error('Invalid relatedIngredients parameter for Ingredient');
	}

	/*----------  substitutes  ----------*/
	get substitutes() {
		return _substitutes.get(this);
	}

	set substitutes(value) {
		if (value && (value instanceof Map)) {
			// ensure that each ingredient in here is valid or setup as another ingredient
			value = this.validateMapIngredients(value);

			_dateUpdated.set(this, moment());
			return _substitutes.set(this, value);
		}
		throw new Error('Invalid substitutes parameter for Ingredient');
	}

	/*----------  references  ----------*/
	get references() {
		return _references.get(this);
	}

	set references(value) {
		if (value && (value instanceof Map)) {
			// go through the items in our Map to ensure that they've valid
			for (let [line, id] of value) {
				// if we aren't providing a line, or our id is something other than a valid UUID or null
				if (!line || (typeof line !== 'string') || (line.length === 0) || (!isUUID.v1(id) && id !== null)) {
					// remove this item
					value.delete(line);
				} else {
					let recipe = null;
					// look up this recipe reference
					if (id !== null) {
						recipe = recipeController.findRecipes('recipeID', id);
					}

					// if we didn't find an existing recipe either by id
					if (recipe && recipe.length === 0) {
						// then delete this line
						value.delete(line);
					}
				}
			}

			_dateUpdated.set(this, moment());
			return _references.set(this, value);
		}
		throw new Error('Invalid references parameter for Ingredient');
	}

	/*----------  isValidated  ----------*/
	get isValidated() {
		return _isValidated.get(this);
	}

	set isValidated(value) {
		if (typeof(value) === "boolean") {
			_dateUpdated.set(this, moment());
			return _isValidated.set(this, value);
		}
		throw new Error('Invalid isValidated parameter for Ingredient');
	}
	/*=====  End of Getters / Setters  ======*/


	/*==========================================
	=            Ingredient Methods            =
	==========================================*/
	getIngredient() {
		return {
			ingredientID: _ingredientID.get(this),
			parentIngredientID: _parentIngredientID.get(this),
			dateCreated: _dateCreated.get(this),
			dateUpdated: _dateUpdated.get(this),

			name: _name.get(this),
			plural: _plural.get(this),
			properties: _properties.get(this),

			alternateNames: _alternateNames.get(this),
			parsingExpressions: _parsingExpressions.get(this),
			relatedIngredients: _relatedIngredients.get(this),
			substitutes: _substitutes.get(this),
			references: _references.get(this),

			isValidated: _isValidated.get(this)
		};
	}

	encodeIngredient() {
		// before we can save an ingredient as a JSON object
		// we need to convert its Maps and Sets to arrays
		const encoded = {
			ingredientID: null,
			parentIngredientID: null,
			dateCreated: null,
			dateUpdated: null,

			name: null,
			plural: null,
			properties: {},

			alternateNames: [],
			parsingExpressions: [],
			relatedIngredients: [],
			substitutes: [],
			references: [],

			isValidated: false
		};

		encoded.ingredientID = _ingredientID.get(this);
		encoded.parentIngredientID = _parentIngredientID.get(this);
		encoded.dateCreated = _dateCreated.get(this);
		encoded.dateUpdated = _dateUpdated.get(this);

		encoded.name = _name.get(this);
		encoded.plural = _plural.get(this);
		encoded.properties = Object.assign(_properties.get(this), {});

		encoded.alternateNames = [ ..._alternateNames.get(this) ];
		encoded.parsingExpressions = [ ..._parsingExpressions.get(this) ];
		encoded.relatedIngredients = [ ..._relatedIngredients.get(this) ];
		encoded.substitutes = [ ..._substitutes.get(this) ];
		encoded.references = [ ..._references.get(this) ];

		encoded.isValidated = _isValidated.get(this);

		return encoded;
	}

	saveIngredient(originalName = null) {
		let ingredients = [];

		try {
			ingredients = JSON.parse(fs.readFileSync(`${DB_PATH}/ingredients.json`, 'utf8'));
		} catch (ex) {
			throw new Error('Error reading ingredients.json');
		}

		// determine if this is an existing ingredient or not
		let existingIngredient = ingredientController.findIngredients('ingredientID', _ingredientID.get(this));

		// make sure each relatedIngredient on this item also has this ingredient as a relation
		// ie. if saving 'potato' with a relatedIngredient of 'yam'
		// 'yam' should also have a relatedIngredient of 'potato'

		// loop through related ingredients
		const values = [ ...this.relatedIngredients.values() ]; // ids

		if (values && values.length > 0) {
			for (let id of values) {
				// lookup this ingredient by id
				let related = ingredientController.findIngredients('ingredientID', id);
				related = (related.length === 1) ? related[0] : null;

				// if our ingredient isn't listed in the relatedIngredients of this item add it
				if (related && !related.relatedIngredients.has(this.name)) {
					// add our current ingredient to related
					related.relatedIngredients.set(this.name, this.ingredientID);
					related.saveIngredient(this.name);

					// re-pull our ingredients now that we've updated them
					try {
						ingredients = JSON.parse(fs.readFileSync(`${DB_PATH}/ingredients.json`, 'utf8'));
					} catch (ex) {
						throw new Error('Error reading ingredients.json');
					}
				}
			}
		}

		// add this ingredient if it hasn't been added before
		if (existingIngredient && existingIngredient.length === 0) {
			ingredients.push(this.encodeIngredient());
		} else {
			// otherwise update the exisiting record
			// TODO should this just be findIndex? check performance
			ingredients.forEach((ing, index) => {
		    if (ing.ingredientID === _ingredientID.get(this)) {
		      ingredients[index] = this.encodeIngredient();
		    }
			});
		}

		// save ingredients
		fs.writeFileSync(`${DB_PATH}/ingredients.json`, JSON.stringify(ingredients, null, 2), 'utf-8', (err) => {
			if (err) throw new Error(`An error occurred while writing ingredients data`);
		});
	}

	validateMapIngredients(value) {
		// go through the items in our Map to ensure that they've valid
		for (let [name, id] of value) {
			// if we aren't providing a name, or our id is something other than a valid UUID or null
			if (!name || (typeof name !== 'string') || (name.length === 0) || (!isUUID.v1(id) && id !== null)) {
				// remove this item
				value.delete(name);
			} else {
				let ingredient = null;
				// look up this ingredient reference
				if (id !== null) {
					ingredient = ingredientController.findIngredients('ingredientID', id);
				}

				if (!ingredient || ingredient.length === 0) {
					ingredient = ingredientController.findIngredients('exact', name);

					// if we found a match, make sure we're saving only the ingredient name in our list
					if (ingredient && ingredient.length === 1) {
						value.delete(name);
						value.set(ingredient[0].name, ingredient[0].ingredientID);
					}
				}

				// if we didn't find an existing ingredient either by id or name
				if (ingredient && ingredient.length === 0) {
					// create the ingredient
					ingredient = new Ingredient(name);
					ingredient.saveIngredient();
					value.delete(name);
					value.set(name, ingredient.ingredientID);
				}
			}
		}

		return value;
	}

	addAlternateName(value) {
		if (value && typeof value === 'string' && value.length > 0) {
			// check that this value isn't used on any other ingredients
			const existingIngredient = ingredientController.findIngredients('exact', value);
			if (existingIngredient && existingIngredient.length > 0) {
				throw new Error('Alternate name is already in use');
			}

			// check that this value dosen't not equal our current name
			if (value === _name.get(this)) {
				throw new Error('Cannot assign current Ingredient name to alternateNames');
			}

			// check if this value equals our current plural value
			if (value === _plural.get(this)) {
				// if so, we'll still accept this value, but we're remove the plural value
				_plural.set(this, null);
			}

			// check if this value equals any of our current alternate names
			if (_alternateNames.get(this).has(value)) {
				// then don't do anything and get out of here
				return _alternateNames.get(this);
			}

			// check if this value equals any of our current parsing expression values
			if (_parsingExpressions.get(this).has(value)) {
				// if so, we'll still accept this value, but we'll clear out that specific parsing expression value
				_parsingExpressions.get(this).delete(value);
			}

			// if we pass all other validation, accept the alternate name
			return _alternateNames.get(this).add(value);
		}
		throw new Error('Invalid alternateNames parameter for Ingredient');
	}

	removeAlternateName(value) {
		// TODO
	}

	addParsingExpression(value) {
		// TODO
	}

	removeParsingExpression(value) {
		// TODO
	}

	addRelatedIngredient(value) {
		// TODO
	}

	removeRelatedIngredient(value) {
		// TODO
	}

	addSubstitute(value) {
		// TODO
	}

	removeSubstitute(value) {
		// TODO
	}

	addReference(value) {
		// TODO
	}

	removeReference(value) {
		// TODO
	}

	/*=====  End of Ingredient Methods  ======*/
};
/*=====  End of Ingredient Class Definition  ======*/

module.exports = Ingredient;
