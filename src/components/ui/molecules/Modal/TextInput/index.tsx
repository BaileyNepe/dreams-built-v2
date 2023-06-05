import type React from 'react';
import { useCallback, useState } from 'react';
import CustomModal from '..';

const TextInputModal = ({
  show,
  onHide,
  title,
  size = 'lg',
  children,
  characterLimit = 500,
}: {
  show: boolean;
  onHide: () => void;
  title: string;
  size?: 'sm' | 'lg' | 'xl';
  children: React.ReactNode;
  characterLimit?: number;
}) => {
  const [text, setText] = useState<string>('');

  const setFormattedComment = useCallback(
    (typedText: string) => {
      setText(typedText.slice(0, characterLimit));
    },
    [characterLimit, setText],
  );

  return (
    <CustomModal show={show} onHide={onHide} title={title} size={size} centered={true}>
      {children}
    </CustomModal>
  );
};

export default TextInputModal;
