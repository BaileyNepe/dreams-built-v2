import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary, Typography } from '@mui/material';
import { EnhancedTable } from 'components/EnhancedTable';
import { Fragment, type FC } from 'react';
import styled from 'styled-components';
import { formatDate, getDate } from 'utils/date';
import { useProjectReport } from './hooks/useProjectReport';
import { ReportBlock, TotalRow } from './styles';

const StyledAccordionSummary = styled.div`
  && {
    display: grid;
    justify-content: space-between;
  }
`;

const Container = styled.div`
  align-items: center;
  display: flex;
  gap: 0.5rem;
  justify-content: space-between;
  padding: 0 1rem 0 0;
  width: 100%;
`;

export const ProjectReport: FC<{ weekStart: string }> = ({ weekStart }) => {
  const projectReports = useProjectReport(weekStart);
  const weekStartDate = getDate(weekStart);

  // Overall summary totals
  const overallTotalHours = projectReports.reduce(
    (acc, project) => acc + project.totalHours,
    0
  );
  const overallTotalCost = projectReports.reduce(
    (acc, project) => acc + project.totalCost,
    0
  );

  return (
    <>
      {projectReports.length > 0 && (
        <ReportBlock>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Overall Summary ({projectReports.length}{' '}
            {projectReports.length === 1 ? 'Project' : 'Projects'})
          </Typography>
          <Typography variant="body1">
            Total Hours: {overallTotalHours.toFixed(2)} hrs | Total Cost: $
            {overallTotalCost.toFixed(2)}
          </Typography>
        </ReportBlock>
      )}

      {projectReports.map((project) => {
        const numberOfEmployees = project.rows.length;

        return (
          <Fragment key={project.jobNumber}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Container>
                  <StyledAccordionSummary>
                    <Typography variant="h6">
                      {project.jobNumber} - {project.projectAddress}
                    </Typography>
                    <Typography variant="caption">
                      {formatDate({ date: weekStartDate, format: 'dd/MM/yyyy' })} -{' '}
                      {formatDate({
                        date: weekStartDate.plus({ days: 6 }),
                        format: 'dd/MM/yyyy'
                      })}
                    </Typography>
                  </StyledAccordionSummary>

                  <Typography variant="subtitle2" sx={{ ml: 2 }}>
                    {numberOfEmployees}{' '}
                    {numberOfEmployees === 1 ? 'employee' : 'employees'} |{' '}
                    {project.totalHours.toFixed(2)} hrs | ${project.totalCost.toFixed(2)}
                  </Typography>
                </Container>
              </AccordionSummary>
              <AccordionDetails>
                <EnhancedTable
                  hasShadow={false}
                  headers={[
                    { id: 'employee', label: 'Employee', width: '40%' },
                    { id: 'rate', label: 'Rate ($/hr)', align: 'right' },
                    { id: 'hours', label: 'Hours', align: 'right' },
                    { id: 'cost', label: 'Cost', align: 'right' }
                  ]}
                  rows={project.rows}
                />
                <TotalRow>
                  <Typography variant="body2">
                    <strong>Total:</strong> {project.totalHours.toFixed(2)} hrs | $
                    {project.totalCost.toFixed(2)}
                  </Typography>
                </TotalRow>
              </AccordionDetails>
            </Accordion>
          </Fragment>
        );
      })}

      {projectReports.length === 0 && (
        <Typography variant="caption" sx={{ textAlign: 'center', mt: 2 }}>
          No entries found for this week...
        </Typography>
      )}
    </>
  );
};
