import Evernote from 'evernote';

export const metadataSpec = new Evernote.NoteStore.NotesMetadataResultSpec({
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

export const noteSpec = new Evernote.NoteStore.NoteResultSpec({
  includeContent: true,
  includeResourcesData: true,
  includeResourcesRecognition: false,
  includeResourcesAlternateData: false,
  includeSharedNotes: false,
  includeNoteAppDataValues: true,
  includeResourceAppDataValues: true,
  includeAccountLimits: false,
});