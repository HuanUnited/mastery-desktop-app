const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // ErrorLog
  insertErrorLog: (data) => ipcRenderer.invoke('db:insertErrorLog', data),
  getErrorLogs: (filters) => ipcRenderer.invoke('db:getErrorLogs', filters),
  getLastErrorEntry: () => ipcRenderer.invoke('db:getLastErrorEntry'),
  
  // MaterialLog
  upsertMaterialLog: (data) => ipcRenderer.invoke('db:upsertMaterialLog', data),
  getMaterialLogs: () => ipcRenderer.invoke('db:getMaterialLogs'),
  
  // RussianDrillingLog
  insertRussianDrilling: (data) => ipcRenderer.invoke('db:insertRussianDrilling', data),
  getRussianDrillingLogs: () => ipcRenderer.invoke('db:getRussianDrillingLogs'),
  
  // Tasklist
  getTasks: () => ipcRenderer.invoke('db:getTasks'),
  addTask: (task) => ipcRenderer.invoke('db:addTask', task),
  toggleTask: (id) => ipcRenderer.invoke('db:toggleTask', id),
  deleteTask: (id) => ipcRenderer.invoke('db:deleteTask', id),
  
  // Export
  exportJSON: () => ipcRenderer.invoke('db:exportJSON'),
  
  // Utilities
  getUniqueSubjects: () => ipcRenderer.invoke('db:getUniqueSubjects'),

  // Delete operations
  deleteErrorLog: (id) => ipcRenderer.invoke('db:deleteErrorLog', id),
  deleteMaterialLog: (id) => ipcRenderer.invoke('db:deleteMaterialLog', id),
  deleteRussianDrilling: (id) => ipcRenderer.invoke('db:deleteRussianDrilling', id),
  
  // Update operations
  updateErrorLog: (id, data) => ipcRenderer.invoke('db:updateErrorLog', id, data),

  // Vocabulary
  upsertVocabulary: (data) => ipcRenderer.invoke('db:upsertVocabulary', data),
  getVocabulary: (searchTerm) => ipcRenderer.invoke('db:getVocabulary', searchTerm),
  deleteVocabulary: (id) => ipcRenderer.invoke('db:deleteVocabulary', id),
  
  // Subject statistics
  getSubjectStats: () => ipcRenderer.invoke('db:getSubjectStats'),
  getMaterialsBySubject: (subject) => ipcRenderer.invoke('db:getMaterialsBySubject', subject)

});
