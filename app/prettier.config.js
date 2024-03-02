/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions} */
const config = {
  singleQuote: true,
  tabWidth: 2,

  plugins: ["prettier-plugin-tailwindcss"],
};

export default config;
