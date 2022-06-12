import { Prisma, PrismaClient } from '@prisma/client';
import * as cheerio from 'cheerio';

import {
  ExistingParsedSegment,
  ImportedNote,
  // Ingredient,
  IngredientLine,
  InstructionLine,
  Note,
  ParsedSegment,
} from '../../../types/note';
import Parser from '../../../lib/line-parser-min';

const findIngredient = async (name: string, prisma: PrismaClient)
  :Promise<Prisma.IngredientCreateNestedOneWithoutParsedSegmentInput | null> => {
    const existing = await prisma.ingredient.findMany({
      where: {
        OR: [
          { name: { equals: name } },
          { plural: { equals: name } },
          // TODO search by plural values
          // TODO search by altNames
        ],
      }
    });

    if (!existing?.length) {
      // TODO determine plural/singular
      const ingredient = await prisma.ingredient.create({ data: { name: name }});
      if (ingredient?.id) {
        return { connect: { id: +ingredient.id } };
      }
    }
    if (existing?.length > 0 && existing?.[0]?.id) {
      // TODO any updates needed here? new plural, altNames or something?
      return { connect: { id: +existing[0].id } };
    }

    return null;
  };

const createParsedSegment = async (parsed: ParsedSegment, prisma: PrismaClient)
  : Promise<Prisma.ParsedSegmentCreateWithoutIngredientLineInput> => {
    const data: Prisma.ParsedSegmentCreateWithoutIngredientLineInput = {
      index: parsed.index,
      rule: parsed.rule,
      type: parsed.type,
      value: parsed.value,
    };
    const hasIngredient = parsed.type === 'ingredient';
    const ingredient: Prisma.IngredientCreateNestedOneWithoutParsedSegmentInput | null =
      hasIngredient
        ? await findIngredient(parsed.value, prisma)
        : null;

    if (hasIngredient && ingredient !== null) {
      data.ingredient = ingredient;
    }

    return data;
};

const updateParsedSegment = async (parsed: ExistingParsedSegment, prisma: PrismaClient)
  : Promise<Prisma.ParsedSegmentUpdateWithWhereUniqueWithoutIngredientLineInput> => {
    const data: Prisma.ParsedSegmentUpdateWithoutIngredientLineInput = {
      index: parsed.index,
      rule: parsed.rule,
      type: parsed.type,
      value: parsed.value,
    };
    // TODO there's probably some disconnections that should happen here
    const hasIngredient = parsed.type === 'ingredient' && !parsed?.ingredient;
    const ingredient: Prisma.IngredientCreateNestedOneWithoutParsedSegmentInput | null =
      hasIngredient
        ? await findIngredient(parsed.value, prisma)
        : parsed?.ingredient?.id ? { connect: { id: +parsed.ingredient.id } } : null;

    if (hasIngredient && ingredient !== null) {
      data.ingredient = ingredient;
    }

    return {
      where: { id: +parsed.id },
      data,
    };
};

const resolveParsedBuild = async (parsed: ParsedSegment, prisma: PrismaClient)
  :Promise<(Prisma.ParsedSegmentCreateNestedManyWithoutIngredientLineInput
    | Prisma.ParsedSegmentUpdateManyWithoutIngredientLineInput)> => {
    const isNewParsedSegment = !parsed?.id;
    if (isNewParsedSegment) {
      const create: Prisma.ParsedSegmentCreateWithoutIngredientLineInput =
        await createParsedSegment(parsed, prisma);
      return { create };
    }
    const update: Prisma.ParsedSegmentUpdateWithWhereUniqueWithoutIngredientLineInput =
        await updateParsedSegment(parsed as ExistingParsedSegment, prisma);
    return { update };
  };

const buildParsedSegments = async (parsedSegments: ParsedSegment[] = [], prisma: PrismaClient)
  : Promise<(Prisma.ParsedSegmentUpdateManyWithoutIngredientLineInput)> => {
      const parsedConnection: (Prisma.ParsedSegmentCreateNestedManyWithoutIngredientLineInput
        | Prisma.ParsedSegmentUpdateManyWithoutIngredientLineInput)[] = await Promise.all(
        parsedSegments.map(async (parsed) => resolveParsedBuild(parsed, prisma)));
      const create = parsedConnection.filter((c) => c?.create).map((c) => c.create);
      const update = parsedConnection.filter((c) => c?.update).map((c) => c.update);
      const result = {};
      if (create.length > 0) {
        result.create = create;
      }
      if (update.length > 0) {
        result.update = update;
      }

      return result;
    };

const createIngredientLine = async (ingredient: IngredientLine, prisma: PrismaClient)
  : Promise<Prisma.IngredientLineCreateWithoutNoteInput>  => {
    const parsed: Prisma.ParsedSegmentCreateNestedManyWithoutIngredientLineInput =
      await buildParsedSegments(ingredient.parsed, prisma);
    return {
      blockIndex: ingredient.blockIndex,
      lineIndex: ingredient.lineIndex,
      reference: ingredient.reference,
      rule: ingredient.rule,
      isParsed: ingredient.isParsed,
      parsed,
    };
  };

const updateIngredientLine = async (ingredient: IngredientLine, prisma: PrismaClient)
  : Promise<Prisma.IngredientLineUpdateWithWhereUniqueWithoutNoteInput>  => {
    const parsed: Prisma.ParsedSegmentUpdateManyWithoutIngredientLineInput =
      await buildParsedSegments(ingredient.parsed, prisma);
    return {
      where: { id: +ingredient.id },
      data: {
        blockIndex: ingredient.blockIndex,
        lineIndex: ingredient.lineIndex,
        reference: ingredient.reference,
        rule: ingredient.rule,
        isParsed: ingredient.isParsed,
        parsed,
      },
    };
  };

const createIngredientLines = async (ingredients: IngredientLine[] = [], prisma: PrismaClient)
: Promise<Prisma.IngredientLineCreateWithoutNoteInput[]> =>
  Promise.all(
    ingredients.map(async (ingredient: IngredientLine) => createIngredientLine(ingredient, prisma))
  );

const updateIngredientLines = async (ingredients: IngredientLine[] = [], prisma: PrismaClient)
: Promise<Prisma.IngredientLineUpdateWithWhereUniqueWithoutNoteInput[]> =>
  Promise.all(
    ingredients.map(async (ingredient: IngredientLine) =>
      updateIngredientLine(ingredient, prisma))
  );

const buildIngredientLines = async (ingredients: IngredientLine[] = [], prisma: PrismaClient)
  : Promise<Prisma.IngredientLineUpdateManyWithoutNoteInput> => {
    const isCreateIngredients = ingredients?.[0]?.id === undefined;
    if (isCreateIngredients) {
      const create: Promise<Prisma.IngredientLineCreateWithoutNoteInput[]> =
        await createIngredientLines(ingredients, prisma);
      return { create };
    }

    const update: Promise<Prisma.IngredientLineUpdateWithWhereUniqueWithoutNoteInput> =
      await updateIngredientLines(ingredients, prisma);
    return { update };
};

const saveNote = async (note: Note, prisma: PrismaClient): Promise<Note> => {
  // TODO this a pretty dumb check; will want to replace this with _.every
  const isCreateInstructions = note.instructions?.[0]?.id === undefined;

  const instructions: Prisma.InstructionLineUpdateManyWithoutNoteInput = isCreateInstructions
    ? (
      {
        create: note.instructions.map(({ blockIndex, reference }) => ({
          blockIndex,
          reference,
        }))
      }
    ) : (
      {
        update: note.instructions.map(({ id, blockIndex, reference }) => ({
          where: { id },
          data: { blockIndex, reference }, // ? updatedAt
        }))
      }
    );

  const ingredients: Promise<Prisma.IngredientLineUpdateManyWithoutNoteInput> =
    await buildIngredientLines(note.ingredients, prisma);

  const noteResult = await prisma.note.update({
    data: {
      // TODO eventually we'll add in the ability to edit these
      // title: note.title,
      // source: note.source,
      // // categories?:
      // // tags?:
      // image: note.image,
      // content: note.content,
      isParsed: true,
      instructions,
      ingredients
    },
    where: { id: note.id },
  });

  const updatedInstructions = await prisma.instructionLine.findMany({
    where: { noteId: note.id },
  });

  const updatedIngredients = await prisma.ingredientLine.findMany({
    where: { noteId: note.id },
  });

  return {
    ...noteResult,
    ingredients: updatedIngredients, // TODO do we also need to query parsed again?
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
  console.log('~~~~~~', JSON.stringify(parsedNotes, null, 2));
  return parsedNotes;
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

const parseHTML = (content: string, note: Note | ImportedNote) => {
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
  const parsedIngredientLines = ingredients.map((line) =>
    parseIngredientLine(line)
  );

  // if we've previously parsed this, check changes
  if (
    (note as Note).instructions !== undefined &&
    (note as Note)?.instructions?.length > 0
  ) {
    if ((note as Note).instructions.length === instructions.length) {
      instructions = instructions.map((line, index: number) => ({
        ...line,
        id: (note as Note)?.instructions?.[index]?.id,
      }));
    } else {
      throw new Error(
        'Wehrman you never implemented this feature for instructions!'
      );
    }
  }

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
        ...
		]
	}
*/
const parseIngredientLine = (line: string) => {
  // IngredientLine
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
    ingredientLine.parsed = parsed.values.map((data, index: number) => ({
      ...data,
      index,
      value: data.value.trim(),
    }));
  } catch (err) {
    console.log(`OH FUCK! failed to parse lineIndex: ${ingredientLine.reference}`);
    console.log(line);
    // TODO log failures to db
  }

  return ingredientLine;
};
