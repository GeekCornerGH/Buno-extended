import eslint from "@eslint/js";
import globals from "globals";
import tseslint from "@typescript-eslint/eslint-plugin";
import tseslintParser from "@typescript-eslint/parser";
import unusedImports from "eslint-plugin-unused-imports";
import simpleImportSort from "eslint-plugin-simple-import-sort";

export default [
    {
        ignores: ["dist/**", "node_modules/**"],
    },
    eslint.configs.recommended,
    {
        files: ["**/*.ts"],
        plugins: {
            "@typescript-eslint": tseslint,
            "unused-imports": unusedImports,
            "simple-import-sort": simpleImportSort,
        },
        languageOptions: {
            globals: {
                ...globals.node
            },
            parser: tseslintParser,
        },
        rules: {
            "quotes": ["error", "double", { "avoidEscape": true }],
            "jsx-quotes": ["error", "prefer-double"],
            "no-mixed-spaces-and-tabs": "error",
            "indent": ["error", 4, { "SwitchCase": 1 }],
            "arrow-parens": ["error", "as-needed"],
            "eol-last": ["error", "always"],
            "func-call-spacing": ["error", "never"],
            "no-multi-spaces": "error",
            "no-trailing-spaces": "error",
            "no-whitespace-before-property": "error",
            "semi": ["error", "always"],
            "space-in-parens": ["error", "never"],
            "block-spacing": ["error", "always"],
            "object-curly-spacing": ["error", "always"],
            "eqeqeq": ["error", "always", { "null": "ignore" }],
            "spaced-comment": ["error", "always", { "markers": ["!"] }],
            "yoda": "error",
            "no-undef": "off",
            "prefer-destructuring": ["error", { "object": true, "array": false }],
            "operator-assignment": ["error", "always"],
            "no-useless-computed-key": "error",
            "no-unneeded-ternary": ["error", { "defaultAssignment": false }],
            "no-invalid-regexp": "error",
            "no-constant-condition": ["error", { "checkLoops": false }],
            "no-duplicate-imports": "error",
            "no-extra-semi": "error",
            "dot-notation": "error",
            "no-useless-escape": "error",
            "no-fallthrough": "error",
            "for-direction": "error",
            "no-async-promise-executor": "error",
            "no-cond-assign": "error",
            "no-dupe-else-if": "error",
            "no-duplicate-case": "error",
            "no-irregular-whitespace": "error",
            "no-loss-of-precision": "error",
            "no-misleading-character-class": "error",
            "no-prototype-builtins": "error",
            "no-regex-spaces": "error",
            "no-shadow-restricted-names": "error",
            "no-unexpected-multiline": "error",
            "no-unsafe-optional-chaining": "error",
            "no-useless-backreference": "error",
            "no-unused-expressions": "error",
            "no-unused-labels": "error",
            "no-unused-vars": "error",
            "use-isnan": "error",
            "prefer-const": "error",
            "prefer-spread": "error",
            "linebreak-style": ["error", "unix"],

            "simple-import-sort/imports": "error",
            "simple-import-sort/exports": "error",

            "unused-imports/no-unused-imports": "error"
        },
    },
];
