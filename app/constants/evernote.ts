import Evernote from 'evernote';

export const METADATA_NOTE_SPEC = new Evernote.NoteStore.NotesMetadataResultSpec({
  includeTitle: true,
  includeContentLength: false,
  includeCreated: false,
  includeUpdated: false,
  includeDeleted: false,
  includeUpdateSequenceNum: false,
  includeNotebookGuid: false,
  includeTagGuids: false,
  includeAttributes: true, // needed for source
  includeLargestResourceMime: false,
  includeLargestResourceSize: false,
});

export const NOTE_SPEC = new Evernote.NoteStore.NoteResultSpec({
  includeContent: true,
  includeResourcesData: true,
  includeResourcesRecognition: false,
  includeResourcesAlternateData: false,
  includeSharedNotes: false,
  includeNoteAppDataValues: true,
  includeResourceAppDataValues: true,
  includeAccountLimits: false,
});

export const NOTE_FILTER = new Evernote.NoteStore.NoteFilter();
export const MAX_NOTES_LIMIT = parseInt(`${process.env.DOWNLOAD_LIMIT}`) ?? 1;