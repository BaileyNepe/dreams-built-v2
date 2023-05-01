import LoginButton from '@/components/ui/atoms/LoginButton';
import Link from 'next/link';
import { Container, Image, Nav, Navbar } from 'react-bootstrap';
import styled from 'styled-components';

const HeaderWrapper = styled.header`
  grid-area: header;
`;

const Logo = styled(Image)`
  width: 15rem;
`;

const DisplayNoneMobile = styled.div`
  display: none;
`;

const TopNav = styled.div`
  width: 100%;

  @media only screen and (min-width: 61.9375rem) {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    align-items: center;
  }
`;

const Toggle = styled.div`
  grid-area: toggle;
  justify-self: end;

  @media only screen and (max-width: 61.9375rem) {
    button {
      width: min-content;

      span {
        border: 0;
      }
    }
  }
`;

const Collapse = styled(Navbar.Collapse)`
  grid-area: col;
  text-align: center;

  @media only screen and (max-width: 61.9375rem) {
    button {
      align-self: center;
      width: 100%;
      max-width: 10rem;
    }
  }
`;

const Brand = styled.div`
  grid-area: brand;

  @media only screen and (min-width: 61.9375rem) {
    display: none;
  }
`;

const Header = () => {
  return (
    <HeaderWrapper>
      <Navbar bg="dark" variant="dark" expand="lg" collapseOnSelect>
        <Container>
          <TopNav>
            <DisplayNoneMobile>
              <Link href="/" passHref>
                <Navbar.Brand>
                  <Logo src="logo-min.png" />
                </Navbar.Brand>
              </Link>
            </DisplayNoneMobile>
            <Brand>
              <Link href="/" passHref>
                <Navbar.Brand>
                  <Logo src="logo-min.png" />
                </Navbar.Brand>
              </Link>
            </Brand>
            <Toggle>
              <Navbar.Toggle aria-controls="basic-navbar-nav" />
            </Toggle>
            <Collapse id="basic-navbar-nav">
              <Nav>
                <LoginButton />
              </Nav>
            </Collapse>
            <DisplayNoneMobile>
              <LoginButton />
            </DisplayNoneMobile>
          </TopNav>
        </Container>
      </Navbar>
    </HeaderWrapper>
  );
};

export default Header;
