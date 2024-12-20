import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import { IconButton, InputBase } from '@mui/material';
import { memo, useState } from 'react';
import styled from 'styled-components';

/* STYLES */

const SearchWrapper = styled.div<{
  $isFocused: boolean;
}>`
  align-items: center;
  background-color: ${({ theme }) => theme.palette.background.paper};
  border: 2px solid
    ${({ theme, $isFocused }) =>
      $isFocused ? theme.palette.primary.main : 'transparent'};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  box-shadow: ${({ theme }) => theme.customShadows.outline};
  display: flex;
  padding: 0 0.5rem;
  width: 100%;

  svg {
    color: ${({ theme, $isFocused }) =>
      $isFocused ? theme.palette.primary.main : 'inherit'};
  }
  button {
    margin-right: 0.5rem;
    padding: 0.2rem;
  }
`;

const Input = styled(InputBase)`
  flex: 1;
`;

/* TYPES */

export type SearchProps = {
  value?: string;
  placeholder?: string;
  onChange: (value: string) => void;
};

/* COMPONENT */

export const Search = memo(
  ({ value: query, onChange: setQuery, placeholder = 'Search...' }: SearchProps) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
      <SearchWrapper $isFocused={isFocused}>
        <IconButton type="button" aria-label="search" disableRipple disabled>
          <SearchIcon />
        </IconButton>
        <Input
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          endAdornment={
            query && (
              <IconButton
                type="button"
                aria-label="clear"
                onClick={() => setQuery('')}
                disabled={!query}
                color="inherit"
              >
                <ClearIcon />
              </IconButton>
            )
          }
        />
      </SearchWrapper>
    );
  }
);
