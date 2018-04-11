const isUUID = require('is-uuid');
const uuid = require('uuid');
const moment = require('moment');

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

const _isRootIngredient = new WeakMap();
const _isValidated = new WeakMap();

/*===================================================
=            Ingredient Class Definition            =
===================================================*/
module.exports = class Ingredient {
	constructor(name) {
		if ((typeof name === 'string' || name instanceof String) && (name !== '')) {
			_ingredientID.set(this, uuid.v1());
			_parentIngredientID.set(this, null);
			_dateCreated.set(this, moment());
			_dateUpdated.set(this, moment());

			_name.set(this, name);
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
			_relatedIngredients.set(this, new Set());
			_substitutes.set(this, new Set());
			_references.set(this, new Set());

			_isRootIngredient.set(this, true);
			_isValidated.set(this, false);
			return true;
		}
		throw new Error('Invalid name parameter for Ingredient');
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
		if (moment(value).isValid()) {
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
		// TODO return specific property
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
		throw new Error('Invalid properties object');
	}

	/*----------  alternateNames  ----------*/
	get alternateNames() {
		return _alternateNames.get(this);
	}

	set alternateNames(value) {
		// TODO check if it already has this value
		if (value && value !== '') {
			_dateUpdated.set(this, moment());
			return _alternateNames.set(this, value); // TODO is this correct!?
		}
	}

	/*----------  parsingExpressions  ----------*/
	get parsingExpressions() {
		return _parsingExpressions.get(this);
	}

	set parsingExpressions(value) {
		// TODO check if it already has this value
		if (value && value !== '') {
			_dateUpdated.set(this, moment());
			return _parsingExpressions.set(this, value); // TODO is this correct!?
		}
	}

	/*----------  relatedIngredients  ----------*/
	get relatedIngredients() {
		return _relatedIngredients.get(this);
	}

	set relatedIngredients(value) {
		// TODO check if it already has this value
		if (value && value !== '') {
			_dateUpdated.set(this, moment());
			return _relatedIngredients.set(this, value); // TODO is this correct!?
		}
	}

	/*----------  substitutes  ----------*/
	get substitutes() {
		return _substitutes.get(this);
	}

	set substitutes(value) {
		// TODO check if it already has this value
		if (value && value !== '') {
			_dateUpdated.set(this, moment());
			return _substitutes.set(this, value); // TODO is this correct!?
		}
	}

	/*----------  references  ----------*/
	get references() {
		return _references.get(this);
	}

	set references(value) {
		// TODO check if it already has this value
		if (value && value !== '') {
			_dateUpdated.set(this, moment());
			return _relatedIngredients.set(this, value); // TODO is this correct!?
		}
	}

	/*----------  isRootIngredient  ----------*/
	get isRootIngredient() {
		return _isRootIngredient.get(this);
	}

	set isRootIngredient(value) {
		if (typeof(value) === "boolean") {
			_dateUpdated.set(this, moment());
			return _isRootIngredient.set(this, value);
		}
		throw new Error('Invalid isRootIngredient parameter for Ingredient');
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

			isRootIngredient: _isRootIngredient.get(this),
			isValidated: _isValidated.get(this)
		};
	}

	updateProperty(key, value) {
		// TODO
	}

	addAlternateName(value) {
		// TODO
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
