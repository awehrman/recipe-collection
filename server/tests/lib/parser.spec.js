const assert = require('assert');
const chai = require('chai');
const chaiHttp = require('chai-http');
const colors = require('colors');
const expect = require('chai').expect;
const fs = require('fs');
const bodyParser = require('body-parser');
const peg = require('pegjs');

const Parser = require('../../lib/ingredientLineParser'); // prod parser

/* [...] amount [...] unit [...] ing [...]
	{
		amountExpression: {
			descriptors: { v: [], c: [] },				// v: ['~', 'approx']
			amounts: { v: [], c: []},							// v: [1, 2], c: ['to']
			container: { v: [] }								
		}
		
		unitExpression: {
			descriptors: { v: [], c: [] },
			amounts: { v: [], c: []},
			container: { v: [] }
		}

		ingredientExpression: {
			descriptors: { v: [], c: [] },
			amounts: { v: [], c: []},
			container: { v: [] }
		}
		
		comments: { vaues: [] }												// v: ', sliced'
	}
	// [~ 1 to 2 ] [heaping cups] [roasted chicken broth], separated
*/

describe.only('Ingredient Line Parser ============================================='.magenta, function () {
	function generateParser(rulename) {

		let grammar, parser;

		try {
			grammar = fs.readFileSync(`tests/lib/test_grammar.pegjs`, 'utf8');
			grammar = grammar.replace(/START_VARIABLE/g, rulename);
			parser = peg.generate(grammar, { optimize: 'speed' });
			return parser;
		} catch (err) {
			console.log(`could not generate parser!`.red);
			console.log(err);
		}
	}

	describe('Base Rules'.magenta, function() {
		let parsed, parser;
		
		it('_', function() {
			parser = generateParser('_');
			expect(parser).to.exist;

			parsed = parser.parse(' ');
			console.log(parsed);
			expect(parsed).to.equal(' ');
		});

		it('dashes', function() {
			parser = generateParser('dashes');
			expect(parser).to.exist;

			parsed = parser.parse('-');
			console.log(parsed);
			expect(parsed).to.equal('-');

			parsed = parser.parse('~');
			console.log(parsed);
			expect(parsed).to.equal('-');

			parsed = parser.parse('‒');
			console.log(parsed);
			expect(parsed).to.equal('-');
		});

		it('slashes', function() {
			parser = generateParser('slashes');
			expect(parser).to.exist;

			parsed = parser.parse('/');
			console.log(parsed);
			expect(parsed).to.equal('/');

			parsed = parser.parse('|');
			console.log(parsed);
			expect(parsed).to.equal('/');

			parsed = parser.parse('⁄');
			console.log(parsed);
			expect(parsed).to.equal('/');
		});

		it('quotes', function() {
			parser = generateParser('quotes');
			expect(parser).to.exist;

			parsed = parser.parse("'");
			console.log(parsed);
			expect(parsed).to.equal("'");

			parsed = parser.parse('"');
			console.log(parsed);
			expect(parsed).to.equal('"');

			parsed = parser.parse('’');
			console.log(parsed);
			expect(parsed).to.equal("'");
		});

		it('letter', function() {
			parser = generateParser('letter');
			expect(parser).to.exist;

			parsed = parser.parse('a');
			console.log(parsed);
			expect(parsed).to.equal('a');

			//parsed = parser.parse('"');
			//console.log(parsed);
			//expect(parsed).to.equal("'");

			parsed = parser.parse('©');
			console.log(parsed);
			expect(parsed).to.equal("©");
		});

		it('digit', function() {
			parser = generateParser('digit');
			expect(parser).to.exist;

			parsed = parser.parse('1');
			console.log(parsed);
			expect(parsed).to.equal('1');

			parsed = parser.parse('⁷');
			console.log(parsed);
			expect(parsed).to.equal(7);		// TODO do i care if this is a string or not?
		});

		it('unicodeAmount', function() {
			parser = generateParser('unicodeAmount');
			expect(parser).to.exist;

			parsed = parser.parse('½');
			console.log(parsed);
			expect(parsed).to.equal('1/2');

			parsed = parser.parse('¾');
			console.log(parsed);
			expect(parsed).to.equal('3/4');
		});

		it('fraction', function() {
			parser = generateParser('fraction');
			expect(parser).to.exist;

			parsed = parser.parse('1/2');
			console.log(parsed);
			expect(parsed).to.equal('1/2');
		});

		it('float', function() {
			parser = generateParser('float');
			expect(parser).to.exist;

			parsed = parser.parse('1.2');
			console.log(parsed);
			expect(parsed).to.equal('1.2');

			parsed = parser.parse('4,5');
			console.log(parsed);
			expect(parsed).to.equal('4.5');

			parsed = parser.parse('.33');
			console.log(parsed);
			expect(parsed).to.equal('.33');

			parsed = parser.parse('1.75');
			console.log(parsed);
			expect(parsed).to.equal('1.75');
		});

		/*----------  Indicators & Separators  ----------*/
		// TODO i bet these could be simplified more; its kind of a mess
		it('separator', function() {
			parser = generateParser('separator');
			expect(parser).to.exist;

			parsed = parser.parse('&');
			console.log(parsed);
			expect(parsed.value).to.equal('and');

			parsed = parser.parse('and');
			console.log(parsed);
			expect(parsed.value).to.equal('and');

			parsed = parser.parse('OR');
			console.log(parsed);
			expect(parsed.value).to.equal('or');
		});

		it('amountSeparator', function() {
			parser = generateParser('amountSeparator');
			expect(parser).to.exist;

			parsed = parser.parse('OR');
			console.log(parsed);
			expect(parsed.value).to.equal('or');

			parsed = parser.parse('plus');
			console.log(parsed);
			expect(parsed.value).to.equal('plus');

			parsed = parser.parse('×');
			console.log(parsed);
			expect(parsed.value).to.equal('x');
		});

		it('parenthesisIndicator', function() {
			parser = generateParser('parenthesisIndicator');
			expect(parser).to.exist;

			parsed = parser.parse('(');
			console.log(parsed);
			expect(parsed).to.equal('(');

			parsed = parser.parse('[');
			console.log(parsed);
			expect(parsed).to.equal('(');

			parsed = parser.parse('{');
			console.log(parsed);
			expect(parsed).to.equal('(');			
		});

		/*----------  Keywords  ----------*/
		// TODO throw in a function to lowercase or camel case?
		/*it('fillerKeyword', function() {
			parser = generateParser('fillerKeyword');
			expect(parser).to.exist;

			parsed = parser.parse('additional');
			console.log(parsed);
			expect(parsed).to.equal('additional');
		});*/

		it('amountKeyword', function() {
			parser = generateParser('amountKeyword');
			expect(parser).to.exist;

			parsed = parser.parse('ten');
			console.log(parsed);
			expect(parsed).to.equal('ten');
		});

		it('descriptorKeyword', function() {
			parser = generateParser('descriptorKeyword');
			expect(parser).to.exist;

			parsed = parser.parse('boneless');
			console.log(parsed);
			expect(parsed).to.equal('boneless');
		});

		it('unitKeyword', function() {
			parser = generateParser('unitKeyword');
			expect(parser).to.exist;

			parsed = parser.parse('handful');
			console.log(parsed);
			expect(parsed).to.equal('handful');
		});

		it('ingredientKeyword', function() {
			parser = generateParser('ingredientKeyword');
			expect(parser).to.exist;

			parsed = parser.parse('hot sauce');
			console.log(parsed);
			expect(parsed).to.equal('hot sauce');
		});

		/*----------  Comments  ----------*/
	/*	
		it('parentheticalComments', function() {
			parser = generateParser('parentheticalComments');
			expect(parser).to.exist;

			// container $(_* container)*
			parsed = parser.parse('(!)');
			console.log(parsed);
			expect(parsed).to.equal('(!)');

			parsed = parser.parse('(!) (!!)');
			console.log(parsed);
			expect(parsed).to.equal('(!) (!!)');
		});
*/
		it('parentheticalComment', function() {
			parser = generateParser('parentheticalComment');
			expect(parser).to.exist;

			parsed = parser.parse('(!)');
			console.log(parsed);
			expect(parsed).to.equal('(!)');

			parsed = parser.parse('( OPTIONAL )');
			console.log(parsed);
			expect(parsed).to.equal('(optional)');

			parsed = parser.parse('()');
			console.log(parsed);
			expect(parsed).to.equal('()');
		});

		it('comments', function() {
			parser = generateParser('comments');
			expect(parser).to.exist;

			// !containerIndicator char:. { return char; }
			parsed = parser.parse('!');
			console.log(parsed);
			expect(parsed).to.equal('!');

			parsed = parser.parse('a');
			console.log(parsed);
			expect(parsed).to.equal('a');
		});
	});

	describe('Quantity Rules'.magenta, function() {
		let parsed, parser;
		
		it.skip('quantityExpressions', function() {
			parser = generateParser('quantityExpressions');
			expect(parser).to.exist;

			// head:quantityExpression _+ sep:quantitySeparator _+ tail:quantityExpression
			parsed = parser.parse('');
			console.log(parsed);
			expect(parsed).to.equal('');

			// quantityExpression
			parsed = parser.parse('');
			console.log(parsed);
			expect(parsed).to.equal('');
		});

		it.skip('quantityExpression', function() {
			parser = generateParser('quantityExpression');
			expect(parser).to.exist;

			/*
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
		  */
			parsed = parser.parse('');
			console.log(parsed);
			expect(parsed).to.equal('');
		});

		/*----------  Amounts  ----------*/

		it.skip('amounts', function() {
			parser = generateParser('amounts');
			expect(parser).to.exist;

			parsed = parser.parse('');
			console.log(parsed);
			expect(parsed).to.equal('');
		});

		it.skip('amount', function() {
			parser = generateParser('amount');
			expect(parser).to.exist;

			parsed = parser.parse('');
			console.log(parsed);
			expect(parsed).to.equal('');
		});

		/*----------  Descriptors  ----------*/

		it('descriptors', function() {
			parser = generateParser('descriptors');
			expect(parser).to.exist;

			// head:descriptor _+ sep:wordSeparator _+ tail:descriptor
			parsed = parser.parse('boneless and roasted');
			console.log(parsed);
			expect(parsed.values[0]).to.equal('boneless');
			expect(parsed.values[1]).to.equal('roasted');
			expect(parsed.separator).to.equal('and');

			// head:descriptor _* sep:symbolSeparator _* tail:descriptor
			parsed = parser.parse('boneless & roasted');
			console.log(parsed);
			expect(parsed.values[0]).to.equal('boneless');
			expect(parsed.values[1]).to.equal('roasted');
			expect(parsed.separator).to.equal('and');

			// !ingredientKeyword head:descriptor _* sep:dashes _* tail:descriptor
			//parsed = parser.parse('');
			//console.log(parsed);
			//expect(parsed).to.equal('');

			// !ingredientKeyword head:descriptor tail:(','? _+ fillerExpression? _* descriptor)*
			parsed = parser.parse('boneless roasted');
			console.log(parsed);
			expect(parsed.values[0]).to.equal('boneless');
			expect(parsed.values[1]).to.equal('roasted');

			parsed = parser.parse('boneless, roasted');
			console.log(parsed);
			expect(parsed.values[0]).to.equal('boneless');
			expect(parsed.values[1]).to.equal('roasted');

			parsed = parser.parse('boneless, approx roasted');
			console.log(parsed);
			expect(parsed.values[0]).to.equal('boneless');
			expect(parsed.values[1]).to.equal('roasted');
			expect(parsed.filler[0]).to.equal('approx');

			// !ingredientKeyword desc:descriptor
			//parsed = parser.parse('');
			//console.log(parsed);
			//expect(parsed).to.equal('');
		});

		it('descriptor', function() {
			parser = generateParser('descriptor');
			expect(parser).to.exist;

			// $(descriptorKeyword _* dashes+ _* descriptorKeyword)
			parsed = parser.parse('roughly - boneless');
			console.log(parsed);
			expect(parsed).to.equal('roughly-boneless');

  		// descriptorKeyword

  		parsed = parser.parse('boneless');
			console.log(parsed);
			expect(parsed).to.equal('boneless');
		});

		/*----------  Units  ----------*/

		it.skip('units', function() {
			parser = generateParser('units');
			expect(parser).to.exist;

			// first:unit _+ second:$(dashes? _* unitKeyword _+)
			parsed = parser.parse('inch knob ');
			console.log(parsed.values);
			expect(parsed.values[0]).to.equal('in');
			expect(parsed.values[1]).to.equal('knob');

			// unit:unit _+
			parsed = parser.parse('tsp ');
			console.log(parsed);
			expect(parsed.values[0]).to.equal('tsp');
		});

		it.skip('unit', function() {
			/* 
				//always needs a following space
				dash:dashes? _* unit:unitKeyword { return (dash) ? dash + unit : unit; }
			  / dash:dashes? _* unit:fluidOunce { return (dash) ? dash + unit : unit; }
			  / dash:dashes? _* unit:gallon { return (dash) ? dash + unit : unit; }
			  // careful on ordering these
			  // 'lb' needs to come before 'l'
			  // 'gm' needs to come before 'm'
			  // 'ml' needs to come before 'm'
			  / dash:dashes? _* unit:pound { return (dash) ? dash + unit : unit; }
			  / dash:dashes? _* unit:gram { return (dash) ? dash + unit : unit; }
			  / dash:dashes? _* unit:liter { return (dash) ? dash + unit : unit; }
			  / dash:dashes? _* unit:meter { return (dash) ? dash + unit : unit; }
			  / dash:dashes? _* unit:cup { return (dash) ? dash + unit : unit; }
			  / dash:dashes? _* unit:inch { return (dash) ? dash + unit : unit; }
			  / dash:dashes? _* unit:ounce { return (dash) ? dash + unit : unit; }
			  / dash:dashes? _* unit:pint { return (dash) ? dash + unit : unit; }
			  / dash:dashes? _* unit:quart { return (dash) ? dash + unit : unit; }
			  / dash:dashes? _* unit:spoons { return (dash) ? dash + unit : unit; }
		  */
			parser = generateParser('unit');
			expect(parser).to.exist;

			parsed = parser.parse('dl');
			console.log(parsed);
			expect(parsed).to.equal('dl');

			parsed = parser.parse('inch');
			console.log(parsed);
			expect(parsed).to.equal('in');

			parsed = parser.parse('tsp');
			console.log(parsed);
			expect(parsed).to.equal('tsp');

			parsed = parser.parse('-tbsp');
			console.log(parsed);
			expect(parsed).to.equal('-tbsp');
		});

		/*----------  Volumes  ----------*/

		it.skip('volume', function() {
			parser = generateParser('volume');
			expect(parser).to.exist;

			parsed = parser.parse('fluid-ounces');
			console.log(parsed);
			expect(parsed).to.equal('fl oz');

			parsed = parser.parse('tbsp');
			console.log(parsed);
			expect(parsed).to.equal('tbsp');

			parsed = parser.parse('cup');
			console.log(parsed);
			expect(parsed).to.equal('c');
		});

		it.skip('fluidOunce', function() {
			parser = generateParser('fluidOunce');
			expect(parser).to.exist;

			parsed = parser.parse('fluid ounce');
			console.log(parsed);
			expect(parsed).to.equal('fl oz');

			parsed = parser.parse('fl-oz');
			console.log(parsed);
			expect(parsed).to.equal('fl oz');
		});

		it.skip('cup', function() {
			parser = generateParser('cup');
			expect(parser).to.exist;

			parsed = parser.parse('cups');
			console.log(parsed);
			expect(parsed).to.equal('c');

			parsed = parser.parse('C.');
			console.log(parsed);
			expect(parsed).to.equal('c');
		});

		it.skip('pint', function() {
			parser = generateParser('pint');
			expect(parser).to.exist;

			parsed = parser.parse('pint');
			console.log(parsed);
			expect(parsed).to.equal('pt');

			parsed = parser.parse('pt.');
			console.log(parsed);
			expect(parsed).to.equal('pt');
		});

		it.skip('quart', function() {
			parser = generateParser('quart');
			expect(parser).to.exist;

			parsed = parser.parse('quart');
			console.log(parsed);
			expect(parsed).to.equal('qt');

			parsed = parser.parse('qt.');
			console.log(parsed);
			expect(parsed).to.equal('qt');
		});

		it.skip('gallon', function() {
			parser = generateParser('gallon');
			expect(parser).to.exist;

			parsed = parser.parse('gals');
			console.log(parsed);
			expect(parsed).to.equal('gal');

			parsed = parser.parse('gal.');
			console.log(parsed);
			expect(parsed).to.equal('gal');
		});

		it.skip('liter', function() {
			parser = generateParser('liter');
			expect(parser).to.exist;

			parsed = parser.parse('ml');
			console.log(parsed);
			expect(parsed).to.equal('ml');

			parsed = parser.parse('liter');
			console.log(parsed);
			expect(parsed).to.equal('l');

			parsed = parser.parse('litre');
			console.log(parsed);
			expect(parsed).to.equal('l');
		});

		it.skip('spoons', function() {
			parser = generateParser('spoons');
			expect(parser).to.exist;

			parsed = parser.parse('tablespoonful');
			console.log(parsed);
			expect(parsed).to.equal('tbsp');

			parsed = parser.parse('T');
			console.log(parsed);
			expect(parsed).to.equal('tbsp');

			parsed = parser.parse('t');
			console.log(parsed);
			expect(parsed).to.equal('tsp');

			parsed = parser.parse('teaspoon');
			console.log(parsed);
			expect(parsed).to.equal('tsp');
		});

		/*----------  Weights  ----------*/

		it.skip('weight', function() {
			parser = generateParser('weight');
			expect(parser).to.exist;

			parsed = parser.parse('wt oz');
			console.log(parsed);
			expect(parsed).to.equal('oz');

			parsed = parser.parse('pounds');
			console.log(parsed);
			expect(parsed).to.equal('lbs');

			parsed = parser.parse('kg');
			console.log(parsed);
			expect(parsed).to.equal('kg');
		});

		it.skip('ounce', function() {
			parser = generateParser('ounce');
			expect(parser).to.exist;

			parsed = parser.parse('ounce');
			console.log(parsed);
			expect(parsed).to.equal('oz');

			parsed = parser.parse('wt ounce');
			console.log(parsed);
			expect(parsed).to.equal('oz');

			parsed = parser.parse('ozs.');
			console.log(parsed);
			expect(parsed).to.equal('oz');
		});

		it.skip('pound', function() {
			parser = generateParser('pound');
			expect(parser).to.exist;

			parsed = parser.parse('lbs');
			console.log(parsed);
			expect(parsed).to.equal('lbs');

			parsed = parser.parse('lb');
			console.log(parsed);
			expect(parsed).to.equal('lb');

			parsed = parser.parse('pound');
			console.log(parsed);
			expect(parsed).to.equal('lb');
		});

		it.skip('gram', function() {
			parser = generateParser('gram');
			expect(parser).to.exist;

			parsed = parser.parse('gram');
			console.log(parsed);
			expect(parsed).to.equal('g');

			parsed = parser.parse('kilo');
			console.log(parsed);
			expect(parsed).to.equal('kg');

			parsed = parser.parse('gs.');
			console.log(parsed);
			expect(parsed).to.equal('g');
		});

		/*----------  Lengths  ----------*/
		it.skip('length', function() {
			parser = generateParser('length');
			expect(parser).to.exist;

			parsed = parser.parse('meters');
			console.log(parsed);
			expect(parsed).to.equal('m');

			parsed = parser.parse('inches');
			console.log(parsed);
			expect(parsed).to.equal('in');

			parsed = parser.parse('ft');
			console.log(parsed);
			expect(parsed).to.equal('ft');
		});

		it.skip('foot', function() {
			parser = generateParser('foot');
			expect(parser).to.exist;

			parsed = parser.parse('feet');
			console.log(parsed);
			expect(parsed).to.equal('ft');

			parsed = parser.parse('foot');
			console.log(parsed);
			expect(parsed).to.equal('ft');

			parsed = parser.parse('‘');
			console.log(parsed);
			expect(parsed).to.equal('ft');
		});

		it.skip('meter', function() {
			parser = generateParser('meter');
			expect(parser).to.exist;

			parsed = parser.parse('millimeters');
			console.log(parsed);
			expect(parsed).to.equal('mm');

			parsed = parser.parse('m');
			console.log(parsed);
			expect(parsed).to.equal('m');

			parsed = parser.parse('cm.');
			console.log(parsed);
			expect(parsed).to.equal('cm');
		});

		it.skip('inch', function() {
			parser = generateParser('inch');
			expect(parser).to.exist;

			parsed = parser.parse('inch');
			console.log(parsed);
			expect(parsed).to.equal('in');

			parsed = parser.parse('ins');
			console.log(parsed);
			expect(parsed).to.equal('in');

			parsed = parser.parse('in.');
			console.log(parsed);
			expect(parsed).to.equal('in');
		});
	});
});