import CloseIcon from '@mui/icons-material/Close';
import FilterListIcon from '@mui/icons-material/FilterList';
import {
  Checkbox,
  FormControlLabel,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip
} from '@mui/material';
import { Search, type SearchProps } from 'components/Search';
import { useState, type FC } from 'react';
import styled from 'styled-components';

export type ToolbarProps = {
  filters?: {
    label: string;
    component: JSX.Element;
    active: boolean;
    toggleActive: () => void; // Added handler to toggle filter active state
  }[];
  search?: SearchProps;
};

const StyledToolbar = styled(Toolbar)`
  display: flex;
  gap: 1rem;
  justify-content: space-between;

  padding: 0.5rem 1rem 0.5rem;

  div {
    max-width: 20rem;
  }
`;

const LeftContainer = styled.div`
  display: flex;
  gap: 1rem;
`;

const FilterContainer = styled.div`
  align-items: center;
  display: flex;
`;

const RightContainer = styled.div`
  display: flex;
  gap: 1rem;
`;

const StyledMenu = styled(Menu)`
  .MuiMenu-list {
    padding: 0;
  }
`;

const StyledMenuItem = styled(MenuItem)`
  padding: 0.5rem 1rem;
`;

const StyledCheckbox = styled(Checkbox)`
  padding: 0;
`;

export const EnhancedTableToolbar: FC<ToolbarProps> = ({ search, filters }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleFilterIconClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <StyledToolbar>
        <LeftContainer>{search && <Search {...search} />}</LeftContainer>

        <RightContainer>
          {filters
            ?.filter((filter) => filter.active)
            .map((filter, index) => (
              <FilterContainer key={index}>
                <IconButton onClick={filter.toggleActive} size="small">
                  <CloseIcon fontSize="small" />
                </IconButton>
                {filter.component}
              </FilterContainer>
            ))}
          {filters && filters.length > 0 && (
            <Tooltip title="Filter list">
              <IconButton onClick={handleFilterIconClick}>
                <FilterListIcon />
              </IconButton>
            </Tooltip>
          )}
        </RightContainer>
      </StyledToolbar>

      <StyledMenu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        {filters?.map((filter, index) => (
          <StyledMenuItem disableRipple key={index}>
            <FormControlLabel
              control={
                <StyledCheckbox
                  disableRipple
                  onClick={filter.toggleActive}
                  defaultChecked={filter.active}
                />
              }
              label={filter.label}
            />
          </StyledMenuItem>
        ))}
      </StyledMenu>
    </>
  );
};
