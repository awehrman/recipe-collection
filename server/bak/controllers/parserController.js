const cheerio = require('cheerio');
const colors = require('colors');
const fs = require('fs');
const pluralize = require('pluralize');

const ingredientController = require('./ingredientController');
const Ingredient = require('./../models/ingredientModel');
const Parser = require('../lib/ingredientLineParser');

exports.parseNoteContent = (content, recipeID) => {
	let ingredientLines, instructions = [];

	// tease out the ingredient lines vs the instructions from the note content
	if (content) {
		[ ingredientLines, instructions ] = parseHTML(content);
	}

	// parse each ingredient line into its individual components
	ingredientLines = ingredientLines.map(line => parseIngredientLine(line, recipeID));

	return { ingredientLines, instructions };
};

parseHTML = (content) => {
	let blocks = [];
	let lines = [];
	let ingredients = [];
	let instructions = [];

	// we'll use cheerio to help translate our content string into a traversable DOM structure
	$ = cheerio.load(content);
  const body = $('body').children();

  // we're going to run with some basic assumptions on how recipe data
  // is formatted to differentiate between ingredient lines and instructions

  // ingredient lines are grouped together in blocks, but
  // we'll make an exception if the first line is by itself

  // instructions are surrounded by <div><br/ ></div>

  // so sample content might look like:

  /**
    <!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">
			<en-note>
			    <div>
			    		// below is our single recipe image
			        <en-media hash="1dd640eacebd80e0bbb2b643daeab8c5" type="image/png" />
			        <br />
			    </div>
			    <div>
			        <br />
			    </div>
			    <div>some text</div>			// ingredient* (block: 0, line: 0)
			    <div>											// *make an exception for first line
			        <br />
			    </div>
			    <div>some text</div>			// ingredient* (block: 1, line: 0)
			    <div>some text</div>			// ingredient* (block: 1, line: 1)
			    <div>some text</div>			// ingredient* (block: 1, line: 2)
			    <div>some text</div>			// ingredient* (block: 1, line: 3)
			    <div>
			        <br />
			    </div>
			    <div>some text</div>			// ingredient* (block: 2, line: 0)
			    <div>some text</div>			// ingredient* (block: 2, line: 1)
			    <div>
			        <br />
			    </div>
			    <div>some text</div>			// instruction (block: 3, line: 0)
			    <div>
			        <br />
			    </div>
			    <div>some text</div>			// instruction (block: 4, line: 0)
			</en-note>
   *
   */
  

  // go through the children of our root level divs to look for new lines or actual text
  // we may go one level deeper to look for these instances to handle some inconsistent HTML formatting on these notes

	body[0].children.forEach(rootEl => {
  	if (rootEl.children) {
  		rootEl.children.forEach(childEl => {
				// if we found a new line, create a new block
				if (childEl.name === 'br') {
					blocks = [];
					lines.push(blocks);
				}
				// if we found actual text, then add it to our current block
				else if (childEl.data && childEl.data.trim().length > 0) {
					blocks.push(childEl.data.replace(/\s+/g,' ').trim());
				} else {
					// if we found more children, then we'll have to dip a bit deeper
					// TODO we could probably make this recursive, but in reality these notes don't get that complicated so eh...
					if (childEl.children) {
						childEl.children.forEach(grandChildEl => {
							// if we found a new line, create a new block
							if (grandChildEl.name === 'br') {
								blocks = [];
								lines.push(blocks);
							}
							// if we found actual text, then add it to our current block
							else if (grandChildEl.data && grandChildEl.data.trim().length > 0) {
								blocks.push(grandChildEl.data.replace(/\s+/g,' ').trim());
							}
						});
					}
				}
  		});
  	}
  });

  // go through lines and strip out any empty arrays
	lines = lines.filter(line => line.length > 0);

  // we'll expect "lines" to end up with an array of arrays looking something like:
 	// [ [text], [text, text, text], [text, text, text], [text], [text, text, text], [text], [text] ]

 	// that we'll end up interpreting (based on our above assumptions) when we parse as:
 	// [ [ing*], [ing, ing, ing], [ing, ing, ing], [instr], [ing, ing, ing], [instr], [instr] ]

 	for (let line in lines) {
  	const block = lines[line];

  	// we'll always assume the first line is an ingredient regardless of block length
  	if (parseInt(line, 10) === 0) {
  		let blockIndex = 0;
  		for (let i in block) {
  			ingredients.push({
  				block: parseInt(line, 10),
  				line: blockIndex,
  				reference: block[i],
  				isParsed: false
  			});
  			blockIndex++;
  		}
  	}
  	// if there's only a single line in our block, we'll assume its an instruction
  	else if (block.length === 1) {
  		instructions.push({
  			block: parseInt(line, 10),
  			line: 0,
  			reference: block[0]
  		});
  	}
  	// otherwise if we have multiple lines in our block, we'll assume its an ingredient
  	else {
  		let blockIndex = 0;
  		for (let i in block) {
  			ingredients.push({
  				block: parseInt(line, 10),
  				line: blockIndex,
  				reference: block[i],
  				isParsed: false
  			});
  			blockIndex++;
  		}
  	}
  }

	return [ ingredients, instructions ];
};

lookupIngredient = (recipeID, name, ref) => {
	//console.log('lookupIngredient'.yellow);
	let plural = null;

	// TODO there's got to be a better place to do this
	pluralize.addUncountableRule('molasses');

  // determine if this parsed as a singular or plural value
  if (pluralize.singular(name) !== name) {
  	plural = name;
  	name = pluralize.singular(name);
  }

  // check if this is an existing ingredient
  let existing = ingredientController.findIngredients('exact', name);

  // if we didn't find this under the adjusted singular value, try looking it up by the original plural value
  if (plural && existing && existing.length === 0) {
  	existing = ingredientController.findIngredients('exact', plural);
  }

	return updateIngredientReferences(recipeID, existing, name, ref, plural);
};

updateIngredientReferences = (recipeID, existing, name, ref, plural) => {
	//console.log('updateIngredientReferences'.yellow);
	// if we found a match, update this ingredient's references
  if (existing && existing.length === 1) {
  	console.log(`updating: ${existing[0].name}`.cyan);
  	existing = existing[0];

  	// update reference
  	existing.addReference(ref, recipeID);
  	existing.saveIngredient();

  	return existing.encodeIngredient();
  	//console.log(existing.getIngredient());
	} else if (existing && existing.length === 0) {
		console.log(`creating: ${name}`.green);
		// if this is a new ingredient, then add it
		const newIng = new Ingredient(name);
		newIng.plural = plural ? plural : null;
		newIng.addReference(ref, recipeID);
		newIng.saveIngredient();
		//console.log(newIng.getIngredient());

		return newIng.encodeIngredient();
	} else {
		// if we found multiple matches, then something's gone horribly awry!
		throw new Error(`Multiple matches found for ingredient "${name}"`);
	}
};

parseIngredientLine = (line, recipeID) => {
	let parsedIng, ingredients;

	try {
		parsed = Parser.parse(line.reference);

		// line: "~1 heaping cup (100 g) freshly-cut apples, washed"
		/* should result in an object that looks like:
			/* should result in an object that looks like:
			{
			   "rule": "#1_ingredientLine",
			   "type": "line",
			   "values": [
						{
							"rule": "#1_ingredientLine >> #2_quantities >> #2_quantityExpression >> #3_amounts >> #2_amountExpression >> #2_amount",
							"type": "amount",
			   			"value": "1"
						},
			      {
			         "rule": "#1_ingredientLine >> #3_ingredients >> #1_ingredientExpression >> #2_ingredient",
			         "type": "ingredient",
			         "value": "apples"
			      }
			   ]
			}
		*/

		line.isParsed = true;

		line.values = parsed.values.map((v, index) => {
			if (v.type === 'ingredient') {
				//console.log('INGREDIENT'.magenta);
				try {
					let ing = lookupIngredient(recipeID, v.value, line.reference);
					v.ingredientID = ing.ingredientID;
					v.name = ing.name;
					v.properties = ing.properties; // TODO look at
					v.isValidated = ing.isValidated;
				} catch (err) {
					console.log(`${err}`.red);
				}
		  }

	    return v;
		});



	} catch (err) {
		console.log(`failed to parse: ${line.reference}`.red);

		let ingredient = new Ingredient(line.reference);
		ingredient.addReference(line.reference, recipeID);
		ingredientController.saveError({ associations: [], type: 'parsing' }, ingredient.encodeIngredient());
	}

	return line;
};