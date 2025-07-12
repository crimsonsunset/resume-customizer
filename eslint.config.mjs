import {includeIgnoreFile} from '@eslint/compat'
import oclif from 'eslint-config-oclif'
import prettier from 'eslint-config-prettier'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

const gitignorePath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '.gitignore')

export default [
  includeIgnoreFile(gitignorePath), 
  ...oclif, 
  prettier,
  {
    rules: {
      // Disable overly strict sorting rules
      'perfectionist/sort-classes': 'off',
      'perfectionist/sort-objects': 'off', 
      'perfectionist/sort-object-types': 'off',
      'perfectionist/sort-union-types': 'off',
      'perfectionist/sort-imports': 'off',
      'perfectionist/sort-named-imports': 'off',
      'perfectionist/sort-interfaces': 'off',
      'sort-keys': 'off',
      
      // Allow camelCase violations for API data (credential_id, etc.)
      'camelcase': 'off',
      
      // Allow lonely if statements
      'unicorn/no-lonely-if': 'off',
      
      // Allow top-level function calls in scripts
      'unicorn/prefer-top-level-await': 'off',
      
      // Allow process.exit in CLI scripts
      'n/no-process-exit': 'off',
      
      // Less strict spacing
      '@stylistic/padding-line-between-statements': 'off',
      
      // Allow String.replace for regex patterns (replaceAll doesn't support regex)
      'unicorn/prefer-string-replace-all': 'off',
      
      // Allow block statements in arrow functions (sometimes clearer)
      'arrow-body-style': 'off',
      
      // Allow TODO comments (useful during development)
      'no-warning-comments': 'off',
      
      // Increase complexity and depth limits for parser logic
      'complexity': ['warn', 50],
      'max-depth': ['warn', 5],
      
      // Disable TypeScript-specific rules for JavaScript files
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/ban-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      
      // Use standard JavaScript rules instead
      'no-unused-vars': ['warn', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_'
      }],
      
      // Allow __dirname equivalent for ES modules
      'no-undef': 'off',
      
      // Allow await in loops for CLI operations
      'no-await-in-loop': 'warn',
      
      // Allow SvelteKit imports like $app/environment
      'import/no-unresolved': ['error', { 
        ignore: ['^\\$app/', '^\\$env/', '^\\$lib/', '^\\$service-worker']
      }]
    }
  }
] 