import SearchBox from '@/components/ui/atoms/SearchBox';
import { Button } from 'react-bootstrap';

import Link from 'next/link';
import styles from './style.module.css';

const HeaderSearchGroup = ({
  setSearch,
  link,
  title,
  addition = true,
}: {
  setSearch: (search: string) => void;
  link: string;
  title: string;
  addition?: boolean;
}) => (
  <div className={styles.header}>
    <h1 className={styles.title}>{title}</h1>
    <div className={styles.add}>
      {addition && (
        <Link href={link}>
          <Button className={styles.btn}>+</Button>
        </Link>
      )}
    </div>
    <div className={styles.search}>
      <SearchBox setSearch={setSearch} />
    </div>
  </div>
);

export default HeaderSearchGroup;
