import { useState } from 'react';
import { Button, Table } from 'react-bootstrap';
import { FiEdit } from 'react-icons/fi';

import withAuth from '@/components/HOC/withAuthAndLoading';
import HeaderSearchGroup from '@/components/ui/molecules/HeaderSearchGroup';
import PageState from '@/components/ui/molecules/PageState';
import PaginationGroup from '@/components/ui/molecules/PaginationGroup';
import { paths } from '@/components/utils/paths';
import styles from '@/styles/ClientListScreen.module.css';
import { api } from '@/utils/api';
import { useRouter } from 'next/router';
import { useDebounce } from 'use-debounce';

const ClientListScreen = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(2);
  const [search, setSearch] = useState('');
  const [query] = useDebounce(search, 500);

  const router = useRouter();

  const {
    data: { pages, clientList } = {},
    isLoading,
    error,
  } = api.client.list.useQuery(
    { page: currentPage, limit, search: query },
    { keepPreviousData: true },
  );

  return (
    <div className={styles.parent}>
      <PageState loading={isLoading} error={error?.message}>
        <section className='container'>
          <div className={styles.card}>
            <HeaderSearchGroup title='Clients' setSearch={setSearch} link='/clients/create' />
            <Table hover responsive='sm' bordered>
              <thead>
                <tr>
                  <th className={styles.responsive} style={{ width: '5%' }}>
                    Colour
                  </th>
                  <th>Client</th>
                  <th className={styles.responsive}>Contact</th>
                  <th className={styles.responsive}>Email</th>
                  <th style={{ width: '5%' }}>Edit</th>
                </tr>
              </thead>
              <tbody>
                {clientList?.map((client) => (
                  <tr key={client.id} className={styles.data}>
                    <td className={styles.responsive}>
                      <div
                        className={styles.color}
                        style={{ backgroundColor: client.color ?? '#eeeeeeee' }}
                      />
                    </td>
                    <td className={styles.client}>{client.clientName}</td>
                    <td className={styles.responsive}>{client?.contact?.name}</td>
                    <td className={styles.responsive}>{client?.contact?.email}</td>
                    <td>
                      <Button
                        className='btn-sm'
                        onClick={() => {
                          void router.push(paths.clients.edit(client.id));
                        }}
                      >
                        <FiEdit />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <PaginationGroup
              pages={pages ?? 1}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              limit={`${limit}`}
              setLimit={(value) => {
                setLimit(Number(value));
                setCurrentPage(1);
              }}
            />
          </div>
        </section>
      </PageState>
    </div>
  );
};

export default withAuth(ClientListScreen);
