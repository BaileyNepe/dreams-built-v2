import { Col, Container, Row } from 'react-bootstrap';
import styled from 'styled-components';

const FooterContainer = styled.footer`
  grid-area: footer;
  font-size: 0.7rem;
  color: ${({ theme }) => theme.colors.white};
`;

const Footer = () => {
  return (
    <FooterContainer className="bg-dark">
      <Container>
        <Row>
          <Col className="text-center py3 m-3"> Dreams Built &copy; {new Date().getFullYear()}</Col>
        </Row>
      </Container>
    </FooterContainer>
  );
};

export default Footer;
