import { ContactSchema } from '@dreams-built/shared/src/schemas';
import FmdGoodOutlinedIcon from '@mui/icons-material/FmdGoodOutlined';
import MarkunreadOutlinedIcon from '@mui/icons-material/MarkunreadOutlined';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import SmartphoneOutlinedIcon from '@mui/icons-material/SmartphoneOutlined';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useContactMutation } from 'api/contact';
import { TextFieldRHF } from 'components/Forms/TextFieldRHF';
import { Socials } from 'components/Socials';
import { FormBody } from 'layouts/FormLayout';
import { ReCaptchaProvider, useReCaptcha } from 'libs/Captcha';
import { type FC } from 'react';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import { useCustomForm } from 'utils/hooks/useForm';

const ContactFormContainer = styled.div`
  padding: 0 0 1rem;
  text-align: left;
`;

export const ContactForm: FC = () => {
  const mutate = useContactMutation();
  const { execute, reset: resetReCaptcha } = useReCaptcha();

  const methods = useCustomForm({
    schema: ContactSchema,
    defaultValues: {
      name: '',
      email: '',
      phoneNumber: '',
      message: ''
    }
  });

  return (
    <FormBody
      onSubmit={methods.handleSubmit(async (input) => {
        try {
          const token = execute();
          if (token) {
            const mutationPromise = mutate.mutateAsync(input, {
              onSuccess: () => {
                methods.reset();
                resetReCaptcha();
              }
            });

            toast.promise(mutationPromise, {
              pending: 'Sending message...',
              success: 'Message sent successfully',
              error: {
                render: (error) =>
                  `Failed to send message: ${(error.data as { message: string })?.message}`
              }
            });

            await mutationPromise;
          } else {
            toast.error('Failed to send message, please try again later');
          }
        } catch {}
      })}
      isSubmitting={methods.formState.isSubmitting}
      buttonIcon={<SendRoundedIcon />}
      buttonText="Send Message"
    >
      <ContactFormContainer>
        <Stack spacing={0}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextFieldRHF name="name" {...methods} />
          </Stack>
          <TextFieldRHF name="email" fullWidth {...methods} />
          <TextFieldRHF name="phoneNumber" fullWidth {...methods} />
          <TextFieldRHF name="message" multiline rows={8} fullWidth {...methods} />
        </Stack>
      </ContactFormContainer>
    </FormBody>
  );
};

// --------------------------
// Styled layout components
// --------------------------
const StyledContainer = styled.div`
  margin: 0 auto;

  @media (min-width: 768px) {
    padding: 4rem 1rem 7rem;
  }
  max-width: 1000px;
  padding: 5rem 1rem 10rem;
`;

const ContactContent = styled.div`
  background-color: ${({ theme }) => theme.palette.background.default};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  box-shadow: ${({ theme }) => theme.customShadows.z8};
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 2rem;
  @media (min-width: 768px) {
    flex-direction: row;
    gap: 3rem;
  }
`;

const ContactDetails = styled.div`
  text-align: center;
  width: 100%;
  @media (min-width: 768px) {
    width: 50%;
    text-align: left;
  }
`;

const ContactFormWrapper = styled.div`
  width: 100%;
  @media (min-width: 768px) {
    width: 65%;
  }
`;

const ContactHeading = styled(Typography)`
  && {
    margin-bottom: ${({ theme }) => theme.spacing(5)};
    text-align: center;
    @media (min-width: 768px) {
      text-align: left;
    }
  }
`;

// --------------------------
// Contact Section
// --------------------------
export default function ContactSection() {
  return (
    <StyledContainer>
      <ContactContent>
        <ContactDetails>
          <ContactHeading variant="h1">Get In Touch</ContactHeading>
          <Stack
            spacing={3}
            alignItems="center"
            sx={{ alignItems: { md: 'flex-start' } }}
          >
            <Stack spacing={1}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <MarkunreadOutlinedIcon sx={{ fontSize: 24 }} />
                <Typography variant="subtitle2">Email</Typography>
              </Stack>
              <Link
                color="inherit"
                variant="body2"
                sx={{ pl: 4 }}
                href="mailto:admin@dreamsbuilt.co.nz"
              >
                admin@dreamsbuilt.co.nz
              </Link>
            </Stack>

            <Stack spacing={1}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <SmartphoneOutlinedIcon sx={{ fontSize: 24 }} />
                <Typography variant="subtitle2">Phone</Typography>
              </Stack>
              <Typography variant="body2" sx={{ pl: 4 }}>
                (021) 412-384
              </Typography>
            </Stack>

            <Stack spacing={1}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <FmdGoodOutlinedIcon sx={{ fontSize: 24 }} />
                <Typography variant="subtitle2">Address</Typography>
              </Stack>
              <Typography variant="body2" sx={{ pl: 4 }}>
                Waikato, New Zealand
              </Typography>
            </Stack>

            <Divider sx={{ borderStyle: 'dashed', width: '100%', my: 2 }} />

            <Stack spacing={1} alignItems="center">
              <Typography variant="overline" fontWeight={700}>
                Follow Us
              </Typography>
              <Socials />
            </Stack>
          </Stack>
        </ContactDetails>
        <ContactFormWrapper>
          <ReCaptchaProvider>
            <ContactForm />
          </ReCaptchaProvider>
        </ContactFormWrapper>
      </ContactContent>
    </StyledContainer>
  );
}
