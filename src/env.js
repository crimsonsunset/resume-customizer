import { defineEnvVars } from '@sveltejs/kit/env'

export const variables = defineEnvVars({
  GOTENBERG_URL: {
    static: true,
    description: 'Base URL of the Gotenberg PDF service, e.g. http://localhost:5555'
  }
})
