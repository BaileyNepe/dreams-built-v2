import Limit from '../../atoms/Limit';
import Paginate from '../Paginate';
import styles from './style.module.css';

const PaginationGroup = ({
  pages,
  currentPage,
  setCurrentPage,
  limit,
  setLimit,
}: {
  pages: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  limit: string;
  setLimit: (value: string) => void;
}) => {
  if (pages <= 1) {
    return null;
  }
  return (
    <div className={styles.controls}>
      <div>
        <Paginate setCurrentPage={setCurrentPage} currentPage={currentPage} totalPages={pages} />
        <div
          style={{
            padding: '0.5rem 0 0',
          }}
        >
          Page {currentPage} of {pages}
        </div>
      </div>

      <div className={styles.limit}>
        <Limit setLimit={setLimit} limit={limit} />
      </div>
    </div>
  );
};

export default PaginationGroup;
