import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const removedRoutes = new Set(['/profilarr-setup', '/development']);

export function getAllRoutes() {
  // Static routes 
  const staticRoutes = [
    '/',
    '/profilarr-setup/installation',
    '/devlogs',
    '/quality-profile',
    '/custom-format',
    '/regex-pattern',
    '/delay-profile',
    '/media-management',
    '/media-management/naming',
    '/media-management/qualitydefinitions',
    '/media-management/misc',
    '/wiki',
    '/ai-transparency'
  ];

  // Get dynamic routes from the generated content database
  const dynamicRoutes = [];
  
  try {
    const dbPath = path.join(__dirname, '../src/generated/contentDatabase.ts');
    if (fs.existsSync(dbPath)) {
      const content = fs.readFileSync(dbPath, 'utf-8');

      const match = content.match(/export const contentDatabase = (\{[\s\S]*\}) as const;/);
      const database = match ? eval(`(${match[1]})`) : null;

      const databaseSections = ['/quality-profile', '/custom-format', '/regex-pattern', '/delay-profile', '/media-management'];
      for (const source of database?.databases || []) {
        for (const section of databaseSections) {
          const scopedSection = `/db/${encodeURIComponent(source.id)}${section}`;
          if (!staticRoutes.includes(scopedSection) && !dynamicRoutes.includes(scopedSection)) {
            dynamicRoutes.push(scopedSection);
          }
        }
      }

      for (const entry of database?.entries || []) {
        const route = entry.path;
        if (removedRoutes.has(route)) {
          continue;
        }

        if (!staticRoutes.includes(route)) {
          dynamicRoutes.push(route);
        }

        if (entry.databaseId) {
          const scopedRoute = `/db/${encodeURIComponent(entry.databaseId)}${entry.path}`;
          if (!staticRoutes.includes(scopedRoute)) {
            dynamicRoutes.push(scopedRoute);
          }
        }
      }
    }
  } catch (error) {
    console.warn('Could not read content database:', error.message);
  }

  return [...staticRoutes, ...dynamicRoutes];
}

// If run directly, print routes
if (import.meta.url === `file://${process.argv[1]}`) {
  const routes = getAllRoutes();
  console.log(`Found ${routes.length} routes`);
  console.log(JSON.stringify(routes, null, 2));
}
