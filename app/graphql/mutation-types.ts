
import { mutationType, nullable, stringArg } from '@nexus/schema';
import Evernote from 'evernote';

const client = new Evernote.Client({
	consumerKey: process.env.API_CONSUMER_KEY,
	consumerSecret: process.env.API_CONSUMER_SECRET,
	sandbox: process.env.SANDBOX,
	china: process.env.CHINA,
});

const Mutation = mutationType({
  definition(t) {
    t.field('authenticateEvernote', {
      type: 'AuthenticationResponse',
      args: {
        oauthVerifier: nullable(stringArg())
      },
      async resolve(_parent, args, ctx) {
        // const isClientTokenSet = Boolean(client.token);
        console.log('do i have anything in my session? or even a request?');
        console.log({ ctx, args });
        // const { count } = await ctx.prisma.user.deleteMany({});
        // return `${count} user(s) destroyed.`;
        const response = {
          id: 1,
          typename: '__AuthenticationResponse',
          authURL: '',
          errors: '',
          isAuthPending: false,
          isAuthenticated: false,
        };

        return response;
      }
    });

    t.crud.createOneUser();
    t.crud.deleteOneUser();
    t.crud.updateOneUser();
  }
});

export default Mutation;