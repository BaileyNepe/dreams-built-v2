import { useState } from 'react';
import { Button, Card } from 'react-bootstrap';
import { FiArrowRight } from 'react-icons/fi';
import styled from 'styled-components';
import CustomModal from '../Modal';

const StyledCard = styled(Card)`
  background: ${({ theme }) => theme.colors.greys[1000]};
`;

const CardTitle = styled(Card.Title)`
  color: ${({ theme }) => theme.colors.accent.foreground};
  padding: 1rem;
  font-size: ${({ theme }) => theme.fontSizes.base};
`;

const Icon = styled.span`
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
`;

const IconText = styled.span`
  margin-left: 0.5rem;
`;

const CardBody = styled(Card.Body)`
  color: ${({ theme }) => theme.colors.greys[200]};
  padding: 0 1rem 1rem;
`;

const BodyTitle = styled.div`
  color: ${({ theme }) => theme.colors.white};
  font-size: ${({ theme }) => theme.fontSizes['xl']};
  font-weight: bold;
  margin-bottom: 0.2rem;
`;

const CardFooter = styled(Card.Footer)`
  display: flex;
  justify-content: right;
  color: ${({ theme }) => theme.colors.white};
  padding: 0rem 1rem 1rem;
`;

const StyledButton = styled(Button)`
  background-color: unset;
  color: ${({ theme }) => theme.colors.accent.foreground};
  border-color: ${({ theme }) => theme.colors.accent.background};

  &:hover {
    background-color: unset;
    color: ${({ theme }) => theme.colors.accent.foreground};
    border-color: ${({ theme }) => theme.colors.accent.foreground};
    transition: 250ms ease-in-out;
  }
`;

const HorizontalLine = styled.hr`
  color: ${({ theme }) => theme.colors.greys[800]};
  width: 100%;
`;

const IFrameContainer = styled.div`
  position: relative;
  padding-bottom: 56.25%;
  height: 0;
`;

/* -------------------------------------------------------------------------- */
/*                                  COMPONENT                                 */
/* -------------------------------------------------------------------------- */

const InfoBlock = ({
  icon,
  iconText,
  title,
  text,
  link,
}: {
  icon: React.ReactNode;
  iconText: string;
  title: string;
  text: string;
  link: {
    title: string;
    link?: string;
  };
}) => {
  const [modalShow, setModalShow] = useState(false);

  const onClose = () => {
    setModalShow(false);
  };
  return (
    <StyledCard>
      <CardTitle>
        <Icon>{icon}</Icon>
        <IconText>{iconText}</IconText>
      </CardTitle>
      <CardBody>
        <BodyTitle>{title}</BodyTitle>
        {text}
      </CardBody>
      <HorizontalLine />
      <CardFooter>
        <StyledButton onClick={() => setModalShow(true)}>
          {link.title} <FiArrowRight />
        </StyledButton>

        <CustomModal show={modalShow} onHide={onClose} title={link.title}>
          {link.link ? (
            <IFrameContainer>
              <iframe
                src={link.link}
                frameBorder="0"
                title={title}
                allowFullScreen
                style={{ position: 'absolute', top: '0', left: '0', width: '100%', height: '100%' }}
              />
            </IFrameContainer>
          ) : (
            <>
              <p>Contact Email:</p>
              <a href="email:bailey.nepe@gmail.com">bailey.nepe@gmail.com</a>
              <p>Contact Phone:</p>
              <p>021 931 845</p>
            </>
          )}
        </CustomModal>
      </CardFooter>
    </StyledCard>
  );
};

export default InfoBlock;
