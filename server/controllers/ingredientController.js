const fs = require('fs');

const Recipe = require('./../models/recipeModel');
const recipeController = require('./recipeController');

const DB_PATH = (process.env.NODE_ENV === 'test') ? 'tests/data' : 'data';

/*====================================
=            Web Requests            =
====================================*/

exports.saveIngredient = (req, res, next) => {
	// this is purely to avoid a circular dependency
	// TODO this is probably a code smell so look into better patterns
	const Ingredient = require('../models/ingredientModel');

	let { ingredient, parent, error } = req.body;
	let status = '';

	if (!ingredient) {
		return next(new Error('No ingredient provided!'));
	}

	if (error) {
		// handle error
		try {
			this.saveError(error, ingredient);
			status = `Saved error for ${ingredient.name}.`;
		} catch (err) {
			status = err;
		}
	}

	if (!error && parent) {
		// handle relationships
		console.log('handle parent'.magenta);
		try {
			// lookup parent ingredient
			let parentName = parent;
			let ingName = ingredient.name;
			parent = this.findIngredient('name', parentName);

			if (!parent) {
				parent = new Ingredient(parentName);
			}

			// load ingredient
			ingredient = new Ingredient(ingredient);

			// merge ingredient records
			ingredient = this.mergeIngredients(parent, ingredient);
			ingredient = ingredient.encodeIngredient();
			status = `Merged ingredient ${ingredient.name} and ${ingName}`;
		} catch (err) {
			status = err;
		}
		
	}

	// handle ingredient updates
	if (!error && !parent) {
		try {
			ingredient = new Ingredient(ingredient);
			ingredient = this.updateIngredient(ingredient);
			ingredient = ingredient.encodeIngredient();
			status = `Updated ingredient ${ingredient.name}`;
		} catch (err) {
			status = err;
		}
	}

	console.log(`${status}`.green);
	console.log(ingredient);
	res.json({ status, ingredient: ingredient, error });
};

/*=====  End of Web Requests  ======*/


/*----------  Ingredient Methods  ----------*/

exports.findIngredient = (key = null, value = null) => {
	let ingredients = this.loadIngredients();

	// possible keys to filter search by
	const searchExpressions = {
		// lookup by ingredientID
		ingredientID: () => ingredients.filter(i => i.ingredientID === value),

		// lookup by name
		name: () => ingredients.filter(i => i.name === value),

		// lookup by any exact matches on all fields
		exact: () => ingredients.filter(i =>
			i.name === value
			|| i.plural === value
			|| i.alternateNames.has(value)
			|| i.name.replace(/-|\s/g,"") === value.replace(/-|\s/g,"")
			|| i.plural.replace(/-|\s/g,"") === value.replace(/-|\s/g,"")
			|| i.alternateNames.has(value.replace(/-|\s/g,""))),
	};

	if (key !== null && value !== null) {
		ingredients = searchExpressions[key]();
	}

	if (ingredients.length === 1) {
		return ingredients[0];
	}
	return null;
};

exports.findIngredients = (key = null, value = null) => {
	let ingredients = this.loadIngredients();

	// possible keys to filter search by
	const searchExpressions = {
		// lookup by ingredientID
		ingredientID: () => ingredients.filter(i => i.ingredientID === value),

		// lookup by name
		name: () => ingredients.filter(i => i.name === value),

		// lookup by any exact matches on all fields
		exact: () => ingredients.filter(i =>
			i.name === value
			|| i.plural === value
			|| i.alternateNames.has(value)),

		// lookup by any partial mathces on all fields
		partial: () => ingredients.filter(i =>
			i.name.includes(value)
			|| (i.plural && i.plural.includes(value))
			|| [ ...i.alternateNames ].find(n => n.includes(value))),

		// lookup all ingredients connected by the name or ingredientID provided
		related: () => ingredients.filter(i => {
			// match directly on name or ID
			//if (i.name === value) { return true; }
			//if (i.ingredientID === value) { return true; }
			// find any matches linked within on related or substitutes
			const related = [ ...i.relatedIngredients ].filter(n => n[0] === value || n[1] === value);
			if (related.length > 0) { return true; }

			const substitutes = [ ...i.substitutes ].filter(n => n[0] === value || n[1] === value);
			if (substitutes.length > 0) { return true; }
			return false;
		})
	};

	if (key !== null && value !== null) {
		return searchExpressions[key]();
	}

	return ingredients;
};

exports.loadErrors = () => {
	let errors = [];

	// load errors from flat file
	try {
		errors = JSON.parse(fs.readFileSync(`${DB_PATH}/errors.json`, 'utf8'));
	} catch (ex) {
		throw new Error('Error reading errors.json');
	}

	return errors;
};

exports.loadIngredients = (isEncodeObject = false) => {
	// this is purely to avoid a circular dependency
	// TODO this is probably a code smell so look into better patterns
	const Ingredient = require('../models/ingredientModel');

	let ingredients = [];

	// load ingredients from flat file
	try {
		ingredients = JSON.parse(fs.readFileSync(`${DB_PATH}/ingredients.json`, 'utf8'));
	} catch (ex) {
		throw new Error('Error reading ingredients.json');
	}

	if (!isEncodeObject) {
		ingredients = ingredients.map(ing => new Ingredient(ing));
	}

	return ingredients;
};

exports.saveError = (error, ingredient) => {

	// possible type values:
	// [ 'parsing', 'data', 'semantic', 'instruction', 'equipment' ]
	
	// 'parsing' - PEG grammar exception thrown
	// 'data' - borked data in the evernote file that should be removed
	// 'semantic' - whatever the grammar thought was the ingredient name was off, and should be associated with another ingredient
	// 'instruction' - likely due to bad note date, an instruction line was in the wrong place
	// 'equipment' - cooking requipment or tools listed as ingredients	

	// TODO throw error if no error
	// TODO throw error if no ingredient with at least references and an ID

	if (!error || typeof error !== 'object' || !error.hasOwnProperty('type')) {
		throw new Error('Invalid error parameter passed to saveError');
	}

	if (!ingredient || typeof ingredient !== 'object' || !ingredient.hasOwnProperty('references')  || !ingredient.hasOwnProperty('ingredientID')) {
		throw new Error('Invalid ingredient parameter passed to saveError');
	}

	let errors = this.loadErrors();
	let { associated, type } = error;
	let associations = null

	// handle any new associations
	if (associated && associated.length > 0) {
		associations = associated.map(name => {
			let match = this.findIngredient('name', name);
			if (match) {
				// update the references if we found it
				ingredient.references.forEach(ref => match.addReference(ref[0], ref[1]));
				match.saveIngredient();
				return match;
			}

			// create the match if we didn't find it
			const Ingredient = require('../models/ingredientModel');
			match = new Ingredient(name);
			// TODO do we want to transfer any other fields here? maybe properties? or validated?
			ingredient.references.forEach(rp => match.addReference(rp[0], rp[1]));
			match.saveIngredient();
			return match;
		});
	}

	if (ingredient && ingredient.hasOwnProperty('references') && ingredient.hasOwnProperty('ingredientID')) {
		// update the recipes that contain references to this ingredient
		ingredient.references.forEach(ref => {
			// log an error for its ingredient line
			errors.push({
				line: ref[0],							// 200ml full-cream milk
				recipeID: ref[1],					// "52848790-68fa-11e8-8018-0726559ba6d2"
				type,											// 'semantic' 
				value: ingredient.name		// '-cream milk'
			});


			// lookup the recipe and update its ingredientID reference
			let rp = recipeController.findRecipe('recipeID', ref[1]);
			if (rp && rp.ingredientLines.size > 0) {
				const iterator = rp.ingredientLines.entries();
				// go through the ingredient lines
				
				try {
					let pendingRemoval = [];
					for (let i = 0; i < rp.ingredientLines.size; i++) {
						let [ index, line ] = iterator.next().value; // ["0_0", { block: 0, line: 0, ... }]
						if (line && line.hasOwnProperty('ingredients')) {
							let matchingLine = line.ingredients.filter(i => i.name === ingredient.name);

							// and if we find our error ingredient in this list, update it
							if (matchingLine.length > 0) {
								switch(type) {
									case "parsing":
										// clean up ingredient object
										line.isParsed = false;
										delete line.amounts;
										delete line.unitDescriptor;
										delete line.units;
										delete line.amountUnitSeparator;
										delete line.ingDescriptor;
										delete line.comments;
										delete line.filler;
										delete line.ingredients;
										break;
									case "data":
										// remove the ingredient object
										pendingRemoval.push(`${line.block}_${line.line}`);
										break;
									case "semantic":
										// TODO grammar extension
										// TODO pass manually parsed items?

										// update the ingredient object
										line.isParsed = false;
										delete line.amounts;
										delete line.unitDescriptor;
										delete line.units;
										delete line.amountUnitSeparator;
										delete line.ingDescriptor;
										delete line.comments;
										delete line.filler;
										line.ingredients = associations.map(a => {
											return {
												ingredientID: a.ingredientID,
												name: a.name,
												properties: Object.assign(a.properties, {}),
												isValidated: a.isValidated
											};
										});
										break;
									case "instruction":
										// move line to instructions
										delete line.isParsed;
										rp.ingredientLines.delete(index);
										rp.instructions.set(index, line);
										break;
									case "equipment":
										// remove the ingredient object
										pendingRemoval.push(`${line.block}_${line.line}`);

										// log the equipment
										// TODO
										break;
									default:
										break;
								}
							}
						}
					}

					// handle any pending removals
					pendingRemoval.forEach(item => rp.ingredientLines.delete(item));

					rp.saveRecipe();
				} catch (err) {
					console.log(err);
				}
			}
		});

		// if this is an existing ingredient, remove it
		let existing = this.findIngredient('ingredientID', ingredient.ingredientID);
		if (existing) {
			existing.removeIngredient();
		}
	}

	// save the errors file
	fs.writeFileSync(`${DB_PATH}/errors.json`, JSON.stringify(errors, null, 2), 'utf-8', (err) => {
		if (err) throw new Error(`An error occurred while writing error data`);
	});
};

exports.mergeIngredients = (parent, ingredient) => {
	// handle any prior updates to the ingredient
	ingredient = this.updateIngredient(ingredient);

	parent.addAlternateName(ingredient.name, false);

	if (ingredient.plural) {
		parent.addAlternateName(ingredient.plural, false);
	}

	parent.properties = ingredient.properties;
	
	if (ingredient.alternateNames.size > 0) {
		ingredient.alternateNames.forEach(item => {
			parent.addAlternateName(item, false);
		});
	}

	if (ingredient.relatedIngredients.size > 0) {
		for (let [name, ingredientID] of ingredient.relatedIngredients) {
		  parent.addRelatedIngredient(name, ingredientID);
		}
	}

	if (ingredient.substitutes.size > 0) {
		for (let [name, ingredientID] of ingredient.substitutes) {
		  parent.addSubstitute(name, ingredientID);
		}
	}

	if (ingredient.references.size > 0) {
		for (let [line, recipeID] of ingredient.references) {
		  parent.addReference(line, recipeID);
		}
	}

	parent.saveIngredient();

	ingredient.removeIngredient();

	return parent;
};

exports.updateIngredient = (updated) => {
	if (!updated) {
		throw new Error('No ingredient to update');
	}

	if (!this.validate(updated)) {
		throw new Error('Invaild ingredient');
	}
	
	let current, parent, existing, iterator, it, next;
	let mergeList = [];

	// lookup this ingredient
	current = this.findIngredient('ingredientID', updated.ingredientID);

	if (!current) {
		// or create it if its new
		current = new Ingredient(updated.name);
	}

	// handle any parentIngredientID updates
	if (updated.parentIngredientID !== current.parentIngredientID) {
		parent = this.findIngredient('ingredientID', updated.parentIngredientID);
		current.parentIngredientID = (parent) ? updated.parentIngredientID : null;
	}

	// handle any name updates
	if (updated.name !== current.name) {
		const originalName = current.name;

		// we'll always accept a new name even if its used elsewhere
		// this will trigger a merge if we found it on another ingredient
		current.name = updated.name;

		// check if this value is used on any other ingredients
		existing = this.findIngredient('exact', updated.name);
		
		// if it doesn't or this is the same ingredient
		if (!existing || (existing.ingredientID === updated.ingredientID)) {
			// this will move the original name down to the alt names by default
			// delete this and let the other parts handle that assignment if it was manually moved
			current.removeAlternateName(originalName);
		} else if (existing && !mergeList.find(i => i.ingredientID === existing.ingredientID)) {
			mergeList.push(existing);
		}
	}

	// plural
	if (updated.plural !== current.plural) {
		current.plural = updated.plural;

		// check if this value is used on any other ingredients
		existing = this.findIngredient('exact', updated.plural);
		
		if (existing && !mergeList.find(i => i.ingredientID === existing.ingredientID)) {
			mergeList.push(existing);
		}
	}

	// properties
	current.properties = updated.properties;

	// alternate names
	current.alternateNames = new Set();

	if (updated.alternateNames.size > 0) {
		iterator = updated.alternateNames.entries();
		for (it = 0; it < updated.alternateNames.size; it++) {
			next = iterator.next().value[0];
			try {
				// accept it if it passes validation
				current.addAlternateName(next, false);
			} catch (ex) {
				console.log(ex);
			}

			existing = this.findIngredient('exact', next);

			if (existing && (existing.ingredientID !== current.ingredientID)) {
				mergeList.push(existing);
			}
		}
	}

	// related ingredients
	current.relatedIngredients = updated.relatedIngredients;

	// substitutes
	current.substitutes = updated.substitutes;

	// isValidated
	current.isValidated = updated.isValidated;

	// merge any ingredient records into current record
	mergeList.forEach(i => {
		//parentIngredientID
		if (i.parentIngredientID && i.parentIngredientID !== current.parentIngredientID) {
			current.parentIngredientID = i.parentIngredientID;
		}

		//name
		if ((i.name !== current.name) && (i.name !== current.plural) && !current.alternateNames.has(i.name)) {
			current.addAlternateName(i.name, false);
		}

		//plural
		if (i.plural && (i.plural !== current.name) && (i.plural !== current.plural) && !current.alternateNames.has(i.plural)) {
			current.addAlternateName(i.plural, false);
		}
		
		//properties
		Object.keys(current.properties).forEach(key => {
			current.properties[key] = i.properties[key] || current.properties[key];
		});

		//alternateNames
		if (i.alternateNames.size > 0) {
			const altIt = i.alternateNames.entries();
			for (let s = 0; s < i.alternateNames.size; s++) {
				let altName = altIt.next().value[0];
				if ((altName !== current.name) && (altName !== current.plural) && !current.alternateNames.has(altName)) {
					current.addAlternateName(altName, false);
				}
			}
		}

		//relatedIngredients
		if (i.relatedIngredients.size > 0) {
			const refIt = i.relatedIngredients.entries();
			for (let s = 0; s < i.relatedIngredients.size; s++) {
				let [ name, ingredientID ] = refIt.next().value;
				current.addRelatedIngredient(name);
			}
		}

		//substitutes
		if (i.substitutes.size > 0) {
			const refIt = i.substitutes.entries();
			for (let s = 0; s < i.substitutes.size; s++) {
				let [ name, ingredientID ] = refIt.next().value;
				current.addSubstitute(name);
			}
		}

		//references
		if (i.references.size > 0) {
			const refIt = i.references.entries();
			for (let s = 0; s < i.references.size; s++) {
				let [ line, recipeID ] = refIt.next().value;
				current.addReference(line, recipeID);
			}
		}

		// isValidated
		current.isValidated = i.isValidated || current.isValidated;

		// search for any connections in relatedIngredients and substitues on other ingredients that need to be updated
		let updatedIngredients = this.findIngredients('related', i.ingredientID);
		updatedIngredients.forEach(u => {
			if (u.relatedIngredients.has(i.name)) {
				u.removeRelatedIngredient(i.name);
				u.addRelatedIngredient(current.name, current.ingredientID);
				u.saveIngredient(true);
			}

			if (u.substitutes.has(i.name)) {
				u.removeSubstitute(i.name);
				u.addSubstitute(current.name, current.ingredientID);
				u.saveIngredient(true);
			}

		});

		i.removeIngredient();
	});

	current.saveIngredient();
	return current;
};

exports.validate = (value) => {
	try {
		value = value.encodeIngredient();
	} catch (ex) {}

	let isValid = true;
	const requiredProperties = [
		'ingredientID',
		'parentIngredientID',
		'dateCreated',
		'dateUpdated',
		'name',
		'plural',
		'properties',
		'alternateNames',
		'relatedIngredients',
		'substitutes',
		'references',
		'isValidated'
	];

	for (let i in requiredProperties) {
		if (!(requiredProperties[i] in value)) {
			isValid = false;
			break;
		}
	}

	return isValid;
}