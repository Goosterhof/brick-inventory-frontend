# New App Skill

Step-by-step guide for adding a new app to this multi-app monorepo.

## Steps

1. Create the app directory structure:
   ```bash
   mkdir -p src/apps/newapp/services src/apps/newapp/types src/apps/newapp/views
   ```

2. Create required files:
   - `src/apps/newapp/index.html` - App HTML entry
   - `src/apps/newapp/main.ts` - Vue app initialization
   - `src/apps/newapp/App.vue` - Root component
   - `src/apps/newapp/services/` - App-specific service instances
   - `src/apps/newapp/types/` - App-specific types

3. Create service files in `src/apps/newapp/services/`:
   - `http.ts` - Instantiate HTTP service with API URL
   - `auth.ts` - Instantiate auth service with profile type
   - `router.ts` - Define routes and create router service, extract RouterView/RouterLink
   - `storage.ts` - Instantiate storage service with app prefix
   - `loading.ts` - Instantiate loading service
   - `translation.ts` - Define translations and instantiate translation service
   - `index.ts` - Re-export all services

4. Prefix all exports with the app name (e.g., `newappHttpService`, `NewappRouterView`)

5. In `main.ts`, call `{appname}RouterService.install()` instead of `app.use(router)`

6. In `App.vue`, import and use the extracted `{Appname}RouterView` and `{Appname}RouterLink` components

7. Add npm scripts to `package.json`:
   ```json
   "dev:newapp": "cross-env APP_NAME=newapp vite",
   "build:newapp": "cross-env APP_NAME=newapp vite build"
   ```

8. Update the build script to include the new app:
   ```json
   "build": "run-p type-check \"build:families {@}\" \"build:newapp {@}\" --"
   ```

9. Create test directory:
   ```bash
   mkdir -p src/tests/unit/apps/newapp
   ```

## Reference Files

Use the existing `families` app as a template:
- `src/apps/families/index.html`
- `src/apps/families/main.ts`
- `src/apps/families/App.vue`
- `src/apps/families/services/` - All service instances
- `src/apps/families/types/profile.ts` - User profile type
