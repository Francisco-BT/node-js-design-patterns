import js from '@eslint/js'
import globals from 'globals'
import prettier from 'eslint-config-prettier'
import importPlugin from 'eslint-plugin-import'

export default [
  js.configs.recommended,
  prettier,
  {
    files: ['**/*.{js,mjs,cjs}'],
    plugins: {
      import: importPlugin
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.es2021
      }
    },
    rules: {
      // Add any custom rules here
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': 'off',
      // Import rules
      'import/no-unresolved': 'error', // Detecta imports que no existen
      'import/named': 'error', // Verifica named imports
      'import/default': 'error', // Verifica default imports
      'import/namespace': 'error', // Verifica namespace imports
      'import/no-absolute-path': 'error', // No permite paths absolutos
      'import/no-duplicates': 'warn', // Detecta imports duplicados
      'import/first': 'warn', // Imports deben estar al inicio
      'import/newline-after-import': 'warn', // Línea en blanco después de imports
      'import/order': [
        'warn',
        {
          // Ordena los imports
          groups: [
            'builtin', // node:fs, node:path
            'external', // paquetes npm
            'internal', // imports internos
            'parent', // ../
            'sibling', // ./
            'index' // ./index
          ],
          'newlines-between': 'always'
        }
      ]
    }
  }
]
