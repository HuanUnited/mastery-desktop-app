const { ipcMain, dialog } = require('electron');
const { getDb } = require('./database.js');
const fs = require('fs');
const path = require('path');
const { app } = require('electron');

console.log('📡 Registering IPC handlers...');

// ErrorLog handlers
ipcMain.handle('db:insertErrorLog', (event, data) => {
  const db = getDb();  // ← Get db instance
  console.log('📝 Inserting error log:', data.ProblemID);
  
  // Get all previous attempts for this problem
  const previousAttempts = getDb().prepare(
    'SELECT * FROM ErrorLog WHERE ProblemID = ? ORDER BY DateTimeGMT7 DESC'
  ).all(data.ProblemID);
  
  const totalAttempts = previousAttempts.length + 1;
  
  // Calculate batch number (every 5 attempts = new batch)
  const batchNumber = Math.ceil(totalAttempts / 5);
  const batchID = `${data.ProblemID}-Batch-${batchNumber}`;
  const batchAttemptIndex = ((totalAttempts - 1) % 5) + 1;
  
  console.log(`  → Batch ${batchNumber} (${batchID}), Index: ${batchAttemptIndex}, Total: ${totalAttempts}`);
  
  const stmt = getDb().prepare(`
    INSERT INTO ErrorLog (
      Subject, MaterialNameEN, MaterialNameRU, ProblemID, ProblemTitle,
      BatchID, BatchAttemptIndex, AttemptNumber, UsedResources, Successful,
      TimeSpentMinutes, ErrorsDescription, ResolutionStrategy, Annotation,
      Commentary, StatusTag, RelatedMaterial, DateTimeGMT7
    ) VALUES (
      @Subject, @MaterialNameEN, @MaterialNameRU, @ProblemID, @ProblemTitle,
      @BatchID, @BatchAttemptIndex, @AttemptNumber, @UsedResources, @Successful,
      @TimeSpentMinutes, @ErrorsDescription, @ResolutionStrategy, @Annotation,
      @Commentary, @StatusTag, @RelatedMaterial, @DateTimeGMT7
    )
  `);
  
  const result = stmt.run({
    ...data,
    BatchID: batchID,
    BatchAttemptIndex: batchAttemptIndex,
    AttemptNumber: totalAttempts
  });
  
  console.log('  ✅ Saved with ID:', result.lastInsertRowid);
  
  return result;
});



ipcMain.handle('db:getErrorLogs', (event, filters = {}) => {
  let query = 'SELECT * FROM ErrorLog';
  const params = [];
  
  if (filters.startDate) {
    query += ' WHERE DateTimeGMT7 >= ?';
    params.push(filters.startDate);
  }
  
  query += ' ORDER BY DateTimeGMT7 DESC';
  
  return getDb().prepare(query).all(...params);
});

ipcMain.handle('db:getLastErrorEntry', () => {
  return getDb().prepare('SELECT * FROM ErrorLog ORDER BY id DESC LIMIT 1').get();
});

// MaterialLog handlers
ipcMain.handle('db:upsertMaterialLog', (event, data) => {
  const stmt = getDb().prepare(`
    INSERT INTO MaterialLog (
      Subject, MaterialID, MaterialNameEN, Status, TotalProblems,
      ProblemsSolved, AvgAttemptsLastBatch, Commentary, ResourcesList,
      LastReviewedGMT7, ForcedStopFlag
    ) VALUES (
      @Subject, @MaterialID, @MaterialNameEN, @Status, @TotalProblems,
      @ProblemsSolved, @AvgAttemptsLastBatch, @Commentary, @ResourcesList,
      @LastReviewedGMT7, @ForcedStopFlag
    )
    ON CONFLICT(MaterialID) DO UPDATE SET
      Status = excluded.Status,
      LastReviewedGMT7 = excluded.LastReviewedGMT7,
      Commentary = excluded.Commentary,
      TotalProblems = excluded.TotalProblems,
      ProblemsSolved = excluded.ProblemsSolved
  `);
  
  return stmt.run(data);
});

ipcMain.handle('db:getMaterialLogs', () => {
  return getDb().prepare('SELECT * FROM MaterialLog ORDER BY LastReviewedGMT7 DESC').all();
});

// RussianDrillingLog handlers
ipcMain.handle('db:insertRussianDrilling', (event, data) => {
  const stmt = getDb().prepare(`
    INSERT INTO RussianDrillingLog (
      Subject, MaterialID, MaterialNameEN, MaterialNameRU, AttemptNumber,
      Status, ErrorsRU, ResolutionStrategyRU, CommentaryRU,
      UsedKeywordList, DateTimeGMT7
    ) VALUES (
      @Subject, @MaterialID, @MaterialNameEN, @MaterialNameRU, @AttemptNumber,
      @Status, @ErrorsRU, @ResolutionStrategyRU, @CommentaryRU,
      @UsedKeywordList, @DateTimeGMT7
    )
  `);
  
  return stmt.run(data);
});

ipcMain.handle('db:getRussianDrillingLogs', () => {
  return getDb().prepare('SELECT * FROM RussianDrillingLog ORDER BY DateTimeGMT7 DESC').all();
});

// Tasklist handlers
ipcMain.handle('db:getTasks', () => {
  return getDb().prepare('SELECT * FROM Tasklist ORDER BY completed ASC, priority DESC, deadline ASC').all();
});

ipcMain.handle('db:addTask', (event, task) => {
  const stmt = getDb().prepare(`
    INSERT INTO Tasklist (task, priority, deadline, createdAt, completed)
    VALUES (?, ?, ?, ?, 0)
  `);
  return stmt.run(task.task, task.priority, task.deadline, new Date().toISOString());
});

ipcMain.handle('db:toggleTask', (event, id) => {
  const task = getDb().prepare('SELECT completed FROM Tasklist WHERE id = ?').get(id);
  if (!task) return { success: false };
  const newStatus = task.completed === 1 ? 0 : 1;
  getDb().prepare('UPDATE Tasklist SET completed = ? WHERE id = ?').run(newStatus, id);
  return { success: true };
});

ipcMain.handle('db:deleteTask', (event, id) => {
  getDb().prepare('DELETE FROM Tasklist WHERE id = ?').run(id);
  return { success: true };
});

// Export to JSON
ipcMain.handle('db:exportJSON', async () => {
  const { filePath } = await dialog.showSaveDialog({
    title: 'Export Data as JSON',
    defaultPath: path.join(app.getPath('documents'), 'mastery-learning-export.json'),
    filters: [{ name: 'JSON Files', extensions: ['json'] }]
  });
  
  if (!filePath) return { success: false, message: 'Export cancelled' };
  
  // Get raw data
  const errorLog = getDb().prepare('SELECT * FROM ErrorLog').all();
  const materialLog = getDb().prepare('SELECT * FROM MaterialLog').all();
  const russianDrillingLog = getDb().prepare('SELECT * FROM RussianDrillingLog').all();
  const tasklist = getDb().prepare('SELECT * FROM Tasklist').all();
  
  // Compute analytics for ML/pattern analysis
  const analytics = computeAnalytics(errorLog, materialLog);
  
  const data = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    
    // Raw logs (cleaned - nulls instead of empty strings)
    errorLog: errorLog.map(cleanEntry),
    materialLog: materialLog.map(cleanEntry),
    russianDrillingLog: russianDrillingLog.map(cleanEntry),
    tasklist: tasklist.map(cleanEntry),
    
    // Analytics layer for ML
    analytics: analytics
  };
  
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  return { success: true, path: filePath };
});

// Helper: Convert empty strings to null
function cleanEntry(entry) {
  const cleaned = {};
  for (const [key, value] of Object.entries(entry)) {
    cleaned[key] = (value === '' || value === 0 && key.includes('Minutes')) ? null : value;
  }
  return cleaned;
}

// Helper: Compute analytics for ML
function computeAnalytics(errorLog, materialLog) {
  const problemStats = {};
  
  // Group by problem
  errorLog.forEach(log => {
    const pid = log.ProblemID;
    if (!problemStats[pid]) {
      problemStats[pid] = {
        problemId: pid,
        subject: log.Subject,
        material: log.MaterialNameEN,
        totalAttempts: 0,
        successfulAttempts: 0,
        totalTimeMinutes: 0,
        batches: [],
        firstAttempt: log.DateTimeGMT7,
        lastAttempt: log.DateTimeGMT7
      };
    }
    
    const stats = problemStats[pid];
    stats.totalAttempts++;
    if (log.Successful === 1) stats.successfulAttempts++;
    stats.totalTimeMinutes += log.TimeSpentMinutes || 0;
    stats.lastAttempt = log.DateTimeGMT7;
    
    // Track batch-level stats
    let batch = stats.batches.find(b => b.batchId === log.BatchID);
    if (!batch) {
      batch = {
        batchId: log.BatchID,
        batchNumber: Math.ceil(log.AttemptNumber / 5),
        attempts: []
      };
      stats.batches.push(batch);
    }
    batch.attempts.push({
      attemptNumber: log.AttemptNumber,
      successful: log.Successful === 1,
      timeMinutes: log.TimeSpentMinutes,
      timestamp: log.DateTimeGMT7
    });
  });
  
  // Compute derived metrics
  const summary = Object.values(problemStats).map(stats => {
    const successRate = stats.totalAttempts > 0 
      ? (stats.successfulAttempts / stats.totalAttempts) 
      : 0;
    
    const avgTimePerAttempt = stats.totalAttempts > 0
      ? (stats.totalTimeMinutes / stats.totalAttempts)
      : 0;
    
    const daysToProficiency = stats.successfulAttempts > 0
      ? Math.ceil((new Date(stats.lastAttempt) - new Date(stats.firstAttempt)) / (1000 * 60 * 60 * 24))
      : null;
    
    return {
      ...stats,
      successRate: parseFloat(successRate.toFixed(3)),
      avgTimePerAttempt: parseFloat(avgTimePerAttempt.toFixed(2)),
      daysToProficiency,
      batchCount: stats.batches.length,
      avgAttemptsPerBatch: parseFloat((stats.totalAttempts / stats.batches.length).toFixed(2))
    };
  });
  
  return {
    problemStats: summary,
    overallStats: {
      totalProblems: Object.keys(problemStats).length,
      totalAttempts: errorLog.length,
      totalSuccessfulAttempts: errorLog.filter(l => l.Successful === 1).length,
      overallSuccessRate: errorLog.length > 0 
        ? parseFloat((errorLog.filter(l => l.Successful === 1).length / errorLog.length).toFixed(3))
        : 0,
      totalTimeMinutes: errorLog.reduce((sum, l) => sum + (l.TimeSpentMinutes || 0), 0),
      uniqueSubjects: [...new Set(errorLog.map(l => l.Subject))],
      uniqueMaterials: [...new Set(errorLog.map(l => l.MaterialNameEN))]
    }
  };
}

// Get unique subjects
ipcMain.handle('db:getUniqueSubjects', () => {
  const subjects = getDb().prepare('SELECT DISTINCT Subject FROM ErrorLog WHERE Subject IS NOT NULL').all();
  return subjects.map(s => s.Subject);
});

// DELETE handlers
ipcMain.handle('db:deleteErrorLog', (event, id) => {
  getDb().prepare('DELETE FROM ErrorLog WHERE id = ?').run(id);
  return { success: true };
});

ipcMain.handle('db:deleteMaterialLog', (event, id) => {
  getDb().prepare('DELETE FROM MaterialLog WHERE id = ?').run(id);
  return { success: true };
});

ipcMain.handle('db:deleteRussianDrilling', (event, id) => {
  getDb().prepare('DELETE FROM RussianDrillingLog WHERE id = ?').run(id);
  return { success: true };
});

// UPDATE handlers
ipcMain.handle('db:updateErrorLog', (event, id, data) => {
  const stmt = getDb().prepare(`
    UPDATE ErrorLog SET
      ProblemID = @ProblemID,
      ErrorsDescription = @ErrorsDescription,
      ResolutionStrategy = @ResolutionStrategy,
      Commentary = @Commentary,
      TimeSpentMinutes = @TimeSpentMinutes,
      Successful = @Successful
    WHERE id = @id
  `);
  return stmt.run({ ...data, id });
});

console.log('✅ Delete/Update handlers registered');

console.log('✅ IPC handlers registered');

ipcMain.handle('db:upsertVocabulary', (event, data) => {
  console.log('📝 Upserting vocabulary:', data.russianWord);
  
  const stmt = getDb().prepare(`
    INSERT INTO RussianVocabulary (
      russianWord, englishTranslation, subject, materialID, 
      firstSeenDate, lastReviewedDate, reviewCount
    ) VALUES (
      @russianWord, @englishTranslation, @subject, @materialID,
      @firstSeenDate, @lastReviewedDate, @reviewCount
    )
    ON CONFLICT(russianWord) DO UPDATE SET
      englishTranslation = excluded.englishTranslation,
      lastReviewedDate = excluded.lastReviewedDate,
      reviewCount = reviewCount + 1
  `);
  
  return stmt.run(data);
});

ipcMain.handle('db:getVocabulary', (event, searchTerm = '') => {
  console.log('🔍 Getting vocabulary, search:', searchTerm);
  
  if (searchTerm) {
    const stmt = getDb().prepare(`
      SELECT * FROM RussianVocabulary 
      WHERE russianWord LIKE ? OR englishTranslation LIKE ?
      ORDER BY lastReviewedDate DESC
    `);
    return stmt.all(`%${searchTerm}%`, `%${searchTerm}%`);
  }
  
  return getDb().prepare('SELECT * FROM RussianVocabulary ORDER BY lastReviewedDate DESC').all();
});

ipcMain.handle('db:deleteVocabulary', (event, id) => {
  getDb().prepare('DELETE FROM RussianVocabulary WHERE id = ?').run(id);
  return { success: true };
});

// Subject statistics
ipcMain.handle('db:getSubjectStats', () => {
  console.log('📊 Getting subject statistics');
  
  const stats = getDb().prepare(`
    SELECT 
      Subject,
      COUNT(DISTINCT MaterialID) as totalMaterials,
      SUM(TotalProblems) as totalProblems,
      SUM(ProblemsSolved) as problemsSolved,
      AVG(AvgAttemptsLastBatch) as avgAttempts,
      MAX(LastReviewedGMT7) as lastActivity
    FROM MaterialLog
    WHERE Subject IS NOT NULL
    GROUP BY Subject
    ORDER BY lastActivity DESC
  `).all();
  
  return stats;
});

ipcMain.handle('db:getMaterialsBySubject', (event, subject) => {
  console.log('📚 Getting materials for subject:', subject);
  
  return getDb().prepare(`
    SELECT * FROM MaterialLog 
    WHERE Subject = ?
    ORDER BY LastReviewedGMT7 DESC
  `).all(subject);
});

console.log('✅ Dictionary handlers registered');