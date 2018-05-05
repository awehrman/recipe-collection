const fs = require('fs');
const isUUID = require('is-uuid');
const uuid = require('uuid');
const moment = require('moment');

const ingredientController = require('../controllers/ingredientController');
const recipeController = require('../controllers/recipeController');

const DB_PATH = (process.env.NODE_ENV === 'test') ? 'tests/data' : 'data';

/*----------  Private Recipe Variables  ----------*/

const _recipeID = new WeakMap();
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
		// TODO
	}

	/*=========================================
	=            Getters / Setters            =
	=========================================*/

	/*----------  recipeID  ----------*/
	get recipeID() {
		// TODO
	}

	set recipeID(value) {
		// TODO
	}

	/*----------  dateCreated  ----------*/
	get dateCreated() {
		return _dateCreated.get(this);
	}

	set dateCreated(value) {
		// TODO
	}

	/*----------  dateUpdated  ----------*/
	get dateUpdated() {
		// TODO
	}

	set dateUpdated(value) {
		// TODO
	}

	/*----------  title  ----------*/
	get title() {
		// TODO
	}

	set title(value) {
		// TODO
	}

	/*----------  source  ----------*/
	get source() {
		// TODO
	}

	set source(value) {
		// TODO
	}

	/*----------  image  ----------*/
	get image() {
		// TODO
	}

	set image(value) {
		// TODO
	}

	/*----------  categories  ----------*/
	get categories() {
		// TODO
	}

	set categories(value) {
		// TODO
	}

	/*----------  tags  ----------*/
	get tags() {
		// TODO
	}

	set tags(value) {
		// TODO
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
		// TODO
	}

	encodeRecipe() {
		// TODO
	}

	saveRecipe() {
		// TODO
	}

	addCategory() {
		// TODO
	}

	removeCategory() {
		// TODO
	}

	addTag() {
		// TODO
	}

	removeTag() {
		// TODO
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
