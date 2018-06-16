// compile me in the cmd prompt:
// pegjs -O speed lib/ingredientLineParser.pegjs

// for codepen:
// pegjs --format globals -e Parser -O size ingredientLineParser.pegjs

/*
  // sort word lists by size then alphabetically
  let list = [];
  list.sort(function(a, b) {
    return b.length - a.length || b.localeCompare(a)
  });

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
		"Zest and juice of"i / "approximately"i / "as necessary"i / "seeds from"i / "juice from"i / "equivalent"i / "additional"i / "zest from"i / "peel from"i / "to taste"i / "Seeds of"i / "optional"i / "juice of"i / "zest of"i / "without"i / "peel of"i / "i used"i / "enough"i / "around"i / "approx"i / "up to"i / "scant"i / "other"i / "about"i / "your"i / "with"i / "such"i / "plus"i / "over"i / "more"i / "like"i / "into"i / "from"i / "each"i / "the"i / "for"i / "few"i / "bit"i / "to"i / "of"i / "ea"i / "at"i / "an"i / "a"i / "~"i
	
	amountKeyword "Amount Keyword" =
		"equal parts"i / "thumb-size"i / "seventeen"i / "thirteen"i / "nineteen"i / "fourteen"i / "eighteen"i / "sixteen"i / "several"i / "seventy"i / "quarter"i / "hundred"i / "fifteen"i / "acouple"i / "twenty"i / "twelve"i / "thirty"i / "single"i / "ninety"i / "eleven"i / "eighty"i / "couple"i / "three"i / "third"i / "third"i / "sixty"i / "sixth"i / "seven"i / "forty"i / "fifty"i / "eight"i / "dozen"i / "some"i / "nine"i / "half"i / "four"i / "five"i / "two"i / "ten"i / "six"i / "one"i

	descriptorKeyword "Descriptor Keyword" =
		"titanium-strength"i / "titanium strength"i / "room-temperature"i / "room temperature"i / "non-hydrogenated"i / "well-fermented"i / "well fermented"i / "reduced-sodium"i / "reduced sodium"i / "pasture-raised"i / "pasture raised"i / "extra-strength"i / "extra strength"i / "well-scrubbed"i / "well scrubbed"i / "traditionally"i / "Thinly-peeled"i / "Thinly peeled"i / "shallow-fried"i / "shallow fried"i / "ripe-but-firm"i / "ripe but firm"i / "reconstituted"i / "medium-bodied"i / "finely-grated"i / "finely grated"i / "country-style"i / "country style"i / "approximately"i / "vine-ripened"i / "vine ripened"i / "store-bought"i / "store bought"i / "stone-ground"i / "stone ground"i / "refrigerated"i / "medium-large"i / "medium-grind"i / "medium grind"i / "medium grain"i / "high-quality"i / "high quality"i / "hand-chopped"i / "hand chopped"i / "good-quality"i / "good quality"i / "extra-virgin"i / "extra virgin"i / "concentrated"i / "cold-pressed"i / "cold pressed"i / "best-quality"i / "best quality"i / "as per taste"i / "whole-grain"i / "whole grain"i / "well-coated"i / "well coated"i / "unsweetened"i / "unflavoured"i / "tri-colored"i / "tri colored"i / "thumb-sized"i / "thumb sized"i / "sustainable"i / "soft-boiled"i / "short-grain"i / "short-crust"i / "short grain"i / "short crust"i / "recommended"i / "pasteurized"i / "medium-size"i / "medium size"i / "just-cooked"i / "immediately"i / "high-gluten"i / "high gluten"i / "hard-boiled"i / "hand-pulled"i / "hand pulled"i / "gluten-free"i / "gluten free"i / "full-bodied"i / "full bodied"i / "flavourless"i / "fast-action"i / "fast action"i / "butterflied"i / "as required"i / "wholegrain"i / "vine-ripen"i / "vine ripen"i / "vegetarian"i / "unsulfured"i / "unseasoned"i / "unflavored"i / "unfiltered"i / "unbleached"i / "thumb-size"i / "thumb size"i / "thoroughly"i / "super fine"i / "spiralized"i / "spiralised"i / "rehydrated"i / "ready-made"i / "ready made"i / "pulverized"i / "previously"i / "preferably"i / "pre-cooked"i / "oven-ready"i / "oven ready"i / "low-sodium"i / "low sodium"i / "loose-leaf"i / "loose leaf"i / "long-grain"i / "long grain"i / "high-grade"i / "high grade"i / "granulated"i / "generously"i / "gelatinous"i / "full cream"i / "free-range"i / "free range"i / "flavourful"i / "flavorless"i / "fine-grind"i / "fine-grain"i / "fine grind"i / "fine grain"i / "diagonally"i / "desiccated"i / "de-stemmed"i / "completely"i / "center-cut"i / "center cut"i / "bite-sized"i / "bite sized"i / "wholemeal"i / "vine-ripe"i / "vine ripe"i / "untrimmed"i / "untoasted"i / "unripened"i / "top-split"i / "top split"i / "thickened"i / "thick-cut"i / "thick cut"i / "sweetened"i / "superfine"i / "sprinkled"i / "split-top"i / "split top"i / "sometimes"i / "separated"i / "semi-firm"i / "semi firm"i / "segmented"i / "scrambled"i / "scattered"i / "readymade"i / "quartered"i / "purchased"i / "preferred"i / "precooked"i / "pin-boned"i / "pin boned"i / "over-easy"i / "over easy"i / "non-stick"i / "non stick"i / "marinated"i / "Less than"i / "left-over"i / "left over"i / "just-ripe"i / "just ripe"i / "julienned"i / "instantly"i / "housemade"i / "home made"i / "half-ripe"i / "half ripe"i / "ground up"i / "grass-fed"i / "grass fed"i / "generally"i / "flavoured"i / "flavorful"i / "flat-leaf"i / "flat leaf"i / "fermented"i / "favourite"i / "fashioned"i / "distilled"i / "dissolved"i / "discarded"i / "destemmed"i / "decorated"i / "de-scaled"i / "crustless"i / "cross-cut"i / "cross cut"i / "congealed"i / "condensed"i / "cage-free"i / "cage free"i / "bite-size"i / "bite size"i / "as needed"i / "artisanal"i / "activated"i / "unrefined"i / "unsalted"i / "unpeeled"i / "uncooked"i / "strongly"i / "stripped"i / "strained"i / "squeezed"i / "softened"i / "slivered"i / "skinless"i / "sizzling"i / "simmered"i / "shredded"i / "shell-on"i / "shell on"i / "seedless"i / "seasoned"i / "seasonal"i / "rindless"i / "reserved"i / "rendered"i / "reheated"i / "purified"i / "prepared"i / "packaged"i / "nonstick"i / "lukewarm"i / "low-salt"i / "low salt"i / "leftover"i / "inserted"i / "imported"i / "homemade"i / "headless"i / "half-fat"i / "half fat"i / "generous"i / "garlicky"i / "full-fat"i / "full fat"i / "frenched"i / "flavored"i / "filtered"i / "favorite"i / "fat-less"i / "fat-free"i / "fat less"i / "fat free"i / "dry-aged"i / "dry aged"i / "deveined"i / "deseeded"i / "de-boned"i / "crumpled"i / "crumbled"i / "corn-fed"i / "corn fed"i / "coarsely"i / "chrunchy"i / "buttered"i / "boneless"i / "blanched"i / "assorted"i / "arranged"i / "aromatic"i / "actually"i / "x-large"i / "x large"i / "whisked"i / "whacked"i / "unbaked"i / "trussed"i / "trimmed"i / "toasted"i / "tightly"i / "thickly"i / "tex-mex"i / "streaky"i / "stirred"i / "stemmed"i / "steamed"i / "snipped"i / "smeared"i / "smashed"i / "skinned"i / "skin-on"i / "skin on"i / "skimmed"i / "similar"i / "shelled"i / "scraped"i / "scooped"i / "savoury"i / "rounded"i / "roughly"i / "roasted"i / "ripened"i / "reserve"i / "removed"i / "regular"i / "refried"i / "refined"i / "reduced"i / "quality"i / "pricked"i / "pressed"i / "premium"i / "powdery"i / "poached"i / "pickled"i / "peppery"i / "organic"i / "non-GMO"i / "non-fat"i / "non gmo"i / "non fat"i / "neutral"i / "natural"i / "low-fat"i / "low fat"i / "loosely"i / "lightly"i / "largely"i / "instant"i / "ideally"i / "heaping"i / "head-on"i / "head on"i / "grilled"i / "freshly"i / "exactly"i / "dressed"i / "drained"i / "divided"i / "diluted"i / "desired"i / "day-old"i / "day old"i / "crushed"i / "crumbly"i / "cracked"i / "covered"i / "cooking"i / "cleaned"i / "classic"i / "citrusy"i / "chopped"i / "chilled"i / "checked"i / "charred"i / "candied"i / "buttery"i / "burning"i / "brushed"i / "browned"i / "braised"i / "bottled"i / "bone-in"i / "bone in"i / "boiling"i / "blended"i / "artisan"i / "zested"i / "wilted"i / "watery"i / "washed"i / "warmed"i / "unripe"i / "tinned"i / "thinly"i / "thawed"i / "tender"i / "tasted"i / "syrupy"i / "strong"i / "stoned"i / "sticky"i / "stewed"i / "square"i / "spongy"i / "soured"i / "soaked"i / "smooth"i / "smoked"i / "sliced"i / "sliced"i / "skinny"i / "simple"i / "sifted"i / "shaved"i / "served"i / "seeded"i / "season"i / "scored"i / "salted"i / "rubbed"i / "rolled"i / "rinsed"i / "really"i / "puréed"i / "pureed"i / "pulled"i / "poured"i / "placed"i / "pitted"i / "picked"i / "peeled"i / "patted"i / "packed"i / "opened"i / "nonfat"i / "needed"i / "native"i / "narrow"i / "minced"i / "milled"i / "mildly"i / "melted"i / "medium"i / "mature"i / "mashed"i / "little"i / "juiced"i / "husked"i / "hulled"i / "heated"i / "hearty"i / "heaped"i / "halved"i / "ground"i / "gritty"i / "greasy"i / "grated"i / "grainy"i / "glazed"i / "frozen"i / "frosty"i / "formed"i / "folded"i / "fluffy"i / "floury"i / "flaked"i / "firmly"i / "finely"i / "farmed"i / "fairly"i / "edible"i / "earthy"i / "decent"i / "crusty"i / "crispy"i / "creamy"i / "cooled"i / "cooked"i / "coarse"i / "chunky"i / "chubby"i / "choice"i / "cheesy"i / "chalky"i / "carved"i / "canned"i / "broken"i / "brewed"i / "boiled"i / "bitter"i / "beaten"i / "basted"i / "always"i / "almost"i / "active"i / "zesty"i / "young"i / "whole"i / "vegan"i / "tough"i / "thick"i / "tepid"i / "tasty"i / "tangy"i / "sweet"i / "stale"i / "spicy"i / "solid"i / "small"i / "sized"i / "short"i / "sharp"i / "serve"i / "salty"i / "runny"i / "round"i / "rough"i / "quick"i / "plain"i / "oiled"i / "nutty"i / "mushy"i / "moist"i / "mixed"i / "minty"i / "mince"i / "milky"i / "meaty"i / "loose"i / "local"i / "leafy"i / "large"i / "jumbo"i / "juicy"i / "inner"i / "heavy"i / "hardy"i / "fully"i / "fried"i / "fresh"i / "fresh"i / "flaky"i / "fizzy"i / "fishy"i / "fiery"i / "fatty"i / "extra"i / "dried"i / "diced"i / "curly"i / "cubed"i / "crisp"i / "cored"i / "clear"i / "clean"i / "chewy"i / "bushy"i / "burnt"i / "brush"i / "boned"i / "bland"i / "basic"i / "wild"i / "wide"i / "waxy"i / "warm"i / "very"i / "torn"i / "tiny"i / "tied"i / "thin"i / "tart"i / "sour"i / "soft"i / "slit"i / "semi"i / "ripe"i / "rich"i / "real"i / "pure"i / "oily"i / "mini"i / "mild"i / "made"i / "lump"i / "long"i / "lean"i / "iced"i / "high"i / "hard"i / "good"i / "full"i / "flat"i / "firm"i / "fine"i / "dull"i / "deep"i / "cool"i / "cook"i / "cold"i / "bulk"i / "best"i / "baby"i / "aged"i / "wet"i / "top"i / "raw"i / "old"i / "off"i / "med"i / "icy"i / "hot"i / "fat"i / "dry"i / "cut"i / "big"i / "any"i / "add"i / "XL"i / "md"i / "lg"i

	unitKeyword "Unit Keyword" =
		"sprinklings"i / "sprinkling"i / "selections"i / "quantities"i / "juice from"i / "containers"i / "zest from"i / "sprinkles"i / "spoonfuls"i / "shoulders"i / "selection"i / "peel from"i / "marylands"i / "grindings"i / "envelopes"i / "container"i / "carcasses"i / "trotters"i / "sprinkle"i / "spoonful"i / "splashes"i / "shoulder"i / "shavings"i / "servings"i / "quantity"i / "portions"i / "packages"i / "maryland"i / "juice of"i / "handfuls"i / "grinding"i / "gratings"i / "fistfuls"i / "filamets"i / "envelope"i / "drizzles"i / "crumbles"i / "clusters"i / "zest of"i / "trotter"i / "throats"i / "threads"i / "teabags"i / "strands"i / "squeeze"i / "sleeves"i / "shaving"i / "serving"i / "sachets"i / "reserve"i / "recipes"i / "rashers"i / "punnets"i / "pouches"i / "portion"i / "pinches"i / "peel of"i / "packets"i / "package"i / "lardons"i / "handful"i / "grating"i / "glasses"i / "florets"i / "fistful"i / "fistful"i / "fillets"i / "filamet"i / "drizzle"i / "dollops"i / "cutlets"i / "crumble"i / "cluster"i / "carcass"i / "bundles"i / "bunches"i / "breasts"i / "breasts"i / "bottles"i / "batches"i / "amounts"i / "wheels"i / "wedges"i / "twists"i / "thumbs"i / "throat"i / "thread"i / "thighs"i / "teabag"i / "strips"i / "strand"i / "sticks"i / "stalks"i / "sprigs"i / "spoons"i / "splash"i / "spears"i / "slurry"i / "slices"i / "sleeve"i / "shells"i / "sheets"i / "shanks"i / "scoops"i / "sachet"i / "rounds"i / "recipe"i / "rashes"i / "rasher"i / "quills"i / "punnet"i / "pieces"i / "packet"i / "loaves"i / "length"i / "leaves"i / "lardon"i / "ladles"i / "joints"i / "hearts"i / "halves"i / "grinds"i / "fronds"i / "floret"i / "fillet"i / "dollop"i / "dashes"i / "cutlet"i / "cloves"i / "chunks"i / "cheeks"i / "bundle"i / "bricks"i / "bottle"i / "blocks"i / "blades"i / "amount"i / "wings"i / "wheel"i / "wedge"i / "units"i / "twist"i / "turns"i / "thumb"i / "thigh"i / "tails"i / "strip"i / "stick"i / "stems"i / "stalk"i / "sprig"i / "spoon"i / "spear"i / "slice"i / "slabs"i / "sides"i / "shots"i / "shell"i / "sheet"i / "shank"i / "seeds"i / "scoop"i / "round"i / "roots"i / "rinds"i / "racks"i / "quill"i / "pouch"i / "pinch"i / "piece"i / "parts"i / "packs"i / "necks"i / "links"i / "ladle"i / "knobs"i / "joint"i / "hunks"i / "heart"i / "heads"i / "grind"i / "glugs"i / "glass"i / "frond"i / "flesh"i / "drops"i / "disks"i / "discs"i / "cubes"i / "coins"i / "clove"i / "chunk"i / "cheek"i / "bunch"i / "bulbs"i / "brick"i / "boxes"i / "bowls"i / "block"i / "blade"i / "batch"i / "balls"i / "a lot"i / "zest"i / "wing"i / "unit"i / "turn"i / "tubs"i / "tins"i / "tail"i / "stem"i / "slab"i / "side"i / "shot"i / "seed"i / "root"i / "rind"i / "ribs"i / "rack"i / "q.b."i / "pods"i / "Pkts"i / "pats"i / "part"i / "pack"i / "nubs"i / "neck"i / "lots"i / "logs"i / "loaf"i / "link"i / "legs"i / "leaf"i / "knob"i / "jars"i / "hunk"i / "head"i / "glug"i / "foot"i / "feet"i / "ears"i / "drop"i / "disk"i / "disc"i / "dash"i / "cuts"i / "cube"i / "ctns"i / "coin"i / "cobs"i / "caps"i / "cans"i / "bulb"i / "bowl"i / "bars"i / "ball"i / "bags"i / "tub"i / "tin"i / "rib"i / "pod"i / "Pkt"i / "pcs"i / "pat"i / "nub"i / "nos"i / "log"i / "leg"i / "jar"i / "ear"i / "ctn"i / "cob"i / "cap"i / "can"i / "box"i / "bar"i / "bag"i / "qb"i / "ea"

	ingredientKeyword "Ingredient Keyword" =
		"black onion seeds"i / "all-purpose flour"i / "all purpose flour"i / "black onion seed"i / "sunflower seeds"i / "whipping cream"i / "sweet and sour"i / "sunflower seed"i / "seasoning salt"i / "Seasoning cube"i / "fermented bean"i / "baby back ribs"i / "baby back ribs"i / "whipped cream"i / "sweet peppers"i / "half-and-half"i / "glass noodles"i / "ginger-garlic"i / "cooking spray"i / "bitter greens"i / "banana leaves"i / "baby back rib"i / "angelica root"i / "simple syrup"i / "sesame seeds"i / "glass noodle"i / "eye of round"i / "curry leaves"i / "vine leaves"i / "taco shells"i / "short crust"i / "poppy seeds"i / "hot peppers"i / "hot paprika"i / "hot italian"i / "hot chilies"i / "taco shell"i / "sweet-corn"i / "sweet corn"i / "sour cream"i / "shortening"i / "shortcrust"i / "short ribs"i / "poppy seed"i / "hot pepper"i / "gram flour"i / "flatbreads"i / "five-spice"i / "five spice"i / "curry leaf"i / "burnt ends"i / "bay leaves"i / "sweetener"i / "sun-dried"i / "sun dried"i / "short rib"i / "Seasoning"i / "room-temp"i / "room temp"i / "prime rib"i / "hot sauce"i / "hot chili"i / "hot chile"i / "gold leaf"i / "flatbread"i / "baby back"i / "rindless"i / "hot dogs"i / "bay leaf"i / "tri-tip"i / "Tartare"i / "squares"i / "rib-eye"i / "old bay"i / "Medjool"i / "Madeira"i / "hot dog"i / "hot dog"i / "bitters"i / "cloves"i / "clove"i

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
		/ head:descriptor _* sep:dashes _* tail:descriptor
			{
				return {
					values: [ head, tail ].map(d => d.toLowerCase()),
					separator: sep
				}
			}
        // roughly chopped
        / head:descriptor tail:(','? _+ fillerExpression? _* descriptor)*
			{
				return {
					values: [ head ].concat(tail.map(t => t[4])),
                    filler: tail.map(t => t[2])
				}
			}
		// fresh
		/ desc:descriptor
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
	  / $(dashes? _* tablespoon)
	  / $(dashes? _* teaspoon)
	  / 'dl'i


	/*----------  Volumes  ----------*/
	volume "Volume" =
	  fluidOunce
	  / cup
	  / pint
	  / quart
	  / gallon
	  / liter
	  / tablespoon
	  / teaspoon

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
	  / $('cl'i 's'i? '.'?) { return 'cl'; }
	  / $('ml'i 's'i? '.'?) { return 'ml'; }
	  / $('l'i 's'i? '.'?) { return 'l'; }

	tablespoon "Tablespoon" =
	  $('tablespoon'i 's'i?) { return 'tbsp'; }
	  / $('tblsp'i 's'i? '.'?) { return 'tbsp'; }
	  / $('tbsp'i 's'i? '.'?) { return 'tbsp'; }
	  / $('tbl'i 's'i? '.'?) { return 'tbsp'; }
	  / $('tb'i 's'i? '.'?) { return 'tbsp'; }
	  / $('T' 's'i? '.'?) { return 'tbsp'; }

	teaspoon "Teaspoon" =
	  $('teaspoon'i 's'i?) { return 'tsp'; }
	  / $('tsp'i 's'i? '.'?) { return 'tsp'; }
	  / $('t' 's'i? '.'?) { return 'tsp'; }

	/*----------  Weights  ----------*/
	weight "Weight" =
	  ounce
	  / pound
	  / gram

	ounce "Ounce" =
	  $('ounces'i) { return 'oz'; }
	  / $('ounce'i) { return 'oz'; }
	  / $('oz'i '.'?) { return 'oz'; }

	pound "Pound" =
	  $('pound'i 's'i?) { return 'lbs'; }
	  / $('lb'i 's'i? '.'?) { return 'lbs'; }

	gram "Gram" =
	  $('milligram'i 's'i?) { return 'mg'; }
	  / $('kilogram'i 's'i?) { return 'kg'; }
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