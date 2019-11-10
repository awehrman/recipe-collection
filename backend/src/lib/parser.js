import Parser from './ingredientLineParser';

const cheerio = require('cheerio');

// TODO clean the cheerio version of this up
export const parseIngredientLine = (line) => {
	const ingredientLine = {
		...line,
		isParsed: false,
		reference: line.reference.trim(),
	};
	let parsed;

	// try to parse the ingredient line into parts
	try {
		// lineIndex: "~1 heaping cup (100 g) freshly-cut apples, washed"
		/* should result in an object that looks like:
			/* should result in an object that looks like:
			{
				"rule": "#1_ingredientLine",
				"type": "line",
				"values": [
						{
							"rule": "#1_ingredientLine >> #2_quantities >> #2_quantityExpression
							>> #3_amounts >> #2_amountExpression >> #2_amount",
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
		parsed = Parser.parse(ingredientLine.reference);
		ingredientLine.isParsed = true;
		ingredientLine.rule = parsed.rule;
		ingredientLine.parsed = parsed.values.map((v) => ({ ...v }));
	} catch (err) {
		console.log(`failed to parse lineIndex: ${ ingredientLine.reference }`.red);
		// TODO log failures to db
	}

	return ingredientLine;
};

export const parseHTML = (content) => {
	let blocks = [];
	let lines = [];
	let ingredients = [];
	const instructions = [];

	// we'll use cheerio to help translate our content string into a traversable DOM structure
	const $ = cheerio.load(content);

	const body = $('body').children();
	const { children } = body[0];

	// TODO this needs to be re-attended to; and any spans encountered need to be skipped

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
			    <div>some text</div>			// ingredient* (blockIndex: 0, lineIndex: 0)
			    <div>											// *make an exception for first line
			        <br />
			    </div>
			    <div>some text</div>			// ingredient* (blockIndex: 1, lineIndex: 0)
			    <div>some text</div>			// ingredient* (blockIndex: 1, lineIndex: 1)
			    <div>some text</div>			// ingredient* (blockIndex: 1, lineIndex: 2)
			    <div>some text</div>			// ingredient* (blockIndex: 1, lineIndex: 3)
			    <div>
			        <br />
			    </div>
			    <div>some text</div>			// ingredient* (blockIndex: 2, lineIndex: 0)
			    <div>some text</div>			// ingredient* (blockIndex: 2, lineIndex: 1)
			    <div>
			        <br />
			    </div>
			    <div>some text</div>			// instruction (blockIndex: 3, lineIndex: 0)
			    <div>
			        <br />
			    </div>
			    <div>some text</div>			// instruction (blockIndex: 4, lineIndex: 0)
			</en-note>
   *
   */

		// go through the children of our root level div to look for new lines or actual text
	// we may go one level deeper to look for these instances to handle some inconsistent HTML formatting on these notes
	let currentBlock = [];

	// TODO watch out for spans; flag or skip these
	children.forEach((div) => {
		const numChildren = (div.children && div.children.length) ? div.children.length : 0;
		const firstChild = (numChildren > 0) ? div.children[0] : null;

		if (numChildren > 1) {
			console.log(`${ JSON.stringify(div, null, 2) }`.red);
			// TODO throw an error or log elsewhere
		}

		const hasContent = Boolean(firstChild.data);

		if (!hasContent && (currentBlock.length > 0)) {
			blocks.push(currentBlock);
			currentBlock = [];
		} else if (firstChild.data && (firstChild.data.length > 0)) {
			currentBlock.push(firstChild.data);
		}
	});


	blocks.forEach((block, blockIndex) => {
		// add ingredient lines if its the first line, or if we have multiple lines per block
		if ((blockIndex === 0) || (block.length > 1)) {
			block.forEach((line, lineIndex) => {
				ingredients.push({
					blockIndex,
					lineIndex,
					reference: line,
				});
			});
		} else if (block.length === 1) {
			// add ingredient lines if our block only has a single line
			instructions.push({
				blockIndex,
				reference: block[0],
			});
		}
	});

	// this occurs if we have a single line, useful mostly for testing
	if ((blocks.length === 0) && (currentBlock.length > 0)) {
		currentBlock.forEach((line, lineIndex) => {
			ingredients.push({
				blockIndex: 0,
				lineIndex,
				reference: line,
			});
		});
	}

	// if we still have leftovers in the current block and blocks is populated, then its a leftover instruction
	if ((blocks.length > 0) && (currentBlock.length > 0)) {
		currentBlock.forEach((line) => {
			instructions.push({
				blockIndex: blocks.length,
				reference: line,
			});
		});
	}

/*
	children.forEach((rootEl) => {
		if (rootEl.children) {
			rootEl.children.forEach((childEl) => {
				// console.log({ name: childEl.name, type: childEl.type, data: childEl.data });
				// if we found a new line, create a new block
				if (childEl.name === 'br') {
					blocks = [];
					lines.push(blocks);
				} else if (childEl.data && childEl.data.trim().length > 0) {
					// if we found actual text, then add it to our current block
					blocks.push(childEl.data.replace(/\s+/g, ' ').trim());
				} else if (childEl.children) {
					// if we found more children, then we'll have to dip a bit deeper
					// TODO we could probably make this recursive, but in reality these notes don't get that complicated so eh...
					childEl.children.forEach((grandChildEl) => {
						// console.log({ name: grandChildEl.name, type: grandChildEl.type, data: grandChildEl.data });
						// if we found a new line, create a new block
						if (grandChildEl.name === 'br') {
							blocks = [];
							lines.push(blocks);
						} else if (grandChildEl.data && grandChildEl.data.trim().length > 0) {
							// if we found actual text, then add it to our current block
							blocks.push(grandChildEl.data.replace(/\s+/g, ' ').trim());
						}
					});
				}
			});
		}
	});

	// go through lines and strip out any empty arrays
	lines = lines.filter((line) => line.length > 0);

	// we'll expect "lines" to end up with an array of arrays looking something like:
	// [ [text], [text, text, text], [text, text, text], [text], [text, text, text], [text], [text] ]

	// that we'll end up interpreting (based on our above assumptions) when we parse as:
	// [ [ing*], [ing, ing, ing], [ing, ing, ing], [instr], [ing, ing, ing], [instr], [instr] ]

	// eslint-disable-next-line
	for (const line in lines) {
		const block = lines[line];

		// we'll always assume the first line is an ingredient regardless of block length
		if (parseInt(line, 10) === 0) {
			let blockIndex = 0;
			// eslint-disable-next-line
			for (const i in block) {
				ingredients.push({
					blockIndex: parseInt(line, 10),
					lineIndex: blockIndex,
					reference: block[i],
					isParsed: false,
				});
				blockIndex += 1;
			}
		} else if (block.length === 1) {
			// if there's only a single line in our block, we'll assume its an instruction
			instructions.push({
				blockIndex: parseInt(line, 10),
				reference: block[0],
			});
		} else {
			// otherwise if we have multiple lines in our block, we'll assume its an ingredient
			let blockIndex = 0;
			// eslint-disable-next-line
			for (const i in block) {
				ingredients.push({
					blockIndex: parseInt(line, 10),
					lineIndex: blockIndex,
					reference: block[i],
					isParsed: false,
				});
				blockIndex += 1;
			}
		}
	}
	*/

	// parse each ingredient line into its individual components
	ingredients = ingredients.map((line) => parseIngredientLine(line));


	return {
		ingredients,
		instructions,
	};
};

export default {
	parseHTML,
	parseIngredientLine,
};
