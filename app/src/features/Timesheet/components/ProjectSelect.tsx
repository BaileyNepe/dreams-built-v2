import { useSimpleJobsList } from 'api/jobs'
import { Select } from 'components/Form/Select'
import { useMemo, type FC } from 'react'

const ProjectSelect: FC<{
  name: string
  label: string
  value?: string
  onChange: (value: string) => void
}> = (props) => {
  const projects = useSimpleJobsList()

  const options = useMemo(
    () =>
      projects.map((project) => ({
        label: `${project.jobNumber} - ${project.address}`,
        value: project.id,
      })),
    [projects],
  )

  const selectedOption = options.find((option) => option.value === props.value)

  return (
    <Select
      options={projects.map((project) => ({
        label: `${project.jobNumber} - ${project.address}`,
        value: project.id,
      }))}
      label={props.label}
      placeholder="Select a project"
      onBlur={() => {}}
      onChange={(option) => props.onChange(option.value)}
      value={selectedOption}
    />
  )
}

export default ProjectSelect
