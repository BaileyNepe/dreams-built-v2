import CloseIcon from '@mui/icons-material/Close';
import { IconButton, Typography } from '@mui/material';
import Modal from '@mui/material/Modal';
import { type FC } from 'react';
import styled from 'styled-components';

/* STYLES */

const Container = styled.div<{
  $width?: string;
  $height?: string;
  $padding?: string;
  $rows: number;
}>`
  background-color: ${({ theme }) => theme.palette.background.paper};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  box-shadow: 0 0 1rem 0 rgba(0, 0, 0, 0.2);
  display: grid;
  grid-template-rows: ${({ $rows }) => ($rows === 2 ? 'min-content auto' : 'auto')};
  height: ${({ $height }) => $height ?? 'auto'};
  left: 50%;
  max-height: 80dvh;
  max-width: 80vw;
  /* overflow: auto; */
  padding: ${({ $padding }) => $padding ?? '1rem'};
  position: relative;
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: ${({ $width }) => $width ?? '30rem'};
  z-index: 99999;
`;

const Header = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  button {
    margin-left: auto;
  }
`;

const HeaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
`;

export const CloseButton = styled(IconButton)`
  &&& {
    background-color: ${({ theme }) => theme.palette.grey[300]};
    cursor: pointer;
    height: 2rem;
    opacity: 0.8;
    padding: 0.6rem;
    position: absolute;
    right: -1.5rem;
    top: -1.5rem;
    width: 2rem;
    z-index: 999999;

    &:hover {
      opacity: 1;
    }
  }
`;

const ChildContainer = styled.div`
  overflow-y: auto;
`;

/* COMPONENT */

const BasicModal: FC<{
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  width?: string;
  height?: string;
  hasHeader?: boolean;
  padding?: string;
  hasCloseIcon?: boolean;
}> = ({
  open = false,
  onClose,
  children,
  title,
  width,
  height,
  padding,
  hasHeader = true,
  hasCloseIcon = false
}) => (
  <Modal
    open={open}
    onClose={onClose}
    aria-labelledby={title ? `${title}-modal` : 'modal'}
  >
    <Container
      $width={width}
      $height={height}
      $padding={padding}
      $rows={hasHeader ? 2 : 1}
    >
      {hasCloseIcon && (
        <CloseButton onClick={onClose}>
          <CloseIcon />
        </CloseButton>
      )}
      {hasHeader && (
        <HeaderContainer>
          <Header>
            {title && <Typography variant="h4">{title}</Typography>}
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Header>
        </HeaderContainer>
      )}
      <ChildContainer>{children}</ChildContainer>
    </Container>
  </Modal>
);

export default BasicModal;
