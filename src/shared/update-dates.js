#!/usr/bin/env node

/**
 * Script to update all "Present" date entries in resume JSON files
 * Run with: node src/shared/update-dates.js
 */

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { updateAllPresentEntries } from './date-utils.js';

/**
 * Updates all "Present" dates across all JSON files in the profiles directory
 */
function updateAllDates() {
  const profilesDir = path.join(process.cwd(), 'input/profiles');
  const sectionsDir = path.join(profilesDir, 'sections');
  
  let totalUpdates = 0;
  
  console.log('🔄 Updating present dates across all profile files...');
  
  // Update main profile.json
  const profilePath = path.join(profilesDir, 'profile.json');
  try {
    const profileData = JSON.parse(readFileSync(profilePath, 'utf8'));
    const originalData = JSON.stringify(profileData);
    const updatedData = updateAllPresentEntries(profileData);
    const updatedString = JSON.stringify(updatedData);
    
    if (originalData !== updatedString) {
      writeFileSync(profilePath, JSON.stringify(updatedData, null, 2));
      console.log(`✅ Updated dates in profile.json`);
      totalUpdates++;
    }
  } catch (error) {
    console.log(`ℹ️  Skipping profile.json (${error.message})`);
  }
  
  // Update all section files
  try {
    const sectionFiles = readdirSync(sectionsDir).filter(file => file.endsWith('.json'));
    
    for (const file of sectionFiles) {
      const filePath = path.join(sectionsDir, file);
      try {
        const data = JSON.parse(readFileSync(filePath, 'utf8'));
        const originalData = JSON.stringify(data);
        const updatedData = updateAllPresentEntries(data);
        const updatedString = JSON.stringify(updatedData);
        
        if (originalData !== updatedString) {
          writeFileSync(filePath, JSON.stringify(updatedData, null, 2));
          console.log(`✅ Updated dates in ${file}`);
          totalUpdates++;
        }
      } catch (error) {
        console.log(`⚠️  Error processing ${file}: ${error.message}`);
      }
    }
  } catch (error) {
    console.log(`⚠️  Error reading sections directory: ${error.message}`);
  }
  
  if (totalUpdates === 0) {
    console.log('✨ All dates are already up to date!');
  } else {
    console.log(`🎉 Successfully updated ${totalUpdates} files`);
  }
}

// Run the update if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  updateAllDates();
} 