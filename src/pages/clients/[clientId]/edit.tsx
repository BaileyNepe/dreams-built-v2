import withAuth from '@/components/HOC/withAuthAndLoading';
import Button from '@/components/ui/atoms/Button';
import AdminGroup from '@/components/ui/molecules/AdminGroup';
import DetailsGroup from '@/components/ui/molecules/DetailsGroup';
import CustomModal from '@/components/ui/molecules/Modal';
import PageState from '@/components/ui/molecules/PageState';
import { useClientParams } from '@/components/utils/hooks/useParams';
import { paths } from '@/components/utils/paths';
import { api } from '@/utils/api';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { Form } from 'react-bootstrap';
import styles from './style.module.css';

const EditClientScreen = () => {
  const clientId = useClientParams();
  const navigate = useRouter();
  const [modalShow, setModalShow] = useState(false);

  const [formData, setFormData] = useState({
    clientName: '',
    color: '#563d7c',
    contactName: '',
    contactEmail: '',
  });

  const { clientName, color, contactName, contactEmail } = formData;

  const { isLoading, error } = api.client.getOne.useQuery(
    {
      clientId,
    },
    {
      onSuccess: (data) => {
        setFormData({
          clientName: data.clientName,
          color: data.color ?? '#563d7c',
          contactName: data.contact?.name ?? '',
          contactEmail: data.contact?.email ?? '',
        });
      },
      onError: () => {
        void navigate.push(paths.clients.root);
      },
    },
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDeleteTrue = () => {
    setModalShow(false);
  };

  return (
    <PageState loading={isLoading} error={error?.message}>
      <AdminGroup>
        <DetailsGroup title='Edit Client' link={paths.clients.root} linkName='Clients'>
          <Form
            className={styles.form}
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <Form.Group className={styles.client} controlId='Client'>
              <Form.Label>Client *</Form.Label>
              <Form.Control
                type='text'
                placeholder='Company...'
                value={clientName}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className={styles.color} controlId='color'>
              <Form.Label>Colour</Form.Label>
              <Form.Control
                type='color'
                style={{ width: '100%' }}
                value={color}
                onChange={handleChange}
                title='Choose your color'
              />
            </Form.Group>
            <div className={styles.contact}>
              <Form.Group className='mb-2' controlId='contact.name'>
                <Form.Label>Contact Name</Form.Label>
                <Form.Control
                  type='text'
                  placeholder='John Doe'
                  value={contactName}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group className='mb-2' controlId='contact.email'>
                <Form.Label>Contact Email</Form.Label>
                <Form.Control
                  type='text'
                  placeholder='john@gmail.com'
                  value={contactEmail}
                  onChange={handleChange}
                />
              </Form.Group>
            </div>
            <Button
              className={styles['button-update']}
              disabled={!clientName}
              type='submit'
              variant='success'
            >
              Save
            </Button>
            <Button
              className={styles['button-delete']}
              onClick={() => setModalShow(true)}
              variant='danger'
            >
              Delete
            </Button>
          </Form>
          <CustomModal
            title={`Delete "${clientName}"?`}
            show={modalShow}
            onHide={() => setModalShow(false)}
          >
            <Button
              variant='danger'
              onClick={() => {
                handleDeleteTrue();
                setModalShow(false);
              }}
            >
              Delete
            </Button>
            <Button
              variant='secondary'
              onClick={() => {
                setModalShow(false);
              }}
            >
              Cancel
            </Button>
          </CustomModal>
        </DetailsGroup>
      </AdminGroup>
    </PageState>
  );
};
export default withAuth(EditClientScreen);
