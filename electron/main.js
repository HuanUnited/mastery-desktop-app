const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    show: true,
    backgroundColor: '#ffffff',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  const indexPath = path.join(__dirname, '../dist/index.html');
  
  mainWindow.loadFile(indexPath)
    .then(() => console.log('✅ Loaded'))
    .catch(err => console.error('❌ Load error:', err));

  // Remove DevTools in production
  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  console.log('🚀 App starting...');
  
  try {
    const { initDatabase } = require('./database');
    initDatabase();
    console.log('✅ Database OK');
    
    // IPC handlers will now import db directly
    require('./ipc-handlers');
    console.log('✅ IPC handlers loaded');
  } catch (err) {
    console.error('❌ Error:', err);
  }
  
  createWindow();
});

app.on('window-all-closed', () => {
  app.quit();
});
