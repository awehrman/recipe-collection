
import { objectType } from '@nexus/schema';

export const AuthenticationResponse = objectType({
  name: 'AuthenticationResponse',
  definition(t) {
    t.model.id();
    t.model.authURL();
    t.model.errors();
    t.model.isAuthPending();
    t.model.isAuthenticated();
  }
});

export const User = objectType({
  name: 'User',
  definition(t) {
    t.model.id();
    t.model.name();
    t.model.email();
    t.model.emailVerified();
    t.model.evernoteAuthToken();
    t.model.evernoteReqToken();
    t.model.evernoteReqSecret();
    t.model.evernoteExpiration();
    t.model.image();
    t.model.createdAt();
    t.model.updatedAt();
    t.model.importedRecipes();
    t.model.role();
  }
});

export const Account = objectType({
  name: 'Account',
  definition(t) {
    t.model.id();
    t.model.compoundId();
    t.model.userId();
    t.model.providerType();
    t.model.providerId();
    t.model.providerAccountId();
    t.model.refreshToken();
    t.model.accessToken();
    t.model.accessTokenExpires();
    t.model.createdAt();
    t.model.updatedAt();
  }
});

export const Session = objectType({
  name: 'Session',
  definition(t) {
    t.model.id();
    t.model.userId();
    t.model.expires();
    t.model.sessionToken();
    t.model.accessToken();
    t.model.createdAt();
    t.model.updatedAt();
  }
});

export const Ingredient = objectType({
  name: 'Ingredient',
  definition(t) {
    t.model.id();
    t.model.createdAt();
    t.model.updatedAt();
    t.model.name();
    t.model.plural();
    t.model.alternateNames();
    t.model.properties();
    t.model.isComposedIngredient();
    t.model.isValidated();

    t.model.parent();
    t.model.parentId();
    t.model.relatedIngredients();
    t.model.substitutes();
    t.model.referencedSubstitutes();
    t.model.references();
  }
});

export const AlternateName = objectType({
  name: 'AlternateName',
  definition(t) {
    t.model.name();
    t.model.ingredient();
    t.model.ingredientId();
  }
});

export const Recipe = objectType({
  name: 'Recipe',
  definition(t) {
    t.model.id();
    t.model.createdAt();
    t.model.updatedAt();
    t.model.importedUser();
    t.model.importedUserId();

    t.model.evernoteGUID();
    t.model.title();
    t.model.sources();
    t.model.image();

    t.model.book();
    t.model.bookId();

    t.model.categories();
    t.model.tags();

    t.model.ingredients();
    t.model.instructions();
  }
});

export const Category = objectType({
  name: 'Category',
  definition(t) {
    t.model.id();
    t.model.name();
    t.model.evernoteGUID();
    t.model.recipes();
  }
});

export const Tag = objectType({
  name: 'Tag',
  definition(t) {
    t.model.id();
    t.model.name();
    t.model.evernoteGUID();
    t.model.recipes();
  }
});

export const IngredientLine = objectType({
  name: 'IngredientLine',
  definition(t) {
    t.model.id();
    t.model.createdAt();
    t.model.updatedAt();
    t.model.blockIndex();
    t.model.lineIndex();
    t.model.reference();
    t.model.rule();
    t.model.isParsed();
    t.model.parsed();

    t.model.recipe();
    t.model.recipeId();

    t.model.note();
    t.model.noteId();
  }
});

export const InstructionLine = objectType({
  name: 'InstructionLine',
  definition(t) {
    t.model.id();
    t.model.createdAt();
    t.model.updatedAt();
    t.model.blockIndex();
    t.model.reference();

    t.model.recipe();
    t.model.recipeId();

    t.model.note();
    t.model.noteId();
  }
});

export const ParsedSegment = objectType({
  name: 'ParsedSegment',
  definition(t) {
    t.model.id();
    t.model.createdAt();
    t.model.updatedAt();

    t.model.index();
    t.model.rule();
    t.model.type();
    t.model.value();

    t.model.ingredient();
    t.model.ingredientId();

    t.model.ingredientLine();
    t.model.ingredientLineId();
  }
});

export const Note = objectType({
  name: 'Note',
  definition(t) {
    t.model.id();
    t.model.createdAt();
    t.model.updatedAt();
    t.model.evernoteGUID();
    t.model.title();
    t.model.source();

    t.model.categories();
    t.model.tags();

    t.model.image();
    t.model.content();
    t.model.isParsed();

    t.model.ingredients();
    t.model.instructions();
  }
});

export const Book = objectType({
  name: 'Book',
  definition(t) {
    t.model.id();
    t.model.title();

    t.model.author();
    t.model.authorId();

    t.model.recipes();
  }
});

export const Author = objectType({
  name: 'Author',
  definition(t) {
    t.model.id();
    t.model.name();
    t.model.books();
  }
});


