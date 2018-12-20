const fs = require('fs');

const DB_PATH = (process.env.NODE_ENV === 'test') ? 'tests/data' : 'data';

exports.findTag = (key = null, value = null) => {
	let tags = this.loadTags();

	// possible keys to filter search by
	const searchExpressions = {
		// lookup by tagID
		tagID: () => tags.filter(i => i.tagID === value),

		// lookup by evernoteGUID
		evernoteGUID: () => tags.filter(i => i.evernoteGUID === value),

		// lookup by name
		name: () => tags.filter(i => i.name === value),
	};

	if (key !== null && value !== null) {
		tags = searchExpressions[key]();
	}

	if (tags.length === 1) {
		return tags[0];
	}
	return null;
};

exports.findTags = (key = null, value = null) => {
	let tags = this.loadTags();

	// possible keys to filter search by
	const searchExpressions = {
		// lookup by evernoteGUID
		evernoteGUID: () => tags.filter(i => i.evernoteGUID === value),

		// lookup by name
		name: () => tags.filter(i => i.name === value),

		// lookup by tagID
		tagID: () => tags.filter(i => i.tagID === value)
	};

	if (key !== null && value !== null) {
		return searchExpressions[key]();
	}

	return tags;
};

exports.loadTags = () => {
	// this is purely to avoid a circular dependency
	// TODO this is probably a code smell so look into better patterns
	const Tag = require('../models/tagModel');

	let tags = [];
	const converted = [];

	// load tags from flat file
	try {
		tags = JSON.parse(fs.readFileSync(`${DB_PATH}/tags.json`, 'utf8'));
	} catch (ex) {
		throw new Error('Error reading tags.json');
	}

	for (let tag of tags) {
		// convert 'encoded' ingredient to Ingredient object
		converted.push(new Tag(tag));
	}

	return converted;
};