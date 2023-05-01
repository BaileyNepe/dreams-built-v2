import { Spinner } from 'react-bootstrap';
import styled from 'styled-components';

const LoaderContainer = styled.div`
  margin: 2rem auto;
  display: block;

  div {
    width: 100px;
    height: 100px;
    margin: auto;
    display: block;
  }
`;

const Loader = () => (
  <LoaderContainer>
    <Spinner animation="border" role="status" />
  </LoaderContainer>
);

export default Loader;
