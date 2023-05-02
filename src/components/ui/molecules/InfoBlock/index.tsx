import { useState } from 'react';
import { Button, Card } from 'react-bootstrap';
import { FiArrowRight } from 'react-icons/fi';
import styled from 'styled-components';

// import ContactModal from './modals/ContactModal';

// import VideoModal from './modals/VideoModal';

const StyledCard = styled(Card)`
  background: ${({ theme }) => theme.colors.greys[1000]};
`;

const CardTitle = styled(Card.Title)`
  color: ${({ theme }) => theme.colors.accent.foreground};
  padding: 1rem;
  font-size: 1rem;
`;

const Icon = styled.span`
  font-size: 1.5rem;
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
  font-size: 1.2rem;
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
        {/* {link.link ? (
          <VideoModal show={modalShow} setModalShow={setModalShow} src={link.link} title={title} onHide={() => setModalShow(false)} />
        ) : (
          <ContactModal show={modalShow} setModalShow={setModalShow} title={title} onHide={() => setModalShow(false)} />
        )} */}
      </CardFooter>
    </StyledCard>
  );
};

export default InfoBlock;
