module.exports = {
  root: true,
  env: { browser: true, es2022: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    // The following two are for debug use. Should fix before release.
    "@typescript-eslint/no-unused-vars": "warn",
    'prefer-const': 'warn',
    // NDNts style class & namespace combination requires turning off the following
    '@typescript-eslint/no-namespace': 'off',
  },
}
