require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { Vocabulary } = require('../models');
const { sequelize } = require('../config/db');

async function importVocabulary() {
  try {
    await sequelize.authenticate();
    console.log('✓ Connected to database\n');
    
    const csvPath = path.join(__dirname, '../../vocabulary.csv');
    
    if (!fs.existsSync(csvPath)) {
      console.error('vocabulary.csv not found in project root');
      process.exit(1);
    }
    
    console.log('Reading vocabulary.csv...');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });
    
    console.log(`Found ${records.length} words\n`);
    console.log('Importing...');
    
    let imported = 0;
    let skipped = 0;
    
    for (const record of records) {
      try {
        if (!record.word || !record.part_of_speech || !record.definition) {
          skipped++;
          continue;
        }
        
        await Vocabulary.create({
          word: record.word.trim(),
          partOfSpeech: record.part_of_speech.trim(),
          definition: record.definition.trim()
        });
        
        imported++;
        if (imported % 100 === 0) {
          process.stdout.write(`\rImported: ${imported}`);
        }
      } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
          skipped++;
        } else {
          console.error(`\nError importing "${record.word}":`, error.message);
        }
      }
    }
    
    console.log(`\n\n✓ Import complete!`);
    console.log(`  Imported: ${imported}`);
    console.log(`  Skipped: ${skipped}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Import failed:', error);
    process.exit(1);
  }
}

importVocabulary();
