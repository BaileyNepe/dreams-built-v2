import { ConfigSchema } from './types';

export const config: ConfigSchema = {
  admin: {
    portalMessage: { variant: 'success', message: "You're in the Admin portal" },
    content: [
      {
        iconText: 'Schedule',
        title: 'Need help figuring things out?',
        text: 'Watch this explanation video, to learn how to use the Job Schedule.',
        linkTitle: 'Help Center',
        linkUrl: 'https://www.loom.com/embed/8e22009ec07741768244878dfe84780b?hide_owner=true&hide_share=true&hide_title=true&hideEmbedTopBar=true',
      },
      {
        iconText: 'Job Reports',
        title: 'Need help figuring things out?',
        text: 'Watch this explanation video, to learn how to use the Reports.',
        linkTitle: 'Help Center',
        linkUrl: 'https://www.loom.com/embed/590488f9bd704092af3c5ba508b3b435?hide_owner=true&hide_share=true&hide_title=true&hideEmbedTopBar=true',
      },
    ],
  },
  employee: {
    portalMessage: { variant: 'success', message: "You're in the Employee portal" },
    content: [
      {
        iconText: 'Video Tutorial',
        title: 'Need help figuring things out?',
        text: 'Watch this explanation video, to learn how to use the Employee Dashboard.',
        linkTitle: 'Demo',
        linkUrl: 'https://www.loom.com/embed/80058a2a069d477b9bd194ad089fdc34?hide_owner=true&hide_share=true&hide_title=true&hideEmbedTopBar=true',
      },
      {
        iconText: 'Help Center',
        title: 'Need help figuring things out?',
        text: 'Contact us here.',
        linkTitle: 'Help Center',
      },
    ],
  },
  default: {
    portalMessage: { variant: 'info', message: 'You have not been added to the employee list yet, please contact your employer.' },
    content: [
      {
        iconText: 'Contact',
        title: 'Need help figuring things out?',
        text: 'Contact us here.',
        linkTitle: 'Contact',
      },
      {
        iconText: 'Contact',
        title: 'Need help figuring things out?',
        text: 'Contact us here.',
        linkTitle: 'Contact',
      },
    ],
  },
};
