import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { getYear, getMonth, formatISO } from 'date-fns';

/**
 * Vite plugin that automatically updates resume dates monthly
 * Checks metadata in profile.json and only runs if last update was in a different month
 */
export default function dateUpdaterPlugin() {
  const profilePath = path.join(process.cwd(), 'input/profiles/sections/profile.json');
  
  return {
    name: 'date-updater',
    buildStart() {
      try {
        // Read current profile metadata
        const profileData = JSON.parse(readFileSync(profilePath, 'utf8'));
        const metadata = profileData.metadata || {};
        
        const now = new Date();
        const currentMonth = getYear(now) * 12 + getMonth(now); // Unique number per month
        
        let shouldUpdate = true;
        
        if (metadata.dateUpdatedLastRun) {
          const lastUpdate = new Date(metadata.dateUpdatedLastRun);
          const lastUpdateMonth = getYear(lastUpdate) * 12 + getMonth(lastUpdate);
          
          if (currentMonth === lastUpdateMonth) {
            console.log('📅 Date updates already current for this month, skipping...');
            shouldUpdate = false;
          }
        }
        
        if (shouldUpdate) {
          console.log('📅 Running monthly date updates...');
          
          // Run the date update script
          execSync('npm run update-dates', { stdio: 'inherit' });
          
          // Update metadata
          metadata.dateUpdatedLastRun = formatISO(now);
          profileData.metadata = metadata;
          
          writeFileSync(profilePath, JSON.stringify(profileData, null, 2));
          console.log('✅ Date updates completed and metadata updated');
        }
        
      } catch (error) {
        console.warn('⚠️  Date updater plugin encountered an error:', error.message);
        // Don't fail the build, just warn
      }
    }
  };
} 