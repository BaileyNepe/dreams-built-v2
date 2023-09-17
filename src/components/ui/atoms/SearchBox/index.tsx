import { Button, Form } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';

import styles from './style.module.css';

const SearchBox = ({ setSearch }: { setSearch: (search: string) => void }) => (
  <div className={styles.parent}>
    <Form.Control
      type='text'
      name='q'
      onChange={(e) => setSearch(e.target.value)}
      placeholder='Search...'
      className={styles.input}
    />
    <Button type='submit' variant='primary' className={styles.btn}>
      <FaSearch />
    </Button>
  </div>
);

export default SearchBox;
