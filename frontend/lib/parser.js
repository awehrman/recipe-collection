import Parser from '../../backend/src/util/ingredientLineParser';

export const parseIngredientLine = (line) => {
	const ingredientLine = {
		...line,
		isParsed: false,
		reference: line.reference.trim(),
	};
	let parsed;

	// try to parse the ingredient line into parts
	try {
		// line: "~1 heaping cup (100 g) freshly-cut apples, washed"
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
		console.log(`failed to parse line: ${ ingredientLine.reference }`);
		// TODO log failures to db
	}

	return ingredientLine;
};

export const parseHTML = (content) => {
	const blocks = [];
	const ingredients = [];
	const instructions = [];

	const dom = new DOMParser().parseFromString([ content ], 'text/html');
	let children = (dom.body.children && (dom.body.children.length > 0))
		? [ ...dom.body.children ]
		: [ ...new DOMParser().parseFromString(`<div>${ dom.body.innerText }</div>`, 'text/html').body.children ];
	if (children[0].tagName === 'EN-NOTE') {
		children = [ ...children[0].children ];
	}
	// go through the children of our root level div to look for new lines or actual text
	// we may go one level deeper to look for these instances to handle some inconsistent HTML formatting on these notes
	let currentBlock = [];

	children.forEach((div) => {
		const hasContent = (div.innerText.length > 0) ? 1 : 0;
		if (!hasContent && (currentBlock.length > 0)) {
			blocks.push(currentBlock);
			currentBlock = [];
		} else if (div.innerText.length > 0) {
			currentBlock.push(div.innerText);
		}
	});

	/* blocks should look like this, where after the first instance, each array with length of 1 is an instruction
		[
			["12 pork cheeks"],
			["1 onion, chopped","4 cloves"],
			["4 pak choi","100 ml of sesame oil","sesame seeds, toasted"],
			["To begin, ..."],
			["Reduce the heat ..."]
		]
	*/

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

	const ingredientLines = ingredients.map((line) => parseIngredientLine(line));

	return [ ingredientLines, instructions ];
};

export default {
	parseHTML,
	parseIngredientLine,
};
