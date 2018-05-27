const assert = require('assert');
const chai = require('chai');
const chaiHttp = require('chai-http');
const colors = require('colors');
const expect = require('chai').expect;
const fs = require('fs');
const moment = require('moment');

const server = require('../../app');
const Category = require('../../models/categoryModel');
const categoryController = require('../../controllers/categoryController');
const Recipe = require('../../models/recipeModel');
const recipeController = require('../../controllers/recipeController');
const Tag = require('../../models/tagModel');
const tagController = require('../../controllers/tagController');

/**

	TODO:
	- isValidated? isParsed? isValidatedIngredients?
  	we might want some kind of confirmation that the ingredients/instructions were identified correctly
	  if all of the ingredient lines within were parsed successfully
	  if the ingredient lines have all been validated as well

 */


describe.only('Recipe Class ============================================='.magenta, function () {
	it('should initialize test data', function() {
		const databases = [ 'categories', 'recipes', 'tags' ];

		// load presets for each database
		for (let db of databases) {
			let preset;

			try {
				preset = fs.readFileSync(`tests/data/presets/recipeModel_${db}.json`, 'utf8');
			} catch (ex) {
				throw new Error(`Error reading ${db}.json`);
			}

			fs.writeFileSync(`tests/data/${db}.json`, preset, 'utf-8', (err) => {
				if (err) throw new Error(`An error occurred while writing ${db} preset data`);
			});
		}
	});

	describe('Getters / Setters ============================================='.magenta, function () {
		it('[constructor] should create a new instance of Recipe', function() {
			// # passing invalid paramters should throw an exception
			// should match 'Invalid constructor for Recipe' for string values
			expect(() => new Recipe('Roasted John Dory')).to.throw('Invalid constructor for Recipe');
			// should match 'Invalid constructor for Recipe' for int values
			expect(() => new Recipe(123)).to.throw('Invalid constructor for Recipe');


			// # passing no parameters should return an empty Recipe object
			const rp = new Recipe();
			// should assign a recipeID
			expect(rp.recipeID).to.exist;
			// should set dateCreated
			expect(moment.isMoment(rp.dateCreated)).to.equal(true);
			// should assign a default image placeholder
			expect(rp.image).to.equal("images/default.png");

			// # passing an encoded Recipe object without a recipeID should throw an exception
			// should match 'Cannot instantiate an existing Recipe without a recipeID value'
			expect(() => new Recipe({
		    //"recipeID": "d00f2e31-507d-11e8-92b8-87300f04d0d7",
		    "title": "Roasted John Dory",
		    "source": "http://www.delicious.com.au/recipes/roasted-john-dory-baby-spinach-umami-butter/21c1a415-2966-4987-a4df-827cf8d065e2?current_section=recipes",
		    "image": "images/d00f2e31-507d-11e8-92b8-87300f04d0d7.png",
		    "categories":  [ [ 'Fish', '9edffec0-5091-11e8-a81f-c91c7c9345ea' ] ],
		    "tags": [ [ 'imported', 'bcd7a810-5091-11e8-9a9d-adbccf9cc4a6' ] ],
		    "ingredientLines": [],
		    "instructions": []
		  })).to.throw('Invalid constructor for Recipe');

			// # passing a fully encoded Recipe object should return a true Recipe object
			const rp2 = new Recipe({
		    "recipeID": "d00f2e31-507d-11e8-92b8-87300f04d0d7",
		    "title": "Roasted John Dory",
		    "source": "http://www.delicious.com.au/recipes/roasted-john-dory-baby-spinach-umami-butter/21c1a415-2966-4987-a4df-827cf8d065e2?current_section=recipes",
		    "image": "images/d00f2e31-507d-11e8-92b8-87300f04d0d7.png",
		    "categories": [ [ 'Fish', '9edffec0-5091-11e8-a81f-c91c7c9345ea' ] ], // TODO add some values
		    "tags": [ [ 'imported', 'bcd7a810-5091-11e8-9a9d-adbccf9cc4a6' ] ], // TODO add some values
		    "ingredientLines": [],
		    "instructions": []
		  });
			// should have a recipeID
			expect(rp2.recipeID).to.equal("d00f2e31-507d-11e8-92b8-87300f04d0d7");
			// should have matching datecreated
			expect(rp2.dateCreated).to.exist;
			expect(moment.isMoment(rp2.dateCreated)).to.equal(true);
			// should have matching dateupdated
			expect(rp2.dateUpdated).to.exist;
			expect(moment.isMoment(rp2.dateUpdated)).to.equal(true);
			// should have matching title
			expect(rp2.title).to.equal("Roasted John Dory");
			// should have matching source
			expect(rp2.source).to.equal("http://www.delicious.com.au/recipes/roasted-john-dory-baby-spinach-umami-butter/21c1a415-2966-4987-a4df-827cf8d065e2?current_section=recipes");
			// should have matching image
			expect(rp2.image).to.equal("images/d00f2e31-507d-11e8-92b8-87300f04d0d7.png");
			// should have matching category values in a Map
			expect(rp2.categories.size).to.equal(1);
			// should have matching tag values in a Map
			expect(rp2.tags.size).to.equal(1);
			// TODO should have matching ingredients
			// TODO should have matching instructions
		});

		it('[recipeID] should update with a valid UUID', function() {
			const rp = new Recipe();
			let initialDate = rp.dateUpdated;

			// # should be able to read value
			expect(rp.recipeID).to.exist;

			// TODO should we check if this recipeID already exists before setting?

			// # should set recipeID if valid UUID is provided
			rp.recipeID = "d00f2e31-507d-11e8-92b8-87300f04d0d7";
			expect(rp.recipeID).to.equal("d00f2e31-507d-11e8-92b8-87300f04d0d7");
			// should update the dateUpdated value
			expect(rp.dateUpdated).to.not.equal(initialDate);

			// # should throw exception 'Invalid recipeID provided' if invalid UUID is provided
			// ... such as null
			expect(() => { rp.recipeID = null; }).to.throw('Invalid recipeID provided');
			// ... such as undefined
			expect(() => { rp.recipeID = undefined; }).to.throw('Invalid recipeID provided');
			// ... such as integers
			expect(() => { rp.recipeID = 123; }).to.throw('Invalid recipeID provided');
			// ... such as strings
			expect(() => { rp.recipeID = '123'; }).to.throw('Invalid recipeID provided');
			// ... such as objects
			expect(() => { rp.recipeID = { recipeID: "d00f2e31-507d-11e8-92b8-87300f04d0d7" }; }).to.throw('Invalid recipeID provided');
		});

		it('[evernoteGUID] should update with a valid string', function() {
			const rp = new Recipe();
			let initialDate = rp.dateUpdated;

			// # should be able to read
			expect(rp.evernoteGUID).to.be.null;

			// # should be able to assign strings
			rp.evernoteGUID = "98a6cff1-5151-11e8-a376-357e61021145";
			expect(rp.evernoteGUID).to.equal("98a6cff1-5151-11e8-a376-357e61021145");
			// should update the dateUpdated value
			expect(rp.dateUpdated).to.not.equal(initialDate);

			// # should throw exception 'Invalid evernoteGUID provided' if invalid string is provided
			// ... such as undefined
			expect(() => { rp.evernoteGUID = undefined; }).to.throw('Invalid evernoteGUID provided');
			// ... such as integers
			expect(() => { rp.evernoteGUID = 123; }).to.throw('Invalid evernoteGUID provided');
			// ... such as empty strings
			expect(() => { rp.evernoteGUID = ''; }).to.throw('Invalid evernoteGUID provided');
			// ... such as objects
			expect(() => { rp.evernoteGUID = { evernoteGUID: "98a6cff1-5151-11e8-a376-357e61021145" }; }).to.throw('Invalid evernoteGUID provided');
		});

		it('[dateCreated] should be read only', function() {
			const rp = new Recipe();
			// # should be able to read value
			expect(rp.dateCreated).to.exist;
			expect(moment.isMoment(rp.dateCreated)).to.equal(true);

			// # should throw an exception if you try to set
			expect(() => { rp.dateCreated = new moment(); }).to.throw('Cannot update dateCreated value');
		});

		it('[dateUpdated] should update with a valid datetime', function() {
			const rp = new Recipe();
			// # should be able to read value
			expect(rp.dateUpdated).to.exist;
			expect(moment.isMoment(rp.dateUpdated)).to.equal(true);

			// # should update with valid datetime
			rp.dateUpdated = new moment();
			expect(rp.dateUpdated).to.exist;
			expect(moment.isMoment(rp.dateUpdated)).to.equal(true);

			// # should throw an exception of 'Invalid dateUpdated provided' if invalid datetime is provided
			// ... such as null
			expect(() => { rp.dateUpdated = null; }).to.throw('Invalid dateUpdated provided');
			// ... such as undefined
			expect(() => { rp.dateUpdated = undefined; }).to.throw('Invalid dateUpdated provided');

			// TODO expand validation for date-like strings
			// ... such as integers
			//expect(() => { rp.dateUpdated = 123; }).to.throw('Invalid dateUpdated provided');
			// ... such as strings
			//expect(() => { rp.dateUpdated = '123'; }).to.throw('Invalid dateUpdated provided');
			// ... such as objects
			//expect(() => { rp.dateUpdated = { dateUpdated: new moment() }; }).to.throw('Invalid recipeID provided');
		});

		it('[title] should update with a valid string', function() {
			const rp = new Recipe();
			let initialDate = rp.dateUpdated;

			// # should be able to read
			expect(rp.title).to.be.null;

			// # should be able to assign strings
			rp.title = "Roasted John Dory";
			expect(rp.title).to.equal("Roasted John Dory");
			expect(rp.dateUpdated).to.not.equal(initialDate);

			// # should throw exception 'Invalid title provided' if invalid string is provided
			// ... such as null
			expect(() => { rp.title = null; }).to.throw('Invalid title provided');
			// ... such as undefined
			expect(() => { rp.title = undefined; }).to.throw('Invalid title provided');
			// ... such as integers
			expect(() => { rp.title = 123; }).to.throw('Invalid title provided');
			// ... such as empty strings
			expect(() => { rp.title = ''; }).to.throw('Invalid title provided');
			// ... such as objects
			expect(() => { rp.title = { title: "Roasted John Dory" }; }).to.throw('Invalid title provided');
		});

		it('[source] should update with a valid string', function() {
			const rp = new Recipe();
			let initialDate = rp.dateUpdated;

			// # should be able to read
			expect(rp.source).to.be.null;

			// # should be able to assign strings
			rp.source = "http://www.delicious.com.au/recipes/roasted-john-dory-baby-spinach-umami-butter/21c1a415-2966-4987-a4df-827cf8d065e2?current_section=recipes";
			expect(rp.source).to.equal("http://www.delicious.com.au/recipes/roasted-john-dory-baby-spinach-umami-butter/21c1a415-2966-4987-a4df-827cf8d065e2?current_section=recipes");
			expect(rp.dateUpdated).to.not.equal(initialDate);
			initialDate = rp.dateUpdated;
			// i'm not going to do any further URL validation, because this can book titles

			// # should be able to assign nulls
			rp.source = null;
			expect(rp.source).to.be.null;
			expect(rp.dateUpdated).to.not.equal(initialDate);

			// # should throw exception 'Invalid source provided' if invalid string is provided
			// ... such as undefined
			expect(() => { rp.source = undefined; }).to.throw('Invalid source provided');
			// ... such as integers
			expect(() => { rp.source = 123; }).to.throw('Invalid source provided');
			// ... such as empty strings
			expect(() => { rp.source = ''; }).to.throw('Invalid source provided');
			// ... such as objects
			expect(() => { rp.source = { source: "www.delicious.com.au" }; }).to.throw('Invalid source provided');
		});

		it('[image] should update with a valid string for an image path', function() {
			const rp = new Recipe();
			let initialDate = rp.dateUpdated;

			// # should be able to read
			expect(rp.image).to.equal("images/default.png");

			// # should be able to assign valid strings
			rp.image = "images/d00f2e31-507d-11e8-92b8-87300f04d0d7.png";
			expect(rp.image).to.equal("images/d00f2e31-507d-11e8-92b8-87300f04d0d7.png");
			expect(rp.dateUpdated).to.not.equal(initialDate);
			expect(recipeController.isValidImageFormat(rp.image)).to.be.true;
			initialDate = rp.dateUpdated;

			// # should throw an error if an invalid image format is used
			// ... such as an extensionless file
			expect(() => { rp.image = "images/d00f2e31-507d-11e8-92b8-87300f04d0d7"; }).to.throw('Invalid image format');
			// ... such as an unallow extension
			expect(() => { rp.image = "images/d00f2e31-507d-11e8-92b8-87300f04d0d7.docx"; }).to.throw('Invalid image format');

			// # should be able to assign nulls, and get a default placeholder assigned
			rp.image = null;
			expect(rp.image).to.equal("images/default.png");
			expect(rp.dateUpdated).to.not.equal(initialDate);

			// # should throw exception 'Invalid image provided' if invalid string is provided
			// ... such as undefined
			expect(() => { rp.image = undefined; }).to.throw('Invalid image provided');
			// ... such as integers
			expect(() => { rp.image = 123; }).to.throw('Invalid image provided');
			// ... such as empty strings
			expect(() => { rp.image = ''; }).to.throw('Invalid image provided');
			// ... such as objects
			expect(() => { rp.image = { image: "images/default.png" }; }).to.throw('Invalid image provided');
		});

		it('[categories] should update with a valid Map with name/id pairs', function() {
			const rp = new Recipe();
			let initialDate = rp.dateUpdated;
			let categories = new Map();

			// # should accept an empty Map
			rp.categories = categories;
			expect(rp.categories.size).to.equal(0);
			expect(rp.dateUpdated).to.not.equal(initialDate);
			initialDate = rp.dateUpdated;

			const cat = new Category();
			cat.name = "Beef";
			cat.saveCategory();

			// # should accept a Map with valid categories
			// ... such as a Map containing existing categories
			categories.set(cat.name, cat.categoryID);
			rp.categories = categories;
			expect(rp.categories.size).to.equal(1);
			expect(rp.dateUpdated).to.not.equal(initialDate);
			initialDate = rp.dateUpdated;

			// ... such as a Map containing new category assignments
			rp.categories = categories.set("Lamb", null);
			expect(rp.categories.size).to.equal(2);
			expect(rp.dateUpdated).to.not.equal(initialDate);
			initialDate = rp.dateUpdated;

			// ... such as a Map containing duplicated existing categories
			rp.categories = categories.set(cat.name, cat.categoryID);
			expect(rp.categories.size).to.equal(2);
			expect(rp.dateUpdated).to.not.equal(initialDate);
			initialDate = rp.dateUpdated;

			// # should throw exception 'Invalid categories provided' if invalid Map is provided
			// ... such as null
			expect(() => { rp.categories = null; }).to.throw('Invalid categories provided');
			// ... such as undefined
			expect(() => { rp.categories = undefined; }).to.throw('Invalid categories provided');
			// ... such as integers
			expect(() => { rp.categories = 123; }).to.throw('Invalid categories provided');
			// ... such as empty strings
			expect(() => { rp.categories = ''; }).to.throw('Invalid categories provided');
			// ... such as objects
			expect(() => { rp.categories = { categories: "Fish" }; }).to.throw('Invalid categories provided');
		});

		it('[tags] should update with a valid Map with name/id pairs', function() {
			const rp = new Recipe();
			let initialDate = rp.dateUpdated;
			let tags = new Map();

			// # should accept an empty Map
			rp.tags = tags;
			expect(rp.tags.size).to.equal(0);
			expect(rp.dateUpdated).to.not.equal(initialDate);
			initialDate = rp.dateUpdated;

			const tag = new Tag();
			tag.name = "Beef";
			tag.saveTag();

			// # should accept a Map with valid tags
			// ... such as a Map containing existing tags
			tags.set(tag.name, tag.tagID);
			rp.tags = tags;
			expect(rp.tags.size).to.equal(1);
			expect(rp.dateUpdated).to.not.equal(initialDate);
			initialDate = rp.dateUpdated;

			// ... such as a Map containing new tag assignments
			rp.tags = tags.set("Lamb", null);
			expect(rp.tags.size).to.equal(2);
			expect(rp.dateUpdated).to.not.equal(initialDate);
			initialDate = rp.dateUpdated;

			// ... such as a Map containing duplicated existing tags
			rp.tags = tags.set(tag.name, tag.tagID);
			expect(rp.tags.size).to.equal(2);
			expect(rp.dateUpdated).to.not.equal(initialDate);
			initialDate = rp.dateUpdated;

			// # should throw exception 'Invalid tags provided' if invalid Map is provided
			// ... such as null
			expect(() => { rp.tags = null; }).to.throw('Invalid tags provided');
			// ... such as undefined
			expect(() => { rp.tags = undefined; }).to.throw('Invalid tags provided');
			// ... such as integers
			expect(() => { rp.tags = 123; }).to.throw('Invalid tags provided');
			// ... such as empty strings
			expect(() => { rp.tags = ''; }).to.throw('Invalid tags provided');
			// ... such as objects
			expect(() => { rp.tags = { tags: "Fish" }; }).to.throw('Invalid tags provided');
		});

		it('[ingredientLines] should update with a valid Map containing ingredient lines', function() {
			let rp = new Recipe();
			let ingredientLines = new Map();
			let keys, values, uniqueKeys, uniqueValues = [];

			const reset = function() {
				ingredientLines = new Map();
				keys = [];
				values = [];
			}

			const refreshArrays = function(map) {
				keys = [ ...rp.ingredientLines.keys() ]; // names
				values = [ ...rp.ingredientLines.values() ]; // ids
				uniqueKeys = [ ...new Set([keys])];
				uniqueValues = [ ...new Set([values])];
			}

			// should accept a valid map
			let line = {
	      "block": 0,
	      "line": 0,
	      "reference": "2 tablespoons olive oil",
	      "isParsed": true,
	      "amounts": {
	        "values": [
	          "2"
	        ]
	      },
	      "unitDescriptor": null,
	      "units": {
	        "values": [
	          "tablespoons"
	        ]
	      },
	      "amountUnitSeparator": null,
	      "ingDescriptor": null,
	      "comments": "",
	      "filler": [
	        [],
	        [],
	        [],
	        [],
	        []
	      ],
	      "ingredients": [
	        {
	          "ingredientID": "b21c6980-6129-11e8-8eb4-ef06482bb95d",
	          "name": "olive oil",
	          "validated": false
	        }
	      ]
	    };
			ingredientLines.set(line, rp.recipeID);
			rp.ingredientLines = ingredientLines;
			refreshArrays();
			expect(rp.ingredientLines.size).to.equal(1);

			reset();

			// should throw an error if we pass in somethrp other than a Map
			expect(() => {
				rp.ingredientLines = undefined;
			}).to.throw('Invalid ingredientLines provided for Recipe');
			expect(() => {
				rp.ingredientLines = '';
			}).to.throw('Invalid ingredientLines provided for Recipe');
			expect(() => {
				rp.ingredientLines = NaN;
			}).to.throw('Invalid ingredientLines provided for Recipe');
			expect(() => {
				rp.ingredientLines = null;
			}).to.throw('Invalid ingredientLines provided for Recipe');
			expect(() => {
				rp.ingredientLines = 123;
			}).to.throw('Invalid ingredientLines provided for Recipe');
			expect(() => {
				rp.ingredientLines = { line: '1 cup apples' };
			}).to.throw('Invalid ingredientLines provided for Recipe');
			expect(() => {
				rp.ingredientLines = '1 cup apples';
			}).to.throw('Invalid ingredientLines provided for Recipe');
			expect(() => {
				rp.ingredientLines = new Set();
			}).to.throw('Invalid ingredientLines provided for Recipe');
		});

		it('[instructions] should update with a valid Map containing instruction lines', function() {
			let rp = new Recipe();
			let instructions = new Map();
			let keys, values, uniqueKeys, uniqueValues = [];

			const reset = function() {
				instructions = new Map();
				keys = [];
				values = [];
			}

			const refreshArrays = function(map) {
				keys = [ ...rp.instructions.keys() ]; // names
				values = [ ...rp.instructions.values() ]; // ids
				uniqueKeys = [ ...new Set([keys])];
				uniqueValues = [ ...new Set([values])];
			}

			// should accept a valid map
			let line = {
	      "block": 1,
	      "line": 0,
	      "reference": "2 tablespoons olive oil",
	    };
			instructions.set(line, rp.recipeID);
			rp.instructions = instructions;
			refreshArrays();
			expect(rp.instructions.size).to.equal(1);

			reset();

			// should throw an error if we pass in somethrp other than a Map
			expect(() => {
				rp.instructions = undefined;
			}).to.throw('Invalid instructions provided for Recipe');
			expect(() => {
				rp.instructions = '';
			}).to.throw('Invalid instructions provided for Recipe');
			expect(() => {
				rp.instructions = NaN;
			}).to.throw('Invalid instructions provided for Recipe');
			expect(() => {
				rp.instructions = null;
			}).to.throw('Invalid instructions provided for Recipe');
			expect(() => {
				rp.instructions = 123;
			}).to.throw('Invalid instructions provided for Recipe');
			expect(() => {
				rp.instructions = { line: '1 cup apples' };
			}).to.throw('Invalid instructions provided for Recipe');
			expect(() => {
				rp.instructions = '1 cup apples';
			}).to.throw('Invalid instructions provided for Recipe');
			expect(() => {
				rp.instructions = new Set();
			}).to.throw('Invalid instructions provided for Recipe');
		});
	});

	describe('Recipe Methods ============================================='.magenta, function () {
		it('[getRecipe] should return a Recipe object', function() {
			const rp = new Recipe();
			const obj = rp.getRecipe();

			expect(obj.hasOwnProperty('recipeID')).to.be.true;
			expect(obj.hasOwnProperty('dateCreated')).to.be.true;
			expect(obj.hasOwnProperty('dateUpdated')).to.be.true;
			expect(obj.hasOwnProperty('title')).to.be.true;
			expect(obj.hasOwnProperty('source')).to.be.true;
			expect(obj.hasOwnProperty('image')).to.be.true;
			expect(obj.hasOwnProperty('categories')).to.be.true;
			expect(obj.hasOwnProperty('tags')).to.be.true;
			expect(obj.hasOwnProperty('ingredientLines')).to.be.true;
			expect(obj.hasOwnProperty('instructions')).to.be.true;
		});

		it('[encodeRecipe] should encode the Recipe object into writeable JSON', function() {
			const rp = new Recipe();
			const encoded = rp.encodeRecipe();

			// # should translate maps to arrays
			expect(typeof encoded).to.be.equal('object');
			expect(Array.isArray(encoded.categories)).to.be.true;
			expect(Array.isArray(encoded.tags)).to.be.true;
			expect(Array.isArray(encoded.ingredientLines)).to.be.true;
			expect(Array.isArray(encoded.instructions)).to.be.true;
		});

		it('[saveRecipe] should write the Recipe to the database', function() {
			const rp = new Recipe();
			let recipes = [];
			let foundRecipe = false;
			let numRecipes = 0;

			try {
				recipes = JSON.parse(fs.readFileSync('tests/data/recipes.json', 'utf8'));
			} catch (ex) {
				throw new Error('Error reading recipes.json');
			}

			for (let recipe of recipes) {
				if (recipe.recipeID === rp.recipeID) { foundRecipe = true; }
			}
			expect(foundRecipe).to.be.false;
			numRecipes = recipes.length;

			rp.title = "Roasted John Dory";
			rp.source = "http://www.delicious.com.au/recipes/roasted-john-dory-baby-spinach-umami-butter/21c1a415-2966-4987-a4df-827cf8d065e2?current_section=recipes";
			rp.saveRecipe();

			// # should save new recipe to database
			try {
				recipes = JSON.parse(fs.readFileSync('tests/data/recipes.json', 'utf8'));
			} catch (ex) {
				throw new Error('Error reading recipes.json');
			}

			for (let recipe of recipes) {
				if (recipe.recipeID === rp.recipeID) { foundRecipe = true; }
			}
			expect(foundRecipe).to.be.true;
			expect((recipes.length - numRecipes)).to.equal(1);
			numRecipes = recipes.length;

			// # should update existing recipe in database
			rp.image = `images/${rp.recipeID}.png`;
			rp.saveRecipe();

			try {
				recipes = JSON.parse(fs.readFileSync('tests/data/recipes.json', 'utf8'));
			} catch (ex) {
				throw new Error('Error reading recipes.json');
			}

			foundRecipe = false;
			for (let recipe of recipes) {
				if (recipe.recipeID === rp.recipeID) {
					foundRecipe = true;
					expect(recipe.image).to.equal(rp.image);
				}
			}
			expect(foundRecipe).to.be.true;
			expect((recipes.length - numRecipes)).to.equal(0);
		});

		it('[addCategory] should add a valid string and UUID pair to the categories Map', function() {
			const rp = new Recipe();

			// don't allow nonsense
			expect(() => rp.addCategory()).to.throw('Invalid categories parameter for Recipe');
			expect(() => rp.addCategory('')).to.throw('Invalid categories parameter for Recipe');
			expect(() => rp.addCategory(NaN)).to.throw('Invalid categories parameter for Recipe');
			expect(() => rp.addCategory(null)).to.throw('Invalid categories parameter for Recipe');
			expect(() => rp.addCategory(123)).to.throw('Invalid categories parameter for Recipe');

			// if the category doesn't exist, add it
			let quiche = categoryController.findCategories('name', 'Quiche');
			expect(quiche.length).to.equal(0);

			rp.addCategory('Quiche');
			quiche = categoryController.findCategories('name', 'Quiche');

			expect(quiche.length).to.equal(1);
			expect(quiche[0].name).to.equal('Quiche');
			expect(rp.categories.size).to.equal(1);
			let keys = [ ...rp.categories.keys() ];
			expect(keys.includes('Quiche')).to.be.true;

			// clear out
			rp.categories = new Map();

			let cake = new Category();
			cake.name = "Cake";
			cake.saveCategory();

			cake = categoryController.findCategories('name', 'Cake');
			expect(cake.length).to.equal(1);
			expect(cake[0].name).to.equal('Cake');

			rp.addCategory('Cake');

			cake = categoryController.findCategories('name', 'Cake');
			expect(cake.length).to.equal(1);
			expect(cake[0].name).to.equal('Cake');
			expect(rp.categories.size).to.equal(1);
			keys = [ ...rp.categories.keys() ];
			expect(keys.includes('Cake')).to.be.true;

			// clear out
			rp.categories = new Map();

			// if the ingredient already exists in the map, don't duplicate
			rp.addCategory('Cake');
			expect(rp.categories.size).to.equal(1);
			keys = [ ...rp.categories.keys() ];
			expect(keys.includes('Cake')).to.be.true;
		});

		it('[removeCategory] should remove a matching string and UUID pair from the categories Map', function() {
			const rp = new Recipe();
			rp.addCategory('Beef');
			expect(rp.categories.has('Beef')).to.be.true;
			expect(rp.categories.size).to.equal(1);
			rp.saveRecipe();

			// don't do anything if we don't find a match
			rp.removeCategory('not a thing');
			expect(rp.categories.size).to.equal(1);

			// remove any matchrp names
			rp.removeCategory('Beef');
			expect(rp.categories.size).to.equal(0);
			expect(rp.categories.has('Beef')).to.be.false;
		});

		it('[addTag] should add a valid string and UUID pair to the tags Map', function() {
			const rp = new Recipe();

			// don't allow nonsense
			expect(() => rp.addTag()).to.throw('Invalid tags parameter for Recipe');
			expect(() => rp.addTag('')).to.throw('Invalid tags parameter for Recipe');
			expect(() => rp.addTag(NaN)).to.throw('Invalid tags parameter for Recipe');
			expect(() => rp.addTag(null)).to.throw('Invalid tags parameter for Recipe');
			expect(() => rp.addTag(123)).to.throw('Invalid tags parameter for Recipe');

			// if the tag doesn't exist, add it
			let korean = tagController.findTags('name', 'korean');
			expect(korean.length).to.equal(0);

			rp.addTag('korean');
			korean = tagController.findTags('name', 'korean');

			expect(korean.length).to.equal(1);
			expect(korean[0].name).to.equal('korean');
			expect(rp.tags.size).to.equal(1);
			let keys = [ ...rp.tags.keys() ];
			expect(keys.includes('korean')).to.be.true;

			// clear out
			rp.tags = new Map();

			let vietnamese = new Tag();
			vietnamese.name = "vietnamese";
			vietnamese.saveTag();

			vietnamese = tagController.findTags('name', 'vietnamese');
			expect(vietnamese.length).to.equal(1);
			expect(vietnamese[0].name).to.equal('vietnamese');

			rp.addTag('vietnamese');

			vietnamese = tagController.findTags('name', 'vietnamese');
			expect(vietnamese.length).to.equal(1);
			expect(vietnamese[0].name).to.equal('vietnamese');
			expect(rp.tags.size).to.equal(1);
			keys = [ ...rp.tags.keys() ];
			expect(keys.includes('vietnamese')).to.be.true;

			// clear out
			rp.tags = new Map();

			// if the ingredient already exists in the map, don't duplicate
			rp.addTag('vietnamese');
			expect(rp.tags.size).to.equal(1);
			keys = [ ...rp.tags.keys() ];
			expect(keys.includes('vietnamese')).to.be.true;
		});

		it('[removeTag] should remove a matching string and UUID pair from the tags Map', function() {
			const rp = new Recipe();
			rp.addTag('Vegan');
			expect(rp.tags.has('Vegan')).to.be.true;
			expect(rp.tags.size).to.equal(1);
			rp.saveRecipe();

			// don't do anything if we don't find a match
			rp.removeTag('not a thing');
			expect(rp.tags.size).to.equal(1);

			// remove any matching names
			rp.removeTag('Vegan');
			expect(rp.tags.size).to.equal(0);
			expect(rp.tags.has('Vegan')).to.be.false;
		});

		it('[addIngredientLine] should add a valid ingredient object to the ingredientLines Map', function() {
			const rp = new Recipe();

			// don't allow nonsense
			expect(() => rp.addIngredientLine()).to.throw('Invalid ingredientLines parameter for Recipe');
			expect(() => rp.addIngredientLine('')).to.throw('Invalid ingredientLines parameter for Recipe');
			expect(() => rp.addIngredientLine(NaN)).to.throw('Invalid ingredientLines parameter for Recipe');
			expect(() => rp.addIngredientLine(null)).to.throw('Invalid ingredientLines parameter for Recipe');
			expect(() => rp.addIngredientLine(123)).to.throw('Invalid ingredientLines parameter for Recipe');

			// should reject lines that lack a reference
			let line = {
	      "block": 0,
	      "line": 0,
	      //"reference": "2 tablespoons olive oil",
	      "isParsed": true,
	      "amounts": {
	        "values": [
	          "2"
	        ]
	      },
	      "unitDescriptor": null,
	      "units": {
	        "values": [
	          "tablespoons"
	        ]
	      },
	      "amountUnitSeparator": null,
	      "ingDescriptor": null,
	      "comments": "",
	      "filler": [
	        [],
	        [],
	        [],
	        [],
	        []
	      ],
	      "ingredients": [
	        {
	          "ingredientID": "b21c6980-6129-11e8-8eb4-ef06482bb95d",
	          "name": "olive oil",
	          "validated": false
	        }
	      ]
	    };
	    expect(() => rp.addIngredientLine(line)).to.throw('Ingredient Line is missing reference line');

			// should reject lines that lack a block
			line = {
	      //"block": 0,
	      "line": 0,
	      "reference": "2 tablespoons olive oil",
	      "isParsed": true,
	      "amounts": {
	        "values": [
	          "2"
	        ]
	      },
	      "unitDescriptor": null,
	      "units": {
	        "values": [
	          "tablespoons"
	        ]
	      },
	      "amountUnitSeparator": null,
	      "ingDescriptor": null,
	      "comments": "",
	      "filler": [
	        [],
	        [],
	        [],
	        [],
	        []
	      ],
	      "ingredients": [
	        {
	          "ingredientID": "b21c6980-6129-11e8-8eb4-ef06482bb95d",
	          "name": "olive oil",
	          "validated": false
	        }
	      ]
	    };
	    expect(() => rp.addIngredientLine(line)).to.throw('Ingredient Line is missing a block line reference');
			
			// should reject lines that lack a line number
			line = {
	      "block": 0,
	      //"line": 0,
	      "reference": "2 tablespoons olive oil",
	      "isParsed": true,
	      "amounts": {
	        "values": [
	          "2"
	        ]
	      },
	      "unitDescriptor": null,
	      "units": {
	        "values": [
	          "tablespoons"
	        ]
	      },
	      "amountUnitSeparator": null,
	      "ingDescriptor": null,
	      "comments": "",
	      "filler": [
	        [],
	        [],
	        [],
	        [],
	        []
	      ],
	      "ingredients": [
	        {
	          "ingredientID": "b21c6980-6129-11e8-8eb4-ef06482bb95d",
	          "name": "olive oil",
	          "validated": false
	        }
	      ]
	    };
	    expect(() => rp.addIngredientLine(line)).to.throw('Ingredient Line is missing a line number reference');

	    // should reject lines that lack a isParsed value
			line = {
	      "block": 0,
	      "line": 0,
	      "reference": "2 tablespoons olive oil",
	      //"isParsed": true,
	      "amounts": {
	        "values": [
	          "2"
	        ]
	      },
	      "unitDescriptor": null,
	      "units": {
	        "values": [
	          "tablespoons"
	        ]
	      },
	      "amountUnitSeparator": null,
	      "ingDescriptor": null,
	      "comments": "",
	      "filler": [
	        [],
	        [],
	        [],
	        [],
	        []
	      ],
	      "ingredients": [
	        {
	          "ingredientID": "b21c6980-6129-11e8-8eb4-ef06482bb95d",
	          "name": "olive oil",
	          "validated": false
	        }
	      ]
	    };
	    expect(() => rp.addIngredientLine(line)).to.throw('Ingredient Line is missing a parsed determination');

			// should accept lines with these three items
			line = {
	      "block": 0,
	      "line": 0,
	      "reference": "2 tablespoons olive oil",
	      "isParsed": true,
	      "amounts": {
	        "values": [
	          "2"
	        ]
	      },
	      "unitDescriptor": null,
	      "units": {
	        "values": [
	          "tablespoons"
	        ]
	      },
	      "amountUnitSeparator": null,
	      "ingDescriptor": null,
	      "comments": "",
	      "filler": [
	        [],
	        [],
	        [],
	        [],
	        []
	      ],
	      "ingredients": [
	        {
	          "ingredientID": "b21c6980-6129-11e8-8eb4-ef06482bb95d",
	          "name": "olive oil",
	          "validated": false
	        }
	      ]
	    };
	    rp.addIngredientLine(line);
	    expect(rp.ingredientLines.size).to.equal(1);

			// should not accept a line with the same block and line number
			line = {
	      "block": 0,
	      "line": 0,
	      "reference": "4 tablespoons fat",
	      "isParsed": true,
	      "amounts": {
	        "values": [
	          "4"
	        ]
	      },
	      "unitDescriptor": null,
	      "units": {
	        "values": [
	          "tablespoons"
	        ]
	      },
	      "amountUnitSeparator": null,
	      "ingDescriptor": null,
	      "comments": "",
	      "filler": [
	        [],
	        [],
	        [],
	        [],
	        []
	      ],
	      "ingredients": [
	        {
	          "ingredientID": "c21c6980-6129-11e8-8eb4-ef06482bb95d",
	          "name": "fat",
	          "validated": false
	        }
	      ]
	    };
	    expect(() => rp.addIngredientLine(line)).to.throw('Ingredient Line already exists at this location');
		});

		it('[removeIngredientLine] should remove a matching ingredient line at the given block/line position from the map', function() {
			const rp = new Recipe();
			rp.addIngredientLine({
	      "block": 0,
	      "line": 0,
	      "reference": "2 tablespoons olive oil",
	      "isParsed": true,
	      "amounts": {
	        "values": [
	          "2"
	        ]
	      },
	      "unitDescriptor": null,
	      "units": {
	        "values": [
	          "tablespoons"
	        ]
	      },
	      "amountUnitSeparator": null,
	      "ingDescriptor": null,
	      "comments": "",
	      "filler": [
	        [],
	        [],
	        [],
	        [],
	        []
	      ],
	      "ingredients": [
	        {
	          "ingredientID": "b21c6980-6129-11e8-8eb4-ef06482bb95d",
	          "name": "olive oil",
	          "validated": false
	        }
	      ]
	    });
			expect(rp.ingredientLines.size).to.equal(1);
			rp.saveRecipe();

			// don't do anything if we don't find a match
			rp.removeIngredientLine(1, 1);
			expect(rp.ingredientLines.size).to.equal(1);

			// remove any matching names
			rp.removeIngredientLine(0, 0);
			expect(rp.ingredientLines.size).to.equal(0);
		});

		it('[addInstruction] should add a valid instruction object to the instructions Map', function() {
			const rp = new Recipe();

			// don't allow nonsense
			expect(() => rp.addInstruction()).to.throw('Invalid instructions parameter for Recipe');
			expect(() => rp.addInstruction('')).to.throw('Invalid instructions parameter for Recipe');
			expect(() => rp.addInstruction(NaN)).to.throw('Invalid instructions parameter for Recipe');
			expect(() => rp.addInstruction(null)).to.throw('Invalid instructions parameter for Recipe');
			expect(() => rp.addInstruction(123)).to.throw('Invalid instructions parameter for Recipe');

			// should reject lines that lack a reference
			let line = {
	      "block": 0,
	      "line": 0,
	      //"reference": "2 tablespoons olive oil",
	    };
	    expect(() => rp.addInstruction(line)).to.throw('Instruction is missing reference line');

			// should reject lines that lack a block
			line = {
	      //"block": 0,
	      "line": 0,
	      "reference": "Mix ingredients together.",
	    };
	    expect(() => rp.addInstruction(line)).to.throw('Instruction is missing a block line reference');
			
			// should reject lines that lack a line number
			line = {
	      "block": 0,
	      //"line": 0,
	      "reference": "Mix ingredients together.",
	    };
	    expect(() => rp.addInstruction(line)).to.throw('Instruction is missing a line number reference');

	    
			// should accept lines with these three items
			line = {
	      "block": 0,
	      "line": 0,
	      "reference": "Mix ingredients together.",
	    };
	    rp.addInstruction(line);
	    expect(rp.instructions.size).to.equal(1);

			// should not accept a line with the same block and line number
			line = {
	      "block": 0,
	      "line": 0,
	      "reference": "Pre-heat oven.",
	    };
	    expect(() => rp.addInstruction(line)).to.throw('Instruction already exists at this location');
		});

		it('[removeInstruction] should remove a matching instruction line at the given block/line position from the map', function() {
			const rp = new Recipe();
			rp.addInstruction({
	      "block": 0,
	      "line": 0,
	      "reference": "Pre-heat the oven to 500F."
	    });
			expect(rp.instructions.size).to.equal(1);
			rp.saveRecipe();

			// don't do anything if we don't find a match
			rp.removeInstruction(1, 1);
			expect(rp.instructions.size).to.equal(1);

			// remove any matching names
			rp.removeInstruction(0, 0);
			expect(rp.instructions.size).to.equal(0);
		});
	});
});