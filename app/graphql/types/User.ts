import { enumType, objectType } from 'nexus';

export const User = objectType({
  name: 'User',
  definition(t) {
    t.string('id');
    t.string('name');
    t.string('email');
    t.string('emailVerified');
    t.string('evernoteAuthToken');
    t.string('evernoteReqToken');
    t.string('evernoteReqSecret');
    t.string('evernoteExpiration');
    t.string('image');
    t.string('createdAt');
    t.string('updatedAt');
    // t.string('importedRecipes');
    t.field('role', { type: Role });
  }
});

const Role = enumType({
  name: 'Role',
  members: ['USER', 'ADMIN'],
})