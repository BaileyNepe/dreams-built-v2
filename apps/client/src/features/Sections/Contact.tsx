import { ContactSchema } from '@dreams-built/shared/src/schemas';
import FmdGoodOutlinedIcon from '@mui/icons-material/FmdGoodOutlined';
import MarkunreadOutlinedIcon from '@mui/icons-material/MarkunreadOutlined';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import SmartphoneOutlinedIcon from '@mui/icons-material/SmartphoneOutlined';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import LinearProgress from '@mui/material/LinearProgress';
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

const CharacterCounter = styled(Box)`
  display: flex;
  flex-direction: column;
  margin-top: 4px;
  width: 100%;
`;

const CounterText = styled(Typography)<{ $isNearLimit: boolean; $isOverLimit: boolean }>`
  align-self: flex-end;
  color: ${({ theme, $isNearLimit, $isOverLimit }) =>
    $isOverLimit
      ? theme.palette.error.main
      : $isNearLimit
        ? theme.palette.warning.main
        : theme.palette.text.secondary};
  font-size: 0.75rem;
  margin-top: 4px;
`;

const StyledProgress = styled(LinearProgress)<{ $value: number }>`
  height: 4px;
  margin-top: 2px;
  width: 100%;

  .MuiLinearProgress-bar {
    background-color: ${({ theme, $value }) => {
      if ($value > 100) return theme.palette.error.main;
      if ($value > 85) return theme.palette.warning.main;
      return theme.palette.primary.main;
    }};
  }
`;

const MAX_MESSAGE_LENGTH = 2000;

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

  // Get message value directly from form watch
  const message = methods.watch('message') || '';
  const messageLength = message.length;

  const isNearLimit = messageLength >= MAX_MESSAGE_LENGTH * 0.85;
  const isOverLimit = messageLength > MAX_MESSAGE_LENGTH;
  const progressValue = (messageLength / MAX_MESSAGE_LENGTH) * 100;

  return (
    <FormBody
      onSubmit={methods.handleSubmit(async (input) => {
        if (input.message.length > MAX_MESSAGE_LENGTH) {
          toast.error(
            `Message exceeds maximum length of ${MAX_MESSAGE_LENGTH} characters`
          );
          return;
        }

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
      isSubmitting={methods.formState.isSubmitting || mutate.isPending}
      buttonIcon={<SendRoundedIcon />}
      buttonText="Send Message"
    >
      <ContactFormContainer>
        <Typography variant="h3" fontWeight={700} gutterBottom color="grey.700">
          Drop Us A Line
        </Typography>
        <Typography variant="caption" sx={{ mb: 2 }}>
          We would love to hear from you! Please fill out the form below and we will get
          back to you as soon as possible.
        </Typography>

        <Stack spacing={0}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextFieldRHF name="name" {...methods} />
          </Stack>
          <TextFieldRHF name="email" fullWidth {...methods} />
          <TextFieldRHF name="phoneNumber" fullWidth {...methods} />
          <TextFieldRHF
            name="message"
            multiline
            rows={8}
            fullWidth
            inputProps={{
              maxLength: MAX_MESSAGE_LENGTH,
              style: { overflowY: 'auto' } // Control the scrollbar
            }}
            {...methods}
          />
          <CharacterCounter>
            <StyledProgress
              variant="determinate"
              value={Math.min(progressValue, 100)}
              $value={progressValue}
            />
            <CounterText
              variant="caption"
              $isNearLimit={isNearLimit}
              $isOverLimit={isOverLimit}
            >
              {messageLength}/{MAX_MESSAGE_LENGTH} characters
            </CounterText>
          </CharacterCounter>
        </Stack>
      </ContactFormContainer>
    </FormBody>
  );
};

const StyledContainer = styled.div`
  background-color: ${({ theme }) => theme.palette.background.default};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  box-shadow: ${({ theme }) => theme.customShadows.heavy};
  display: grid;
  gap: 2rem;
  grid-template-areas: 'details' 'form';
  grid-template-columns: 1fr;
  margin: 1rem;
  max-width: 1000px;
  padding: 2rem;

  @media (min-width: 720px) {
    grid-template-columns: 0.6fr 1fr;
    grid-template-areas: 'details form';
  }
`;

const ContactDetails = styled.div`
  grid-area: details;
`;

const ContactFormWrapper = styled.div`
  grid-area: form;
`;

const StyledDivider = styled(Divider)`
  && {
    border-style: dashed;
    margin: 0 0 2rem;
    width: 100%;
    @media (min-width: 720px) {
      display: none;
    }
  }
`;

export default function ContactSection() {
  return (
    <StyledContainer>
      <ContactDetails>
        <Typography
          variant="h2"
          fontWeight={700}
          gutterBottom
          sx={{ mb: 4 }}
          color="grey.700"
        >
          Contact Us
        </Typography>
        <Stack spacing={3} alignItems="center" sx={{ alignItems: { md: 'flex-start' } }}>
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
        <StyledDivider />
        <ReCaptchaProvider>
          <ContactForm />
        </ReCaptchaProvider>
      </ContactFormWrapper>
    </StyledContainer>
  );
}
