const fs = require('fs');
const isUUID = require('is-uuid');
const uuid = require('uuid');
const moment = require('moment');

const tagController = require('../controllers/tagController');

const DB_PATH = (process.env.NODE_ENV === 'test') ? 'tests/data' : 'data';

/*----------  Private Tag Variables  ----------*/

const _tagID = new WeakMap();
const _dateCreated = new WeakMap();
const _evernoteGUID = new WeakMap();
const _name = new WeakMap();

/*===================================================
=            Tag Class Definition            =
===================================================*/
class Tag {
	constructor(value) {
		if (!(this instanceof Tag)) {
	    throw new Error("Tag needs to be called with the new keyword");
	  }
		try {
			// if we didn't pass a value parameter, just create an empty object
			if ((typeof value === 'undefined') || !value) {
				_tagID.set(this, uuid.v1());
				_dateCreated.set(this, moment());
				_evernoteGUID.set(this, null);
				_name.set(this, null);

				return true;
			}

			// if we have a value, ensure that it at least has an associated tagID
			if (value && (typeof value === 'object')) {
				_tagID.set(this, value.tagID || uuid.v1());
				_dateCreated.set(this, moment(value.dateCreated) || moment());
				_evernoteGUID.set(this, value.evernoteGUID || null);
				_name.set(this, value.name || null);

				return true;
			}

			throw new Error('Invalid constructor for Tag');
		} catch (ex) {
			throw new Error('Invalid constructor for Tag');
		}
	}

	/*=========================================
	=            Getters / Setters            =
	=========================================*/

	/*----------  tagID  ----------*/
	get tagID() {
		return _tagID.get(this);
	}

	set tagID(value) {
		if (value && value !== '' && isUUID.v1(value)) {
			return _tagID.set(this, value);
		}
		throw new Error('Invalid tagID provided');
	}

	/*----------  dateCreated  ----------*/
	get dateCreated() {
		return _dateCreated.get(this);
	}

	set dateCreated(value) {
		throw new Error('Cannot update dateCreated value');
	}

	/*----------  evernoteGUID  ----------*/
	get evernoteGUID() {
		return _evernoteGUID.get(this);
	}

	set evernoteGUID(value) {
		if ((typeof value === 'string' || value instanceof String) && (value !== '')) {
			return _evernoteGUID.set(this, value);
		}
		throw new Error('Invalid evernoteGUID provided');
	}

	/*----------  name  ----------*/
	get name() {
		return _name.get(this);
	}

	set name(value) {
		if ((typeof value === 'string' || value instanceof String) && (value !== '')) {
			return _name.set(this, value);
		}
		throw new Error('Invalid name provided');
	}

	/*=====  End of Getters / Setters  ======*/


	/*==========================================
	=            Tag Methods            =
	==========================================*/
	getTag() {
		return {
			tagID: _tagID.get(this),
			dateCreated: _dateCreated.get(this),
			evernoteGUID: _evernoteGUID.get(this),
			name: _name.get(this)
		};
	}

	saveTag() {
		let tags = [];

		try {
			tags = JSON.parse(fs.readFileSync(`${DB_PATH}/tags.json`, 'utf8'));
		} catch (ex) {
			throw new Error('Error reading tags.json');
		}

		// determine if this is an existing tag or not
		let existingTag = tagController.findTags('tagID', _tagID.get(this));

		// add this tag if it hasn't been added before
		if (existingTag && existingTag.length === 0) {
			tags.push(this.getTag());
		} else {
			// otherwise update the exisiting record
			tags.forEach((tag, index) => {
		    if (tag.tagID === _tagID.get(this)) {
		      tags[index] = this.getTag();
		    }
			});
		}

		// save tags
		fs.writeFileSync(`${DB_PATH}/tags.json`, JSON.stringify(tags, null, 2), 'utf-8', (err) => {
			if (err) throw new Error(`An error occurred while writing tags data`);
		});
	}

	removeTag() {
		let tags = [];

		try {
			tags = JSON.parse(fs.readFileSync(`${DB_PATH}/tags.json`, 'utf8'));
		} catch (ex) {
			throw new Error('Error reading tags.json');
		}

		const index = tags.findIndex(i => i.tagID === _tagID.get(this));
		if (index !== -1) {
			tags.splice(index, 1);
		}

		fs.writeFileSync(`${DB_PATH}/tags.json`, JSON.stringify(tags, null, 2), 'utf-8', (err) => {
			if (err) throw new Error(`An error occurred while writing tags data`);
		});
	}

	/*=====  End of Tag Methods  ======*/
};
/*=====  End of Tag Class Definition  ======*/

module.exports = Tag;
