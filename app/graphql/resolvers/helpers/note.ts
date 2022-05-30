import { PrismaClient } from '@prisma/client';
import * as cheerio from 'cheerio';

import { InstructionLine, Note } from '../../../types/note';
import Parser from '../../../lib/line-parser-min';

export const parseNotesContent = (notes: Note[]) => {
  const parsedNotes = notes.map((note) => {
    const { content } = note;
    if (!content) {
      throw new Error(
        `Note: ${note?.title ?? note.evernoteGUID} is missing content!`
      );
    }
    const { ingredients, instructions } = parseContent(content, note);
    return {
      ...note,
      ingredients,
      instructions,
    };
  });
  return parsedNotes;
};

const saveNote = async (note: Note, prisma: PrismaClient): Promise<Note> => {
  const instructions = {
    upsert: note.instructions.map((instruction: InstructionLine) => ({
      where: { id: instruction?.id },
      update: { ...instruction },
      create: {
        blockIndex: instruction.blockIndex,
        reference: instruction.reference,
      },
    }))
  };

  const noteResult = await prisma.note.update({
    data: {
      // title: note.title,
      // source: note.source,
      // // categories?:
      // // tags?:
      // image: note.image,
      content: note.content,
      isParsed: true,
      instructions,
      // ingredients
    },
    where: { id: note.id },
  });

  const updatedInstructions = await prisma.instructionLine.findMany({
    where: { noteId: note.id },
  });

  return {
    ...noteResult,
    instructions: updatedInstructions,
  };
};

export const saveNotes = async (
  notes: Note[],
  prisma: PrismaClient
): Promise<Note[]> => {
  const result = await Promise.all(notes.map((note) => saveNote(note, prisma)));
  return result;
};

const parseContent = (content: string, note: Note) => {
  const { ingredients, instructions } = parseHTML(content, note);

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

const parseHTML = (content: string, note: Note) => {
  const ingredients: unknown[] = []; // TODO
  let instructions: InstructionLine[] = [];

  // load our string dom content into a cheerio object
  // this will allow us to easily traverse the DOM tree
  const $ = cheerio.load(content);

  const body = $('body').children();
  const { children } = body[0];

  let currentBlock: unknown[] = [];
  const blocks: unknown[] = [];

  // TODO wehrman you should really re-write this
  children.forEach((div) => {
    const numChildren =
      div.children && div.children.length ? div.children.length : 0;
    let textNode = numChildren > 0 ? div.children[0] : null;
    if (numChildren > 1) {
      textNode = div.children.find((c) => c.type === 'text');
    }
    const data = textNode && textNode.data && textNode.data.trim();
    const hasContent = Boolean(data);

    if (!hasContent && currentBlock.length > 0) {
      blocks.push(currentBlock);
      currentBlock = [];
    } else if (data && data.length > 0) {
      currentBlock.push(data);
    }
  });

  blocks.forEach((block, blockIndex) => {
    // add ingredient lines if its the first line, or if we have multiple lines per block
    if (blockIndex === 0 || block.length > 1) {
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
  if (blocks.length === 0 && currentBlock.length > 0) {
    currentBlock.forEach((line, lineIndex) => {
      ingredients.push({
        blockIndex: 0,
        lineIndex,
        reference: `${line}`,
      });
    });
  }

  // if we still have leftovers in the current block and blocks is populated, then its a leftover instruction
  if (blocks.length > 0 && currentBlock.length > 0) {
    currentBlock.forEach((line) => {
      instructions.push({
        blockIndex: blocks.length,
        reference: `${line}`,
      });
    });
  }

  // parse each ingredient line into its individual components
  let parsedIngredientLines = ingredients.map((line) =>
    parseIngredientLine(line)
  );
  console.log({ note });
  // if we've previously parsed this, check changes
  if (note?.ingredients?.length || note?.instructions?.length) {
    if (note?.ingredients?.length === parsedIngredientLines.length) {
      parsedIngredientLines = parsedIngredientLines.map((line, index) => ({
        ...line,
        id: note.ingredients[index].id,
      }));
    } else {
      // TODO and come back to deal with this case
      throw new Error(
        'Wehrman you never implemented this feature for ingredients!'
      );
    }
    if (note?.instructions?.length === instructions.length) {
      instructions = instructions.map((line, index) => ({
        ...line,
        id: note.instructions[index].id,
      }));
    } else {
      throw new Error(
        'Wehrman you never implemented this feature for instructions!'
      );
    }
  }
  console.log({ instructions });
  return {
    ingredients: parsedIngredientLines,
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
    console.log(`failed to parse lineIndex: ${ingredientLine.reference}`);
    console.log(line);
    // TODO log failures to db
  }

  return ingredientLine;
};
