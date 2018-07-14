const fs = require('fs');

const Recipe = require('./../models/recipeModel');
const recipeController = require('./recipeController');

const DB_PATH = (process.env.NODE_ENV === 'test') ? 'tests/data' : 'data';

/*====================================
=            Web Requests            =
====================================*/

exports.saveIngredient = (req, res, next) => {
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
	}

	// handle ingredient updates
	if (!error && !parent) {
		try {
			ingredient = this.updateIngredient(ingredient);
			status = `Updated ingredient ${ingredient.name}`;
		} catch (err) {
			status = err;
		}
	}

	console.log(`${status}`.green);
	res.json({ status, ingredient, parent, error });
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
			|| i.parsingExpressions.has(value)),
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
			|| i.alternateNames.has(value)
			|| i.parsingExpressions.has(value)),

		// lookup by any partial mathces on all fields
		partial: () => ingredients.filter(i =>
			i.name.includes(value)
			|| (i.plural && i.plural.includes(value))
			|| [ ...i.alternateNames ].find(n => n.includes(value))
			|| [ ...i.parsingExpressions ].find(n => n.includes(value))),

		// lookup all ingredients connected by the name or ingredientID provided
		related: () => ingredients.filter(i => {
			// match directly on name or ID
			if (i.name === value) { return true; }
			if (i.ingredientID === value) { return true; }
			// find any matches linked within
			const related = [ ...i.relatedIngredients].filter(n => n[0] === value || n[1] === value);
			if (related.length > 0) { return true; }
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

exports.updateIngredient = (updated) => {
	console.log('updateIngredient'.green);

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
		console.log(`[parentIngredientID] updated: ${updated.parentIngredientID}, current: ${current.parentIngredientID}`.yellow);
		parent = this.findIngredient('ingredientID', updated.parentIngredientID);
		current.parentIngredientID = (parent) ? updated.parentIngredientID : null;
	}

	// handle any name updates
	if (updated.name !== current.name) {
		console.log(`[name] updated: ${updated.name}, current: ${current.name}`.yellow);
		
		let originalName = current.name;

		// check if this value is used on any other ingredients
		existing = this.findIngredient('exact', updated.name);

		// we'll always accept a new name even if its used elsewhere
		// this will trigger a merge if we found it on another ingredient
		current.name = updated.name;
		
		// if it doesn't or this is the same ingredient
		if (!existing || (existing.ingredientID === updated.ingredientID)) {
			console.log(`removing alt name ${originalName}`.red);
			// this will move the original name down to the alt names by default
			// delete this and let the other parts handle that assignment if it was manually moved
			current.removeAlternateName(originalName);
		} else {
			console.log('a match on [name] triggered a merge!'.red);

			if (!mergeList.find(i => i.ingredientID === existing.ingredientID)) {
				mergeList.push(existing);
			}
		}
	}

	// plural
	if (updated.plural !== current.plural) {
		console.log(`[plural] updated: ${updated.plural}, current: ${current.plural}`.yellow);

		// check if this value is used on any other ingredients
		existing = this.findIngredient('exact', updated.plural);
		
		current.plural = updated.plural;

		// if we didn't find this used on another ingredient
		if (!existing) {
			//...
		} else {
			if (!mergeList.find(i => i.ingredientID === existing.ingredientID)) {
				mergeList.push(existing);
			}	
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
			} catch (ex) {}

			existing = this.findIngredient('exact', next);

			if (existing && (existing.ingredientID !== current.ingredientID)) {
				mergeList.push(existing);
			}
		}
	}

	// parsing expressions
	current.parsingExpressions = updated.parsingExpressions;

	// related ingredients
	current.relatedIngredients = updated.relatedIngredients;

	// substitutes
	current.substitutes = updated.substitutes;

	// isValidated
	current.isValidated = updated.isValidated;

	// MERGE
	mergeList.forEach(i => {
		console.log(`merging ${i.name}...`.red);
		//parentIngredientID
		if (i.parentIngredientID && i.parentIngredientID !== current.parentIngredientID) {
			current.parentIngredientID = i.parentIngredientID;
		}

		//name
		if ((i.name !== current.name) && (i.name !== current.plural) && !current.alternateNames.has(i.name) && !current.parsingExpressions.has(i.name)) {
			console.log(`adding name: ${i.name} to...`.red);
			current.addAlternateName(i.name, false);
			console.log(current.alternateNames);
		}

		//plural
		if (i.plural && (i.plural !== current.name) && (i.plural !== current.plural) && !current.alternateNames.has(i.plural) && !current.parsingExpressions.has(i.plural)) {
			console.log(`adding plural: ${i.name} to...`.red);
			current.addAlternateName(i.plural, false);
			console.log(current.alternateNames);
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
				if ((altName !== current.name) && (altName !== current.plural) && !current.alternateNames.has(altName) && !current.parsingExpressions.has(altName)) {
					console.log(`adding alt name: ${i.name} to...`.red);
					current.addAlternateName(altName, false);
					console.log(current.alternateNames);
				}
			}
		}

		//parsingExpressions
		if (i.parsingExpressions.size > 0) {
			const expIt = i.parsingExpressions.entries();
			for (let s = 0; s < i.parsingExpressions.size; s++) {
				let parExp = expIt.next().value[0];
				if ((parExp !== current.name) && (parExp !== current.plural) && !current.alternateNames.has(parExp) && !current.parsingExpressions.has(parExp)) {
					console.log(`adding parsing expression: ${i.name} to...`.red);
					current.addParsingExpression(parExp, false);
				}
			}
		}

		//relatedIngredients
		if (i.relatedIngredients.size > 0) {
			const refIt = i.relatedIngredients.entries();
			for (let s = 0; s < i.relatedIngredients.size; s++) {
				let [ name, ingredientID ] = refIt.next().value;
				console.log('adding related....'.red);
				current.addRelatedIngredient(name);
				console.log(current.relatedIngredients);
			}
		}

		//substitutes
		if (i.substitutes.size > 0) {
			const refIt = i.substitutes.entries();
			for (let s = 0; s < i.substitutes.size; s++) {
				let [ name, ingredientID ] = refIt.next().value;
				console.log('adding substitute....'.red);
				current.addSubstitute(name);
				console.log(current.substitutes);
			}
		}

		//references
		if (i.references.size > 0) {
			const refIt = i.references.entries();
			for (let s = 0; s < i.references.size; s++) {
				let [ line, recipeID ] = refIt.next().value;
				console.log('adding reference....'.red);
				console.log(line);
				console.log(recipeID);
				current.addReference(line, recipeID);
				console.log(current.references);
			}
		}

		// isValidated
		current.isValidated = i.isValidated || current.isValidated;

		i.removeIngredient();
	});

	current.saveIngredient();
	return current;
};

exports.validate = (value) => {
	value = value.encodeIngredient();
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
		'parsingExpressions',
		'relatedIngredients',
		'substitutes',
		'references',
		'isValidated'
	];

	for (let i in requiredProperties) {
		//console.log(`${requiredProperties[i]}: ${requiredProperties[i] in value}`.yellow);
		if (!(requiredProperties[i] in value)) {
			isValid = false;
			break;
		}
	}

	return isValid;
}