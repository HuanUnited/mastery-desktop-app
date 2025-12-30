export const useDatabase = () => {
  return {
    // ErrorLog
    insertErrorLog: (data) => window.electronAPI.insertErrorLog(data),
    getErrorLogs: (filters) => window.electronAPI.getErrorLogs(filters),
    getLastErrorEntry: () => window.electronAPI.getLastErrorEntry(),
    deleteErrorLog: (id) => window.electronAPI.deleteErrorLog(id),
    updateErrorLog: (id, data) => window.electronAPI.updateErrorLog(id, data),
    
    // MaterialLog
    upsertMaterialLog: (data) => window.electronAPI.upsertMaterialLog(data),
    getMaterialLogs: () => window.electronAPI.getMaterialLogs(),
    deleteMaterialLog: (id) => window.electronAPI.deleteMaterialLog(id),
    
    // RussianDrillingLog
    insertRussianDrilling: (data) => window.electronAPI.insertRussianDrilling(data),
    getRussianDrillingLogs: () => window.electronAPI.getRussianDrillingLogs(),
    deleteRussianDrilling: (id) => window.electronAPI.deleteRussianDrilling(id),
    
    // Tasklist
    getTasks: () => window.electronAPI.getTasks(),
    addTask: (task) => window.electronAPI.addTask(task),
    toggleTask: (id) => window.electronAPI.toggleTask(id),
    deleteTask: (id) => window.electronAPI.deleteTask(id),
    
    // Export
    exportJSON: () => window.electronAPI.exportJSON(),
    
    // Utilities
    getUniqueSubjects: () => window.electronAPI.getUniqueSubjects(),

    // Vocabulary
    upsertVocabulary: (data) => window.electronAPI.upsertVocabulary(data),
    getVocabulary: (searchTerm) => window.electronAPI.getVocabulary(searchTerm),
    deleteVocabulary: (id) => window.electronAPI.deleteVocabulary(id),
    
    // Subject stats
    getSubjectStats: () => window.electronAPI.getSubjectStats(),
    getMaterialsBySubject: (subject) => window.electronAPI.getMaterialsBySubject(subject)
  };
};
