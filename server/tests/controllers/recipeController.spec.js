const assert = require('assert');
const chai = require('chai');
const chaiHttp = require('chai-http');
const colors = require('colors');
const expect = require('chai').expect;
const fs = require('fs');
const moment = require('moment');

const server = require('../../app');
const Recipe = require('../../models/recipeModel');
const recipeController = require('../../controllers/recipeController');

describe('Recipe Controller ============================================='.magenta, function () {
	it('should initialize test data', function() {
		const databases = [ 'recipes' ];

		// load presets for each database
		for (let db of databases) {
			let preset;

			try {
				preset = fs.readFileSync(`tests/data/presets/recipeController_${db}.json`, 'utf8');
			} catch (ex) {
				throw new Error(`Error reading ${db}.json`);
			}

			fs.writeFileSync(`tests/data/${db}.json`, preset, 'utf-8', (err) => {
				if (err) throw new Error(`An error occurred while writing ${db} preset data`);
			});
		}
	});

	describe('Recipe Methods ============================================='.magenta, function () {
		it('[loadRecipes] should return an array of Recipe objects', function() {
			let recipes = recipeController.loadRecipes();
			for (let rp of recipes) {
				expect(typeof rp === 'object').to.be.true;
			}
		});

		it('[findRecipes] should return an array of recipes matching the search key and value', function() {
			let recipes = [];

			// # should return all recipes
			recipes = recipeController.findRecipes();
			expect(recipes.length).to.equal(0);
			recipes = [];

			const rp = new Recipe();
			rp.title = "Roasted John Dory";
			rp.source = "http://www.delicious.com.au/recipes/roasted-john-dory-baby-spinach-umami-butter/21c1a415-2966-4987-a4df-827cf8d065e2?current_section=recipes";
			rp.saveRecipe();

			recipes = recipeController.findRecipes();
			expect(recipes.length).to.equal(1);
			recipes = [];

			// # should return a exact match on recipeID
			recipes = recipeController.findRecipes('recipeID', rp.recipeID);
			expect(recipes[0].recipeID === rp.recipeID);
			expect(recipes.length).to.equal(1);
			recipes = [];
		});

		it('[isValidImageFormat] should return a boolean indicating if an image\'s file format is accepted', function() {
			// # should return true if valid extension
			// ... such as png
			expect(recipeController.isValidImageFormat('images/abc.png')).to.be.true;
			// ... such as jpg
			expect(recipeController.isValidImageFormat('images/abc.jpg')).to.be.true;
			// ... such as jpeg
			expect(recipeController.isValidImageFormat('images/abc.jpeg')).to.be.true;
			// ... such as jp2
			expect(recipeController.isValidImageFormat('images/abc.jp2')).to.be.true;
			// ... such as gif
			expect(recipeController.isValidImageFormat('images/abc.gif')).to.be.true;
			// ... such as tiff
			expect(recipeController.isValidImageFormat('images/abc.tiff')).to.be.true;
			// ... such as bmp
			expect(recipeController.isValidImageFormat('images/abc.bmp')).to.be.true;
			// TODO extend as needed

			// # should return false if no extension is provided
			expect(recipeController.isValidImageFormat('images/abc')).to.be.false;

			// # should return false if invalid extension
			// ... such as docx
			expect(recipeController.isValidImageFormat('images/abc.docx')).to.be.false;
			// ... such as undefined
			expect(recipeController.isValidImageFormat(undefined)).to.be.false;
			// ... such as null
			expect(recipeController.isValidImageFormat(null)).to.be.false;
			// ... such as an integer
			expect(recipeController.isValidImageFormat(123)).to.be.false;
			// ... such as an empty string
			expect(recipeController.isValidImageFormat('')).to.be.false;
			// ... such as an object
			expect(recipeController.isValidImageFormat({ image: 'images/abc' })).to.be.false;
		});
	});
});