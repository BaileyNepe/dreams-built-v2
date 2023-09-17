import { Form } from 'react-bootstrap';
import styled from 'styled-components';

const FormSelect = styled(Form)`
  min-width: 4.3rem;
  max-width: 8.5rem;
`;

const Limit = ({ setLimit, limit }: { setLimit: (value: string) => void; limit: string }) => (
  <FormSelect>
    <Form.Group controlId={`limit`}>
      <Form.Control
        as='select'
        style={{ color: 'gray' }}
        className='form-select form-select-md'
        defaultValue={limit}
        onChange={(e) => setLimit(e.target.value)}
      >
        <option value='25'>25 per page</option>
        <option value='50'>50 per page</option>
        <option value='75'>75 per page</option>
        <option value='100'>100 per page</option>
      </Form.Control>
    </Form.Group>
  </FormSelect>
);

export default Limit;
