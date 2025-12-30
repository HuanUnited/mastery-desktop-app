const Database = require('better-sqlite3');
const path = require('path');
const { app } = require('electron');
const fs = require('fs');

const userDataPath = app.getPath('userData');
if (!fs.existsSync(userDataPath)) {
  fs.mkdirSync(userDataPath, { recursive: true });
}

const dbPath = path.join(userDataPath, 'mastery-learning.db');
const db = new Database(dbPath);

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

module.exports = { db };
