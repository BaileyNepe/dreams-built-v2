import { type FC } from 'react';
import { Button } from 'react-bootstrap';
import { BsThreeDots } from 'react-icons/bs';
import { MdNavigateBefore, MdNavigateNext } from 'react-icons/md';

import styles from './style.module.css';

const Paginate: FC<{
  setCurrentPage: (page: number) => void;
  currentPage?: number;
  totalPages?: number;
}> = ({ setCurrentPage, currentPage = 1, totalPages = 0 }) => {
  if (totalPages < 1) {
    return null;
  }
  return (
    <div className={styles.pagination}>
      <Button
        aria-label='Previous page'
        onClick={() => setCurrentPage(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        <MdNavigateBefore />
      </Button>
      {currentPage > 10 && (
        <>
          <Button className={styles.lg} onClick={() => setCurrentPage(currentPage - 10)}>
            {currentPage - 10}
          </Button>
          <BsThreeDots className={styles.lg} />
        </>
      )}
      {currentPage > 3 && (
        <Button className={styles.md} onClick={() => setCurrentPage(currentPage - 3)}>
          {currentPage - 3}
        </Button>
      )}
      {currentPage > 2 && (
        <Button className={styles.sm} onClick={() => setCurrentPage(currentPage - 2)}>
          {currentPage - 2}
        </Button>
      )}
      {currentPage > 1 && (
        <Button className={styles.sm} onClick={() => setCurrentPage(currentPage - 1)}>
          {currentPage - 1}
        </Button>
      )}
      <Button variant='success'>{currentPage}</Button>
      {totalPages >= currentPage + 1 && (
        <Button className={styles.sm} onClick={() => setCurrentPage(currentPage + 1)}>
          {currentPage + 1}
        </Button>
      )}
      {totalPages >= currentPage + 2 && (
        <Button className={styles.sm} onClick={() => setCurrentPage(currentPage + 2)}>
          {currentPage + 2}
        </Button>
      )}
      {totalPages >= currentPage + 3 && (
        <Button className={styles.md} onClick={() => setCurrentPage(currentPage + 3)}>
          {currentPage + 3}
        </Button>
      )}
      {totalPages >= currentPage + 10 && (
        <>
          <BsThreeDots className={styles.lg} />
          <Button className={styles.lg} onClick={() => setCurrentPage(currentPage + 10)}>
            {currentPage + 10}
          </Button>
        </>
      )}
      <Button
        aria-label='Next page'
        onClick={() => setCurrentPage(currentPage + 1)}
        disabled={currentPage >= totalPages}
      >
        <MdNavigateNext />
      </Button>
    </div>
  );
};

export default Paginate;
