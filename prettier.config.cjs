/** @type {import("prettier").Config} */
const config = {
  singleQuote: true,
  bracketSpacing: true,
  printWidth: 150,
  tabWidth: 2,

  overrides: [
    {
      files: ['*.json', '*.json5'],
      options: {
        tabWidth: 2,
      },
    },
    {
      files: ['*.md'],
      options: {
        proseWrap: 'always',
      },
    },
  ],
};

module.exports = config;
