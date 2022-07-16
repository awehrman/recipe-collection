import { stringArg, extendType, idArg, objectType } from 'nexus';

export const Container = objectType({
  name: 'Container',
  definition(t) {
    t.string('id');
    t.string('name');
  },
});

export const ContainerQuery = extendType({
  type: 'Query',
  definition(t) {
    t.field('container', {
      type: 'Container',
      args: { id: idArg() },
      resolve: async (root, args, ctx) => {
        const id = parseInt(`${args.id}`, 10);
        // TODO
        const container = { id, name: 'TODO container'}
        return {
          container,
        };
      },
    });
  },
});

export const ContainersQuery = extendType({
  type: 'Query',
  definition(t) {
    t.list.field('containers', {
      type: 'Container',
      args: { group: stringArg(), view: stringArg() },
      resolve: async (_root, args, ctx) => {
        console.log('containers');
        const { group = 'name', view = 'all' } = args;
        const { prisma } = ctx;
        const where = view === 'new' ? { isValidated: false } : {};
        const ingredients = await prisma.ingredient.findMany({
          where,
          select: {
            id: true,
            name: true,
          }
        });
        const containers = [];

        containers.push({
          id: `container_0`,
          name: view === 'new' ? 'New Ingredients' : 'All Ingredients'
        });
        console.log({ ingredients, containers })
        // TODO create other containers per group
        return containers;
      },
    });
  },
});
