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
			this.updateIngredient(ingredient);
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

// TODO think through if we should pass an optional flag for removing ingredientLine
// i'm thinking about instances like "For Serving:" that need to get stripped out of the recipe data
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

exports.updateIngredient = (updatedIng) => {
	let ing = null;

	if (!updatedIng) {
		throw new Error('No ingredient to update');
	}

	// check to see if this ingredient exists
	let existing = null;
	if (updatedIng.hasOwnProperty('ingredientID')) {
		existing = this.findIngredients('ingredientID', updatedIng.ingredientID);
	}

	// if we didn't find any matches on the id
	if (!existing || existing.length === 0) {
		// look it up by name
		existing = this.findIngredients('exact', updatedIng.name);

		if (existing.length === 0) {
			// if still no dice, then set it up as a new ingredient
			ing = new Ingredient(updatedIng);
		}
	}

	existing = (existing.length === 1) ? existing[1] : null;

	if (!existing) {
		throw new Error('Found multiple matches on this ingredient');
	}

	// TODO...
};