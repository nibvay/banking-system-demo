import globals from "globals";
import pluginJs from "@eslint/js";

export default [
  pluginJs.configs.recommended,
  {
    languageOptions: { globals: globals.node },
    rules: {
      "max-len": [
        "error",
        {
          code: 120,
          ignoreComments: true,
        },
      ],
      semi: ["error", "always"],
      quotes: ["error", "double"],
      "no-unused-vars": "warn",
    },
  },
];
