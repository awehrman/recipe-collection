// compile me in the cmd prompt:
// pegjs -O speed lib/ingredientLineParser.pegjs

// for codepen:
// pegjs --format globals -e Parser -O size ingredientLineParser.pegjs

/*
  list = list.map(str => {
		const split = str.split(/[ -]+/);
		if (split.length === 2) {
			return [
				`${split[0]} ${split[1]}`,
				`${split[0]}-${split[1]}`,
				`${split[0]}${split[1]}`,
				];
	    }
		return [ str ];
	});
	list = [ ...new Set(list.flat()) ];
	list.sort(function(a, b) { return b.length - a.length || b.localeCompare(a) });
	copy(list);

*/

{
	var formatFillerExpression = function(symbols0, words, symbols1) {
		var filler = "";
		if (symbols0 && symbols0.length > 0) {
			filler += symbols0;
		}
		if (words && words.length > 0) {
			filler += words;
		}
		if (symbols1 && symbols1.length > 0) {
			filler += symbols1;
		}

		return filler.toLowerCase().split(',').join('');
	}
}

start =
  ingredientLines


/*==================================
=            Base Rules            =
==================================*/
	_ "Whitespace" =
		[ \t\n\r\x20] { return ' '; }

	dashes "Dashes" =
		[-_~] { return '-'; }
		/ [‐‑‒–—] { return '-'; } // unicode options

	slashes "Slashes" =
		[/\⁄|] { return '\/'; }

	quotes "Quotes" =
		["'`´‘’“”] { return '\''; }

	letter "Letter" =
		[a-z]i
		// accept all other un
		/ !digit !dashes !_ !slashes ![,.;:] !fillerPunctuation !containerIndicator !symbolSeparator char:.
			{ return char; }

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
		'½' { return '1/2'; } / '⅓' { return '1/3'; } / '⅔' { return '2/3'; } / '¼' { return '1/4'; } / '¾' { return '3/4'; } / '⅕' { return '1/5'; } / '⅖' { return '2/5'; } / '⅗' { return '3/5'; } / '⅘' { return '4/5'; } / '⅙' { return '1/6'; } / '⅚' { return '5/6'; } / '⅛' { return '1/8'; } / '⅜' { return '3/8'; } / '⅝' { return '5/8'; } / '⅞' { return '7/8'; }

	fraction "Fraction" =
		numerator:digit+ _* slashes+ _* denominator:digit+
			{ return numerator + '/' + denominator; }

	float "Float" =
		// i think its a british thing to use commas, but i see a lot of 1,5 kg
		head:digit* [.,] tail:digit+
			{ return head + '.' + tail; }


	/*----------  Indicators & Separators  ----------*/
	separator "Separator" =
		symbolSeparator
		/ sep:wordSeparator
			{ return sep.toLowerCase(); }

	amountSeparator "Amount Separator" =
		wordSeparator / 'plus'i / 'to'i / 'x'i / 'x' / '×' / '+'

	symbolSeparator "Ingredient Separator" =
	  [&+/]

	wordSeparator "Word Separator" =
	  'and'i  / 'or'i

	quantitySeparator "Quantity Separator" =
	  'plus'i / amountSeparator / dashes / symbolSeparator / '+'

	ingSeparator "Ingredient Separator" =
		slashes / separator

	containerIndicator "Container Indicators" =
	  '(' { return '('; }
	  / '{' { return '('; }
	  / '[' { return '('; }
	  / ')' { return ')'; }
	  / '}' { return ')'; }
	  / ']' { return ')'; }


	/*----------  Keywords  ----------*/
	fillerKeyword "Ignored" =
		"segments and juice of"i / "Zest and juice from"i / "juice and zest from"i / "Zest and juice of"i / "juice and zest of"i / "more to adjust"i / "for-garnishing"i / "for garnishing"i / "forgarnishing"i / "for-drizzling"i / "for drizzling"i / "assortment-of"i / "assortment of"i / "approximately"i / "if-necessary"i / "if-available"i / "if necessary"i / "if available"i / "fordrizzling"i / "assortmentof"i / "as-necessary"i / "as per taste"i / "as necessary"i / "ifnecessary"i / "ifavailable"i / "combination"i / "asnecessary"i / "as-required"i / "as required"i / "any kind of"i / "variety-of"i / "variety of"i / "seeds-from"i / "seeds from"i / "mixture-of"i / "mixture of"i / "just-under"i / "just under"i / "juice-from"i / "juice from"i / "if-desired"i / "if desired"i / "equivalent"i / "asrequired"i / "as-garnish"i / "as garnish"i / "additional"i / "zest-from"i / "zest from"i / "varietyof"i / "seedsfrom"i / "per-taste"i / "per taste"i / "peel-from"i / "peel from"i / "mixtureof"i / "leave-out"i / "leave out"i / "justunder"i / "just-over"i / "just over"i / "juicefrom"i / "ifdesired"i / "garnishes"i / "garnished"i / "asgarnish"i / "as-needed"i / "as needed"i / "zestfrom"i / "use-your"i / "use your"i / "toppings"i / "to-taste"i / "to taste"i / "Seeds-of"i / "Seeds of"i / "see-note"i / "see note"i / "pertaste"i / "peelfrom"i / "optional"i / "leaveout"i / "justover"i / "juice-of"i / "juice of"i / "at-least"i / "at least"i / "asneeded"i / "zest-of"i / "zest of"i / "without"i / "useyour"i / "totaste"i / "seenote"i / "Seedsof"i / "peel-of"i / "peel of"i / "juiceof"i / "garnish"i / "atleast"i / "as-much"i / "as much"i / "another"i / "zestof"i / "peelof"i / "on-the"i / "on the"i / "mix-of"i / "mix of"i / "if-you"i / "if you"i / "i-used"i / "i-like"i / "i used"i / "i like"i / "enough"i / "either"i / "before"i / "asmuch"i / "around"i / "approx"i / "worth"i / "up-to"i / "up to"i / "their"i / "scant"i / "other"i / "or-so"i / "or so"i / "onthe"i / "mixof"i / "minus"i / "iused"i / "ilike"i / "ifyou"i / "about"i / "your"i / "with"i / "upto"i / "that"i / "such"i / "plus"i / "over"i / "orso"i / "more"i / "like"i / "less"i / "into"i / "i.e."i / "from"i / "each"i / "e.g."i / "the"i / "per"i / "for"i / "few"i / "bit"i / "to"i / "of"i / "my"i / "ie"i / "eg"i / "ea"i / "at"i / "an"i / "a"i / "~"

	amountKeyword "Amount Keyword" =
		"equal-amounts"i / "equal amounts"i / "equalamounts"i / "equal-amount"i / "equal amount"i / "equalamount"i / "equal-parts"i / "equal parts"i / "equalparts"i / "seventeen"i / "thirteen"i / "quarter-"i / "quarter "i / "numerous"i / "nineteen"i / "fourteen"i / "eighteen"i / "a-couple"i / "a couple"i / "sixteen"i / "several"i / "seventy"i / "quarter"i / "hundred"i / "fifteen"i / "amounts"i / "acouple"i / "twenty"i / "twelve"i / "thirty"i / "single"i / "ninety"i / "eleven"i / "eighty"i / "couple"i / "amount"i / "three"i / "third"i / "sixty"i / "sixth"i / "seven"i / "forty"i / "fifty"i / "eight"i / "dozen"i / "ten-"i / "ten "i / "some"i / "nine"i / "half"i / "four"i / "five"i / "two"i / "ten"i / "six"i / "one"i

	descriptorKeyword "Descriptor Keyword" =
		"titanium-strength"i / "titanium strength"i / "preservative-free"i / "preservative free"i / "titaniumstrength"i / "room-temperature"i / "room temperature"i / "preservativefree"i / "non-hydrogenated"i / "non hydrogenated"i / "roomtemperature"i / "nonhydrogenated"i / "neutral-tasting"i / "neutral tasting"i / "dutch-processed"i / "dutch processed"i / "cylinder-shaped"i / "cylinder shaped"i / "butcher-quality"i / "butcher quality"i / "well-fermented"i / "well fermented"i / "sandiwch-style"i / "sandiwch style"i / "reduced-sodium"i / "reduced sodium"i / "postcard-sized"i / "postcard sized"i / "pasture-raised"i / "pasture raised"i / "neutraltasting"i / "medium-grained"i / "medium grained"i / "extra-strength"i / "extra strength"i / "dutchprocessed"i / "cylindershaped"i / "butcherquality"i / "aluminium-free"i / "aluminium free"i / "wellfermented"i / "well-seasoned"i / "well seasoned"i / "vacuum-packed"i / "vacuum packed"i / "traditionally"i / "Thinly-peeled"i / "Thinly peeled"i / "smoking-point"i / "smoking point"i / "short-grained"i / "short grained"i / "shallow-fried"i / "shallow fried"i / "sashimi-grade"i / "sashimi grade"i / "sandiwchstyle"i / "reducedsodium"i / "reconstituted"i / "ready-roasted"i / "Ready to cook"i / "ready roasted"i / "postcardsized"i / "postcard-size"i / "postcard size"i / "pastureraised"i / "no-salt-added"i / "no salt added"i / "multi-colored"i / "multi colored"i / "mediumgrained"i / "medium-bodied"i / "medium bodied"i / "gold-strength"i / "gold strength"i / "firm but ripe"i / "finely-grated"i / "finely grated"i / "extrastrength"i / "double-acting"i / "double acting"i / "country-style"i / "country style"i / "average-sized"i / "average sized"i / "approximately"i / "aluminiumfree"i / "wellseasoned"i / "well-marbled"i / "well-chopped"i / "well marbled"i / "well chopped"i / "vine-ripened"i / "vine ripened"i / "vacuumpacked"i / "Thinlypeeled"i / "store-bought"i / "store bought"i / "stone-ground"i / "stone ground"i / "smokingpoint"i / "shortgrained"i / "shallowfried"i / "sashimigrade"i / "refrigerated"i / "readyroasted"i / "ready-to-eat"i / "ready-rolled"i / "ready-cooked"i / "ready to eat"i / "ready rolled"i / "ready cooked"i / "postcardsize"i / "off the bone"i / "non-bleached"i / "non bleached"i / "nitrate-free"i / "nitrate free"i / "multicolored"i / "mixed-colour"i / "mixed colour"i / "micro-planed"i / "micro planed"i / "mediumbodied"i / "medium-sized"i / "medium-large"i / "medium-grind"i / "medium-grain"i / "medium sized"i / "medium large"i / "medium grind"i / "medium grain"i / "lower-sodium"i / "lower sodium"i / "low-moisture"i / "low moisture"i / "high-quality"i / "high quality"i / "hand-chopped"i / "hand chopped"i / "good-quality"i / "good quality"i / "goldstrength"i / "freeze-dried"i / "freeze dried"i / "firm-fleshed"i / "firm fleshed"i / "fire-roasted"i / "fire roasted"i / "finelygrated"i / "extra-virgin"i / "extra virgin"i / "doubleacting"i / "double-thick"i / "double thick"i / "countrystyle"i / "concentrated"i / "cold-pressed"i / "cold pressed"i / "char-grilled"i / "char grilled"i / "broad-leaved"i / "broad leaved"i / "bitter-sweet"i / "bitter sweet"i / "best-quality"i / "best quality"i / "averagesized"i / "average-size"i / "average size"i / "whole-grain"i / "whole grain"i / "wellmarbled"i / "wellchopped"i / "well-shaken"i / "well-coated"i / "well shaken"i / "well coated"i / "vineripened"i / "unsweetened"i / "unflavoured"i / "tri-colored"i / "tri colored"i / "traditional"i / "thumb-sized"i / "thumb sized"i / "tender-stem"i / "tender stem"i / "sustainably"i / "sustainable"i / "sushi-grade"i / "sushi grade"i / "storebought"i / "stoneground"i / "soft-boiled"i / "soft boiled"i / "smoke-point"i / "smoke point"i / "small-sized"i / "small sized"i / "slow-cooked"i / "slow cooked"i / "short-grain"i / "short-crust"i / "short grain"i / "short crust"i / "shop-bought"i / "shop bought"i / "rectangular"i / "recommended"i / "readyrolled"i / "readycooked"i / "pencil-thin"i / "pencil-size"i / "pencil thin"i / "pencil size"i / "pasteurized"i / "pan-braised"i / "pan braised"i / "nonbleached"i / "nitratefree"i / "multi-color"i / "multi color"i / "mixedcolour"i / "mixed-color"i / "mixed color"i / "middle-size"i / "middle size"i / "microplaned"i / "mediumsized"i / "mediumlarge"i / "mediumgrind"i / "mediumgrain"i / "medium-size"i / "medium-rare"i / "medium size"i / "medium rare"i / "lowmoisture"i / "lowersodium"i / "less-sodium"i / "less sodium"i / "large-sized"i / "large sized"i / "just-cooked"i / "just-boiled"i / "just cooked"i / "just boiled"i / "immediately"i / "highquality"i / "high-gluten"i / "high gluten"i / "hard-boiled"i / "hard boiled"i / "handchopped"i / "hand-pulled"i / "hand pulled"i / "goodquality"i / "gluten-free"i / "gluten free"i / "full-bodied"i / "full bodied"i / "freezedried"i / "flavourless"i / "firmfleshed"i / "fireroasted"i / "fast-action"i / "fast action"i / "extravirgin"i / "doublethick"i / "disc-shaped"i / "disc shaped"i / "de-hydrated"i / "de hydrated"i / "coldpressed"i / "chargrilled"i / "butterflied"i / "broadleaved"i / "blind-baked"i / "blind baked"i / "bittersweet"i / "bestquality"i / "barrel-aged"i / "barrel aged"i / "averagesize"i / "all-natural"i / "all natural"i / "air-chilled"i / "air chilled"i / "wholegrain"i / "wellshaken"i / "wellcoated"i / "vine-ripen"i / "vine ripen"i / "vegetarian"i / "unsulpured"i / "unsulfured"i / "unseasoned"i / "unprepared"i / "unflavored"i / "unfiltered"i / "under-ripe"i / "under ripe"i / "unbleached"i / "un-shelled"i / "un shelled"i / "tricolored"i / "thumbsized"i / "thumb-size"i / "thumb size"i / "thoroughly"i / "tenderstem"i / "sushigrade"i / "super-fine"i / "super fine"i / "sunny-side"i / "sunny side"i / "stir-fried"i / "stir fried"i / "spiralized"i / "spiralised"i / "solidified"i / "softboiled"i / "smokepoint"i / "smokehouse"i / "smallsized"i / "small-size"i / "small size"i / "slowcooked"i / "shortgrain"i / "shortcrust"i / "shopbought"i / "semi-sweet"i / "semi-dried"i / "semi sweet"i / "semi dried"i / "rehydrated"i / "ready-made"i / "ready made"i / "rapid-rise"i / "rapid rise"i / "pulverized"i / "previously"i / "preferably"i / "pre-rolled"i / "pre-cooked"i / "pre rolled"i / "pre cooked"i / "pencilthin"i / "pencilsize"i / "par-boiled"i / "par boiled"i / "panbraised"i / "oven-ready"i / "oven ready"i / "on the cob"i / "new-season"i / "new season"i / "multicolor"i / "mixedcolor"i / "middlesize"i / "mediumsize"i / "mediumrare"i / "low-starch"i / "low-sodium"i / "low-gluten"i / "low starch"i / "low sodium"i / "low gluten"i / "loose-leaf"i / "loose leaf"i / "long-grain"i / "long grain"i / "lesssodium"i / "lengthwise"i / "largesized"i / "large-size"i / "large size"i / "justcooked"i / "justboiled"i / "individual"i / "house-made"i / "house made"i / "highgluten"i / "high-grade"i / "high grade"i / "hardboiled"i / "handpulled"i / "half-moons"i / "half moons"i / "granulated"i / "good-sized"i / "good sized"i / "glutenfree"i / "generously"i / "gelatinous"i / "fullbodied"i / "full-cream"i / "full cream"i / "free-range"i / "free range"i / "food-grade"i / "food grade"i / "flavourful"i / "flavorless"i / "fine-grind"i / "fine-grain"i / "fine grind"i / "fine grain"i / "fastaction"i / "double-cut"i / "double cut"i / "discshaped"i / "diagonally"i / "dessicated"i / "desiccated"i / "deli-style"i / "deli style"i / "dehydrated"i / "decorative"i / "de-stemmed"i / "de stemmed"i / "dairy-free"i / "dairy free"i / "completely"i / "centre-cut"i / "centre cut"i / "center-cut"i / "center cut"i / "blindbaked"i / "bite-sized"i / "bite sized"i / "bi-colored"i / "bi colored"i / "barrelaged"i / "allnatural"i / "airchilled"i / "wholemeal"i / "vineripen"i / "vine-ripe"i / "vine ripe"i / "untrimmed"i / "untreated"i / "untoasted"i / "unsprayed"i / "unskinned"i / "unshelled"i / "unroasted"i / "unripened"i / "unrefined"i / "underripe"i / "un-podded"i / "un podded"i / "top-split"i / "top split"i / "thumbsize"i / "thickness"i / "thickened"i / "thick-cut"i / "thick cut"i / "sweetened"i / "superfine"i / "sunnyside"i / "stirfried"i / "sprinkled"i / "split-top"i / "split top"i / "sometimes"i / "smallsize"i / "separated"i / "semisweet"i / "semidried"i / "semi-firm"i / "semi firm"i / "segmented"i / "scrambled"i / "scattered"i / "salt-free"i / "salt free"i / "room-temp"i / "room temp"i / "readymade"i / "re-heated"i / "re heated"i / "rapidrise"i / "quartered"i / "purchased"i / "processed"i / "prerolled"i / "preferred"i / "precooked"i / "pre-baked"i / "pre baked"i / "powedered"i / "pith-free"i / "pith free"i / "pin-boned"i / "pin boned"i / "parboiled"i / "over-easy"i / "over easy"i / "ovenready"i / "non-stick"i / "non stick"i / "newseason"i / "neutrally"i / "naturally"i / "miniature"i / "marinated"i / "macerated"i / "luke-warm"i / "luke warm"i / "lowstarch"i / "lowsodium"i / "lowgluten"i / "looseleaf"i / "longgrain"i / "less-than"i / "less than"i / "left-over"i / "left over"i / "largesize"i / "just-ripe"i / "just ripe"i / "julienned"i / "instantly"i / "imitation"i / "if-needed"i / "if needed"i / "housemade"i / "home-made"i / "home made"i / "highgrade"i / "high-heat"i / "high heat"i / "hand-size"i / "hand size"i / "halfmoons"i / "half-ripe"i / "half-moon"i / "half ripe"i / "half moon"i / "ground-up"i / "ground up"i / "grass-fed"i / "grass fed"i / "grain-fed"i / "grain fed"i / "goodsized"i / "good-size"i / "good size"i / "generally"i / "fullcream"i / "freerange"i / "foodgrade"i / "flavoured"i / "flavorful"i / "flat-leaf"i / "flat leaf"i / "finishing"i / "finegrind"i / "finegrain"i / "fermented"i / "favourite"i / "fashioned"i / "extremely"i / "excellent"i / "elongated"i / "dry-cured"i / "dry cured"i / "doublecut"i / "distilled"i / "dissolved"i / "discarded"i / "destemmed"i / "deshelled"i / "delistyle"i / "defrosted"i / "decorated"i / "de-seeded"i / "de-scaled"i / "de seeded"i / "de scaled"i / "dairyfree"i / "crustless"i / "cross-cut"i / "cross cut"i / "congealed"i / "condensed"i / "centrecut"i / "centercut"i / "cage-free"i / "cage free"i / "bitesized"i / "bite-size"i / "bite size"i / "bicolored"i / "authentic"i / "artisanal"i / "air-dried"i / "air dried"i / "activated"i / "vineripe"i / "unsmoked"i / "unsalted"i / "unpodded"i / "unpitted"i / "unpeeled"i / "unhulled"i / "uncooked"i / "topsplit"i / "thickcut"i / "tempered"i / "suitable"i / "strongly"i / "stripped"i / "strained"i / "standard"i / "squeezed"i / "splittop"i / "softened"i / "smoothed"i / "smallish"i / "smallest"i / "slivered"i / "slightly"i / "skinless"i / "skin-off"i / "skin off"i / "sizzling"i / "simmered"i / "shredded"i / "shell-on"i / "shell on"i / "semifirm"i / "seedless"i / "seasoned"i / "seasonal"i / "scrubbed"i / "saltfree"i / "roomtemp"i / "ripe-but"i / "ripe but"i / "rindless"i / "ribboned"i / "reserved"i / "rendered"i / "reheated"i / "purified"i / "prepared"i / "prebaked"i / "pre-made"i / "pre made"i / "pithfree"i / "pinboned"i / "pastured"i / "packaged"i / "overeasy"i / "original"i / "ordinary"i / "nonstick"i / "non-waxy"i / "non waxy"i / "no-knead"i / "no knead"i / "lukewarm"i / "low-salt"i / "low salt"i / "lessthan"i / "leftover"i / "justripe"i / "inserted"i / "imported"i / "ifneeded"i / "ice-cold"i / "ice cold"i / "homemade"i / "highheat"i / "headless"i / "handsize"i / "hand-cut"i / "hand cut"i / "halfripe"i / "halfmoon"i / "half-fat"i / "half fat"i / "groundup"i / "grounded"i / "grassfed"i / "grainfed"i / "goodsize"i / "generous"i / "garlicky"i / "full-fat"i / "full fat"i / "frenched"i / "fragrant"i / "flavored"i / "flatleaf"i / "filtered"i / "favorite"i / "fattiest"i / "fat-less"i / "fat-free"i / "fat less"i / "fat free"i / "enriched"i / "drycured"i / "dry-aged"i / "dry aged"i / "deveined"i / "deseeded"i / "descaled"i / "delicate"i / "de-boned"i / "de boned"i / "cultured"i / "crumpled"i / "crumbled"i / "crosscut"i / "corn-fed"i / "corn fed"i / "coloured"i / "colorful"i / "coarsely"i / "circular"i / "chrunchy"i / "cagefree"i / "buttered"i / "boneless"i / "bone-out"i / "bone out"i / "bleached"i / "blanched"i / "bitesize"i / "bi-color"i / "bi color"i / "assorted"i / "arranged"i / "aromatic"i / "airdried"i / "actually"i / "x-large"i / "x large"i / "whisked"i / "whacked"i / "unwaxed"i / "uncured"i / "unbaked"i / "trussed"i / "trimmed"i / "torn-up"i / "torn up"i / "toasted"i / "tightly"i / "thickly"i / "tex-mex"i / "tex mex"i / "streaky"i / "stirred"i / "stemmed"i / "steeped"i / "steamed"i / "spelled"i / "special"i / "sourced"i / "snipped"i / "smeared"i / "smashed"i / "smaller"i / "slender"i / "skinoff"i / "skinned"i / "skin-on"i / "skin on"i / "skimmed"i / "similar"i / "shellon"i / "shelled"i / "scraped"i / "scooped"i / "savoury"i / "sautéed"i / "sauteed"i / "rounded"i / "roughly"i / "roasted"i / "ripened"i / "ripebut"i / "reserve"i / "removed"i / "regular"i / "refried"i / "refined"i / "reduced"i / "quality"i / "proofed"i / "pricked"i / "pressed"i / "premium"i / "premade"i / "pre-cut"i / "pre cut"i / "powdery"i / "pounded"i / "poached"i / "pickled"i / "peppery"i / "organic"i / "nonwaxy"i / "non-GMO"i / "non-fat"i / "non GMO"i / "non fat"i / "noknead"i / "no-salt"i / "no-boil"i / "no salt"i / "no boil"i / "neutral"i / "natural"i / "mid-cut"i / "mid cut"i / "matured"i / "lowsalt"i / "low-fat"i / "low fat"i / "loosely"i / "lightly"i / "liberal"i / "leanest"i / "largely"i / "kneaded"i / "instant"i / "ideally"i / "icecold"i / "heaping"i / "head-on"i / "head on"i / "handcut"i / "halffat"i / "grilled"i / "gourmet"i / "fullfat"i / "freshly"i / "fattier"i / "fatless"i / "fatfree"i / "exactly"i / "dryaged"i / "dressed"i / "drained"i / "divided"i / "diluted"i / "desired"i / "denuded"i / "deboned"i / "day-old"i / "day old"i / "crushed"i / "crunchy"i / "crumbly"i / "crisped"i / "cracked"i / "covered"i / "cornfed"i / "cooking"i / "cleaned"i / "classic"i / "citrusy"i / "chopped"i / "chilled"i / "checked"i / "charred"i / "candied"i / "buttery"i / "burning"i / "brushed"i / "browned"i / "braised"i / "bottled"i / "boneout"i / "bone-in"i / "bone in"i / "boiling"i / "blended"i / "bicolor"i / "artisan"i / "zested"i / "xlarge"i / "wilted"i / "whole-"i / "whole "i / "watery"i / "washed"i / "warmed"i / "virgin"i / "unripe"i / "tornup"i / "topped"i / "tinned"i / "thinly"i / "thawed"i / "texmex"i / "tender"i / "tasted"i / "syrupy"i / "sturdy"i / "strong"i / "stoned"i / "sticky"i / "stewed"i / "spongy"i / "soured"i / "softly"i / "soaked"i / "smooth"i / "smoked"i / "sliced"i / "skinon"i / "skinny"i / "simple"i / "sifted"i / "sieved"i / "shaved"i / "shaped"i / "served"i / "seeded"i / "season"i / "seared"i / "scored"i / "salted"i / "rubbed"i / "rolled"i / "robust"i / "rising"i / "ripped"i / "ripest"i / "rinsed"i / "ridged"i / "really"i / "puréed"i / "pureed"i / "pulsed"i / "pulled"i / "precut"i / "poured"i / "podded"i / "plenty"i / "placed"i / "pitted"i / "picked"i / "petite"i / "peeled"i / "patted"i / "packed"i / "opened"i / "nosalt"i / "nonGMO"i / "nonfat"i / "noboil"i / "no-fat"i / "no fat"i / "needed"i / "native"i / "narrow"i / "minced"i / "milled"i / "mildly"i / "midcut"i / "melted"i / "medium"i / "mature"i / "mashed"i / "lowfat"i / "living"i / "little"i / "liquid"i / "leaner"i / "larger"i / "juiced"i / "jarred"i / "husked"i / "hulled"i / "heated"i / "hearty"i / "heaped"i / "headon"i / "halved"i / "ground"i / "gritty"i / "greasy"i / "grated"i / "grainy"i / "glazed"i / "fruity"i / "frozen"i / "frosty"i / "formed"i / "folded"i / "fluffy"i / "floury"i / "floral"i / "fleshy"i / "flakey"i / "flaked"i / "firmly"i / "finely"i / "farmed"i / "fairly"i / "exotic"i / "edible"i / "earthy"i / "decent"i / "dayold"i / "cut-up"i / "cut up"i / "crusty"i / "crispy"i / "creamy"i / "course"i / "cooled"i / "cooked"i / "coarse"i / "chunky"i / "chubby"i / "choice"i / "cheesy"i / "chalky"i / "caught"i / "carved"i / "canned"i / "broken"i / "bright"i / "brewed"i / "bought"i / "bonein"i / "boiled"i / "bitter"i / "beaten"i / "basted"i / "baking"i / "always"i / "almost"i / "active"i / "-style"i / " style"i / "zesty"i / "young"i / "wiped"i / "whole"i / "vegan"i / "uncut"i / "tough"i / "thick"i / "tepid"i / "tasty"i / "tangy"i / "sweet"i / "style"i / "stale"i / "spicy"i / "solid"i / "smoky"i / "small"i / "sized"i / "short"i / "sharp"i / "serve"i / "salty"i / "runny"i / "round"i / "rough"i / "ripen"i / "riced"i / "quick"i / "plump"i / "plain"i / "oiled"i / "nutty"i / "nofat"i / "mushy"i / "moist"i / "mixed"i / "minty"i / "mince"i / "milky"i / "meaty"i / "mealy"i / "loose"i / "local"i / "level"i / "leafy"i / "large"i / "jumbo"i / "juicy"i / "jammy"i / "inner"i / "hefty"i / "heavy"i / "hardy"i / "giant"i / "fully"i / "fried"i / "fresh"i / "flaky"i / "fizzy"i / "fishy"i / "fiery"i / "fatty"i / "fancy"i / "extra"i / "dried"i / "diced"i / "cutup"i / "curly"i / "cubed"i / "crisp"i / "cored"i / "clear"i / "clean"i / "chewy"i / "bushy"i / "burnt"i / "brush"i / "boxed"i / "boned"i / "bland"i / "basic"i / "baked"i / "wild"i / "wide"i / "weak"i / "waxy"i / "warm"i / "very"i / "torn"i / "tiny"i / "tied"i / "thin"i / "tart"i / "sour"i / "soft"i / "slit"i / "semi"i / "ripe"i / "rich"i / "real"i / "rare"i / "pure"i / "oily"i / "nice"i / "mini"i / "mild"i / "made"i / "lump"i / "long"i / "lean"i / "iced"i / "high"i / "hard"i / "good"i / "full"i / "flat"i / "firm"i / "fine"i / "easy"i / "dull"i / "deep"i / "cool"i / "cook"i / "cold"i / "bulk"i / "best"i / "baby"i / "aged"i / "wet"i / "top"i / "raw"i / "old"i / "off"i / "med"i / "icy"i / "hot"i / "fat"i / "dry"i / "diy"i / "cut"i / "big"i / "any"i / "add"i / "XL"i / "sm"i / "md"i / "lg"i

	unitKeyword "Unit Keyword" =
		"peel and juice"i / "sprinklings"i / "sprinkling"i / "selections"i / "scattering"i / "quantities"i / "juice-from"i / "juice from"i / "containers"i / "zest-from"i / "zest from"i / "sprinkles"i / "spoonfuls"i / "shoulders"i / "selection"i / "peel-from"i / "peel from"i / "marylands"i / "juicefrom"i / "grindings"i / "envelopes"i / "container"i / "carcasses"i / "zestfrom"i / "trotters"i / "stars-of"i / "stars of"i / "sprinkle"i / "spoonful"i / "splashes"i / "shoulder"i / "shavings"i / "servings"i / "sections"i / "quantity"i / "puree-of"i / "puree of"i / "portions"i / "peelings"i / "peelfrom"i / "packages"i / "maryland"i / "juice-of"i / "juice of"i / "handfuls"i / "grinding"i / "gratings"i / "flesh-of"i / "flesh of"i / "fistfuls"i / "filamets"i / "envelope"i / "drizzles"i / "crumbles"i / "clusters"i / "zest-of"i / "zest of"i / "trotter"i / "throats"i / "threads"i / "teabags"i / "tablets"i / "strands"i / "starsof"i / "star-of"i / "star of"i / "squeeze"i / "squares"i / "sleeves"i / "shaving"i / "serving"i / "section"i / "sachets"i / "rind-of"i / "rind of"i / "reserve"i / "recipes"i / "rashers"i / "pureeof"i / "punnets"i / "pulp-of"i / "pulp of"i / "pouches"i / "portion"i / "pinches"i / "peel-of"i / "peel of"i / "packets"i / "package"i / "loaf-of"i / "loaf of"i / "lardons"i / "kernels"i / "juiceof"i / "handful"i / "grating"i / "glasses"i / "florets"i / "fleshof"i / "fistful"i / "fillets"i / "filamet"i / "drizzle"i / "dollops"i / "cutlets"i / "crumble"i / "cluster"i / "carcass"i / "bundles"i / "bunches"i / "breasts"i / "bowlful"i / "bottles"i / "batches"i / "amounts"i / "zestof"i / "wheels"i / "wedges"i / "twists"i / "thumbs"i / "throat"i / "thread"i / "thighs"i / "teabag"i / "tablet"i / "strips"i / "strand"i / "sticks"i / "starof"i / "stalks"i / "square"i / "sprigs"i / "spoons"i / "splash"i / "spears"i / "slurry"i / "slices"i / "sleeve"i / "shells"i / "sheets"i / "shanks"i / "scoops"i / "sachet"i / "rounds"i / "rindof"i / "recipe"i / "rashes"i / "rasher"i / "quills"i / "punnet"i / "pulpof"i / "pieces"i / "peelof"i / "packet"i / "loaves"i / "loafof"i / "length"i / "leaves"i / "layers"i / "lardon"i / "ladles"i / "kernel"i / "joints"i / "hearts"i / "halves"i / "grinds"i / "grates"i / "grains"i / "fronds"i / "floret"i / "fillet"i / "dollop"i / "dashes"i / "cutlet"i / "cranks"i / "cracks"i / "clumps"i / "cloves"i / "chunks"i / "cheeks"i / "carton"i / "bundle"i / "bricks"i / "breast"i / "bottle"i / "blocks"i / "blades"i / "amount"i / "wings"i / "wheel"i / "wedge"i / "units"i / "twist"i / "turns"i / "tubes"i / "thumb"i / "thigh"i / "tails"i / "strip"i / "stick"i / "stems"i / "stalk"i / "sprig"i / "spoon"i / "spear"i / "slice"i / "slabs"i / "sides"i / "shots"i / "shell"i / "sheet"i / "shank"i / "seeds"i / "scoop"i / "round"i / "roots"i / "rolls"i / "rings"i / "rinds"i / "racks"i / "quill"i / "pouch"i / "pinch"i / "piece"i / "parts"i / "packs"i / "nests"i / "necks"i / "links"i / "layer"i / "ladle"i / "knobs"i / "joint"i / "hunks"i / "heart"i / "heads"i / "grind"i / "glugs"i / "glass"i / "frond"i / "flesh"i / "drops"i / "disks"i / "discs"i / "curls"i / "cubes"i / "count"i / "coins"i / "clump"i / "clove"i / "chunk"i / "cheek"i / "cdita"i / "bunch"i / "bulbs"i / "brick"i / "boxes"i / "bowls"i / "block"i / "blade"i / "batch"i / "balls"i / "arils"i / "a-lot"i / "a lot"i / "zest"i / "wing"i / "unit"i / "turn"i / "tuft"i / "tubs"i / "tube"i / "tins"i / "tail"i / "stem"i / "slab"i / "side"i / "shot"i / "seed"i / "root"i / "roll"i / "ring"i / "rind"i / "ribs"i / "rack"i / "q.b."i / "pots"i / "pods"i / "Pkts"i / "pats"i / "part"i / "pack"i / "nubs"i / "nobs"i / "nest"i / "neck"i / "mugs"i / "lots"i / "logs"i / "loaf"i / "link"i / "legs"i / "leaf"i / "knob"i / "jars"i / "hunk"i / "head"i / "glug"i / "foot"i / "feet"i / "ears"i / "drop"i / "disk"i / "disc"i / "dash"i / "cuts"i / "curl"i / "cube"i / "ctns"i / "coin"i / "cobs"i / "caps"i / "cans"i / "bulb"i / "bowl"i / "bars"i / "ball"i / "bags"i / "aril"i / "alot"i / "tub"i / "tin"i / "rib"i / "qty"i / "pot"i / "pod"i / "Pkt"i / "pkg"i / "pcs"i / "pat"i / "nub"i / "nos"i / "nob"i / "mug"i / "log"i / "leg"i / "jar"i / "ear"i / "ctn"i / "cob"i / "cda"i / "cap"i / "can"i / "box"i / "bar"i / "bag"i / "qb"i / "pc"i / "ea"i

	ingredientKeyword "Ingredient Keyword" =
		"bicarbonate of soda"i / "black onion seeds"i / "all purpose flour"i / "liquid-seasoning"i / "liquid seasoning"i / "black onion seed"i / "sunflower-seeds"i / "sunflower seeds"i / "poaching-liquid"i / "poaching liquid"i / "pickling-liquid"i / "pickling liquid"i / "liquidseasoning"i / "cream of tartar"i / "corn-on-the-cob"i / "corn on the cob"i / "braising-liquid"i / "braising liquid"i / "whipping-cream"i / "whipping cream"i / "sweet and sour"i / "sunflowerseeds"i / "sunflower-seed"i / "sunflower seed"i / "smoked-paprika"i / "smoked paprika"i / "seasoning-salt"i / "seasoning-cube"i / "seasoning salt"i / "seasoning cube"i / "powdered-sugar"i / "powdered sugar"i / "poachingliquid"i / "picklingliquid"i / "fermented-bean"i / "fermented bean"i / "braisingliquid"i / "baby back ribs"i / "whippingcream"i / "whipped-cream"i / "whipped cream"i / "sweet-peppers"i / "sweet peppers"i / "sunflowerseed"i / "smokedpaprika"i / "seasoningsalt"i / "seasoningcube"i / "refried-beans"i / "refried beans"i / "ras-el-hanout"i / "powderedsugar"i / "half-and-half"i / "half and half"i / "glass-noodles"i / "glass noodles"i / "ginger-garlic"i / "ginger garlic"i / "fermentedbean"i / "cooking-spray"i / "cooking spray"i / "bitter-greens"i / "bitter greens"i / "banana-leaves"i / "banana leaves"i / "baking-powder"i / "baking powder"i / "baby back rib"i / "angelica-root"i / "angelica root"i / "whippedcream"i / "sweetpeppers"i / "sweet-potato"i / "sweet potato"i / "simple-syrup"i / "simple syrup"i / "sesame-seeds"i / "sesame seeds"i / "refriedbeans"i / "liquid-smoke"i / "liquid smoke"i / "hot dog buns"i / "glassnoodles"i / "glass-noodle"i / "glass noodle"i / "gingergarlic"i / "eye of round"i / "dinner-rolls"i / "dinner rolls"i / "curry-leaves"i / "curry leaves"i / "cookingspray"i / "celery-seeds"i / "celery seeds"i / "bittergreens"i / "bananaleaves"i / "bakingpowder"i / "angelicaroot"i / "whole-wheat"i / "whole wheat"i / "vine-leaves"i / "vine leaves"i / "taco-shells"i / "taco shells"i / "sweety-drop"i / "sweety drop"i / "sweetpotato"i / "st.-germain"i / "st. germain"i / "simplesyrup"i / "short-crust"i / "short crust"i / "sesameseeds"i / "self-rising"i / "self rising"i / "poppy-seeds"i / "poppy seeds"i / "multi-grain"i / "multi grain"i / "liquidsmoke"i / "hot-peppers"i / "hot-paprika"i / "hot-italian"i / "hot-chilies"i / "hot peppers"i / "hot paprika"i / "hot italian"i / "hot dog bun"i / "hot chilies"i / "glassnoodle"i / "dinnerrolls"i / "curryleaves"i / "celeryseeds"i / "celery-seed"i / "celery seed"i / "bean-thread"i / "bean thread"i / "banana-stem"i / "banana stem"i / "baking-soda"i / "baking soda"i / "wholewheat"i / "vineleaves"i / "tacoshells"i / "taco-shell"i / "taco shell"i / "sweetydrop"i / "st.germain"i / "st-germain"i / "st germain"i / "spare-ribs"i / "spare ribs"i / "sour-cream"i / "sour cream"i / "shortening"i / "shortcrust"i / "short-ribs"i / "short ribs"i / "selfrising"i / "seasonings"i / "poppyseeds"i / "poppy-seed"i / "poppy seed"i / "multigrain"i / "long-beans"i / "long beans"i / "hotpeppers"i / "hotpaprika"i / "hotitalian"i / "hotchilies"i / "hot-pepper"i / "hot pepper"i / "gram-flour"i / "gram flour"i / "flatbreads"i / "five-spice"i / "five spice"i / "eye-fillet"i / "eye fillet"i / "curry-leaf"i / "curry leaf"i / "celeryseed"i / "burnt-ends"i / "burnt ends"i / "beanthread"i / "bay-leaves"i / "bay leaves"i / "bananastem"i / "bakingsoda"i / "animal-fat"i / "animal fat"i / "tacoshell"i / "sweetener"i / "sun-dried"i / "sun dried"i / "stgermain"i / "steel-cut"i / "steel cut"i / "st.-louis"i / "st. louis"i / "spareribs"i / "spare-rib"i / "spare rib"i / "sourdough"i / "sourcream"i / "shortribs"i / "short-rib"i / "short rib"i / "seasoning"i / "prime-rib"i / "prime rib"i / "poppyseed"i / "pie-shell"i / "pie shell"i / "longbeans"i / "hotpepper"i / "hot-sauce"i / "hot-chili"i / "hot-chile"i / "hot sauce"i / "hot chili"i / "hot chile"i / "gramflour"i / "gold-leaf"i / "gold leaf"i / "flatbread"i / "fivespice"i / "eyefillet"i / "deep-dish"i / "deep dish"i / "curryleaf"i / "cold-brew"i / "cold brew"i / "burntends"i / "bayleaves"i / "back-ribs"i / "back ribs"i / "baby-back"i / "baby back"i / "animalfat"i / "sweetner"i / "sundried"i / "steelcut"i / "st.louis"i / "st-louis"i / "st louis"i / "sparerib"i / "shortrib"i / "primerib"i / "pieshell"i / "hotsauce"i / "hotchili"i / "hotchile"i / "hot-dogs"i / "hot dogs"i / "goldleaf"i / "deepdish"i / "coldbrew"i / "bay-leaf"i / "bay leaf"i / "backribs"i / "back-rib"i / "back-fat"i / "back rib"i / "back fat"i / "babyback"i / "00-flour"i / "00 flour"i / "tri-tip"i / "tri tip"i / "tartare"i / "stlouis"i / "rib-eye"i / "rib eye"i / "old-bay"i / "old bay"i / "Medjool"i / "madeira"i / "hotdogs"i / "hot-dog"i / "hot dog"i / "fatback"i / "extract"i / "dry-rub"i / "dry rub"i / "bayleaf"i / "backrib"i / "backfat"i / "00flour"i / "tritip"i / "tartar"i / "ribeye"i / "oldbay"i / "lumpia"i / "hotdog"i / "ener-g"i / "ener g"i / "dryrub"i / "cloves"i / "energ"i / "clove"i
				
	/*----------  Fillers  ----------*/
	fillerExpression "Filler Expression" =
	  symbols0:filler+ _* words:$(fillerKeyword _+)* symbols1:filler*
	  	{ return formatFillerExpression(symbols0, words, symbols1); }
	  / symbols0:filler*_* words:$(fillerKeyword _+)+ symbols1:filler*
	  	{ return formatFillerExpression(symbols0, words, symbols1); }
	  / symbols0:filler*_* words:$(fillerKeyword _*)* symbols1:filler+
	  	{ return formatFillerExpression(symbols0, words, symbols1); }

	filler "Filler" =
		container
		/ fillerPunctuation

	fillerPunctuation "Ingored Punctuation" =
		[~*.!?©™]

	/*----------  Containers  ----------*/
	// these could be expanded to parse out their innards, but i'm just not feeling it
	containers "Containers" =
		container $(_* container)*
	
	container "Container" =
		opening:containerIndicator containerSymbol+ closing:containerIndicator

	containerSymbol "Container Symbol" = 
		!containerIndicator char:. { return char; }

/*=====  End of Base Rules  ======*/


/*=======================================
=            Ingredient Lines            =
=======================================*/
	ingredientLines "Ingredient Lines" =
		ingredientLine _+ wordSeparator _+ wordSeparator
		/ ingredientLine

	ingredientLine "Ingredient Line" =
		$('+' _*)?
		qty:quantityExpressions?
		ing:ingredientExpression
		com:commentExpression?
			{
				return {
					amounts: qty.amounts, // { values: [1, 2/3], separator: 'and' }
					unitDescriptor: qty.unitDescriptor, // "large"
					units: qty.units, // { values: [in, cup], separator: 'and' }
					amountUnitSeparator: qty.separator || null, //"plus"
					ingDescriptor: ing.ingDescriptor, // "freshly ground"
					ingredients: ing.ingredients, // { values: [ 'black pepper', 'salt' ], separator: 'and', descriptors: 'washed' }
					comments: com, // ", for serving"
					// filler text is any ignored punctuation or keywords
					// found in and around the interesting bits
					// these include any containerized expressions
					filler: [
						qty.filler[0], // pre-amount
						qty.filler[1], // pre-unitDescriptor
						qty.filler[2], // pre-unit
						ing.filler[0], // pre-ingDescriptor
						ing.filler[1], // pre-ing
					]
				};
			}

/*=====  End of Ingredient Line  ======*/



/*============================================
=            Quantity Expressions            =
============================================*/
	quantityExpressions "Quantity Expressions" =
		head:quantityExpression _+ sep:quantitySeparator _+ tail:quantityExpression
			{
				var headAmount = (head.amounts) ? head.amounts.values : [];
				var tailAmount = (tail.amounts) ? tail.amounts.values : [];

				var headUnit = (head.units) ? head.units.values : [];
				var tailUnit = (tail.units) ? tail.units.values : [];

				var amounts = (head.amounts || tail.amounts) ? { values: [ ...headAmount, ...tailAmount ] } : null;
				var unitDescriptor = (head.unitDescriptor || tail.unitDescriptor) ? { values: [ (head.unitDescriptor) ? head.unitDescriptor.values : null, (tail.unitDescriptor) ? tail.unitDescriptor.values : null ] } : null;
				var units = (head.units || tail.units) ? { values: [ ...headUnit, ...tailUnit ] } : null;

				var headFiller = [ head.filler0 || null, head.filler1 || null, head.filler2 || null ];
				var tailFiller = [ tail.filler0 || null, tail.filler1 || null, tail.filler2 || null ];
				
				return {
					amounts: amounts, // { values: [1, 2/3], separator: 'and' }
					unitDescriptor: unitDescriptor, // "large"
					units: units, // { values: [in, cup], separator: 'and' }
					filler: [ headFiller, tailFiller ],
					separator: sep
				};
			}
			/ quantityExpression

	quantityExpression "Quantity Expression" =
	  filler0:fillerExpression*
	  _*
	  amounts:amounts?
	  _*
	  filler1:fillerExpression*
	  _*
	  unitDesc:descriptors?
	  _*
	  filler2:fillerExpression*
	  _*
	  units:unitExpression?
	  	{
	  		return {
	  			amounts: amounts, // { values: [1, 2/3], separator: 'and' }
		  		unitDescriptor: unitDesc, // "large"
		  		units: units, // { values: [in, cup], separator: 'and' }
		  		filler: [ filler0, filler1, filler2 ]
	  		};
	  	}


	/*----------  Amounts  ----------*/
	amounts "Amounts" =
		// 1 2-3
		first:amount _+ second:amount _* sep:dashes+ _* third:amount
			{ return { values: [ first, second, third ], separator: sep }; }
		// 1 to 1 1/4
    	/ first:amount _* dashes* _* sep0:amountSeparator _* dashes* _*  second:amount _* sep1:dashes? _* third:amount
			{ return { values: [ first, second, third ], separator: [ sep0, sep1 ].filter(s => s) }; }
		// 1 3 1/4
    	/ first:amount _* dashes* _*  second:amount _* sep1:dashes? _* third:amount
			{ return { values: [ first, second, third ] }; }
    // 1 - to - 2
		/ first:amount _* dashes* _* sep:amountSeparator _* dashes* _* second:amount
			{ return { values: [ first, second ], separator: sep.toLowerCase() }; }
		// 1x pack salmon
		/ first:amount _* dashes* _* sep:amountSeparator _+ dashes*
			{ return { values: [ first ], separator: sep.toLowerCase() }; }
		// 1 - 2
		/ first:amount _* sep:dashes* _* second:amount
			{ return { values: [ first, second ], separator: sep }; }
		// one
		/ first:amount
			{ return { values: [ first ]}; }

	amount "Amount" =
		word:amountKeyword { return word.toLowerCase(); }
		/ unicodeAmount
		/ fraction
		/ float
		/ $(digit)+


	/*----------  Descriptors  ----------*/
	descriptors "Descriptors" =
		// cold and fresh
		head:descriptor _+ sep:wordSeparator _+ tail:descriptor
			{
				return {
					values: [ head, tail ].map(d => d.toLowerCase()),
					separator: sep
				}
			}
		// cold & fresh
		/ head:descriptor _* sep:symbolSeparator _* tail:descriptor
			{
				return {
						values: [ head, tail ].map(d => d.toLowerCase()),
						separator: sep
				}
			}
		// freshly-ground
		/ !ingredientKeyword head:descriptor _* sep:dashes _* tail:descriptor
			{
				return {
					values: [ head, tail ].map(d => d.toLowerCase()),
					separator: sep
				}
			}
        // roughly chopped
    / !ingredientKeyword head:descriptor tail:(','? _+ fillerExpression? _* descriptor)*
			{
				return {
					values: [ head ].concat(tail.map(t => t[4])),
                    filler: tail.map(t => t[2])
				}
			}
		// fresh
		/ !ingredientKeyword desc:descriptor
			{ return { values: desc.toLowerCase() }; }

	descriptor "Descriptor" =
		$(descriptorKeyword _* dashes+ _* descriptorKeyword)
	  / descriptorKeyword


	/*----------  Units  ----------*/
	unitExpression "Unit Expression" =
	  // units require an ending space to differentiate them from ingredients
	  unit:units { return unit; }

	units "Units" =
		// inch knob
		first:unit _+ second:$(dashes? _* unitKeyword _+) // don't be too generic here otherwise it will screw with the ingredient match
			{
				return { values: [ first, second ].map(u => u.toLowerCase().trim()) };
			}
		/ unit:unit _+
			{
				return { values: [ unit.toLowerCase().trim() ] };
			}

	unit "Unit" =
		$(dashes? _* unitKeyword)
	  / $(dashes? _* fluidOunce)
	  / $(dashes? _* gallon)
	  // careful on ordering these
	  / $(dashes? _* pound) // 'lb' needs to come before 'l'
	  / $(dashes? _* gram) // 'gm' needs to come before 'm'
	  / $(dashes? _* liter) // 'ml' needs to come before 'm'
	  / $(dashes? _* meter)
	  / 'c.c.'
	  / 'cc'i 
	  / $(dashes? _* cup)
	  / $(dashes? _* inch)
	  / $(dashes? _* ounce)
	  / $(dashes? _* pint)
	  / $(dashes? _* quart)
	  / $(dashes? _* spoons)
	  / 'dl'i


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
	  / $('gal'i '.'?) { return 'gal'; }

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
	  $('tablespoonful'i 's'i?) { return 'tbsp'; }
	  / $('teaspoonful'i 's'i?) { return 'tsp'; }
	  / $('tablespoon'i 's'i?) { return 'tbsp'; }
	  / $('teaspoon'i 's'i?) { return 'tsp'; }
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
	  $('wt'i? 'ounces'i) { return 'oz'; }
	  / $('wt'i? 'ounce'i) { return 'oz'; }
	  / $('wt'i? 'oz'i 's'i? '.'?) { return 'oz'; }

	pound "Pound" =
	  $('pound'i 's'i?) { return 'lbs'; }
	  / $('lb'i 's'i? '.'?) { return 'lbs'; }

	gram "Gram" =
	  $('milligram'i 's'i?) { return 'mg'; }
	  / $('kilogram'i 's'i?) { return 'kg'; }
	  / $('kilo'i 's'i?) { return 'kg'; }
	  / $('gram'i 's'i?) { return 'g'; }
	  / $('mg'i 's'i? '.'?) { return 'mg'; }
	  / $('kg'i 's'i? '.'?) { return 'kg'; }
	  / $('gm'i 's'i? '.'?) { return 'g'; }
	  / $('gr'i 's'i? '.'?) { return 'g'; }
	  / $('g'i 's'i? '.'?) { return 'g'; }
	  / $('㎏' 's'i? '.'?) { return 'kg'; }

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
	  / $('centimeter'i 's'i?) { return 'cm'; }
	  / $('meter'i 's'i?) { return 'm'; }
	  / $('mm'i 's'i? '.'?) { return 'mm'; }
	  / $('cm'i 's'i? '.'?) { return 'cm'; }
	  / $('m'i 's'i? '.'?) { return 'm'; }

	inch "Inch" =
	  $('inch'i 'es'i?) { return 'in'; }
	  / $('in'i 's'i? '.'?) { return 'in'; }
	  / $(["“”]) { return 'in'; }

/*=====  End of Quantity Expressions  ======*/



/*==============================================
=            Ingredient Expressions            =
==============================================*/
ingredientExpression "Ingredient Expression" =
	filler0:fillerExpression*
  _*
  ingDesc:descriptors?
  _*
  filler1:fillerExpression*
  _*
  ingredients:ingredients
  {
  	return {
  		ingDescriptor: ingDesc, // "freshly ground"
  		ingredients: ingredients, // { values: [ 'black pepper', 'salt' ], separator: 'and', descriptors: 'washed' }
  		filler: [ filler0, filler1 ]
  	};
  }

ingredientListEnding "Ingredient List Ending" = 
  ',' _* sep:separator? _* ing:ingredient
  	{
  		return {
  			separator: sep,
  			ingredient: ing
  		};
  	}


ingredients "Ingredients" =
	// banana, apple, pear(, and? pear)
	/*head:ingredient tail:ingredientListEnding*
		{
    	var tailIngredient = tail.map(i => i.ingredient);
    	var tailSeparator = tail.pop().separator;
            
			return {
				values: [ head ].concat(tailIngredient).map(i => i.toLowerCase()),
				separator: (tailSeparator) ? ', ' + tailSeparator : ','
			};
		}
	// apple and fresh peach
	/ 
    */
    head:multiWordIngredient _+ sep:wordSeparator _+ filler:fillerExpression? _* desc:descriptors? _* tail:multiWordIngredient
			{
				return {
					values: [ head, tail ].map(i => i.toLowerCase()),
	        descriptors: desc,
					separator: sep,
	        filler: filler
				};
			}
	
    / head:multiWordIngredient _* sep:ingSeparator _* filler:fillerExpression? _* desc:descriptors? _* tail:multiWordIngredient
			{
				return {
					values: [ head, tail ].map(i => i.toLowerCase()),
					descriptors: desc,
					separator: sep,
	        filler: filler
				};
			}
    / ing:multiWordIngredient
	    {
				return {
					values: [ ing.toLowerCase() ],
				};
			}

multiWordIngredient "Multi Word Ingredient" =
	//lemon-lime
	head:ingredient tail:$(_+ ingredient)+
    	{
			return [ head + tail ].map(i => i.toLowerCase())[0];
		}
    // lemon lime
	/ head:ingredient _+ tail:ingredient
    	{
			return head.toLowerCase() + ' ' + tail.toLowerCase();
		}
    // lemon
	/ ing:ingredient
		{
			return ing.toLowerCase();
		}

ingredient "Ingredient" =
	// parmigiano-reggiano
	head:ingredientWord !_ dashes+ !_ tail:ingredientWord
		{
			return [ head + '-' + tail ].map(i => i.toLowerCase().trim())[0];
		}
	// apple
	/ ingredientWord

excluded "Excluded" =
  ingSeparator / fillerKeyword / descriptors / $(amount _* unit) / amount / unit

ingredientWord "Ingredient Word" =
	ingredientKeyword
	/ !excluded ing:$(letter)+
		{ return ing; }
	/ ing:$(excluded $(letter)+)
		{ return ing; }
		// TODO add in quotes that return a consistent formatting !excluded ing:$(letter)+ quotes !excluded ing:$(letter)+


/*=====  End of Ingredient Expressions  ======*/

/*===========================================
=            Comment Expressions            =
===========================================*/
commentExpression "Comment Expression" =
  comment:$(comment*)
  	{ return comment; }


comment "Comment" =
	// match any characters
	char:. { return char; }

/*=====  End of Comment Expressions  ======*/