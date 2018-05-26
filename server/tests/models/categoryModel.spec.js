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

describe.only('Category Class ============================================='.magenta, function () {
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

		it.skip('[categoryID] should update with a valid UUID', function() {
			// TODO
		});

		it.skip('[dateCreated] should be read only', function() {
			// TODO
		});

		it.skip('[evernoteGUID] should update with a valid string', function() {
			// TODO
		});

		it.skip('[name] should update with a valid string', function() {
			// TODO
		});
	});

	describe('Category Methods ============================================='.magenta, function () {
		it.skip('[getCategory] should return a Category object', function() {
			// TODO
		});

		it.skip('[saveCategory] should write the Category to the database', function() {
			// TODO
		});
	});
});