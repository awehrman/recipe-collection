const assert = require('assert');
const chai = require('chai');
const chaiHttp = require('chai-http');
const colors = require('colors');
const expect = require('chai').expect;
const fs = require('fs');
const moment = require('moment');

const server = require('../../app');
const Tag = require('../../models/tagModel');
const tagController = require('../../controllers/tagController');

describe('Tag Controller ============================================='.magenta, function () {
	it('should initialize test data', function() {
		const databases = [ 'tags' ];

		// load presets for each database
		for (let db of databases) {
			let preset;

			try {
				preset = fs.readFileSync(`tests/data/presets/tagController_${db}.json`, 'utf8');
			} catch (ex) {
				throw new Error(`Error reading ${db}.json`);
			}

			fs.writeFileSync(`tests/data/${db}.json`, preset, 'utf-8', (err) => {
				if (err) throw new Error(`An error occurred while writing ${db} preset data`);
			});
		}
	});

	describe('Tag Methods ============================================='.magenta, function () {
		it('[findTags] should return an array of tags matching the search key and value', function() {
			let tags = [];

			// # should return all tags
			tags = tagController.findTags();
			expect(tags.length).to.equal(0);
			tags = [];

			const rp = new Tag();
			rp.name = "Fish";
			rp.saveTag();

			tags = tagController.findTags();
			expect(tags.length).to.equal(1);
			tags = [];

			// # should return a exact match on tagID
			tags = tagController.findTags('tagID', rp.tagID);
			expect(tags[0].tagID === rp.tagID);
			expect(tags.length).to.equal(1);
			tags = [];
		});
	});
});