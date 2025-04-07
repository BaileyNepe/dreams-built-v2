import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
import styled, { type DefaultTheme } from 'styled-components';

type Type = 'info' | 'success' | 'warning' | 'error';

export const notify = (message: string, options: { type?: Type } = {}) =>
  toast[options.type ?? 'info'](message);

// Helper function to get the color styles based on toast type
const getToastColorStyles = (type: Type, theme: DefaultTheme) => `
  background-color: ${theme.palette[type].lightest};
  
  svg {
    fill: ${theme.palette[type].main};
  }

  .Toastify__progress-bar--${type} {
    background-color: ${theme.palette[type].main};
  }
`;

const StyledContainer = styled(ToastContainer)`
  &&&.Toastify__toast-container {
    // Add your custom styles for the container here if needed
  }

  .Toastify__toast {
    min-height: 40px; // Set a smaller height
    border-radius: ${(props) =>
      props.theme.shape.borderRadius}px; // Use theme's border radius
  }

  // Apply color styles using the utility function
  .Toastify__toast--success {
    ${(props) => getToastColorStyles('success', props.theme)}
  }
  .Toastify__toast--info {
    ${(props) => getToastColorStyles('info', props.theme)}
  }
  .Toastify__toast--warning {
    ${(props) => getToastColorStyles('warning', props.theme)}
  }
  .Toastify__toast--error {
    ${(props) => getToastColorStyles('error', props.theme)}
  }

  .Toastify__close-button > svg {
    fill: ${(props) =>
      props.theme.palette.text.primary}; // Use a neutral color for the close icon
  }
`;

export const ToastProvider = () => (
  <StyledContainer draggable stacked position="top-center" />
);
