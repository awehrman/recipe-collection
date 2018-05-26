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

describe('Category Controller ============================================='.magenta, function () {
	it('should initialize test data', function() {
		const databases = [ 'categories' ];

		// load presets for each database
		for (let db of databases) {
			let preset;

			try {
				preset = fs.readFileSync(`tests/data/presets/categoryController_${db}.json`, 'utf8');
			} catch (ex) {
				throw new Error(`Error reading ${db}.json`);
			}

			fs.writeFileSync(`tests/data/${db}.json`, preset, 'utf-8', (err) => {
				if (err) throw new Error(`An error occurred while writing ${db} preset data`);
			});
		}
	});

	describe('Category Methods ============================================='.magenta, function () {
		it('[findCategories] should return an array of categories matching the search key and value', function() {
			let categories = [];

			// # should return all categories
			categories = categoryController.findCategories();
			expect(categories.length).to.equal(0);
			categories = [];

			const rp = new Category();
			rp.name = "Fish";
			rp.saveCategory();

			categories = categoryController.findCategories();
			expect(categories.length).to.equal(1);
			categories = [];

			// # should return a exact match on categoryID
			categories = categoryController.findCategories('categoryID', rp.categoryID);
			expect(categories[0].categoryID === rp.categoryID);
			expect(categories.length).to.equal(1);
			categories = [];
		});
	});
});