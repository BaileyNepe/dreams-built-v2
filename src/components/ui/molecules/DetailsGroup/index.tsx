import { BsArrowLeft } from 'react-icons/bs';

import Link from 'next/link';
import styles from './style.module.css';

const DetailsGroup = ({
  children,
  title = '',
  link = '/',
  linkName = 'Back',
  width = 'screenDefault',
}: {
  children: React.ReactNode;
  title?: string;
  link?: string;
  linkName?: string;
  width?: string;
}) => (
  <div className='container'>
    <div
      className={
        width === 'screenDefault'
          ? `${styles.card ?? ''}`
          : `${styles.card ?? ''} ${styles.large ?? ''}`
      }
    >
      <div className={styles.grid}>
        <div className={styles.link}>
          <Link href={link} className='btn btn-secondary my-3'>
            <BsArrowLeft /> {linkName}
          </Link>
        </div>
        <h1 className={styles.title}>{title}</h1>
      </div>
      {children}
    </div>
  </div>
);

export default DetailsGroup;
