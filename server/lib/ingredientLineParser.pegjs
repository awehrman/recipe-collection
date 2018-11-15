// compile me in the cmd prompt:
// pegjs -O speed lib/ingredientLineParser.pegjs

// for codepen repo:
// pegjs --format globals -e Parser -O size ingredientLineParser.pegjs

// for running in cli
// node --require ./lib/ingredientLineParser
//> var Parser = require('./lib/ingredientLineParser');

/* format keyword lists
  // sort the list by length, then alphabetically
	list.sort(function(a, b) { return b.length - a.length || b.localeCompare(a) });

	// replace any spaces with a white space with optional dashes (lowercase)
	// $("dry"i _* dashes* "rub"i)
	// lowercase and add i to singular strings

	list = list.map(l => {
		let arr = l.split(' ');

		if (arr.length > 1) {
			// handle spaces
			let str = '';
			arr.forEach((a, i) => {
				if ((i + 1) === arr.length) {
					str += `'${a.toLowerCase()}'i`;
				} else {
					str += `'${a.toLowerCase()}'i _* dashes* _*`;
				}
			});

			return `$(${str}) /`;

		} else {
			// handle singular
			return `'${l.toLowerCase()}'i /`;
		}
	});

	copy(list);
*/

{
	/*----------  Formatting Functions  ----------*/

	// values is the array of objects that we're returning to the expression
	// components are the matches for the particular rule feed in
	function formatExpressionValues(values = [], components = [], rules = "") {
		if (components) {
			values = values.concat(components.map(c => {
				let rule, type, value;

				rule = (c.rule || "");
				if (rules !== "" && rule) {
					rule = `${rules} >> ${rule}`;
				} else if (rules !== "") {
					rule = rules;
				}

				type = c.type || "";

				value = c.value || c;
				value = (typeof value === 'string') ? value.toLowerCase() : null;

				return {
					rule,
					type,
					value
				};
			}));
		}

		return values;
	}

	// try exceptions only
	// or we do need to split up the smaller filler vs descriptions
	const DESCRIPTORS = ['~', 'a', 'about', 'accompaniment', 'accumulated', 'acidulated', 'acting', 'action', 'activated', 'active', 'actually', 'add', 'added', 'additional', 'additive', 'adjust', 'adjusted', 'aged', 'air', 'alcohol', 'all', 'almost', 'aluminium', 'aluminum free', 'always', 'an', 'another', 'any', 'approx', 'approx.', 'approximately', 'aromatic', 'around', 'arranged', 'artisan', 'artisanal', 'as', 'assorted', 'assortment', 'at', 'authentic', 'available', 'average', 'baby', 'baked', 'baking', 'barely', 'barrel', 'baseball size', 'based', 'basic', 'basted', 'beaten', 'beautiful', 'before', 'berry forward', 'best', 'bi', 'big', 'bigger', 'bite', 'bitter', 'bitter sweet', 'blanched', 'bland', 'bleached', 'blended', 'blind', 'bloomed', 'bodied', 'boil', 'boiled', 'boiling', 'bone in', 'bone out', 'boned', 'boneless', 'bottled', 'bought', 'boxed', 'braised', 'brewed', 'bright', 'brimming', 'broad', 'broiled', 'broken', 'browned', 'bruised', 'brush', 'brushed', 'bulk', 'bunched', 'burger size', 'burning', 'burnt', 'bushy', 'but', 'butcher', 'buttered', 'butterflied', 'buttery', 'cage', 'caged', 'canned', 'carb', 'carved', 'casing', 'caught', 'cave', 'center', 'centre', 'certified', 'chalky', 'char', 'charred', 'cheap', 'checked', 'cheesy', 'chewy', 'chilled', 'choice', 'chopped', 'chrunchy', 'chubby', 'chunked', 'chunky', 'circular', 'citrusy', 'classic', 'clean', 'cleaned', 'clear', 'coarse', 'coarsely', 'coarsley', 'coated', 'cold', 'color', 'colored', 'colorful', 'colour', 'coloured', 'combination', 'commercial', 'completely', 'concentrated', 'condensed', 'congealed', 'cook', 'cooked', 'cooking', 'cool', 'cooled', 'cored', 'corn fed', 'country', 'course', 'covered', 'cracked', 'creamy', 'crisp', 'crisped', 'crisply', 'crispy', 'cross', 'crumbled', 'crumbly', 'crumpled', 'crunched', 'crunchy', 'crushed', 'crust', 'crustless', 'crusty', 'cubed', 'culinary', 'cultured', 'cured', 'curly', 'cut', 'cylindar', 'cylindrical', 'dairy', 'dark', 'darker', 'day', 'de stemmed', 'de veined', 'deactivated', 'deboned', 'decent', 'decorated', 'decorative', 'deep', 'defrosted', 'delicate', 'denuded', 'deseeded', 'desiccated', 'desired', 'dessicated', 'diagonally', 'diastatic', 'dice', 'diced', 'different', 'diluted', 'disc shaped', 'discarded', 'dish', 'dissolved', 'distilled', 'divided', 'diy', 'double', 'drained', 'dressed', 'dried', 'dry', 'dull', 'dusting', 'dutch', 'dyed', 'e.g.', 'ea', 'each', 'earthy', 'easy', 'eating', 'edible', 'eg', 'either', 'elongated', 'empty', 'english', 'enough', 'enriched', 'equal', 'equivalent', 'european', 'exactly', 'excellent', 'exotic', 'extra', 'extracted', 'extremely', 'fair', 'fairly', 'fancy', 'farmed', 'fashioned', 'fast', 'fat', 'fattier', 'fattiest', 'fatty', 'favorite', 'favourite', 'fed', 'fermented', 'few', 'fiery', 'filtered', 'fine', 'finely', 'finest', 'finishing', 'fire', 'firm', 'firmly', 'fishy', 'fizzy', 'flaked', 'flakey', 'flaky', 'flat', 'flat leaf', 'flattened', 'flavored', 'flavorful', 'flavorless', 'flavoured', 'flavourful', 'flavourless', 'fleshed', 'fleshy', 'floral', 'floury', 'fluffy', 'folded', 'food', 'for', 'forced', 'formed', 'fragrant', 'free', 'freeze', 'freezer', 'frenched', 'fresh', 'freshly', 'fried', 'from', 'frosted', 'frosty', 'frozen', 'fruity', 'frying', 'full', 'full cream', 'fully', 'garlicky', 'garnish', 'garnished', 'garnishes', 'gelatinous', 'generally', 'generous', 'generously', 'giant', 'glazed', 'gluten', 'GMO', 'good', 'gourmet', 'grade', 'grade a', 'grade b', 'grain', 'grained', 'grainy', 'grandma', 'granulated', 'grass', 'grated', 'greasy', 'grilled', 'grind', 'gritty', 'ground', 'grounded', 'halved', 'hand', 'hard', 'hardy', 'head on', 'headless', 'healthy', 'heaped', 'heaping', 'hearty', 'heat', 'heated', 'heavy', 'hefty', 'heirloom', 'heritage', 'high', 'high protein', 'highest', 'home', 'hong kong', 'hot', 'house', 'hulled', 'husked', 'hydrated', 'hydrogenated', 'i', 'i.e.', 'ice', 'iced', 'icy', 'ideally', 'ie', 'if', 'imitation', 'immediately', 'imported', 'in', 'individual', 'inner', 'inserted', 'instant', 'instantly', 'into', 'iodized', 'ish', 'jammy', 'jarred', 'juiced', 'juicy', 'julienne', 'julienned', 'jumbo', 'just', 'kind', 'king arthur', 'knead', 'kneaded', 'la style', 'large', 'largely', 'larger', 'leafy', 'lean', 'leaner', 'leanest', 'least', 'leave', 'leaved', 'leavened', 'left', 'lengthwise', 'less', 'level', 'lg', 'liberal', 'lighter', 'lightly', 'like', 'liposoluble', 'liquid', 'little', 'live', 'living', 'local', 'long', 'loose', 'loose leaf', 'loosely', 'low', 'low protein', 'low salt', 'low starch', 'lower', 'lower salt', 'luke', 'lump', 'macerated', 'made', 'many', 'marbled', 'marinated', 'mashed', 'massel', 'mature', 'matured', 'md', 'mealy', 'meat', 'meaty', 'med', 'medium', 'mellow', 'melted', 'melting', 'micro', 'mid', 'middle size', 'mild', 'mildly', 'milky', 'milled', 'mince', 'minced', 'mini', 'miniature', 'minty', 'minus', 'mix', 'mixed', 'mixture', 'moist', 'moisture', 'moon', 'moons', 'more', 'most', 'msc', 'much', 'multi', 'mushy', 'my', 'narrow', 'native', 'natural', 'naturally', 'navy', 'necessary', 'needed', 'neutral', 'neutrally', 'new', 'nice', 'nitrate', 'nixtamalized', 'no', 'no salt', 'non', 'non stick', 'normal', 'not', 'note', 'nutty', 'of', 'off', 'off the bone', 'oil packed', 'oiled', 'oily', 'old', 'on', 'on the cob', 'opened', 'optional', 'or so', 'ordinary', 'organic', 'original', 'other', 'out', 'outer', 'oven', 'over', 'packaged', 'packed', 'pan', 'paper', 'par', 'pared', 'part', 'pasteurized', 'pasture', 'pastured', 'patted', 'peated', 'peeled', 'pencil', 'peppery', 'per', 'perfect', 'perfectly', 'person', 'pesticide', 'petite', 'picked', 'pickled', 'pin boned', 'pith', 'pitted', 'placed', 'plain', 'planed', 'plant', 'plenty', 'plump', 'plus', 'poached', 'podded', 'point', 'postcard', 'pounded', 'poured', 'powdery', 'powedered', 'pre', 'preferably', 'preferred', 'premium', 'prepared', 'preservative', 'press', 'pressed', 'previously', 'pricked', 'process', 'processed', 'proof', 'proofed', 'pulled', 'pulsed', 'pulverized', 'purchased', 'pure', 'pureed', 'pureéd', 'puréed', 'purified', 'quality', 'quarter size', 'quarter sized', 'quartered', 'quick', 'raised', 'range', 'rapid', 'rare', 'raw', 'reactivated', 'ready', 'ready to cook', 'ready to eat', 'real', 'really', 'recommended', 'reconstituted', 'rectangular', 'reduced', 'reduced salt', 'refined', 'refried', 'refrigerated', 'regular', 'rehydrated', 'relatively', 'removed', 'rendered', 'required', 'reserve', 'reserved', 'resized', 'responsibly', 'ribboned', 'riced', 'rich', 'ridged', 'rindless', 'rinsed', 'ripe', 'ripen', 'ripened', 'ripest', 'ripped', 'rise', 'rising', 'roasted', 'robust', 'rolled', 'room', 'rough', 'roughly', 'rounded', 'rubbed', 'runny', 'rustic', 'salt free', 'salt reduced', 'salted', 'salty', 'sandwich', 'sashimi grade', 'sauted', 'sauteed', 'sautéed', 'savoury', 'scaled', 'scant', 'scattered', 'scooped', 'scored', 'scrambled', 'scraped', 'scrapped', 'scrubbed', 'seared', 'season', 'seasonal', 'seasoned', 'see', 'seeded', 'seedless', 'segmented', 'semi', 'separated', 'serve', 'served', 'shaken', 'shallow', 'shape', 'shaped', 'sharp', 'shaved', 'shell', 'shelled', 'shop', 'short', 'shredded', 'shucked', 'side', 'sieved', 'sifted', 'silver', 'similar', 'simmered', 'simple', 'size', 'sized', 'sizzling', 'skim', 'skimmed', 'skin', 'skinless', 'skinned', 'skinny', 'skinon', 'slender', 'sliced', 'slightly', 'slit', 'slivered', 'slow', 'sm', 'small', 'smaller', 'smallest', 'smallish', 'smashed', 'smeared', 'smoke', 'smoked', 'smokehouse', 'smoking', 'smoky', 'smooth', 'smoothed', 'snipped', 'so', 'soaked', 'sodium', 'soft', 'softened', 'softly', 'solid', 'solidified', 'soluble', 'sometimes', 'sour', 'sourced', 'soured', 'special', 'spelled', 'spicy', 'spiral', 'spiralised', 'spiralized', 'split', 'spongy', 'sprayed', 'sprinkled', 'squeezed', 'stacked', 'stale', 'standard', 'steamed', 'steeped', 'stem on', 'stemmed', 'stewed', 'sticky', 'stiff', 'still', 'stir', 'stirred', 'stone', 'stoned', 'store', 'strained', 'streaky', 'strength', 'stripped', 'strong', 'strongly', 'sturdy', 'style', 'such', 'suitable', 'sulfured', 'sunny', 'super', 'sushi grade', 'sustainable', 'sustainably', 'sweet', 'sweetened', 'syrupy', 'tangy', 'tart', 'taste', 'tasted', 'tasting', 'tasty', 'temp', 'temperature', 'tempered', 'tender', 'tender stem', 'tepid', 'tex mex', 'texas', 'than', 'that', 'thawed', 'the', 'their', 'then', 'thick', 'thickened', 'thickly', 'thickness', 'thin', 'thinly', 'thoroughly', 'thumb', 'tied', 'tightly', 'tinned', 'tiny', 'titanium', 'to', 'to cook', 'to eat', 'toasted', 'tolerant', 'too', 'top', 'topped', 'topping', 'torn', 'tossed', 'total', 'tough', 'trade', 'traditional', 'traditionally', 'treated', 'tri colored', 'trimmed', 'trussed', 'turned', 'type', 'ugly', 'unbaked', 'unbleached', 'uncooked', 'under', 'undiluted', 'undrained', 'unflavored', 'unflavoured', 'unpeeled', 'unrefined', 'unripe', 'unroasted', 'unsalted', 'unseasoned', 'unskinned', 'unsweet', 'unsweetened', 'unwaxed', 'up', 'us', 'use', 'used', 'using', 'vacuum', 'variety', 'vegan', 'vegetarian', 'veined', 'very', 'vine', 'vinegary', 'vintage', 'virgin', 'wafer', 'walnut size', 'waltnut sized', 'warm', 'warmed', 'washed', 'watery', 'waxed', 'waxy', 'weak', 'well', 'wet', 'whacked', 'whatever', 'whisked', 'whole', 'wholemeal', 'wide', 'wild', 'wilted', 'wiped', 'with', 'without', 'worth', 'x large', 'XL', 'xlarge', 'you', 'young', 'young leaf', 'your', 'zested', 'zesty'];

  // this our hack around the lack of backtracking in PEG
	// this is particularly a problem for ingredient identification when complex descriptors expressions match and leave a trailing space
  function lookupDescriptor(value) {
  	// split this on spaces, dashes, slashes, [&+] and check each instance
  	if (value.indexOf(' ') > -1) {
  		value = value.split(' ');
  	}

  	if (Array.isArray(value)) {
  		value = value.map(v => {
  			if (v.indexOf('/') > -1) {
		  		return v.split('/');
		  	}

		  	if (v.indexOf('-') > -1) {
		  		return v.split('-');
		  	}

		  	if (v.indexOf('&') > -1) {
		  		return v.split('&');
		  	}

		  	if (v.indexOf('+') > -1) {
		  		return v.split('+');
		  	}

		  	return v;
  		});

  		value = [].concat(...value);

  		return value.filter(v => {
  			return DESCRIPTORS.indexOf(v.toLowerCase()) <= 0;
  		});
  	}

    return DESCRIPTORS.indexOf(value.toLowerCase());
  }
}

start =
	ingredientLine

// ! TODO - start with initial descriptor + colon
// ! TODO - ingredientLines (ingredientLine _+ wordSeparator _+ wordSeparator)
// our main assumption with ingredient lines is that they MUST have AT LEAST a single ingredient
// amounts, units, and whatever additional textual fluff is all optional
ingredientLine "Ingredient Line" =
	// 1 cup apple, grated
	qty:quantities?
	_*
	ing:ingredients
	com:comments?
		{
			const rule = "#1_ingredientLine";
			let values = [];

      if (qty && qty.values) {
				values = formatExpressionValues([], qty.values, rule);
			}

			values = formatExpressionValues(values, ing.values, rule);

			if (com) {
				values = formatExpressionValues(values, [ com ], rule);
			}

			values = values.filter(v => v.value);

			return {
				rule,
				type: 'line',
				values
			};
		}

	// sometimes the quantity / ingredients get a little fuzzy even with keywords
  // 1 tbsp 5-spice powder, freshly mixed
  // in this case, we'll use a negative predicate to return everything before our ingredientKeyword
  // and return this as a single quantity unit
  // this quantity unit could be further parsed (similarly comments could too)
  / qty:(c:(!ingredientKeyword .){ return c[1]; })*
    ing:ingredients
	  com:comments?
      {
				const rule = "#2_ingredientLine";
				let values = [];

				if (qty && qty.values) {
					values = formatExpressionValues([], [ { type: 'quantity', value: qty.join('') } ], rule);
				}

				values = formatExpressionValues(values, ing.values, rule);

				if (com) {
					values = formatExpressionValues(values, [ com ], rule);
				}

				values = values.filter(v => v.value);

				return {
					rule,
					type: 'line',
					values
				};
			}


/*==================================
=            Quantities            =
==================================*/

// 10g toasted belacan
// 10+ wonton wrappers
quantities "Quantities" =
	// ! keep an eye on that optional tail...
	// "[1 cup/][250 ml/][34 g ]"
	head:quantityExpression+ tail:quantity_*
		{
			const rule = "#1_quantities";

			let values = [];
			values = formatExpressionValues(values, [].concat(...head.map(v => v.values)), rule);
			values = formatExpressionValues(values, [].concat(...tail.map(v => v.values)), rule);

			return {
				rule,
				type: 'quantity',
				values
			};
		}

	// "ten"
	/ qty:quantity_+
		{
			const rule = "#2_quantities";

			let values = formatExpressionValues([], [].concat(...qty.map(v => v.values)), rule);

			return {
				rule,
				type: 'quantity',
				values
			};
		}

// "1 cup/"
// "250 ml / "
// "ten or "
quantityExpression "Quantity Expression" =
	// spaces around the symbol separator are optional
	qty:quantity ','? _* sep:symbolAmountSeparator _*
		{
			const rule = "#1_quantityExpression";

			let values = [];
			values = formatExpressionValues(values, qty.values, rule);
			values = formatExpressionValues(values, [ sep ], rule);

			return {
				rule,
				type: 'quantity',
				values
			};
		}


	// spaces around the word separator are required even here
	/ qty:quantity ','? _+ sep:wordAmountSeparator _+
		{
			const rule = "#1_quantityExpression";

			let values = [];
			values = formatExpressionValues(values, qty.values, rule);
			values = formatExpressionValues(values, [ sep ], rule);

			return {
				rule,
				type: 'quantity',
				values
			};
		}

// this is either an amount, unit or combination of an amount and unit
// NO SPACES are used at the end of this match
// this is ONLY to be used in long quantity expressions where additional quantities follow
// quantity_ needs to be used before any ingredient match as to not eat any initial matching characters
// 1 cup/ 250 ml water
quantity "Quantity" =
	// "(A) 1 (B) cup"
	c0:parentheticalComment*
	amount:amounts
  c1:parentheticalComment*
	_*
	unit:unitExpression
		{
			const rule = "#1_quantity";

			let values = [];
      values = formatExpressionValues(values, c0, rule);
      values = formatExpressionValues(values, amount.values, rule);
			values = formatExpressionValues(values, c1, rule);
      values = formatExpressionValues(values, unit.values, rule);

			return {
				rule,
				type: 'quantity',
				values
			};
		}

	// "(A) ten"
	/ c0:parentheticalComment*
  	amounts:amounts
			{
				const rule = "#2_quantity";

				let values = [];
	      values = formatExpressionValues(values, c0, rule);
				values = formatExpressionValues(values, amounts.values, rule);

				return {
					rule,
					type: 'quantity',
					values
				};
			}

	// "(A) inch"
	/ c0:parentheticalComment*
  	unit:unitExpression
			{
				const rule = "#3_quantity";

				let values = [];
	      values = formatExpressionValues(values, c0, rule);
				values = formatExpressionValues(values, unit.values, rule);

				return {
					rule,
					type: 'quantity',
					values
				};
			}

// this is to be used before any ingredient matches or at the end of a quantity expression
// 1 cup water
quantity_ "Quantity with Ending Space" =
	// "(A) 1 (B) cup "
	c0:parentheticalComment*
	amount:amounts
  c1:parentheticalComment*
	_*
	unit:units 							// units always requires an ending space!
		{
			const rule = "#1_quantityWithSpace";

			let values = [];
      values = formatExpressionValues(values, c0, rule);
      values = formatExpressionValues(values, amount.values, rule);
			values = formatExpressionValues(values, c1, rule);
      values = formatExpressionValues(values, unit.values, rule);

			return {
				rule,
				type: 'quantity',
				values
			};
		}

	// "(A) ten "
	/ c0:parentheticalComment*
  	amounts:amounts
  	_*	// !TODO - see if this is necessary or not
			{
				const rule = "#2_quantityWithSpace";

				let values = [];
	      values = formatExpressionValues(values, c0, rule);
				values = formatExpressionValues(values, amounts.values, rule);

				return {
					rule,
					type: 'quantity',
					values
				};
			}

	// "(A) inch "
	/ c0:parentheticalComment*
  	unit:units 							// units always requires an ending space!
			{
				const rule = "#3_quantityWithSpace";

				let values = [];
	      values = formatExpressionValues(values, c0, rule);
				values = formatExpressionValues(values, unit.values, rule);

				return {
					rule,
					type: 'quantity',
					values
				};
			}

/*=====  End of Quantities  ======*/

/*==================================
=            Base Rules            =
==================================*/

	_ "Whitespace" =
		[ \t\n\r\x20] { return ' '; }

	dashes "Dashes" =
		[-_~] { return '-'; }
		/ [‐‑‒–—] { return '-'; }

	slashes "Slashes" =
		[/\⁄|] { return '\/'; }

	quotes "Quotes" =
		["“”] { return '\"'; }
		/ ['`´‘’] { return '\''; }

	// consider how to generalize indicators without going overboard
	letter "Letter" =
		[a-z]i
		/ !'*' !digit !dashes !quotes !slashes !_ ![,.;:] !unicodeAmount !parenthesisIndicator !amountSeparator char:. { return char; }

	// ! TODO - add unicode alternatives
	// these are conjunctions used to separate rules
	separator "Separator" =
		wordSeparator
		/ symbolSeparator

	symbolSeparator "Symbol Separator" =
		'&'
			{
				return {
					rule: "#1_symbolSeparator",
					type: "separator",
					value: 'and'
				};
			}
		/ '+'
			{
				return {
					rule: "#2_symbolSeparator",
					type: "separator",
					value: 'plus'
				};
			}
		/ slashes
			{
				return {
					rule: "#3_symbolSeparator",
					type: "separator",
					value: 'or'
				};
			}

	wordSeparator "Word Separator" =
		sep:'and'i
			{
				return {
					rule: "#1_wordSeparator",
					type: "separator",
					value: sep.toLowerCase()
				};
			}
		/ sep:'or'i
			{
				return {
					rule: "#2_wordSeparator",
					type: "separator",
					value: sep.toLowerCase()
				};
			}
		/ $('and'i slashes 'or'i)
			{
				return {
					rule: "#3_wordSeparator",
					type: "separator",
					value: 'and/or'
				};
			}

	separatorExpression "Separator Expression" =
		_* sep:separator _*
		{
			return sep;
		}

	// valid separators to conjugate amounts
	amountSeparator "Amount Separator" =
		wordAmountSeparator
		/ symbolAmountSeparator

	wordAmountSeparator "Word Amount Separator" =
		"minus"i
			{
				return {
					rule: "#1_wordAmountSeparator",
					type: "separator",
					value: 'minus'
				};
			}
		/ "plus"i
			{
				return {
					rule: "#2_wordAmountSeparator",
					type: "separator",
					value: 'plus'
				};
			}
		/ "to"i
			{
				return {
					rule: "#3_wordAmountSeparator",
					type: "separator",
					value: 'to'
				};
			}
		/ sep:wordSeparator
			{
				return {
					rule: "#4_amountSeparator",
					type: "separator",
					value: sep.value
				};
			}

		/ sep:[xXx×]
			{
				return {
					rule: "#5_amountSeparator",
					type: "separator",
					value: 'x'
				};
			}

	symbolAmountSeparator "Symbol Amount Separator" =
		sep:symbolSeparator
			{
				return {
					rule: "#1_symbolAmountSeparator",
					type: "separator",
					value: sep.value
				};
			}

		/ sep:dashes
			{
				return {
					rule: "#2_symbolAmountSeparator",
					type: "separator",
					value: 'to'
				};
			}

	// used for identifying bounds of a parentheticalComment
	parenthesisIndicator "Parenethesis Indicator" =
		'(' { return '('; }
		/ '{' { return '('; }
		/ '[' { return '('; }
		/ ')' { return ')'; }
		/ '}' { return ')'; }
		/ ']' { return ')'; }

	// we don't care about anything in parens, so accept anything thats not an opening or closing bracket
	parentheticalCommentChar "Parenthetical Comment Character" =
		!parenthesisIndicator char:. { return char; }

	// accept any characters for comments
	commentChar "Comment Character" =
		char:. { return char; }

	digit "Digit" =
		[0-9]
		// unicode sub and superscripts
		/ '⁰' { return 0; }
		/ '¹' { return 1; }
		/ '⁴' { return 4; }
		/ '⁵' { return 5; }
		/ '⁶' { return 6; }
		/ '⁷' { return 7; }
		/ '⁸' { return 8; }
		/ '⁹' { return 0; }
		/ '₀' { return 0; }
		/ '₁' { return 1; }
		/ '₂' { return 2; }
		/ '₃' { return 3; }
		/ '₄' { return 4; }
		/ '₅' { return 5; }
		/ '₆' { return 6; }
		/ '₇' { return 7; }
		/ '₈' { return 8; }
		/ '₉' { return 9; }

	unicodeAmount "Unicode Amount" =
		'½' { return '1/2'; }
		/ '⅓' { return '1/3'; }
		/ '⅔' { return '2/3'; }
		/ '¼' { return '1/4'; }
		/ '¾' { return '3/4'; }
		/ '⅕' { return '1/5'; }
		/ '⅖' { return '2/5'; }
		/ '⅗' { return '3/5'; }
		/ '⅘' { return '4/5'; }
		/ '⅙' { return '1/6'; }
		/ '⅚' { return '5/6'; }
		/ '⅛' { return '1/8'; }
		/ '⅜' { return '3/8'; }
		/ '⅝' { return '5/8'; }
		/ '⅞' { return '7/8'; }

	fraction "Fraction" =
		// 1 1/4, 1 1/16, 11/4
		lead:digit _* numerator:$(digit)+ _* slashes+ _* denominator:$(digit)+
			{ return lead + " " + numerator + '/' + denominator; }

		// 1/4
		/ numerator:$(digit)+ _* slashes+ _* denominator:$(digit)+
			{ return numerator + '/' + denominator; }

	float "Float" =
		// 1.5
		// 3,5			// this was weird to me as an american, but i see a lot of commas used in european style amounts (i.e., 1,5 kg pork ribs)
		head:$(digit)* [.,] tail:$(digit)+
			{ return head + '.' + tail; }

	/*----------  Descriptors  ----------*/

	// these are actions or textual fluff that doesn't differentiate an ingredient
	// 'minced garlic', 'fresh garlic', 'pounded garlic' should all end up pairing to the ingredient 'garlic'
	// when its vital to maintain a descriptor in use as a distinct ingredient, such as 'powdered garlic', add the exception as an ingredientKeyword
	descriptors "Descriptors" =
		// freshly grated heaping
		c0:parentheticalComment*
    head:descriptorExpression
    c1:parentheticalComment*
    tail:descriptorListEnding*
			{
				let rule = "#1_descriptors";
				let values = [];

	      values = formatExpressionValues(values, c0, rule);
	      // head may have multiple values
	      if (head && head.values) {
	      	values = formatExpressionValues(values, head.values, rule);
	      } else {
					values = formatExpressionValues(values, [ head ], rule);
	      }
				values = formatExpressionValues(values, c1, rule);
		    values = formatExpressionValues(values, [].concat(...tail.map(v => v.values)) , rule);

				return {
					rule,
					type: "descriptor",
					values
				};
			}

		// freshly, grated, heaping
		/ c0:parentheticalComment*
	    tail:descriptorListEnding+
				{
					let rule = "#1_descriptors";
					let values = [];

		      values = formatExpressionValues(values, c0, rule);
			    values = formatExpressionValues(values, [].concat(...tail.map(v => v.values)) , rule);

					return {
						rule,
						type: "descriptor",
						values
					};
				}

	// ! TODO - ingredient needs to handle embedded comments on its own (descriptorExpression?)
	// must always end in a space

	descriptorExpression "Descriptor Expression" =
		// large/jumbo
    head:descriptor
    _*
    s:symbolSeparator
    _*
    tail:descriptor _+
			{
				let rule = "#1_descriptorExpression";
				let values = [];

	      values = formatExpressionValues(values, [ head ], rule);
	      values = formatExpressionValues(values, [ s ], rule);
				values = formatExpressionValues(values, [ tail ], rule);

				return {
					rule,
					type: "descriptor",
					values
				};
			}

		/ head:descriptor
    _+
    s:wordSeparator
    _+
    tail:descriptor _+
			{
				let rule = "#2_descriptorExpression";
				let values = [];

	      values = formatExpressionValues(values, [ head ], rule);
	      values = formatExpressionValues(values, [ s ], rule);
				values = formatExpressionValues(values, [ tail ], rule);

				return {
					rule,
					type: "descriptor",
					values
				};
			}

		// "hard, organic "
		/ head:descriptor
	    ',' _*
	    tail:descriptor _+
				{
					let rule = "#3_descriptorExpression";
					let values = [];

		      values = formatExpressionValues(values, [ head ], rule);
					values = formatExpressionValues(values, [ tail ], rule);

					return {
						rule,
						type: "descriptor",
						values
					};
				}

		/desc:descriptor dashes+
			{ return desc; }
		/ desc:descriptor _+
			{ return desc; }
		/ '~' // don't require spaces for symbols

	descriptor "Descriptor" =
		head:$(descriptorKeyword)* dashes+ tail:$(descriptorKeyword)*
			{
				return {
					rule: "#1_descriptor",
					type: "descriptor",
					value: head + '-' + tail
				};
			}
		/ desc:$(descriptorKeyword)+
			{
				return {
					rule: "#2_descriptor",
					type: "descriptor",
					value: desc
				};
			}

	// TRY THIS
	// hard organic tofu
	// hard, hard, oragnic tofu
	// the ending space was previously required but i can't remember why
	// this will allow longer lists than 2
	descriptorListEnding "Descriptor List Ending" =
		// for word separators we need the following space
		','? _* dash:dashes* sep:wordSeparator _+ desc:descriptor ','? _+
			{
				const rule = "#1_descriptorListEnding";
				let values = [];

				if (sep) {
					values = formatExpressionValues(values, [ sep ], rule);
				}

				values = formatExpressionValues(values, [ desc ], rule);

				return {
					rule,
					type: 'descriptor',
					values
				};
			}

		// optional symbol separators don't require the following space
		/ ','? _* dash:dashes* sep:symbolSeparator? _* desc:descriptor ','? _+
			{
				const rule = "#2_descriptorListEnding";
				let values = [];

				if (sep) {
					values = formatExpressionValues(values, [ sep ], rule);
				}

				values = formatExpressionValues(values, [ desc ], rule);

				return {
					rule,
					type: 'descriptor',
					values
				};
			}


	/*----------  Keywords  ----------*/

	// for all keyword lists...
	// make sure in the script that generates these rules that all instances with spaces or dashes are covered as follows
	// and are listed by length, in alphabetical order

	// $("hot"i _* dashes* "sauce"i)
	// "clove"i

	// ! TODO - amount vs amountKeyword?
	// ! TODO - swap last rule for proper separator specification if it makes sense
	// ! TODO - review ordering of rules as well
	// these are used to indicate what cannot be used as a standalone ingredient word
	// partial inclusions of reserverd words can be used in ingredients ('can' in 'cane sugar')
	// use singlular only here so that we don't let spaces thru
	reservedKeywords "Reserved Keywords" =
		amountSeparator
		// descriptors // this always includes the space, but we want to strip out this space
		/ descriptor
    // NOTE we don't want to include quantities because this can introduce spaces, commas, slashes and all sorts of shit into the ingredientTerm
		// quantities // doesn't hurt to include this, but units will always look for a trailing space
		/ unit 			 // make sure we include unit so that we exclude stand alone units
		/ amountKeyword
		/ '%' // don't want standalone percent signs

	// these are exceptions to indicate the presence of at least part of an ingredient
	// that would otherwise be flagged as a descriptor or standalone unit
	// these allow the following to be parsed as

	// 'a dash of hot sauce'		=>	ing: 'hot sauce'
	// '1 cup hot water'				=>	ing: 'water'
	// '4 whole cloves'					=>	ing: 'cloves'
	// '2 cloves of garlic'			=>	ing: 'garlic'

	// these are normally reserved words, but are allowed at the end of an ingredient
	// also allowed to be standalone ingredients
	// pork fat, lime juice, orange zest, zest
	ingredientException "Ingredient Exception" =
		'fat'i / 'juice'i / 'zest'i / 'ice'i

	// since these are partial matches on an ingredient, plurals are generally not needed ('sweet potato' will catch 'sweet potatoes')
	ingredientKeyword "Ingredient Keyword" =
		// allow percentages in ingredients
		$(digit+ '%') /
		// 00 flour
		$(quotes* digit* quotes* _* 'flour'i) /
    $('bicarbonate'i _* dashes* _*'of'i _* dashes* _*'soda'i) / $('all'i _* dashes* _*'purpose'i _* dashes* _*'flour'i) / $('liquid'i _* dashes* _*'seasoning'i) / $('black'i _* dashes* _*'onion'i _* dashes* _*'seed'i) / $('poaching'i _* dashes* _*'liquid'i) / $('pickling'i _* dashes* _*'liquid'i) / $('pickled'i _* dashes* _*'mustard'i) / $('liquid'i _* dashes* _*'sweetner'i) / $('impossible'i _* dashes* _*'meat'i) / $('hen'i _* dashes* _*'of'i _* dashes* _*'the'i _* dashes* _*'wood'i) / $('cream'i _* dashes* _*'of'i _* dashes* _*'tartar'i) / $('braising'i _* dashes* _*'liquid'i) / $('aromatic'i _* dashes* _*'bitter'i) / $('whipping'i _* dashes* _*'cream'i) / $('sweet'i _* dashes* _*'dark'i _* dashes* _*'soy'i) / $('sweet'i _* dashes* _*'and'i _* dashes* _*'sour'i) / $('sunflower'i _* dashes* _*'seed'i) / $('smoked'i _* dashes* _*'paprika'i) / $('seasoning'i _* dashes* _*'salt'i) / $('seasoning'i _* dashes* _*'cube'i) / $('powdered'i _* dashes* _*'sugar'i) / $('pickling'i _* dashes* _*'juice'i) / $('new'i _* dashes* _*'york'i _* dashes* _*'strip'i) / $('fermented'i _* dashes* _*'bean'i) / $('dark'i _* dashes* _*'chocolate'i) / $('coriander'i _* dashes* _*'seed'i) / $('condensed'i _* dashes* _*'milk'i) / $('canning'i _* dashes* _*'liquid'i) / $('whipped'i _* dashes* _*'cream'i) / $('smoked'i _* dashes* _*'lardon'i) / $('sheet'i _* dashes* _*'gelatin'i) / 'mediterranean'i / $('leaf'i _* dashes* _*'gelatine'i) / $('hot'i _* dashes* _*'chocolate'i) / $('half'i _* dashes* _*'and'i _* dashes* _*'half'i) / $('ground'i _* dashes* _*'ginger'i) / $('food'i _* dashes* _*'coloring'i) / $('crown'i _* dashes* _*'daisies'i) / $('cooking'i _* dashes* _*'spray'i) / $('banana'i _* dashes* _*'leaves'i) / $('baking'i _* dashes* _*'powder'i) / $('baby'i _* dashes* _*'back'i _* dashes* _*'rib'i) / $('angelica'i _* dashes* _*'root'i) / $('sweet'i _* dashes* _*'potato'i) / $('sweet'i _* dashes* _*'pepper'i) / $('simple'i _* dashes* _*'syrup'i) / $('refried'i _* dashes* _*'bean'i) / $('liquid'i _* dashes* _*'smoke'i) / $('leaf'i _* dashes* _*'lettuce'i) / $('glass'i _* dashes* _*'noodle'i) / $('dried'i _* dashes* _*'shrimp'i) / $('curry'i _* dashes* _*'leaves'i) / $('bitter'i _* dashes* _*'green'i) / $('whole'i _* dashes* _*'wheat'i) / $('wheat'i _* dashes* _*'grass'i) / $('vine'i _* dashes* _*'leaves'i) / $('sweety'i _* dashes* _*'drop'i) / $('sweet'i _* dashes* _*'sauce'i) / $('smoked'i _* dashes* _*'salt'i) / $('sesame'i _* dashes* _*'seed'i) / $('self'i _* dashes* _*'rising'i) / $('root'i _* dashes* _*'ginger'i) / $('red'i _* dashes* _*'skinned'i) / $('multi'i _* dashes* _*'grain'i) / $('hot'i _* dashes* _*'paprika'i) / $('hot'i _* dashes* _*'italian'i) / $('hot'i _* dashes* _*'dog'i _* dashes* _*'bun'i) / $('hot'i _* dashes* _*'chilies'i) / $('honey'i _* dashes* _*'crisp'i) / $('half'i _* dashes* _*'&'i _* dashes* _*'half'i) / $('dutch'i _* dashes* _*'cream'i) / $('dinner'i _* dashes* _*'roll'i) / $('country'i _* dashes* _*'rib'i) / $('celery'i _* dashes* _*'seed'i) / $('bean'i _* dashes* _*'thread'i) / $('banana'i _* dashes* _*'stem'i) / $('banana'i _* dashes* _*'leaf'i) / $('baking'i _* dashes* _*'soda'i) / $('vegan'i _* dashes* _*'meat'i) / $('tart'i _* dashes* _*'shell'i) / $('tart'i _* dashes* _*'crust'i) / $('taco'i _* dashes* _*'shell'i) / $('star'i _* dashes* _*'anise'i) / $('split'i _* dashes* _*'gram'i) / $('sour'i _* dashes* _*'cream'i) / $('soft'i _* dashes* _*'shell'i) / 'seasonings'i / $('poppy'i _* dashes* _*'seed'i) / $('hot'i _* dashes* _*'pepper'i) / $('hot'i _* dashes* _*'cheeto'i) / $('gram'i _* dashes* _*'flour'i) / $('five'i _* dashes* _*'spice'i) / $('dried'i _* dashes* _*'chil'i) / $('curry'i _* dashes* _*'leaf'i) / $('bay'i _* dashes* _*'leaves'i) / $('sun'i _* dashes* _*'dried'i) / $('steel'i _* dashes* _*'cut'i) / $('spare'i _* dashes* _*'rib'i) / 'sourdough'i / $('short'i _* dashes* _*'rib'i) / 'seasoning'i / $('rib'i _* dashes* _*'roast'i) / $('prime'i _* dashes* _*'rib'i) / $('pot'i _* dashes* _*'roast'i) / $('pie'i _* dashes* _*'shell'i) / $('long'i _* dashes* _*'bean'i) / $('hot'i _* dashes* _*'sauce'i) / $('hot'i _* dashes* _*'house'i) / $('hot'i _* dashes* _*'chili'i) / $('hot'i _* dashes* _*'chile'i) / $('hero'i _* dashes* _*'roll'i) / $('gold'i _* dashes* _*'leaf'i) / 'flatbread'i / $('flat'i _* dashes* _*'iron'i) / $('deep'i _* dashes* _*'dish'i) / $('cold'i _* dashes* _*'brew'i) / $('claw'i _* dashes* _*'meat'i) / $('burnt'i _* dashes* _*'end'i) / $('baby'i _* dashes* _*'back'i) / $('sub'i _* dashes* _*'roll'i) / 'sprinkle'i / $('hot'i _* dashes* _*'dogs'i) / 'flathead'i / $('dry'i _* dashes* _*'milk'i) / $('dark'i _* dashes* _*'soy'i) / $('char'i _* dashes* _*'siu'i) / $('bay'i _* dashes* _*'leaf'i) / $('back'i _* dashes* _*'rib'i) / $('tri'i _* dashes* _*'tip'i) / 'tenkasu'i / $('rib'i _* dashes* _*'tip'i) / $('rib'i _* dashes* _*'eye'i) / $('old'i _* dashes* _*'bay'i) / 'medjool'i / 'madeira'i / $('hot'i _* dashes* _*'dog'i) / $('dry'i _* dashes* _*'rub'i) / 'atchara'i / $('5'i _* dashes* _*'spice'i) / 'potato'i / 'lumpia'i / 'longan'i / 'somen'i / 'onion'i / 'liver'i / 'clove'i / 'roll'i / 's&b'i / 'h2o'i / 'egg'i

	// plurals required
	amountKeyword "Amount Keyword" =
		'quarter' / $('half'i _* dashes* _*'a'i _* dashes* _*'dozen'i) / 'seventeen'i / 'thirteen'i / $('quarter'i _* dashes* _*''i) / 'numerous'i / 'nineteen'i / 'fourteen'i / 'eighteen'i / 'sixteen'i / 'several'i / 'seventy'i / 'hundred'i / 'fifteen'i / 'amounts'i / 'twenty'i / 'twelve'i / 'thirty'i / 'single'i / 'ninety'i / 'eleven'i / 'eighty'i / 'couple'i / 'amount'i / 'three'i / 'third'i / 'sixty'i / 'sixth'i / 'seven'i / 'forty'i / 'fifty'i / 'eight'i / 'dozen'i / $('ten'i _* dashes* _*''i) / 'some'i / 'nine'i / 'half'i / 'four'i / 'five'i / 'two'i / 'six'i / 'one'i / 'lot'i

	// plurals required
	unitKeyword "Unit Keyword" =
		$('servings'i _* dashes* _*'worth'i) / 'sprinklings'i / 'containters'i / $('wine'i _* dashes* _*'glass'i) / 'sprinkling'i / 'selections'i / 'scattering'i / 'quantities'i / 'containter'i / 'containers'i / $('bar'i _* dashes* _*'spoons'i) / 'sprinkles'i / 'spoonfuls'i / 'shoulders'i / 'selection'i / 'marylands'i / $('hand'i _* dashes* _*'full'i) / 'grindings'i / 'envelopes'i / 'container'i / 'carcasses'i / $('bar'i _* dashes* _*'spoon'i) / 'trotters'i / 'squeezes'i / 'sprinkle'i / 'spoonful'i / 'splashes'i / 'shoulder'i / 'shavings'i / 'servings'i / 'segments'i / 'sections'i / 'quantity'i / 'portions'i / 'peelings'i / 'packages'i / 'maryland'i / 'handfuls'i / 'grinding'i / 'gratings'i / 'fistfuls'i / 'filamets'i / 'envelope'i / 'drizzles'i / 'crumbles'i / 'clusters'i / 'branches'i / 'trotter'i / 'throats'i / 'threads'i / 'teabags'i / 'tablets'i / 'strands'i / 'squeeze'i / 'squares'i / 'spheres'i / 'sleeves'i / 'shaving'i / 'serving'i / 'segment'i / 'section'i / 'scrapes'i / 'sachets'i / 'reserve'i / 'recipes'i / 'rashers'i / 'punnets'i / 'pouches'i / 'portion'i / 'pinches'i / 'packets'i / 'package'i / 'lobules'i / 'lengths'i / 'lardons'i / 'kernels'i / 'handful'i / 'grating'i / 'glasses'i / 'florets'i / 'fistful'i / 'fillets'i / 'filamet'i / 'drizzle'i / 'dollops'i / 'cutlets'i / 'crumble'i / 'cluster'i / 'circles'i / 'carcass'i / 'bundles'i / 'bunches'i / 'breasts'i / 'bowlful'i / 'bottles'i / 'batches'i / 'wheels'i / 'wedges'i / 'twists'i / 'thumbs'i / 'throat'i / 'thread'i / 'thighs'i / 'teabag'i / 'tablet'i / 'strips'i / 'strand'i / 'sticks'i / 'stalks'i / 'square'i / 'sprigs'i / 'spoons'i / 'splash'i / 'sphere'i / 'spears'i / 'slurry'i / 'slices'i / 'sleeve'i / 'shells'i / 'sheets'i / 'shards'i / 'shanks'i / 'shakes'i / 'scoops'i / 'sachet'i / 'rounds'i / 'recipe'i / 'rashes'i / 'rasher'i / 'quills'i / 'punnet'i / 'pieces'i / 'petals'i / 'packet'i / 'lobule'i / 'loaves'i / 'length'i / 'leaves'i / 'layers'i / 'lardon'i / 'ladles'i / 'kernel'i / 'joints'i / 'hearts'i / 'halves'i / 'grinds'i / 'grates'i / 'grains'i / 'fronds'i / 'floret'i / 'fillet'i / 'dollop'i / 'dashes'i / 'cutlet'i / 'crowns'i / 'cranks'i / 'cracks'i / 'clumps'i / 'cloves'i / 'chunks'i / 'cheeks'i / 'carton'i / 'bundle'i / 'bricks'i / 'breast'i / 'branch'i / 'bottle'i / 'blocks'i / 'blades'i / 'wings'i / 'wheel'i / 'wedge'i / 'units'i / 'twist'i / 'twigs'i / 'turns'i / 'tubes'i / 'touch'i / 'thumb'i / 'thigh'i / 'tails'i / 'strip'i / 'stick'i / 'stems'i / 'stars'i / 'stalk'i / 'sprig'i / 'spoon'i / 'spear'i / 'slice'i / 'slabs'i / 'sides'i / 'shots'i / 'shell'i / 'sheet'i / 'shard'i / 'shank'i / 'seeds'i / 'scoop'i / 'round'i / 'roots'i / 'rolls'i / 'rings'i / 'rinds'i / 'racks'i / 'quill'i / 'puree'i / 'pouch'i / 'pinch'i / 'piece'i / 'petal'i / 'peels'i / 'parts'i / 'pairs'i / 'packs'i / 'nests'i / 'necks'i / 'links'i / 'leafs'i / 'layer'i / 'ladle'i / 'knobs'i / 'juice'i / 'joint'i / 'hunks'i / 'heart'i / 'heads'i / 'grind'i / 'glugs'i / 'glass'i / 'frond'i / 'flesh'i / 'drops'i / 'drips'i / 'disks'i / 'discs'i / 'curls'i / 'cubes'i / 'crown'i / 'count'i / 'coins'i / 'clump'i / 'clove'i / 'chunk'i / 'cheek'i / 'cdita'i / 'bunch'i / 'bulbs'i / 'brick'i / 'boxes'i / 'bowls'i / 'block'i / 'blade'i / 'beads'i / 'batch'i / 'balls'i / 'arils'i / 'zest'i / 'wing'i / 'unit'i / 'twig'i / 'turn'i / 'tuft'i / 'tubs'i / 'tube'i / 'tins'i / 'tail'i / 'stem'i / 'slab'i / 'side'i / 'shot'i / 'seed'i / 'root'i / 'roll'i / 'ring'i / 'rind'i / 'ribs'i / 'rack'i / 'q.b.'i / 'pulp'i / 'pots'i / 'pods'i / 'pkts'i / 'peel'i / 'pcs.'i / 'pats'i / 'part'i / 'pair'i / 'pack'i / 'nubs'i / 'nobs'i / 'nest'i / 'neck'i / 'mugs'i / 'lots'i / 'logs'i / 'loaf'i / 'link'i / 'legs'i / 'leaf'i / 'knob'i / 'jars'i / 'hunk'i / 'head'i / 'glug'i / 'foot'i / 'feet'i / 'ears'i / 'drop'i / 'drip'i / 'disk'i / 'disc'i / 'dash'i / 'dabs'i / 'cuts'i / 'curl'i / 'cube'i / 'ctns'i / 'coin'i / 'cobs'i / 'caps'i / 'cans'i / 'c.c.'i / 'bulb'i / 'bowl'i / 'bits'i / 'bars'i / 'ball'i / 'bags'i / 'aril'i / 'tub'i / 'tin'i / 'rib'i / 'qty'i / 'pot'i / 'pod'i / 'pkt'i / 'pkg'i / 'pcs'i / 'pat'i / 'nub'i / 'nos'i / 'nob'i / 'mug'i / 'log'i / 'leg'i / 'jar'i / 'ear'i / 'dab'i / 'ctn'i / 'cob'i / 'cda'i / 'cap'i / 'can'i / 'box'i / 'bit'i / 'bar'i / 'bag'i / 'qb'i / 'pk'i / 'pc'i / 'ea'i / 'dl'i / 'cc'i

	descriptorKeyword "Descriptor Keyword" =
		// bob's red mill
		$('bob'i quotes? 's'i _* 'red'i _* 'mill'i) /
		$('pre'i _* dashes* _* 'baked'i) /
		$('waltnut'i _* dashes* _* 'sized'i) / 'traditionally'i / $('sashimi'i _* dashes* _*'grade'i) / 'reconstituted'i / $('ready'i _* dashes* _*'to'i _* dashes* _*'cook'i) / $('quarter'i _* dashes* _*'sized'i) / $('berry'i _* dashes* _*'forward'i) / $('baseball'i _* dashes* _*'size'i) / 'approximately'i / $('aluminum'i _* dashes* _*'free'i) / 'accompaniment'i / $('salt'i _* dashes* _*'reduced'i) / 'refrigerated'i / $('reduced'i _* dashes* _*'salt'i) / $('ready'i _* dashes* _*'to'i _* dashes* _*'eat'i) / $('quarter'i _* dashes* _*'size'i) / 'preservative'i / $('off'i _* dashes* _*'the'i _* dashes* _*'bone'i) / 'nixtamalized'i / 'hydrogenated'i / $('high'i _* dashes* _*'protein'i) / 'concentrated'i / $('bitter'i _* dashes* _*'sweet'i) / $('walnut'i _* dashes* _*'size'i) / 'unsweetened'i / 'unflavoured'i / $('tri'i _* dashes* _*'colored'i) / 'traditional'i / $('tender'i _* dashes* _*'stem'i) / 'temperature'i / 'sustainably'i / 'sustainable'i / $('sushi'i _* dashes* _*'grade'i) / 'responsibly'i / 'rectangular'i / 'recommended'i / 'reactivated'i / 'pasteurized'i / $('middle'i _* dashes* _*'size'i) / $('low'i _* dashes* _*'protein'i) / 'liposoluble'i / $('king'i _* dashes* _*'arthur'i) / 'immediately'i / 'flavourless'i / $('disc'i _* dashes* _*'shaped'i) / 'deactivated'i / 'cylindrical'i / 'combination'i / 'butterflied'i / $('burger'i _* dashes* _*'size'i) / 'accumulated'i / $('young'i _* dashes* _*'leaf'i) / 'vegetarian'i / 'unseasoned'i / 'unflavored'i / 'unbleached'i / 'thoroughly'i / 'spiralized'i / 'spiralised'i / 'solidified'i / 'smokehouse'i / 'relatively'i / 'rehydrated'i / 'pulverized'i / 'previously'i / 'preferably'i / $('on'i _* dashes* _*'the'i _* dashes* _*'cob'i) / $('oil'i _* dashes* _*'packed'i) / $('lower'i _* dashes* _*'salt'i) / $('low'i _* dashes* _*'starch'i) / $('loose'i _* dashes* _*'leaf'i) / 'lengthwise'i / 'individual'i / 'granulated'i / 'generously'i / 'gelatinous'i / $('full'i _* dashes* _*'cream'i) / 'flavourful'i / 'flavorless'i / 'equivalent'i / 'diagonally'i / 'dessicated'i / 'desiccated'i / 'decorative'i / $('de'i _* dashes* _*'stemmed'i) / 'completely'i / 'commercial'i / 'assortment'i / 'additional'i / 'acidulated'i / 'wholemeal'i / 'unskinned'i / 'unroasted'i / 'unrefined'i / 'undrained'i / 'undiluted'i / 'thickness'i / 'thickened'i / 'sweetened'i / 'sprinkled'i / 'sometimes'i / 'separated'i / 'segmented'i / 'scrambled'i / 'scattered'i / $('salt'i _* dashes* _*'free'i) / 'quartered'i / 'purchased'i / 'processed'i / 'preferred'i / 'powedered'i / $('pin'i _* dashes* _*'boned'i) / 'pesticide'i / 'perfectly'i / $('non'i _* dashes* _*'stick'i) / 'neutrally'i / 'necessary'i / 'naturally'i / 'miniature'i / 'marinated'i / 'macerated'i / 'julienned'i / 'instantly'i / 'imitation'i / $('hong'i _* dashes* _*'kong'i) / 'generally'i / 'garnishes'i / 'garnished'i / 'flavoured'i / 'flavorful'i / 'flattened'i / $('flat'i _* dashes* _*'leaf'i) / 'finishing'i / 'fermented'i / 'favourite'i / 'fashioned'i / 'extremely'i / 'extracted'i / 'excellent'i / 'elongated'i / 'distilled'i / 'dissolved'i / 'discarded'i / 'different'i / 'diastatic'i / 'defrosted'i / 'decorated'i / $('de'i _* dashes* _*'veined'i) / 'crustless'i / 'congealed'i / 'condensed'i / 'certified'i / 'beautiful'i / 'available'i / 'authentic'i / 'artisanal'i / 'aluminium'i / 'activated'i / 'whatever'i / 'vinegary'i / 'unsalted'i / 'unpeeled'i / 'uncooked'i / 'tolerant'i / 'titanium'i / 'tempered'i / 'sulfured'i / 'suitable'i / 'strongly'i / 'stripped'i / 'strength'i / 'strained'i / 'standard'i / 'squeezed'i / 'softened'i / 'smoothed'i / 'smallish'i / 'smallest'i / 'slivered'i / 'slightly'i / 'skinless'i / 'sizzling'i / 'simmered'i / 'shredded'i / 'seedless'i / 'seasoned'i / 'seasonal'i / 'scrubbed'i / 'scrapped'i / 'sandwich'i / 'rindless'i / 'ribboned'i / 'reserved'i / 'required'i / 'rendered'i / 'purified'i / 'prepared'i / 'postcard'i / 'pastured'i / 'packaged'i / 'original'i / 'ordinary'i / 'optional'i / 'moisture'i / $('low'i _* dashes* _*'salt'i) / 'leavened'i / $('la'i _* dashes* _*'style'i) / 'julienne'i / 'inserted'i / 'imported'i / 'hydrated'i / 'heritage'i / 'heirloom'i / 'headless'i / 'grounded'i / 'generous'i / 'garlicky'i / 'frenched'i / 'fragrant'i / 'flavored'i / 'filtered'i / 'favorite'i / 'fattiest'i / 'european'i / 'enriched'i / 'deseeded'i / 'delicate'i / 'cylindar'i / 'cultured'i / 'culinary'i / 'crunched'i / 'crumpled'i / 'crumbled'i / $('corn'i _* dashes* _*'fed'i) / 'coloured'i / 'colorful'i / 'coarsley'i / 'coarsely'i / 'circular'i / 'chrunchy'i / 'buttered'i / 'brimming'i / 'boneless'i / $('bone'i _* dashes* _*'out'i) / 'bleached'i / 'blanched'i / 'assorted'i / 'arranged'i / 'aromatic'i / 'adjusted'i / 'additive'i / 'actually'i / $('x'i _* dashes* _*'large'i) / 'without'i / 'whisked'i / 'whacked'i / 'vintage'i / 'variety'i / 'unwaxed'i / 'unsweet'i / 'unbaked'i / 'trussed'i / 'trimmed'i / 'treated'i / 'topping'i / 'toasted'i / $('to'i _* dashes* _*'cook'i) / 'tightly'i / 'thickly'i / $('tex'i _* dashes* _*'mex'i) / 'tasting'i / 'streaky'i / 'stirred'i / 'stemmed'i / $('stem'i _* dashes* _*'on'i) / 'steeped'i / 'steamed'i / 'stacked'i / 'sprayed'i / 'spelled'i / 'special'i / 'sourced'i / 'soluble'i / 'snipped'i / 'smoking'i / 'smeared'i / 'smashed'i / 'smaller'i / 'slender'i / 'skinned'i / 'skimmed'i / 'similar'i / 'shucked'i / 'shelled'i / 'shallow'i / 'scraped'i / 'scooped'i / 'savoury'i / 'sautéed'i / 'sauteed'i / 'rounded'i / 'roughly'i / 'roasted'i / 'ripened'i / 'resized'i / 'reserve'i / 'removed'i / 'regular'i / 'refried'i / 'refined'i / 'reduced'i / 'quality'i / 'proofed'i / 'process'i / 'pricked'i / 'pressed'i / 'premium'i / 'powdery'i / 'pounded'i / 'poached'i / 'pickled'i / 'perfect'i / 'peppery'i / 'pasture'i / 'organic'i / $('no'i _* dashes* _*'salt'i) / 'nitrate'i / 'neutral'i / 'natural'i / 'mixture'i / 'melting'i / 'matured'i / 'marbled'i / 'loosely'i / 'lightly'i / 'lighter'i / 'liberal'i / 'leanest'i / 'largely'i / 'kneaded'i / 'iodized'i / 'instant'i / 'ideally'i / 'highest'i / 'heaping'i / 'healthy'i / $('head'i _* dashes* _*'on'i) / 'grilled'i / 'grandma'i / 'grained'i / $('grade'i _* dashes* _*'b'i) / $('grade'i _* dashes* _*'a'i) / 'gourmet'i / 'garnish'i / 'frosted'i / 'freshly'i / 'freezer'i / 'fleshed'i / 'fattier'i / 'exactly'i / 'english'i / 'dusting'i / 'dressed'i / 'drained'i / 'divided'i / 'diluted'i / 'desired'i / 'denuded'i / 'deboned'i / 'crushed'i / 'crunchy'i / 'crumbly'i / 'crisply'i / 'crisped'i / 'cracked'i / 'covered'i / 'country'i / 'cooking'i / 'colored'i / 'cleaned'i / 'classic'i / 'citrusy'i / 'chunked'i / 'chopped'i / 'chilled'i / 'checked'i / 'charred'i / 'buttery'i / 'butcher'i / 'burning'i / 'bunched'i / 'brushed'i / 'bruised'i / 'browned'i / 'broiled'i / 'braised'i / 'bottled'i / $('bone'i _* dashes* _*'in'i) / 'boiling'i / 'bloomed'i / 'blended'i / 'average'i / 'artisan'i / 'approx.'i / 'another'i / 'alcohol'i / 'zested'i / 'xlarge'i / 'wilted'i / 'watery'i / 'washed'i / 'warmed'i / 'virgin'i / 'veined'i / 'vacuum'i / 'unripe'i / 'turned'i / 'tossed'i / 'topped'i / $('to'i _* dashes* _*'eat'i) / 'tinned'i / 'thinly'i / 'thawed'i / 'tender'i / 'tasted'i / 'syrupy'i / 'sturdy'i / 'strong'i / 'stoned'i / 'sticky'i / 'stewed'i / 'spongy'i / 'spiral'i / 'soured'i / 'softly'i / 'sodium'i / 'soaked'i / 'smooth'i / 'smoked'i / 'sliced'i / 'skinon'i / 'skinny'i / 'simple'i / 'silver'i / 'sifted'i / 'sieved'i / 'shaved'i / 'shaped'i / 'shaken'i / 'served'i / 'seeded'i / 'season'i / 'seared'i / 'scored'i / 'scaled'i / 'sauted'i / 'salted'i / 'rustic'i / 'rubbed'i / 'rolled'i / 'robust'i / 'rising'i / 'ripped'i / 'ripest'i / 'rinsed'i / 'ridged'i / 'really'i / 'raised'i / 'puréed'i / 'pureéd'i / 'pureed'i / 'pulsed'i / 'pulled'i / 'poured'i / 'podded'i / 'plenty'i / 'planed'i / 'placed'i / 'pitted'i / 'picked'i / 'petite'i / 'person'i / 'pencil'i / 'peeled'i / 'peated'i / 'patted'i / 'packed'i / 'opened'i / 'normal'i / 'needed'i / 'native'i / 'narrow'i / 'minced'i / 'milled'i / 'mildly'i / 'melted'i / 'mellow'i / 'medium'i / 'mature'i / 'massel'i / 'mashed'i / 'living'i / 'little'i / 'liquid'i / 'leaved'i / 'leaner'i / 'larger'i / 'juiced'i / 'jarred'i / 'husked'i / 'hulled'i / 'heated'i / 'hearty'i / 'heaped'i / 'halved'i / 'ground'i / 'gritty'i / 'greasy'i / 'grated'i / 'grainy'i / 'gluten'i / 'glazed'i / 'frying'i / 'fruity'i / 'frozen'i / 'frosty'i / 'freeze'i / 'formed'i / 'forced'i / 'folded'i / 'fluffy'i / 'floury'i / 'floral'i / 'fleshy'i / 'flakey'i / 'flaked'i / 'firmly'i / 'finest'i / 'finely'i / 'farmed'i / 'fairly'i / 'exotic'i / 'enough'i / 'either'i / 'edible'i / 'eating'i / 'earthy'i / 'double'i / 'decent'i / 'darker'i / 'crusty'i / 'crispy'i / 'creamy'i / 'course'i / 'cooled'i / 'cooked'i / 'colour'i / 'coated'i / 'coarse'i / 'chunky'i / 'chubby'i / 'choice'i / 'cheesy'i / 'chalky'i / 'centre'i / 'center'i / 'caught'i / 'casing'i / 'carved'i / 'canned'i / 'broken'i / 'bright'i / 'brewed'i / 'bought'i / 'boiled'i / 'bodied'i / 'bitter'i / 'bigger'i / 'before'i / 'beaten'i / 'basted'i / 'barrel'i / 'barely'i / 'baking'i / 'around'i / 'approx'i / 'always'i / 'almost'i / 'adjust'i / 'active'i / 'action'i / 'acting'i / 'zesty'i / 'young'i / 'worth'i / 'wiped'i / 'whole'i / 'waxed'i / 'wafer'i / 'vegan'i / 'using'i / 'under'i / 'trade'i / 'tough'i / 'total'i / 'thumb'i / 'thick'i / 'their'i / 'texas'i / 'tepid'i / 'tasty'i / 'taste'i / 'tangy'i / 'sweet'i / 'super'i / 'sunny'i / 'style'i / 'store'i / 'stone'i / 'still'i / 'stiff'i / 'stale'i / 'split'i / 'spicy'i / 'solid'i / 'smoky'i / 'smoke'i / 'small'i / 'sized'i / 'short'i / 'shell'i / 'sharp'i / 'shape'i / 'serve'i / 'scant'i / 'salty'i / 'runny'i / 'rough'i / 'ripen'i / 'riced'i / 'ready'i / 'rapid'i / 'range'i / 'quick'i / 'proof'i / 'press'i / 'point'i / 'plump'i / 'plant'i / 'plain'i / 'pared'i / 'paper'i / 'outer'i / 'other'i / $('or'i _* dashes* _*'so'i) / 'oiled'i / 'nutty'i / 'mushy'i / 'multi'i / 'moons'i / 'moist'i / 'mixed'i / 'minus'i / 'minty'i / 'mince'i / 'milky'i / 'micro'i / 'meaty'i / 'mealy'i / 'lower'i / 'loose'i / 'local'i / 'level'i / 'leave'i / 'least'i / 'leafy'i / 'large'i / 'knead'i / 'jumbo'i / 'juicy'i / 'jammy'i / 'inner'i / 'house'i / 'hefty'i / 'heavy'i / 'hardy'i / 'grind'i / 'grass'i / 'grain'i / 'grade'i / 'giant'i / 'fully'i / 'fried'i / 'fresh'i / 'flaky'i / 'fizzy'i / 'fishy'i / 'fiery'i / 'fatty'i / 'fancy'i / 'extra'i / 'equal'i / 'empty'i / 'dutch'i / 'dried'i / 'diced'i / 'dairy'i / 'curly'i / 'cured'i / 'cubed'i / 'crust'i / 'cross'i / 'crisp'i / 'cored'i / 'color'i / 'clear'i / 'clean'i / 'chewy'i / 'cheap'i / 'caged'i / 'bushy'i / 'burnt'i / 'brush'i / 'broad'i / 'boxed'i / 'boned'i / 'blind'i / 'bland'i / 'basic'i / 'based'i / 'baked'i / 'added'i / 'about'i / 'your'i / 'with'i / 'wild'i / 'wide'i / 'well'i / 'weak'i / 'waxy'i / 'warm'i / 'vine'i / 'very'i / 'used'i / 'ugly'i / 'type'i / 'torn'i / 'tiny'i / 'tied'i / 'thin'i / 'then'i / 'that'i / 'than'i / 'temp'i / 'tart'i / 'such'i / 'stir'i / 'sour'i / 'soft'i / 'slow'i / 'slit'i / 'skin'i / 'skim'i / 'size'i / 'side'i / 'shop'i / 'semi'i / 'room'i / 'rise'i / 'ripe'i / 'rich'i / 'real'i / 'rare'i / 'pure'i / 'plus'i / 'pith'i / 'part'i / 'over'i / 'oven'i / 'oily'i / 'note'i / 'nice'i / 'navy'i / 'much'i / 'most'i / 'more'i / 'moon'i / 'mini'i / 'mild'i / 'meat'i / 'many'i / 'made'i / 'lump'i / 'luke'i / 'long'i / 'live'i / 'like'i / 'less'i / 'left'i / 'lean'i / 'kind'i / 'just'i / 'into'i / 'iced'i / 'i.e.'i / 'home'i / 'high'i / 'heat'i / 'hard'i / 'hand'i / 'good'i / 'full'i / 'from'i / 'free'i / 'food'i / 'flat'i / 'firm'i / 'fire'i / 'fine'i / 'fast'i / 'fair'i / 'easy'i / 'each'i / 'e.g.'i / 'dyed'i / 'dull'i / 'dish'i / 'dice'i / 'deep'i / 'dark'i / 'cool'i / 'cook'i / 'cold'i / 'char'i / 'cave'i / 'carb'i / 'cage'i / 'bulk'i / 'boil'i / 'bite'i / 'best'i / 'baby'i / 'aged'i / 'you'i / 'wet'i / 'use'i / 'top'i / 'too'i / 'the'i / 'see'i / 'raw'i / 'pre'i / 'per'i / 'par'i / 'pan'i / 'out'i / 'old'i / 'off'i / 'not'i / 'non'i / 'new'i / 'msc'i / 'mix'i / 'mid'i / 'med'i / 'low'i / 'ish'i / 'icy'i / 'ice'i / 'hot'i / 'gmo'i / 'for'i / 'few'i / 'fed'i / 'fat'i / 'dry'i / 'diy'i / 'day'i / 'cut'i / 'but'i / 'big'i / 'any'i / 'all'i / 'air'i / 'add'i / 'xl'i / 'us'i / 'up'i / 'to'i / 'so'i / 'sm'i / 'on'i / 'of'i / 'no'i / 'my'i / 'md'i / 'lg'i / 'in'i / 'if'i / 'ie'i / 'eg'i / 'ea'i / 'bi'i / 'at'i / 'as'i / 'an'i / 'i'i / 'a'i / '~'

/*=====  End of Base Rules  ======*/



/*====================================
=            Amount Rules            =
====================================*/

	// ! TODO - test sizes
	//"1 11-x-17-inch jelly roll pan"
	// "2 8\" x 18\" sheets puff pastry"
	amounts "Amounts" =
		// (A) freshly (B) 1 (C) 1/4 fresh and (X) heaping (Y) ten (Z) 4.5
		// 1-to-1
		head:amountExpression _* dashes? _* desc:descriptors? _* dashes? _* sep:amountSeparator _* dashes? _* tail:amountExpression
			{
				const rule = "#1_amounts";
				let values = [];

				values = formatExpressionValues(values, head.values, rule);
				if (desc && desc.values) {
					values = formatExpressionValues(values, desc.values, rule);
				}
				values = formatExpressionValues(values, [ sep ], rule);
				values = formatExpressionValues(values, tail.values, rule)

				return {
					rule,
					type: "amount",
					values
				};
			}

		// (A) 1 - 4
		// 1-to-1
		/ head:amountExpression _* sep:amountSeparator _* dashes? _* tail:amountExpression
			{
				const rule = "#2_amounts";
				let values = [];

				values = formatExpressionValues(values, head.values, rule);
				values = formatExpressionValues(values, [ sep ], rule);
				values = formatExpressionValues(values, tail.values, rule)

				return {
					rule,
					type: "amount",
					values
				};
			}

		// (A) freshly grated (B) 1 (C) 1/4
		/ amt:amountExpression
			{
				let rule = "#3_amounts";
				let values = formatExpressionValues([], amt.values, rule);

				return {
					rule,
					type: "amount",
					values
				};
			}

	// an amount expression must include a single amount and any amount of optional descriptors or comments
	amountExpression "Amount Expression" =
		// required descriptor, two amounts
		// (A) freshly (B) 1 (C) 1/4
		c0:leadingParentheticalComment*
		desc:descriptors _*
		c1:parentheticalComment*
		head:amount _*
		c2:parentheticalComment*
		tail:amount
			{
				let rule = "#1_amountExpression";
				let values = [];

				values = formatExpressionValues(values, c0, rule);
				values = formatExpressionValues(values, desc.values, rule);
				values = formatExpressionValues(values, c1, rule);
				values = formatExpressionValues(values, [ head ], rule);
				values = formatExpressionValues(values, c2, rule);
				values = formatExpressionValues(values, [ tail ], rule);

				return {
					rule,
					type: "amount",
					values
				};
			}

		// required descriptor, single amount
		// (A) fresh (B) 1
		/ c0:leadingParentheticalComment*
			desc:descriptors _*
			c1:parentheticalComment*
			amt:amount
				{
					let rule = "#2_amountExpression";
					let values = [];

					values = formatExpressionValues(values, c0, rule);
					values = formatExpressionValues(values, desc.values, rule);
					values = formatExpressionValues(values, c1, rule);
					values = formatExpressionValues(values, [ amt ], rule);


					return {
						rule,
						type: "amount",
						values
					};
				}

		// no descriptors, two amounts
		// (A) 1 (B) 1
		/ c0:leadingParentheticalComment*
			head:amount ','? _*							// TRY "4, 6-ounce red snapper"
			c1:parentheticalComment*
			tail:amount
				{
					let rule = "#3_amountExpression";
					let values = [];

					values = formatExpressionValues(values, c0, rule);
					values = formatExpressionValues(values, [ head ], rule);
					values = formatExpressionValues(values, c1, rule);
					values = formatExpressionValues(values, [ tail ], rule);


					return {
						rule,
						type: "amount",
						values
					};
				}

		// singular amount
		// (A) 1
		/ c0:leadingParentheticalComment*
			amt:amount
				{
					let rule = "#4_amountExpression";
					let values = [];

					values = formatExpressionValues(values, c0, rule);
					values = formatExpressionValues(values, [ amt ], rule);


					return {
						rule,
						type: "amount",
						values
					};
				}

	amount "Amount" =
		amt:$(amountKeyword)
			{
				return {
					rule: '#1_amount',
					type: 'amount',
					value: amt.toLowerCase()
				};
			}
		/ amt:unicodeAmount
			{
				return {
					rule: '#2_amount',
					type: 'amount',
					value: amt.toLowerCase()
				};
			}
		/ amt:fraction
			{
				return {
					rule: '#3_amount',
					type: 'amount',
					value: amt.toLowerCase()
				};
			}
		/ amt:float
			{
				return {
					rule: '#4_amount',
					type: 'amount',
					value: amt.toLowerCase()
				};
			}
		/ amt:$(digit)+		// this needs to be after fraction and float
			{
				return {
					rule: '#5_amount',
					type: 'amount',
					value: amt.toLowerCase()
				};
			}

/*=====  End of Amount Rules  ======*/



/*==================================
=            Unit Rules            =
==================================*/

	// the secondary unit is baked into the unit defintion so i don't think we need to do anything fancy here
	units "Units" =
		exp:unitExpression ','? _+
      {
      	let rule = "#1_units";
        let values = formatExpressionValues([], exp.values, rule);

        return {
          rule,
          type: "unit",
          values
        };
      }


  // i know i thought this was required here, but i'm wondering if there's a reason why we can't move it up to units
  // so try this so that i can accommodate unit slashes easier, but if there's an example of why this is required i should log it here
	// ! NOTE - the ending space here is required!
	unitListEnding "Unit List Ending" =
		_* dash:dashes* _* u:unit //_+
			{ return u; }

	// ! TODO - there's a few rules that could leak an ending parenComment
	// ! NOTE - the trailing unit space here is required!
	unitExpression "Unit Expression" =
		// "(A) fresh (B) -inch "
		c0:leadingParentheticalComment*
		desc:descriptors _*
		c1:parentheticalComment*
		dashes*
		head:unit
		//_+
			{
				let rule = "#1_unitExpression";
				let values = [];

				values = formatExpressionValues(values, c0, rule);
				values = formatExpressionValues(values, desc.values, rule);
				values = formatExpressionValues(values, c1, rule);
				values = formatExpressionValues(values, [ head ], rule);

				return {
					rule,
					type: "unit",
					values
				};
			}

		// "(A) -inch "
		/ c0:leadingParentheticalComment*
			dashes*
			head:unit
			//_+
				{
					let rule = "#2_unitExpression";
					let values = [];

					values = formatExpressionValues(values, c0, rule);
					values = formatExpressionValues(values, [ head ], rule);


					return {
						rule,
						type: "unit",
						values
					};
				}

		// "(A) heaping grated (B) -cup (D) -inch cup "
		/	c0:leadingParentheticalComment*
			desc:descriptors _*
			c1:parentheticalComment*
			dashes*
			head:unit _+
			c2:parentheticalComment*
			tail:unitListEnding*
				{
					let rule = "#3_unitExpression";
					let values = [];

					values = formatExpressionValues(values, c0, rule);
					values = formatExpressionValues(values, desc.values, rule);
					values = formatExpressionValues(values, c1, rule);
					values = formatExpressionValues(values, [ head ], rule);
					values = formatExpressionValues(values, c2, rule);
					values = formatExpressionValues(values, tail, rule);


					return {
						rule,
						type: "unit",
						values
					};
				}

		// "(A) -inch (B) piece
		/ c0:leadingParentheticalComment*
			dashes*
			head:unit _+
			c1:parentheticalComment*
			tail:unitListEnding*
			//_+
				{
					let rule = "#4_unitExpression";
					let values = [];

					values = formatExpressionValues(values, c0, rule);
					values = formatExpressionValues(values, [ head ], rule);
					values = formatExpressionValues(values, c1, rule);
					values = formatExpressionValues(values, tail, rule);


					return {
						rule,
						type: "unit",
						values
					};
				}

	unit "Unit" =
		unit:unitKeyword
			{
				return {
					"rule": "#1_unit",
					"type": "unit",
					"value": unit
				}
			}
		/ unit:fluidOunce
			{
				return {
					"rule": "#2_unit",
					"type": "unit",
					"value": unit
				}
			}
		/ unit:gallon
			{
				return {
					"rule": "#3_unit",
					"type": "unit",
					"value": unit
				}
			}
		// careful on ordering these
		// 'lb' needs to come before 'l'
		// 'gm' needs to come before 'm'
		// 'ml' needs to come before 'm'
		/ unit:pound
			{
				return {
					"rule": "#4_unit",
					"type": "unit",
					"value": unit
				}
			}
		/ unit:gram
			{
				return {
					"rule": "#5_unit",
					"type": "unit",
					"value": unit
				}
			}
		/ unit:liter
			{
				return {
					"rule": "#6_unit",
					"type": "unit",
					"value": unit
				}
			}
		/ unit:meter
			{
				return {
					"rule": "#7_unit",
					"type": "unit",
					"value": unit
				}
			}
		/ unit:cup
			{
				return {
					"rule": "#8_unit",
					"type": "unit",
					"value": unit
				}
			}
		/ unit:inch
			{
				return {
					"rule": "#9_unit",
					"type": "unit",
					"value": unit
				}
			}
		/ unit:ounce
			{
				return {
					"rule": "#10_unit",
					"type": "unit",
					"value": unit
				}
			}
		/ unit:pint
			{
				return {
					"rule": "#11_unit",
					"type": "unit",
					"value": unit
				}
			}
		/ unit:quart
			{
				return {
					"rule": "#12_unit",
					"type": "unit",
					"value": unit
				}
			}
		/ unit:spoons
			{
				return {
					"rule": "#13_unit",
					"type": "unit",
					"value": unit
				}
			}


	/*----------  Volumes  ----------*/
	volume "Volume" =
		fluidOunce
		/ cup
		/ pint
		/ quart
		/ gallon
		/ liter
		/ spoons

	fluidOunce "Fluid Ounce" =
		$('fluid'i _* dashes* _* ounce) { return 'fl oz'; }
		/ $('fl'i '.'? _* dashes* _* ounce'.'?) { return 'fl oz'; }

	cup "Cup" =
		$('cup'i 's'i?) { return 'c'; }
		/ $('c'i '.'?) { return 'c'; }

	pint "Pint" =
		$('pint'i 's'i?) { return 'pt'; }
		/ $('pt'i '.'?) { return 'pt'; }

	quart "Quart" =
		$('quart'i 's'i?) { return 'qt'; }
		/ $('qt'i 's'i? '.'?) { return 'qt'; }

	gallon "Gallon" =
		$('gallon'i 's'i?) { return 'gal'; }
		/ $('gal'i 's'i? '.'?) { return 'gal'; }

	liter "Liter" =
		$('milliliter'i 's'i?) { return 'ml'; }
		/ $('millilitre'i 's'i?) { return 'ml'; }
		/ $('centiliter'i 's'i?) { return 'ml'; }
		/ $('centilitre'i 's'i?) { return 'ml'; }
		/ $('liter'i 's'i?) { return 'l'; }
		/ $('litre'i 's'i?) { return 'l'; }
		/ $('ltr'i 's'i?) { return 'l'; }
		/ $('cl'i 's'i? '.'?) { return 'cl'; }
		/ $('ml'i 's'i? '.'?) { return 'ml'; }
		/ $('lt'i 's'i? '.'?) { return 'l'; }
		/ $('l'i 's'i? '.'?) { return 'l'; }

	spoons "Tablespoon/Teaspoon" =
		$('tablespoon'i 's'i? 'ful'i?) { return 'tbsp'; }
		/ $('teaspoon'i 's'i?'ful'i?) { return 'tsp'; }
		/ $('tblsp'i 's'i? '.'?) { return 'tbsp'; }
		/ $('tbsp'i 's'i? '.'?) { return 'tbsp'; }
		/ $('tpsp'i 's'i? '.'?) { return 'tbsp'; }
		/ $('tsbp'i 's'i? '.'?) { return 'tbsp'; }
		/ $('tlb'i 's'i? '.'?) { return 'tbsp'; }
		/ $('tbl'i 's'i? '.'?) { return 'tbsp'; }
		/ $('tsp'i 's'i? '.'?) { return 'tsp'; }
		/ $('tb'i 's'i? '.'?) { return 'tbsp'; }
		/ $('T' 's'i? '.'?) { return 'tbsp'; }
		/ $('t' 's'i? '.'?) { return 'tsp'; }

	/*----------  Weights  ----------*/
	weight "Weight" =
		ounce
		/ pound
		/ gram

	ounce "Ounce" =
		$('wt'i '.'? _+ 'ounce'i 's'i?) { return 'oz'; }
		/ $('wt'i '.'? _+ 'oz'i 's'i? '.'?) { return 'oz'; }
		/ $('ounce'i 's'i?) { return 'oz'; }
		/ $('oz'i 's'i? '.'?) { return 'oz'; }

	pound "Pound" =
		$('pounds'i) { return 'lbs'; }
		/ $('pound'i) { return 'lb'; }
		/ $('lbs'i '.'?) { return 'lbs'; }
		/ $('lb'i '.'?) { return 'lb'; }

	gram "Gram" =
		$('milligram'i 's'i?) { return 'mg'; }
		/ $('kilogram'i 's'i?) { return 'kg'; }
		/ $('kilo'i 's'i?) { return 'kg'; }
		/ $('gram'i 's'i?) { return 'g'; }
		/ $('mg'i 's'i? '.'?) { return 'mg'; }
		/ $('kg'i 's'i? '.'?) { return 'kg'; }
		/ $('㎏' 's'i? '.'?) { return 'kg'; }
		/ $('gm'i 's'i? '.'?) { return 'g'; }
		/ $('gr'i 's'i? '.'?) { return 'g'; }
		/ $('g'i 's'i? '.'?) { return 'g'; }

	/*----------  Lengths  ----------*/
	length "Length" =
		meter
		/ inch
		/ foot

	foot "Foot" =
		$('feet'i) { return 'ft'; }
		/ $('foot'i) { return 'ft'; }
		/ $('ft'i) { return 'ft'; }
		/ $(['`´‘’]) { return 'ft'; }

	meter "Meter" =
		$('millimeter'i 's'i?) { return 'mm'; }
		/ $('milimeter'i 's'i?) { return 'mm'; }
		/ $('centimeter'i 's'i?) { return 'cm'; }
		/ $('meter'i 's'i?) { return 'm'; }
		/ $('mm'i 's'i? '.'?) { return 'mm'; }
		/ $('cm'i 's'i? '.'?) { return 'cm'; }
		/ $('m'i 's'i? '.'?) { return 'm'; }

	inch "Inch" =
		$('inch'i 'es'i?) { return 'in'; }
		/ $('in'i 's'i? '.'?) { return 'in'; }
		/ $(["“”]) { return 'in'; }

/*=====  End of Unit Rules  ======*/



/*========================================
=            Ingredient Rules            =
========================================*/

	// comma separated lists of ingredients are accepted, but have a minimum requirement of 3 ingredients
	// this allows us to still use commas as comment indicators (e.g. 'apple, optional')
	ingredients "Ingredients" =
		// apple and peach and pear
		// apple, pear, and peach
		// apple, pear, peach
		first:ingredientListExpression second:ingredientListExpression tail:ingredientListExpression+
			{
				const rule = "#1_ingredients";

				let values = formatExpressionValues([], first.values, rule);
				values = formatExpressionValues(values, second.values, rule);
				tail.forEach(t => {
					values = formatExpressionValues(values, t.values, rule);
				})

				return {
					rule,
					type: 'ingredient',
					values
				};
			}

		// fresh apple and grated pear
		// half-and-half or fresh cream
		/ head:ingredientExpression tail:conjunctedIngredientExpression
			{
				const rule = "#2_ingredients";

				let values = formatExpressionValues([], head.values, rule);
				values = formatExpressionValues(values, tail.values, rule);

				return {
					rule,
					type: 'ingredient',
					values
				};
			}

		// (A) fresh fresh (B) apple
		/ ing:ingredientExpression
			{
				const rule = "#3_ingredients";

				let values = formatExpressionValues([], ing.values, rule);

				return {
					rule,
					type: 'ingredient',
					values
				};
			}

	// an ingredient expression describes a SINGLE ingredient
	// this may include several parenthetical comments and descriptors to describe this ingredient
	ingredientExpression "Ingredient Expression" =
		// (A) apple
		c0:leadingParentheticalComment*
		ing:ingredient
			{
				const rule = "#1_ingredientExpression";

				let values = formatExpressionValues([], c0, rule);
				values = formatExpressionValues(values, [ ing ], rule);

				return {
					rule,
					type: 'ingredient',
					values
				};
			}

		// (A) fresh (B) apple
		/ c0:leadingParentheticalComment*
			desc:descriptors _*
			c1:parentheticalComment*
			ing:ingredient
			{
				const rule = "#2_ingredientExpression";

				let values = formatExpressionValues([], c0, rule);
				values = formatExpressionValues(values, desc.values, rule);
				values = formatExpressionValues(values, c1, rule);
				values = formatExpressionValues(values, [ ing ], rule);

				return {
					rule,
					type: 'ingredient',
					values
				};
			}

	// a unit to build a list of ingredient expressions using commas and/or separators
	ingredientListExpression "Ingredient List Expression" =
		// , and freshly cut apple
		// or cream
		$( _* ',' _*)* sep:separatorExpression _+ exp:ingredientExpression
			{
				const rule = "#1_ingredientListExpression";
				let values = formatExpressionValues([], sep, rule);
				values = formatExpressionValues(values, exp.values, rule);
				values = values.filter(v => v.value);

				return {
					rule,
					type: "ingredient",
					values
				};
			}

			// , peach
      / $( _* ',' _*)* _* exp:ingredientExpression
			{
				const rule = "#2_ingredientListExpression";
				let values = formatExpressionValues([], exp.values, rule);
				values = values.filter(v => v.value);

				return {
					rule,
					type: "ingredient",
					values
				};
			}

	// a unit to end an ingredient list with a conjuncted ingredient expression
	conjunctedIngredientExpression "Conjuncted Ingredient Expression" =
		// and fresh parsley
		_* sep:separator _* exp:ingredientExpression
			{
				const rule = "#1_conjunctedIngredientExpression";
				let values = formatExpressionValues([], [ sep ], rule);
				values = formatExpressionValues(values, exp.values, rule);

				return {
					rule,
					type: "ingredient",
					values
				};
			}

	// ! TODO - ingredient needs to handle embedded comments on its own
	// an ingredient is a collections of ingredient words taken as a whole ("mango hot sauce")
	// dashes are allowed inbetween ingredient words ("half-and-half")
	// quotes are allowed inbetween ingredient words ("bailey's liquor")
	// quotes are allow to encompass groups of ingredient words in any location (green "meiji" chocolate)
	ingredient "Ingredient" =
		// peach-pear-pie
		// ! TODO - half-and-half, does this have to be an ingredient keyword expression?
		head:$(viableIngredient !_ dashes+ !_) tail:$(!_ dashes* !_ ing:viableIngredient)+
			{
				return {
					rule: "#1_ingredient",
					type: "ingredient",
					value: head.toLowerCase() + tail.toLowerCase()
				};
			}

		// bailey's liquor, ginger-garlic paste, confectioners' sugar
		// green "meiji" chocolate, green "meiji" chocolate, "meiji" green chocolate
		/ head:$(quotes* viableIngredient quotes*) tail:$(_* quotes* ing:viableIngredient quotes*)*
			{
				return {
					rule: "#2_ingredient",
					type: "ingredient",
					value: head.toLowerCase() + tail.toLowerCase()
				};
			}

	viableIngredient "Viable Ingredient" =
		ingredientTerm / ingredientException

	// these are stand-alone words that may comprise part of an ingredient ("apple", "melon", "cane")
	// these cannot start with any kind of special characer or digit (ie: *apple, 1apple)
	// internal dashes are allowed ("ginger-garlic")
	// ingredientKeywords override any exclusions ("hot sauce")
	// partial exclusions are allowed ("cane"), but stand-alone instances that are not listed as exceptions are not ("can")
	ingredientTerm "Ingredient Term" =
		// allow stand-alone and initial matches on ingredient keywords
		// NOTE: these may match reservedKeywords independently
		// cloves, dry rub, hot-sauce
		!dashes !slashes ing:$(ingredientKeyword $(letter)*)
		& { return lookupDescriptor(ing); }
			{
				return {
					rule: "#1_ingredientTerm",
					type: "ingredient",
					value: ing.toLowerCase()
				};
			}

		// allow words that contain an excluded word to have inner dashes
		// cane-sugar, ginger-garlic
		/ !dashes !slashes res:$(reservedKeywords) head:$(letter)+ d:$(dashes)* tail:$(letter)+
			& { return lookupDescriptor(res + head); }
     	& { return lookupDescriptor(tail); }
        {
         	let value = res.toLowerCase();
          value += head.toLowerCase();
          value += (d) ? `-${tail.toLowerCase()}` : tail.toLowerCase();

					return {
						rule: "#2_ingredientTerm",
						type: "ingredient",
						value
					};
				}

		// allows words that don't start with an excluded word to have inner dashes
		// ama-koji, ya-cai
		// make sure that the segements around the dashes aren't descriptors
		/ !dashes !slashes !reservedKeywords head:$(letter)+ d:$(dashes)* tail:$(letter)+
	 		& { return lookupDescriptor(head); }
      & { return lookupDescriptor(tail); }
	      {
	        let value = head.toLowerCase();
					value += (d) ? `-${tail.toLowerCase()}` : tail.toLowerCase();

					return {
						rule: "#3_ingredientTerm",
						type: "ingredient",
						value
					};
				}

		// if the word starts with an excluded word, additional letters MUST follow
		// ensure that our entire ingredient term isn't a descriptor ('toasted' vs 'cane')
		// cane, ginger, melon
		/ !dashes !slashes ing:$(reservedKeywords+ $(letter)+)
      // ensure that our entire ingredient term isn't a descriptor
      & { return lookupDescriptor(ing); }
      {
				return {
					rule: "#4_ingredientTerm",
					type: "ingredient",
					value: ing.toLowerCase()
				};
			}

		// not totally sure why the above rule doesn't handle this but oh well
		// mint
		/ !dashes !slashes ing:$(reservedKeywords $(letter)+)
      // ensure that our entire ingredient term isn't a descriptor
      & { return lookupDescriptor(ing); }
      {
				return {
					rule: "#5_ingredientTerm",
					type: "ingredient",
					value: ing.toLowerCase()
				};
			}

		// allow any letters that don't start with any excluded words
		// apple, pear, soba
		/ !dashes !slashes !reservedKeywords ing:$(letter)+
			{
				return {
					rule: "#6_ingredientTerm",
					type: "ingredient",
					value: ing.toLowerCase()
				};
			}

/*=====  End of Ingredient Rules  ======*/



/*=====================================
=            Comment Rules            =
=====================================*/

	// optional spaces
	parentheticalComment "Parenthetical Comment" =
		// ( ... ), [ ,,, ], { ;;; }
		_* opening:parenthesisIndicator txt:$(parentheticalCommentChar)+ closing:parenthesisIndicator _*
		{
			return {
				rule: '#1_parentheticalComment',
				type: 'comment',
				value: opening + txt.trim().toLowerCase() + closing
			};
		}

	// requires a trailing space
	leadingParentheticalComment "Parenthetical Comment" =
		// ( ... ), [ ,,, ], { ;;; }
		opening:parenthesisIndicator txt:$(parentheticalCommentChar)+ closing:parenthesisIndicator _+
		{
			return {
				rule: '#1_leadingParentheticalComment',
				type: 'comment',
				value: opening + txt.trim().toLowerCase() + closing
			};
		}

	comments "Comments" =
		com:$(commentChar*)
		{
			return {
				rule: '#1_comment',
				type: 'comment',
				value: com
			};
		}

/*=====  End of Comment Rules  ======*/