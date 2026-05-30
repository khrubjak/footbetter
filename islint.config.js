import prettier from "eslint-config-prettier"
import pluginPrettier from "eslint-plugin-prettier"

export default [
  {
    files: ["**/*.{js,ts,jsx,tsx}"],
    plugins: {
      prettier: pluginPrettier,
    },
    rules: {
      "prettier/prettier": "error",
    },
  },
  prettier,
]