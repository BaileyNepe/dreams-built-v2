import { Combobox } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'
import { classNames } from 'libs/utils'
import { useMemo, useState, type FC } from 'react'
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from 'react-hook-form'

// Define the option type for clarity and reusability
export type Option = {
  label: string
  value: string
}

// Define props using a generic that extends FieldValues
interface SelectProps<TFormValues extends FieldValues> {
  name: Path<TFormValues>
  label: string
  options: Option[]
  placeholder?: string
  control: Control<TFormValues>
}

export const Select: FC<{
  options: Option[]
  value?: Option
  onChange: (option: Option) => void
  onBlur: () => void
  placeholder?: string
  label?: string
}> = ({ options, label, placeholder, value, onChange, onBlur }) => {
  const [query, setQuery] = useState('')

  const filteredOptions = useMemo(
    () =>
      options.filter((option) =>
        option.label.toLowerCase().includes(query.toLowerCase()),
      ),
    [options, query],
  )

  return (
    <Combobox
      as="div"
      value={value}
      onChange={(option: Option) => {
        onChange(option)
        setQuery('')
      }}
    >
      <Combobox.Label className="block text-sm font-medium leading-6 text-gray-900">
        {label}
      </Combobox.Label>
      <div className="relative mb-2 mt-2">
        <Combobox.Input
          className="w-full rounded-md border-0 bg-white py-1.5 pl-3 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          displayValue={(option: Option) => option?.label}
          onChange={(event) => {
            setQuery(event.target.value)
          }}
          onBlur={onBlur}
          placeholder={placeholder}
        />
        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
          <ChevronUpDownIcon
            className="h-5 w-5 text-gray-400"
            aria-hidden="true"
          />
        </Combobox.Button>

        <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <Combobox.Option
                key={option.value}
                value={option}
                className={({ active }) =>
                  classNames(
                    'relative cursor-default select-none py-2 pl-8 pr-4',
                    active ? 'bg-indigo-600 text-white' : 'text-gray-900',
                  )
                }
              >
                {({ active, selected }) => (
                  <>
                    <span
                      className={classNames(
                        'block truncate',
                        selected ? 'font-semibold' : '',
                      )}
                    >
                      {option.label}
                    </span>
                    {
                      <span
                        className={classNames(
                          'absolute inset-y-0 left-0 flex items-center pl-1.5',
                          active ? 'text-white' : 'text-indigo-600',
                        )}
                      >
                        {value?.value === option.value && (
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        )}
                      </span>
                    }
                  </>
                )}
              </Combobox.Option>
            ))
          ) : (
            <span className="block px-4 py-2 text-sm text-gray-500">
              No results found
            </span>
          )}
        </Combobox.Options>
      </div>
    </Combobox>
  )
}

// Generic functional component using TFormValues for better type safety
export const SelectForm = <TFormValues extends FieldValues>({
  options,
  label,
  placeholder,
  control,
  name,
}: SelectProps<TFormValues>) => (
  <Controller
    name={name}
    control={control}
    render={({ field: { onChange, onBlur, value } }) => (
      <Select
        options={options}
        label={label}
        placeholder={placeholder}
        value={options.find((option) => option.value === value)}
        onChange={(option) => onChange(option.value)}
        onBlur={onBlur}
      />
    )}
  />
)
