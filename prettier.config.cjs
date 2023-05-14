/** @type {import("prettier").Config} */

const config = {
  singleQuote: true,
  bracketSpacing: true,
  printWidth: 100,
  tabWidth: 2,
  trailingComma: 'all',
  arrowParens: 'always',
  semi: true,
  useTabs: false,
  endOfLine: 'lf',
  jsxSingleQuote: true,
  jsxBracketSameLine: false,
  quoteProps: 'consistent',
  overrides: [
    {
      files: '*.json',
      options: {
        tabWidth: 2,
      },
    },
  ],
};

module.exports = config;
