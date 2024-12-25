// components/ProjectSelect.tsx
import { Autocomplete, CircularProgress, TextField } from '@mui/material';
import { useInfiniteProjects } from 'api/projects';
import { useCallback, useRef, useState, type FC } from 'react';
import { useDebounce } from 'utils/hooks/useDebounce';

interface ProjectSelectProps {
  value?: string;
  onChange?: (projectId: string | null) => void;
  label?: string;
}

export const ProjectSelect: FC<ProjectSelectProps> = ({
  value,
  onChange,
  label = 'Select Project'
}) => {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteProjects({ query: debouncedSearch });

  const projects = data?.pages.flatMap((page) => page.projects) ?? [];

  const selectedOption = projects.find((proj) => proj.id === value) ?? null;

  const listboxRef = useRef<HTMLUListElement | null>(null);

  const handleListboxScroll = useCallback(() => {
    if (!listboxRef.current || isFetchingNextPage) return;
    const listbox = listboxRef.current;
    const { scrollTop, clientHeight, scrollHeight } = listbox;

    if (scrollHeight - scrollTop - clientHeight < 100) {
      if (hasNextPage) {
        fetchNextPage();
      }
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <Autocomplete
      options={projects}
      getOptionLabel={(option) => `${option.jobNumber} - ${option.address}`}
      value={selectedOption}
      onChange={(_event, newValue) => {
        onChange?.(newValue?.id ?? null);
      }}
      inputValue={search}
      onInputChange={(_event, newInputValue) => {
        setSearch(newInputValue);
      }}
      loading={isLoading}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {isLoading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            )
          }}
        />
      )}
      slotProps={{
        listbox: { onScroll: handleListboxScroll, ref: listboxRef }
      }}
      // for large lists, you might want some performance props:
      // disablePortal, blurOnSelect, filterOptions={() => projects} (to disable local filtering if your server does it)
      filterOptions={(opts) => opts} // prevent MUI from filtering further
    />
  );
};
