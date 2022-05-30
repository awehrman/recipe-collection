import { PrismaClient } from '@prisma/client';
import cheerio from 'cheerio';
// import { Note } from '@prisma/client'; this doesn't have any of the relation types on it

import { NoteProps } from '../../../components/notes/types';
import Parser from '../../../lib/line-parser-min';

type IngredientLine = {
  blockIndex: number;
  isParsed?: boolean;
  lineIndex: number;
  parsed?: {
    index: number,
    ingredient: {
      id: number;
      isValidated: boolean;
      name: string;
    }
    rule: string;
    type: string;
    value: string;
  }
  reference: string
  rule?: string
}


type InstructionLine = {
  id: number;
  createAt: string;
  updatedAt: string;
  blockIndex: number;
  reference: string;
}

export const parseNotesContent = (notes: NoteProps[]) => {
	const parsedNotes = notes.map((note) => {
		const { content } = note;
		if (!content) {
			throw new Error(`Note: ${note?.title ?? note.evernoteGUID} is missing content!`);
		}
		const { ingredients, instructions } = parseContent(content);
		return {
			...note,
			ingredients,
			instructions,
		}
	});
	// TODO save updates to prisma
	return parsedNotes;
};

const saveNote = async (note: NoteProps, prisma: PrismaClient): Promise<NoteProps> => {
  // clear out any previous relations
  delete note.ingredients;
  console.log(JSON.stringify({
    instructions: {
      upsert: (note?.instructions ?? []).map((instruction) => ({
        create: { ...instruction },
        update: { ...instruction },
        where: { id: instruction.id },
      })),
    },
  }, null, 2));

  // update relations
  const result = await prisma.note.update({
    data: {
      // title: note.title,
      // source: note.source,
      // // categories?:
      // // tags?:
      // image: note.image,
      // content: note.content,
      // isParsed: note.isParsed,
      instructions: {
        upsert: (note?.instructions ?? []).map((instruction) => ({
          create: { ...instruction },
          update: { ...instruction },
          where: { id: instruction.id },
        })),
      },
    },
    where: { id: note.id },
  });
  return result;
};

export const saveNotes = async (notes: NoteProps[], prisma: PrismaClient): Promise<NoteProps[]> => {
  console.log('saveNotes');
  const result = await Promise.all(notes.map((note) => saveNote(note, prisma)));
  return result;
}

const parseContent = (content: string) => {
	const { ingredients, instructions } = parseHTML(content);

	return {
		ingredients,
		instructions,
	};
};

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

const parseHTML = (content: string) => {
  const ingredients: IngredientLine[] = [];
  const instructions: InstructionLine[] = [];

  // load our string dom content into a cheerio object
  // this will allow us to easily traverse the DOM tree
  const $ = cheerio.load(content);

  const body = $('body').children();
  const { children } = body[0];

  let currentBlock: unknown[] = [];
  const blocks: unknown[] = [];


  // TODO wehrman you should really re-write this
  children.forEach((div) => {
    const numChildren = (div.children && div.children.length) ? div.children.length : 0;
    let textNode = (numChildren > 0) ? div.children[0] : null;
    if (numChildren > 1) {
      textNode = div.children.find((c) => c.type === 'text');
    }
    const data = textNode && textNode.data && textNode.data.trim();
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
      block.forEach((line: string, lineIndex: number) => {
        ingredients.push({
          blockIndex,
          lineIndex,
          reference: line,
        });
      });
    } else if (block?.length === 1) {
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
        reference: `${line}`,
      });
    });
  }

  // if we still have leftovers in the current block and blocks is populated, then its a leftover instruction
  if ((blocks.length > 0) && (currentBlock.length > 0)) {
    currentBlock.forEach((line) => {
      instructions.push({
        blockIndex: blocks.length,
        reference: `${line}`,
      });
    });
  }

  // parse each ingredient line into its individual components
  const ingredientLines = ingredients.map((line) => parseIngredientLine(line));

  return {
    ingredients: ingredientLines,
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
const parseIngredientLine = (line: IngredientLine) => {
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
		ingredientLine.parsed = parsed.values.map((data, index) => ({
			...data,
			index,
			value: data.value.trim(),
		}));
	} catch (err) {
		console.log(`failed to parse lineIndex: ${ ingredientLine.reference }`);
		console.log(line);
		// TODO log failures to db
	}

	return ingredientLine;
};
