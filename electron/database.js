const Database = require('better-sqlite3');
const path = require('path');
const { app } = require('electron');
const fs = require('fs');

let db = null;

function initDatabase() {
  if (db) return db;
  
  const userDataPath = app.getPath('userData');
  const dbPath = path.join(userDataPath, 'mastery-learning.db');

  console.log('✅ Database initialized at:', dbPath);

  try {
    db = new Database(dbPath);
  } catch (err) {
    console.error('❌ Database initialization failed:', err);
    const unpackedPath = path.join(process.resourcesPath, 'app.asar.unpacked', 'node_modules', 'better-sqlite3');
    console.log('🔍 Trying unpacked path:', unpackedPath);
    
    if (fs.existsSync(unpackedPath)) {
      console.log('✅ Found unpacked better-sqlite3');
    } else {
      console.log('❌ Unpacked better-sqlite3 not found');
    }
    throw err;
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS ErrorLog (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      Subject TEXT,
      MaterialNameEN TEXT,
      MaterialNameRU TEXT,
      ProblemID TEXT,
      ProblemTitle TEXT,
      BatchID TEXT,
      BatchAttemptIndex INTEGER,
      AttemptNumber INTEGER,
      UsedResources TEXT,
      Successful INTEGER DEFAULT 0,
      TimeSpentMinutes INTEGER,
      ErrorsDescription TEXT,
      ResolutionStrategy TEXT,
      Annotation TEXT,
      Commentary TEXT,
      StatusTag TEXT,
      RelatedMaterial TEXT,
      DateTimeGMT7 TEXT
    );

    CREATE TABLE IF NOT EXISTS MaterialLog (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      Subject TEXT,
      MaterialID TEXT UNIQUE,
      MaterialNameEN TEXT,
      Status TEXT,
      TotalProblems INTEGER DEFAULT 0,
      ProblemsSolved INTEGER DEFAULT 0,
      AvgAttemptsLastBatch REAL,
      Commentary TEXT,
      ResourcesList TEXT,
      LastReviewedGMT7 TEXT,
      ForcedStopFlag INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS RussianDrillingLog (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      Subject TEXT,
      MaterialID TEXT,
      MaterialNameEN TEXT,
      MaterialNameRU TEXT,
      AttemptNumber INTEGER,
      Status TEXT,
      ErrorsRU TEXT,
      ResolutionStrategyRU TEXT,
      CommentaryRU TEXT,
      UsedKeywordList TEXT,
      DateTimeGMT7 TEXT
    );

    CREATE TABLE IF NOT EXISTS RussianVocabulary (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      russianWord TEXT UNIQUE,
      englishTranslation TEXT,
      subject TEXT,
      materialID TEXT,
      firstSeenDate TEXT,
      lastReviewedDate TEXT,
      reviewCount INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS Tasklist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task TEXT NOT NULL,
      completed INTEGER DEFAULT 0,
      priority TEXT DEFAULT 'medium',
      deadline TEXT,
      createdAt TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_errorlog_date ON ErrorLog(DateTimeGMT7);
    CREATE INDEX IF NOT EXISTS idx_errorlog_material ON ErrorLog(MaterialNameEN);
    CREATE INDEX IF NOT EXISTS idx_tasklist_completed ON Tasklist(completed);
  `);

  console.log('✅ Database initialized at:', dbPath);

  return db;
}

// Export a getter function
function getDb() {
  if (!db) {
    throw new Error('Database not initialized! Call initDatabase() first.');
  }
  return db;
}

module.exports = { initDatabase, getDb };
