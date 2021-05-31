
import { mutationType } from '@nexus/schema';

const Mutation = mutationType({
  definition(t) {
    // t.field('bigRedButton', {
    //   type: 'String',
    //   async resolve(_parent, _args, ctx) {
    //     const { count } = await ctx.prisma.user.deleteMany({});
    //     return `${count} user(s) destroyed.`;
    //   }
    // });

    t.crud.createOneUser();
    t.crud.deleteOneUser();
    t.crud.updateOneUser();
  }
});

export default Mutation;