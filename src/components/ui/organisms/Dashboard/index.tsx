import { HiOutlineInformationCircle } from 'react-icons/hi';

import withAuth from '@/components/HOC/withAuthAndLoading';

import { useUser } from '@/components/utils/hooks/useUser';
import styled from 'styled-components';
import Message from '../../atoms/Message';
import InfoBlock from '../../molecules/InfoBlock';
import { config } from './config';

const Grid = styled.div`
  display: grid;
  margin: 2rem 0;
  gap: 2rem;

  @media only screen and (max-width: 35.875rem) {
    margin: 2rem 1rem;
  }

  @media only screen and (min-width: 50rem) {
    grid-template-columns: 1fr 1fr;
  }
`;

const DashboardScreen = () => {
  const { role } = useUser();

  const renderInfoBlock = ({
    iconText,
    title,
    text,
    linkTitle,
    linkUrl,
  }: {
    iconText: string;
    title: string;
    text: string;
    linkTitle: string;
    linkUrl?: string;
  }) => <InfoBlock icon={<HiOutlineInformationCircle />} iconText={iconText} title={title} text={text} link={{ title: linkTitle, link: linkUrl }} />;

  let contentConfig;

  switch (role) {
    case 'admin':
      contentConfig = config.admin;
      break;
    case 'employee':
      contentConfig = config.employee;
      break;
    default:
      contentConfig = config.default;
  }

  const content = contentConfig.content.map(renderInfoBlock);

  return (
    <div className="parent-container">
      <Message margin="0" variant={contentConfig.portalMessage.variant}>
        {contentConfig.portalMessage.message}
      </Message>
      <Grid>{content}</Grid>
    </div>
  );
};

export default withAuth(DashboardScreen);
