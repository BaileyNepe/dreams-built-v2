import { useDispatch, useSelector } from '@/components/store';
import { createEntry, deleteEntry, type Entry } from '@/components/store/slices/timesheet';
import { useEffect, useState } from 'react';
import { Card, Table } from 'react-bootstrap';
import { FaCommentDots, FaTrash } from 'react-icons/fa';
import { v4 as uuidv4 } from 'uuid';
import Button from '../../atoms/Button';

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

  const onEntryAdd = () => {
    const entryId = uuidv4();
    dispatch(createEntry({ entryId, day }));
  };

  const onEntryDelete = (entryId: string) => {
    dispatch(deleteEntry(entryId));
  };

  const dailyTotal = inputList
    .filter(({ jobTime }) => jobTime)
    .reduce((total, job) => total + job.jobTime, 0);

  const commentExists = comments.filter((c) => c.day === day && c.comments !== '').length > 0;

  return (
    <Card className='mt-3 mb-3 shadow'>
      <Card.Header>
        <div className={styles.header}>
          <div className={styles.block}>
            <Button
              type='button'
              variant={commentExists ? 'success' : 'primary'}
              onClick={() => setModalShow(true)}
              text={<FaCommentDots />}
            />
          </div>
          <h2 className={styles.title}>
            {day} - {date}
            <sup>{ordinal}</sup> {month}
          </h2>
          <Button className={styles.controls} onClick={() => onEntryAdd()} text='+' />
        </div>
      </Card.Header>
      <Card.Body>
        {inputList.length > 0 && (
          <Table hover bordered responsive className={styles['timesheet-grid-container']}>
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
                <tr className={styles['timesheet-grid']} key={entryId}>
                  <TimesheetEntry entryId={entryId} day={day} />
                  <td className={styles['table-coloumn-delete']}>
                    <Button
                      variant='danger'
                      className='btn-main'
                      onClick={() => onEntryDelete(entryId)}
                      text={<FaTrash />}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className='display-none_mobile'>
              <tr>
                <th colSpan='3' className='right-align'>
                  Total
                </th>
                <td className='right-align' style={{ color: dailyTotal >= 24 ? 'red' : 'black' }}>
                  {dailyTotal.toFixed(2)}
                </td>
                <td />
              </tr>
            </tfoot>
          </Table>
        )}
        <Button className={styles['btn-sml-screen-btm']} onClick={onEntryAdd} text='+' />
      </Card.Body>
      <TimesheetCommentModal
        show={modalShow}
        day={day}
        date={date}
        ordinal={ordinal}
        month={month}
        setModalShow={setModalShow}
        onHide={() => setModalShow(false)}
      />
    </Card>
  );
};

export default TimesheetDay;
