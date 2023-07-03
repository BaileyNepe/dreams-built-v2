import { useDispatch, useSelector } from '@/components/store';
import {
  createEntry,
  deleteEntry,
  updateComments,
  type Entry,
} from '@/components/store/slices/timesheet';
import { useEffect, useState } from 'react';
import { Card, Table } from 'react-bootstrap';
import { FaCommentDots, FaTrash } from 'react-icons/fa';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
import Button from '../../atoms/Button';
import TextInputModal from '../../molecules/Modal/TextInput';

const StyledCard = styled(Card)`
  margin-top: 3rem;
  margin-bottom: 3rem;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
`;

const StyledHeader = styled.div`
  margin-top: 0.3rem;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: space-around;
  align-items: baseline;
  align-content: stretch;
`;

const StyledTitle = styled.h2`
  flex-grow: 1;
  align-self: auto;
  font-size: 1.2rem;
  text-align: center;
`;

const StyledBlock = styled.div`
  display: block;
  flex-grow: 0;
  flex-shrink: 0;
  flex-basis: auto;
  align-self: auto;
  order: 0;
`;

const StyledTable = styled(Table)`
  @media only screen and (max-width: 50rem) {
    display: grid;
    grid-template-columns: auto min-content;
    gap: 0.5rem;
  }
`;

const Controls = styled(Button)`
  display: none;
  flex-grow: 0;
  flex-shrink: 1;
  flex-basis: auto;
  align-self: auto;
  order: 0;

  @media only screen and (min-width: 50rem) {
    display: block;
  }
`;

const BtnSmlScreenBtm = styled(Button)`
  display: block;
  margin: 0 auto;

  @media only screen and (min-width: 50rem) {
    display: none;
  }
`;

const TableRowGrid = styled.tr`
  @media only screen and (max-width: 50rem) {
    display: grid;
    grid-template-rows: repeat(4, auto);
    border-width: 0;
  }
`;

const TimesheetDay = ({
  day,
  date,
  ordinal,
  month,
}: {
  day: string;
  date: string;
  ordinal: string;
  month: string;
}) => {
  const dispatch = useDispatch();

  const [inputList, setInputList] = useState<Entry[]>([]);
  const [modalShow, setModalShow] = useState(false);

  const timesheetEntries = useSelector((state) => state.timesheet);
  const { dayEntries, comments } = timesheetEntries;

  useEffect(() => {
    setInputList(dayEntries.filter((entry) => entry.day === day));
  }, [dayEntries, day]);

  const onEntryAdd = () => dispatch(createEntry({ entryId: uuidv4(), day }));
  const onEntryDelete = (entryId: string) => dispatch(deleteEntry(entryId));

  const dailyTotal = inputList.reduce((total, { jobTime }) => total + (jobTime || 0), 0);
  const commentExists = comments.filter((c) => c.day === day && c.comments !== '').length > 0;

  return (
    <StyledCard>
      <Card.Header>
        <StyledHeader>
          <StyledBlock>
            <Button
              type='button'
              variant={commentExists ? 'success' : 'primary'}
              onClick={() => setModalShow(true)}
              text={<FaCommentDots />}
            />
          </StyledBlock>
          <StyledTitle>
            {day} - {date}
            <sup>{ordinal}</sup> {month}
          </StyledTitle>
          <Controls onClick={onEntryAdd}>+</Controls>
        </StyledHeader>
      </Card.Header>
      <Card.Body>
        {inputList.length > 0 && (
          <StyledTable hover bordered responsive>
            <thead className='display-none_mobile table-dark'>
              <tr>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Job Number</th>
                <th>
                  <em>Hrs</em>
                </th>
                <th />
              </tr>
            </thead>
            <tbody>
              {inputList.map(({ entryId }) => (
                <TableRowGrid key={entryId}>
                  {/* <TimesheetEntry entryId={entryId} day={day} /> */}
                  <td>
                    <Button variant='danger' type='button' onClick={() => onEntryDelete(entryId)}>
                      <FaTrash />
                    </Button>
                  </td>
                </TableRowGrid>
              ))}
            </tbody>
            <tfoot className='display-none_mobile'>
              <tr>
                <th className='right-align'>Total</th>
                <td className='right-align' style={{ color: dailyTotal >= 24 ? 'red' : 'black' }}>
                  {dailyTotal.toFixed(2)}
                </td>
                <td />
              </tr>
            </tfoot>
          </StyledTable>
        )}
        <BtnSmlScreenBtm onClick={onEntryAdd}>+</BtnSmlScreenBtm>
      </Card.Body>
      <TextInputModal
        show={modalShow}
        onHide={() => setModalShow(false)}
        title='Comments'
        input={comments.filter((c) => c.day === day)[0]?.comments || ''}
        setInput={(input) =>
          dispatch(
            updateComments({
              day,
              comments: input,
            }),
          )
        }
      />
    </StyledCard>
  );
};

export default TimesheetDay;
