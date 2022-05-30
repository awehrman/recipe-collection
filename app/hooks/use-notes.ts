import { useQuery, useMutation } from '@apollo/client';

import { GET_ALL_NOTES_QUERY } from '../graphql/queries/note';
import { PARSE_NOTES_MUTATION } from '../graphql/mutations/note';

// type IngredientLine = {
  // id: string;
  // createdAt: Date;
  // updatedAt: Date;
//   blockIndex: number;
//   isParsed?: boolean;
//   lineIndex: number;
//   parsed?: {
//     index: number,
//     ingredient: {
//       id: string;
//       isValidated: boolean;
//       name: string;
//     }
//     rule: string;
//     type: string;
//     value: string;
//   }
//   reference: string
//   rule?: string
// }

type InstructionLine = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  blockIndex: number;
  reference: string;
}

type NoteProps = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  evernoteGUID: string;
  // ingredients?: IngredientLine[];
  instructions?: InstructionLine[];
  title: string;
  source?: string;
  image?: string;
  content?: string;
  isParsed: boolean;
  // TODO tags/categories
}

const sortByDateCreatedDesc = (a: NoteProps, b: NoteProps) => (+a.createdAt < +b.createdAt) ? 1 : -1;

function useNotes() {
  const { data, loading, refetch } = useQuery(GET_ALL_NOTES_QUERY);
  let notes: NoteProps[] = (data?.notes ?? []);
  notes = [...notes].sort(sortByDateCreatedDesc)

  const [parseNotes] = useMutation(PARSE_NOTES_MUTATION, {
    update: () => refetch(),
  });

  return {
    notes,
    loading,
    parseNotes,
  };
}

export default useNotes;
