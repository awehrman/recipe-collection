import { extendType, enumType, idArg, objectType } from 'nexus';

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
    t.string('noteImportOffset');
    // t.string('importedRecipes');
    t.field('role', { type: Role });
  }
});

export const UserQuery = extendType({
  type: 'Query',
  definition(t) {
    t.field('user', {
      type: 'User',
      args: {
        id: idArg(),
      },
      resolve: async (root, args, ctx) => {
        const id = parseInt(`${args.id}`, 10);
        const user = await ctx.prisma.user.findUnique({
          where: { id }
        });
        console.log({ user });
        return user;
      },
    });
  },
});

const Role = enumType({
  name: 'Role',
  members: ['USER', 'ADMIN'],
})