import cheerio from 'cheerio';
import Parser from './ingredientLineParser';

/*
	we're going to run with some basic assumptions on how recipe data is formatted
	to differentiate between ingredient lines and instructions

		- ingredient lines are grouped together in blocks, but we'll make an exception
			if the first line is by itself

		- instructions are surrounded by <div><br/ ></div>

	so sample content might look like:

	<!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">
	<en-note>
			<div>
					<!-- below is our single recipe image -->
					<en-media hash="1dd640eacebd80e0bbb2b643daeab8c5" type="image/png" />
					<br />
			</div>
			<div>
					<br />
			</div>
			<div>some text</div>			<!-- ingredient (blockIndex: 0, lineIndex: 0) -->
			<div>											<!-- assume the first line is always an ingredient -->
					<br />
			</div>
			<div>some text</div>			<!-- ingredient (blockIndex: 1, lineIndex: 0) -->
			<div>some text</div>			<!-- ingredient (blockIndex: 1, lineIndex: 1) -->
			<div>some text</div>			<!-- ingredient (blockIndex: 1, lineIndex: 2) -->
			<div>some text</div>			<!-- ingredient (blockIndex: 1, lineIndex: 3) -->
			<div>
					<br />
			</div>
			<div>some text</div>			<!-- ingredient (blockIndex: 2, lineIndex: 0) -->
			<div>some text</div>			<!-- ingredient (blockIndex: 2, lineIndex: 1) -->
			<div>
					<br />
			</div>
			<div>some text</div>			<!-- instruction (blockIndex: 3, lineIndex: 0) -->
			<div>
					<br />
			</div>
			<div>some text</div>			<!-- instruction (blockIndex: 4, lineIndex: 0) -->
	</en-note>
 */
export const parseHTML = (content) => {
	const ingredients = [];
	const instructions = [];

	// load our string dom content into a cheerio object
	// this will allow us to easily traverse the DOM tree
	const $ = cheerio.load(content);

	const note = $('body').children();
	console.log(' 0 0 0 0 0 0 0 0 0 0 '.magenta);
	const { children } = note;
	console.log({ children });

	let currentBlock = [];
	const blocks = [];


	// TODO watch out for spans; flag or skip these
	children.forEach((div) => {
		const numChildren = (div.children && div.children.length) ? div.children.length : 0;
		let textNode = (numChildren > 0) ? div.children[0] : null;
		if (numChildren > 1) {
			console.log('check number of children here!'.red);
			// console.log({ numChildren, child: div.children });
			textNode = div.children.find((c) => c.type === 'text');
		}
		const data = textNode.data && textNode.data.trim();
		const hasContent = Boolean(data);

		if (!hasContent && (currentBlock.length > 0)) {
			blocks.push(currentBlock);
			currentBlock = [];
		} else if (data && (data.length > 0)) {
			currentBlock.push(data);
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

	console.log(ingredients);
	// parse each ingredient line into its individual components
	ingredients = ingredients.map((line) => parseIngredientLine(line));


	return {
		ingredients,
		instructions,
	};
};

/* "~1 heaping cup (100 g) freshly-cut apples, washed"
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
export const parseIngredientLine = (line) => {
	const ingredientLine = {
		...line,
		isParsed: false,
		reference: line.reference.trim(),
	};
	let parsed;

	try {
		parsed = Parser.parse(ingredientLine.reference);
		ingredientLine.isParsed = true;
		ingredientLine.rule = parsed.rule;
		ingredientLine.parsed = parsed.values.map((v) => ({ ...v }));
	} catch (err) {
		console.log(`failed to parse lineIndex: ${ ingredientLine.reference }`.red);
		console.log(line);
		// TODO log failures to db
	}

	return ingredientLine;
};

export default {
	parseHTML,
	parseIngredientLine,
};
