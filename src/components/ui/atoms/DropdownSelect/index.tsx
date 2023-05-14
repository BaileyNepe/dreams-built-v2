import Select, {
  type ActionMeta,
  type GroupBase,
  type MenuPosition,
  type OptionsOrGroups,
  type SingleValue,
} from 'react-select';

const DropdownSelect = ({
  position = 'fixed',
  placeholder = 'Select...',
  defaultValue,
  onChange,
  options,
}: {
  position?: MenuPosition;
  placeholder?: string;
  defaultValue?: string;
  onChange?: (newValue: SingleValue<string>, actionMeta: ActionMeta<string>) => void;
  options: OptionsOrGroups<string, GroupBase<string>>;
}) => (
  <Select
    menuPosition={position}
    placeholder={placeholder}
    defaultValue={defaultValue}
    onChange={onChange}
    options={options}
  />
);

export default DropdownSelect;
