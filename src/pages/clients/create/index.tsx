import { useState, type ChangeEvent } from 'react';
import { Button, Form } from 'react-bootstrap';

import withAuth from '@/components/HOC/withAuthAndLoading';
import AdminGroup from '@/components/ui/molecules/AdminGroup';
import DetailsGroup from '@/components/ui/molecules/DetailsGroup';
import { generateColor } from '@/components/utils/generateColor';
import { paths } from '@/components/utils/paths';
import { api } from '@/utils/api';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import styles from './style.module.css';

const FormInput = ({
  label,
  type,
  placeholder,
  value,
  onChange,
  controlId,
  classStyle,
  name,
}: {
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  controlId: string;
  classStyle?: string;
  name: string;
}) => (
  <Form.Group
    className={`mb-2 ${styles[controlId] ?? ''} ${styles[classStyle ?? ''] ?? ''} `}
    controlId={controlId}
  >
    <Form.Label>{label}</Form.Label>
    <Form.Control
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      style={{ width: '100%' }}
    />
  </Form.Group>
);

const CreateClientScreen = () => {
  const navigate = useRouter();
  const [formData, setFormData] = useState({
    clientName: '',
    color: generateColor(),
    contactName: '',
    contactEmail: '',
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const { mutate } = api.client.create.useMutation({
    onSuccess: async () => {
      await navigate.push(paths.clients.root);
    },
    onError: (err) => {
      if (err.data?.zodError) {
        const errors = err.data?.zodError?.fieldErrors;
        const errorArray = errors ? Object.values(errors).flat() : [];

        for (const e of errorArray) {
          toast.error(e);
        }
      } else {
        toast.error(err.message);
      }
    },
  });

  const handleSubmit = (
    e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    e.preventDefault();
    mutate(formData);
  };

  return (
    <AdminGroup>
      <DetailsGroup title='Create Client' link={paths.clients.root} linkName='Clients'>
        <Form className={styles.form} onSubmit={handleSubmit}>
          <FormInput
            label='Client *'
            type='text'
            name='clientName'
            classStyle='client'
            placeholder='Company...'
            value={formData.clientName}
            onChange={handleChange}
            controlId='Client'
          />
          <FormInput
            label='Colour *'
            type='color'
            name='color'
            placeholder=''
            classStyle='color'
            value={formData.color}
            onChange={handleChange}
            controlId='color'
          />
          <div className={styles.contact}>
            <FormInput
              label='Contact Name'
              type='text'
              name='contactName'
              placeholder='John Doe'
              value={formData.contactName}
              onChange={handleChange}
              controlId='contact.name'
            />
            <FormInput
              label='Contact Email'
              type='email'
              name='contactEmail'
              placeholder='john@gmail.com'
              value={formData.contactEmail}
              onChange={handleChange}
              controlId='contact.email'
            />
          </div>
          <Button
            type='submit'
            className={styles.button}
            variant='success'
            disabled={!formData.clientName}
          >
            Create
          </Button>
        </Form>
      </DetailsGroup>
    </AdminGroup>
  );
};

export default withAuth(CreateClientScreen);
