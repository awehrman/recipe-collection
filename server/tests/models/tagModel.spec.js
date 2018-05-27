const assert = require('assert');
const chai = require('chai');
const chaiHttp = require('chai-http');
const colors = require('colors');
const expect = require('chai').expect;
const fs = require('fs');
const moment = require('moment');
const uuid = require('uuid');

const server = require('../../app');
const Tag = require('../../models/tagModel');
const tagController = require('../../controllers/tagController');

describe('Tag Class ============================================='.magenta, function () {
	it('should initialize test data', function() {
		const databases = [ 'tags' ];

		// load presets for each database
		for (let db of databases) {
			let preset;

			try {
				preset = fs.readFileSync(`tests/data/presets/tagModel_${db}.json`, 'utf8');
			} catch (ex) {
				throw new Error(`Error reading ${db}.json`);
			}

			fs.writeFileSync(`tests/data/${db}.json`, preset, 'utf-8', (err) => {
				if (err) throw new Error(`An error occurred while writing ${db} preset data`);
			});
		}
	});

	describe('Getters / Setters ============================================='.magenta, function () {
		it('[constructor] should create a new instance of Tag', function() {
			// # passing invalid paramters should throw an exception
			// should match 'Invalid constructor for Tag' for int values
			expect(() => new Tag(123)).to.throw('Invalid constructor for Tag');

			// # passing no parameters should return an empty Tag object
			const tag = new Tag();
			// should assign a tagID
			expect(tag.tagID).to.exist;
			// should set dateCreated
			expect(moment.isMoment(tag.dateCreated)).to.equal(true);

			// # should allow optional name paramater
			const tag1 = new Tag({
				name: 'Vegan'
			});
			// should assign a tagID
			expect(tag1.tagID).to.exist;
			// should set dateCreated
			expect(moment.isMoment(tag1.dateCreated)).to.equal(true);
			// should set name
			expect(tag1.name).to.equal('Vegan');

			// # should allow optional name and evernoteGUID paramater
			const tag2 = new Tag({
				evernoteGUID: 'dcfc784e-48ad-4ec3-8339-770b6e5e31bd',
				name: 'Vegan'
			});
			// should assign a tagID
			expect(tag2.tagID).to.exist;
			// should set dateCreated
			expect(moment.isMoment(tag2.dateCreated)).to.equal(true);
			// should set name
			expect(tag2.name).to.equal('Vegan');
			// should set evernoteGUID
			expect(tag2.evernoteGUID).to.equal('dcfc784e-48ad-4ec3-8339-770b6e5e31bd');

			// # should allow optional evernoteGUID paramater
			const tag3 = new Tag({
				evernoteGUID: 'dcfc784e-48ad-4ec3-8339-770b6e5e31bd',
			});
			// should assign a tagID
			expect(tag3.tagID).to.exist;
			// should set dateCreated
			expect(moment.isMoment(tag3.dateCreated)).to.equal(true);
			// should set name
			expect(tag3.name).to.be.null;
			// should set evernoteGUID
			expect(tag3.evernoteGUID).to.equal('dcfc784e-48ad-4ec3-8339-770b6e5e31bd');

			// # should allow an object to passed
			let date = new moment();
			const tag4 = new Tag({
				tagID: 'd00f2e31-507d-11e8-92b8-87300f04d0d7',
				dateCreated: date,
				evernoteGUID: 'dcfc784e-48ad-4ec3-8339-770b6e5e31bd',
				name: 'Vegan'
			});
			// should assign a tagID
			expect(tag4.tagID).to.equal('d00f2e31-507d-11e8-92b8-87300f04d0d7');
			// should set dateCreated
			expect(tag4.dateCreated.toString()).to.equal(date.toString());
			// should set name
			expect(tag4.name).to.equal('Vegan');
			// should set evernoteGUID
			expect(tag4.evernoteGUID).to.equal('dcfc784e-48ad-4ec3-8339-770b6e5e31bd');
		});

		it('[tagID] should update with a valid UUID', function() {
			const tag = new Tag();

			// # should be able to read value
			expect(tag.tagID).to.exist;

			// TODO should we check if this tagID already exists before setting?

			// # should set tagID if valid UUID is provided
			const tagID = uuid.v1();
			tag.tagID = tagID;
			expect(tag.tagID).to.equal(tagID);

			// # should throw exception 'Invalid tagID provided' if invalid UUID is provided
			// ... such as null
			expect(() => { tag.tagID = null; }).to.throw('Invalid tagID provided');
			// ... such as undefined
			expect(() => { tag.tagID = undefined; }).to.throw('Invalid tagID provided');
			// ... such as integers
			expect(() => { tag.tagID = 123; }).to.throw('Invalid tagID provided');
			// ... such as strings
			expect(() => { tag.tagID = '123'; }).to.throw('Invalid tagID provided');
			// ... such as objects
			expect(() => { tag.tagID = { tagID: "d00f2e31-507d-11e8-92b8-87300f04d0d7" }; }).to.throw('Invalid tagID provided');
		});

		it('[dateCreated] should be read only', function() {
			const tag = new Tag();
			// # should be able to read value
			expect(tag.dateCreated).to.exist;
			expect(moment.isMoment(tag.dateCreated)).to.equal(true);

			// # should throw an exception if you try to set
			expect(() => { tag.dateCreated = new moment(); }).to.throw('Cannot update dateCreated value');
		});

		it('[evernoteGUID] should update with a valid string', function() {
			const tag = new Tag();

			// # should be able to read
			expect(tag.evernoteGUID).to.be.null;

			// # should be able to assign strings
			tag.evernoteGUID = "98a6cff1-5151-11e8-a376-357e61021145";
			expect(tag.evernoteGUID).to.equal("98a6cff1-5151-11e8-a376-357e61021145");

			// # should throw exception 'Invalid evernoteGUID provided' if invalid string is provided
			// ... such as undefined
			expect(() => { tag.evernoteGUID = undefined; }).to.throw('Invalid evernoteGUID provided');
			// ... such as integers
			expect(() => { tag.evernoteGUID = 123; }).to.throw('Invalid evernoteGUID provided');
			// ... such as empty strings
			expect(() => { tag.evernoteGUID = ''; }).to.throw('Invalid evernoteGUID provided');
			// ... such as objects
			expect(() => { tag.evernoteGUID = { evernoteGUID: "98a6cff1-5151-11e8-a376-357e61021145" }; }).to.throw('Invalid evernoteGUID provided');
		});

		it('[name] should update with a valid string', function() {
			const tag = new Tag();

			// # should be able to read
			expect(tag.name).to.be.null;

			// # should be able to assign strings
			tag.name = "Vegan";
			expect(tag.name).to.equal("Vegan");

			// # should throw exception 'Invalid name provided' if invalid string is provided
			// ... such as null
			expect(() => { tag.name = null; }).to.throw('Invalid name provided');
			// ... such as undefined
			expect(() => { tag.name = undefined; }).to.throw('Invalid name provided');
			// ... such as integers
			expect(() => { tag.name = 123; }).to.throw('Invalid name provided');
			// ... such as empty strings
			expect(() => { tag.name = ''; }).to.throw('Invalid name provided');
			// ... such as objects
			expect(() => { tag.name = { name: "Vegan" }; }).to.throw('Invalid name provided');
		});
	});

	describe('Tag Methods ============================================='.magenta, function () {
		it('[getTag] should return a Tag object', function() {
			const tag = new Tag();
			const obj = tag.getTag();

			expect(obj.hasOwnProperty('tagID')).to.be.true;
			expect(obj.hasOwnProperty('dateCreated')).to.be.true;
			expect(obj.hasOwnProperty('evernoteGUID')).to.be.true;
			expect(obj.hasOwnProperty('name')).to.be.true;
		});

		it('[saveTag] should write the Tag to the database', function() {
			const tag = new Tag();
			let tags = [];
			let foundTag = false;
			let numTags = 0;

			try {
				tags = JSON.parse(fs.readFileSync('tests/data/tags.json', 'utf8'));
			} catch (ex) {
				throw new Error('Error reading tags.json');
			}

			for (let t of tags) {
				if (t.tagID === tag.tagID) { foundTag = true; }
			}
			expect(foundTag).to.be.false;
			numTags = tags.length;

			tag.name = "Vegan";
			tag.saveTag();

			// # should save new tag to database
			try {
				tags = JSON.parse(fs.readFileSync('tests/data/tags.json', 'utf8'));
			} catch (ex) {
				throw new Error('Error reading tags.json');
			}

			for (let t of tags) {
				if (t.tagID === tag.tagID) { foundTag = true; }
			}
			expect(foundTag).to.be.true;
			expect((tags.length - numTags)).to.equal(1);
			numTags = tags.length;

			// # should update existing tag in database
			tag.name = "Vegetarian";
			tag.saveTag();

			try {
				tags = JSON.parse(fs.readFileSync('tests/data/tags.json', 'utf8'));
			} catch (ex) {
				throw new Error('Error reading tags.json');
			}

			foundTag = false;
			for (let t of tags) {
				if (t.tagID === tag.tagID) {
					foundTag = true;
					expect(tag.name).to.equal(tag.name);
				}
			}
			expect(foundTag).to.be.true;
			expect((tags.length - numTags)).to.equal(0);
		});
	});
});