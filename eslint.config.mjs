import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";

export default [
    {
        ignores: ["dist/**"],
    },
    {
        files: ["src/**/*.ts"],
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                ecmaVersion: "latest",
                sourceType: "module",
                project: "./tsconfig.json", // enable type-aware linting
            },
            globals: globals.node,
        },
        plugins: {
            "@typescript-eslint": tseslint.plugin,
        },
        rules: {
            "no-unused-vars": "off",
            "@typescript-eslint/no-unused-vars": [
                "warn",
                { vars: "all", args: "none" }, // only check vars, not args
            ],
            "no-console": [
                "warn", // you can use "error" if you want to block it completely
                { allow: ["warn", "error"] } // allow console.warn and console.error
            ],
        }

    },
];
