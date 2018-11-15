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
	//START_VARIABLE
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
quantities "Quantities" =
	// "[1 cup/][250 ml/][34 g ]"
	head:quantityExpression+ tail:quantity_*  // !TODO - this optional makes me nervous because it seems like you could end with no space
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
	qty:quantity ','? _* sep:amountSeparator _*
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
		'fat'i / 'juice'i / 'zest'i

	// since these are partial matches on an ingredient, plurals are generally not needed ('sweet potato' will catch 'sweet potatoes')
	ingredientKeyword "Ingredient Keyword" =
	// allow percentages in ingredients 
		$(digit+ '%')
		/ $('liquid'i _* dashes* _*'smoke'i)
		/ $("hot"i _* dashes* "sauce"i)
		/ $("half"i _* dashes* separator? dashes* "half"i)
		/ $("sweet"i _* dashes* "potato"i)
		/ $("dry"i _* dashes* "rub"i)
		/ "onion"i
		/ "clove"i / "S&B"i / "egg"i

	// plurals required
	amountKeyword "Amount Keyword" =
		"several"i / "dozen"i / "half"i / "ten"i / "few"i

	// plurals required
	unitKeyword "Unit Keyword" =
		"zest"i / "sachet"i / "kernels"i / "handful"i / "seeds"i / "juice"i / "pieces"i / "piece"i / "knob"i / "cloves"i / "clove"i / "pots"i / "pot"i /  "cans"i / "can"i

	descriptorKeyword "Descriptor Keyword" =
	  "pared"i /"liquid"i / "hard"i / "organic"i / "jumbo"i / "stemmed"i / "boneless"i / "toasted"i /  "heaping"i / "medium"i / "freshly"i / "grated"i / "salted"i / "center"i / "large"i / "fresh"i / "sweet"i / "from"i / "baby"i / "cut"i / "fat"i / "dry"i / "hot"i / "bi"i / "of"i / "to"i / "on"i / "in"i / 'un'i / 'a'i / "i"i / "~"


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