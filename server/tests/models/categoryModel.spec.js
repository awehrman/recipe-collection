const assert = require('assert');
const chai = require('chai');
const chaiHttp = require('chai-http');
const colors = require('colors');
const expect = require('chai').expect;
const fs = require('fs');
const moment = require('moment');
const uuid = require('uuid');

const server = require('../../app');
const Category = require('../../models/categoryModel');
const categoryController = require('../../controllers/categoryController');

describe('Category Class ============================================='.magenta, function () {
	it('should initialize test data', function() {
		const databases = [ 'categories' ];

		// load presets for each database
		for (let db of databases) {
			let preset;

			try {
				preset = fs.readFileSync(`tests/data/presets/categoryModel_${db}.json`, 'utf8');
			} catch (ex) {
				throw new Error(`Error reading ${db}.json`);
			}

			fs.writeFileSync(`tests/data/${db}.json`, preset, 'utf-8', (err) => {
				if (err) throw new Error(`An error occurred while writing ${db} preset data`);
			});
		}
	});

	describe('Getters / Setters ============================================='.magenta, function () {
		it('[constructor] should create a new instance of Category', function() {
			// # passing invalid paramters should throw an exception
			// should match 'Invalid constructor for Category' for int values
			expect(() => new Category(123)).to.throw('Invalid constructor for Category');

			// # passing no parameters should return an empty Category object
			const cat = new Category();
			// should assign a categoryID
			expect(cat.categoryID).to.exist;
			// should set dateCreated
			expect(moment.isMoment(cat.dateCreated)).to.equal(true);

			// # should allow optional name paramater
			const cat1 = new Category({
				name: 'Fish'
			});
			// should assign a categoryID
			expect(cat1.categoryID).to.exist;
			// should set dateCreated
			expect(moment.isMoment(cat1.dateCreated)).to.equal(true);
			// should set name
			expect(cat1.name).to.equal('Fish');

			// # should allow optional name and evernoteGUID paramater
			const cat2 = new Category({
				evernoteGUID: 'dcfc784e-48ad-4ec3-8339-770b6e5e31bd',
				name: 'Fish'
			});
			// should assign a categoryID
			expect(cat2.categoryID).to.exist;
			// should set dateCreated
			expect(moment.isMoment(cat2.dateCreated)).to.equal(true);
			// should set name
			expect(cat2.name).to.equal('Fish');
			// should set evernoteGUID
			expect(cat2.evernoteGUID).to.equal('dcfc784e-48ad-4ec3-8339-770b6e5e31bd');

			// # should allow optional evernoteGUID paramater
			const cat3 = new Category({
				evernoteGUID: 'dcfc784e-48ad-4ec3-8339-770b6e5e31bd',
			});
			// should assign a categoryID
			expect(cat3.categoryID).to.exist;
			// should set dateCreated
			expect(moment.isMoment(cat3.dateCreated)).to.equal(true);
			// should set name
			expect(cat3.name).to.be.null;
			// should set evernoteGUID
			expect(cat3.evernoteGUID).to.equal('dcfc784e-48ad-4ec3-8339-770b6e5e31bd');

			// # should allow an object to passed
			let date = new moment();
			const cat4 = new Category({
				categoryID: 'd00f2e31-507d-11e8-92b8-87300f04d0d7',
				dateCreated: date,
				evernoteGUID: 'dcfc784e-48ad-4ec3-8339-770b6e5e31bd',
				name: 'Fish'
			});
			// should assign a categoryID
			expect(cat4.categoryID).to.equal('d00f2e31-507d-11e8-92b8-87300f04d0d7');
			// should set dateCreated
			expect(cat4.dateCreated.toString()).to.equal(date.toString());
			// should set name
			expect(cat4.name).to.equal('Fish');
			// should set evernoteGUID
			expect(cat4.evernoteGUID).to.equal('dcfc784e-48ad-4ec3-8339-770b6e5e31bd');
		});

		it('[categoryID] should update with a valid UUID', function() {
			const cat = new Category();

			// # should be able to read value
			expect(cat.categoryID).to.exist;

			// TODO should we check if this categoryID already exists before setting?

			// # should set categoryID if valid UUID is provided
			const categoryID = uuid.v1();
			cat.categoryID = categoryID;
			expect(cat.categoryID).to.equal(categoryID);

			// # should throw exception 'Invalid categoryID provided' if invalid UUID is provided
			// ... such as null
			expect(() => { cat.categoryID = null; }).to.throw('Invalid categoryID provided');
			// ... such as undefined
			expect(() => { cat.categoryID = undefined; }).to.throw('Invalid categoryID provided');
			// ... such as integers
			expect(() => { cat.categoryID = 123; }).to.throw('Invalid categoryID provided');
			// ... such as strings
			expect(() => { cat.categoryID = '123'; }).to.throw('Invalid categoryID provided');
			// ... such as objects
			expect(() => { cat.categoryID = { categoryID: "d00f2e31-507d-11e8-92b8-87300f04d0d7" }; }).to.throw('Invalid categoryID provided');
		});

		it('[dateCreated] should be read only', function() {
			const cat = new Category();
			// # should be able to read value
			expect(cat.dateCreated).to.exist;
			expect(moment.isMoment(cat.dateCreated)).to.equal(true);

			// # should throw an exception if you try to set
			expect(() => { cat.dateCreated = new moment(); }).to.throw('Cannot update dateCreated value');
		});

		it('[evernoteGUID] should update with a valid string', function() {
			const cat = new Category();

			// # should be able to read
			expect(cat.evernoteGUID).to.be.null;

			// # should be able to assign strings
			cat.evernoteGUID = "98a6cff1-5151-11e8-a376-357e61021145";
			expect(cat.evernoteGUID).to.equal("98a6cff1-5151-11e8-a376-357e61021145");

			// # should throw exception 'Invalid evernoteGUID provided' if invalid string is provided
			// ... such as undefined
			expect(() => { cat.evernoteGUID = undefined; }).to.throw('Invalid evernoteGUID provided');
			// ... such as integers
			expect(() => { cat.evernoteGUID = 123; }).to.throw('Invalid evernoteGUID provided');
			// ... such as empty strings
			expect(() => { cat.evernoteGUID = ''; }).to.throw('Invalid evernoteGUID provided');
			// ... such as objects
			expect(() => { cat.evernoteGUID = { evernoteGUID: "98a6cff1-5151-11e8-a376-357e61021145" }; }).to.throw('Invalid evernoteGUID provided');
		});

		it('[name] should update with a valid string', function() {
			const cat = new Category();

			// # should be able to read
			expect(cat.name).to.be.null;

			// # should be able to assign strings
			cat.name = "Fish";
			expect(cat.name).to.equal("Fish");

			// # should throw exception 'Invalid name provided' if invalid string is provided
			// ... such as null
			expect(() => { cat.name = null; }).to.throw('Invalid name provided');
			// ... such as undefined
			expect(() => { cat.name = undefined; }).to.throw('Invalid name provided');
			// ... such as integers
			expect(() => { cat.name = 123; }).to.throw('Invalid name provided');
			// ... such as empty strings
			expect(() => { cat.name = ''; }).to.throw('Invalid name provided');
			// ... such as objects
			expect(() => { cat.name = { name: "Fish" }; }).to.throw('Invalid name provided');
		});
	});

	describe('Category Methods ============================================='.magenta, function () {
		it('[getCategory] should return a Category object', function() {
			const cat = new Category();
			const obj = cat.getCategory();

			expect(obj.hasOwnProperty('categoryID')).to.be.true;
			expect(obj.hasOwnProperty('dateCreated')).to.be.true;
			expect(obj.hasOwnProperty('evernoteGUID')).to.be.true;
			expect(obj.hasOwnProperty('name')).to.be.true;
		});

		it('[saveCategory] should write the Category to the database', function() {
			const cat = new Category();
			let categories = [];
			let foundCategory = false;
			let numCategories = 0;

			try {
				categories = JSON.parse(fs.readFileSync('tests/data/categories.json', 'utf8'));
			} catch (ex) {
				throw new Error('Error reading categories.json');
			}

			for (let category of categories) {
				if (category.categoryID === cat.categoryID) { foundCategory = true; }
			}
			expect(foundCategory).to.be.false;
			numCategories = categories.length;

			cat.name = "Fish";
			cat.saveCategory();

			// # should save new category to database
			try {
				categories = JSON.parse(fs.readFileSync('tests/data/categories.json', 'utf8'));
			} catch (ex) {
				throw new Error('Error reading categories.json');
			}

			for (let category of categories) {
				if (category.categoryID === cat.categoryID) { foundCategory = true; }
			}
			expect(foundCategory).to.be.true;
			expect((categories.length - numCategories)).to.equal(1);
			numCategories = categories.length;

			// # should update existing category in database
			cat.name = "Seafood";
			cat.saveCategory();

			try {
				categories = JSON.parse(fs.readFileSync('tests/data/categories.json', 'utf8'));
			} catch (ex) {
				throw new Error('Error reading categories.json');
			}

			foundCategory = false;
			for (let category of categories) {
				if (category.categoryID === cat.categoryID) {
					foundCategory = true;
					expect(category.name).to.equal(cat.name);
				}
			}
			expect(foundCategory).to.be.true;
			expect((categories.length - numCategories)).to.equal(0);
		});

		it('[removeCategory] should remove the Category from the database', function() {
			let cat = new Category();
			cat.name = "Dumplings";
			cat.saveCategory();

			let foundCat = categoryController.findCategories('name', 'Dumplings');
			expect(foundCat.length).to.equal(1);

			cat.removeCategory();

			foundCat = categoryController.findCategories('name', 'Dumplings');
			expect(foundCat.length).to.equal(0);
		});
	});
});