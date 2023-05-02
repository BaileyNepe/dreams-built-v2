import { Modal } from 'react-bootstrap';
import styled from 'styled-components';

const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
`;

const CustomModal = ({
  show,
  onHide,
  size = 'sm',
  centered = true,
  title,
  children,
}: {
  show: boolean;
  onHide: () => void;
  size?: 'sm' | 'lg' | 'xl';
  centered?: boolean;
  title: string;
  children: React.ReactNode;
}) => {
  return (
    <Modal show={show} onHide={onHide} size={size} centered={centered}>
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          <Title>{title}</Title>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>{children}</Modal.Body>
    </Modal>
  );
};

export default CustomModal;
