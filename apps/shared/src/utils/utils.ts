export const camelCase = (str: string) => {
  const result = str
    .replace(/([A-Z])/g, ' $1') // insert a space before all caps
    .replace(/[-_ ]+/g, ' ') // replace hyphens, underscores and multiple spaces with a single space
    .toLowerCase() // convert to lowercase
    .replace(
      / (.)/g,
      (_, $1) =>
        $1
          .toUpperCase()
          // convert the first character of each word to lowercase
          .replace(/ /g, '') // remove spaces
    );

  const firstChar = result.charAt(0).toLowerCase();

  return firstChar + result.slice(1);
};

export const snakeCase = (str: string): string =>
  str
    .replace(/([a-z])([0-9])/g, '$1_$2') // insert underscore between a lowercase letter and a digit
    .replace(/([a-z])([A-Z])/g, '$1_$2') // insert underscore between a lowercase letter and a capital letter
    .replace(/([0-9])([A-Z])/g, '$1_$2') // insert underscore between a digit and a capital letter
    .replace(/[- ]+/g, '_') // replace hyphens and spaces with underscore
    .toLowerCase(); // convert to lowercase

export const kebabCase = (string: string) => snakeCase(string).replace(/_/g, '-');
export const startCase = (string: string) =>
  snakeCase(string)
    .replace(/_/g, ' ')
    .replace(/(^|\s)\S/g, (match) => match.toUpperCase());

export const pascalCase = (string: string) =>
  startCase(camelCase(string)).replace(/ /g, '');

export const sentenceCase = (string: string) => startCase(camelCase(string));

export const wordCase = (string: string) => snakeCase(string).replace(/_/g, ' ');

export const filterAndJoin = (
  parts: (string | undefined | null)[],
  separator: string = ' '
) =>
  parts
    .filter((part) => part !== undefined && part !== null && part !== '') // Filter out undefined, null, or empty strings
    .join(separator); // Join with the provided separator, default is a space
