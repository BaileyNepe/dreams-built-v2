import { publicProcedure, trpc } from '@config/trpc';
import { ContactSchema } from '@dreams-built/shared/src/schemas';
import { logInfo } from '@utils/logger';

export const contactRouter = trpc.router({
  contact: publicProcedure.input(ContactSchema).mutation(async ({ input, ctx }) => {
    const { name, email, phoneNumber, message } = input;

    logInfo({
      message: 'Contact form submission',
      details: { name, email, phoneNumber, message, ctx: ctx.req.ip }
    });

    await ctx.db.contact.create({
      data: {
        name,
        email,
        phone: phoneNumber,
        message
      }
    });

    return {
      success: true,
      message: 'Contact form submitted successfully'
    };
  })
});
