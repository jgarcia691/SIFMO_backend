const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../SIFMO.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run("ALTER TABLE Usuario ADD COLUMN password TEXT", function(err) {
    if (err) {
      if (err.message.includes('duplicate column name')) {
        console.log('Column password already exists.');
      } else {
        console.error('Error adding password column:', err.message);
      }
    } else {
      console.log('Successfully added password column to Usuario table.');
    }
  });
});

db.close();
