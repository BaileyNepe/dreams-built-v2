import { useCallback } from 'react';
import { Form } from 'react-bootstrap';
import CustomModal from '..';

const TextInputModal = ({
  show,
  onHide,
  title,
  size = 'lg',
  characterLimit = 500,
  input,
  setInput,
}: {
  show: boolean;
  onHide: () => void;
  title: string;
  input: string;
  setInput: (input: string) => void;
  size?: 'sm' | 'lg' | 'xl';
  characterLimit?: number;
}) => {
  const setFormattedComment = useCallback(
    (typedText: string) => {
      setInput(typedText.slice(0, characterLimit));
    },
    [characterLimit, setInput],
  );

  return (
    <CustomModal show={show} onHide={onHide} title={title} size={size} centered={true}>
      <Form.Group controlId={title}>
        <Form.Label>{title}:</Form.Label>
        <Form.Control
          style={{ width: '100%', padding: '0.5rem 0.7rem', minHeight: '10rem' }}
          as='textarea'
          placeholder='Begin message...'
          value={input}
          onChange={(e) => setFormattedComment(e.target.value)}
        />
      </Form.Group>
      <p style={{ color: 'grey', fontStyle: 'italic' }}>
        {input.length}/{characterLimit}
      </p>
    </CustomModal>
  );
};

export default TextInputModal;
