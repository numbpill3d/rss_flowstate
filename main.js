const { app, BrowserWindow, Menu, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const fetch = require('node-fetch');
const xml2js = require('xml2js');

let mainWindow;
const isDev = process.argv.includes('--dev');

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    minWidth: 800,
    minHeight: 600,
    icon: path.join(__dirname, 'assets', 'icon.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    titleBarStyle: 'default',
    frame: true,
    show: false,
    backgroundColor: '#c0c0c0'
  });

  mainWindow.loadFile('renderer/index.html');

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Create application menu
function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Feed...',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.send('menu-new-feed');
          }
        },
        {
          label: 'New Group...',
          accelerator: 'CmdOrCtrl+G',
          click: () => {
            mainWindow.webContents.send('menu-new-group');
          }
        },
        { type: 'separator' },
        {
          label: 'Import OPML...',
          click: async () => {
            const result = await dialog.showOpenDialog(mainWindow, {
              filters: [
                { name: 'OPML Files', extensions: ['opml', 'xml'] },
                { name: 'All Files', extensions: ['*'] }
              ]
            });
            
            if (!result.canceled && result.filePaths.length > 0) {
              mainWindow.webContents.send('menu-import-opml', result.filePaths[0]);
            }
          }
        },
        {
          label: 'Export OPML...',
          click: async () => {
            const result = await dialog.showSaveDialog(mainWindow, {
              filters: [
                { name: 'OPML Files', extensions: ['opml'] }
              ],
              defaultPath: 'feeds.opml'
            });
            
            if (!result.canceled) {
              mainWindow.webContents.send('menu-export-opml', result.filePath);
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Refresh All',
          accelerator: 'F5',
          click: () => {
            mainWindow.webContents.send('menu-refresh-all');
          }
        },
        { type: 'separator' },
        {
          label: 'Theme',
          submenu: [
            {
              label: 'Windows 98',
              type: 'radio',
              checked: true,
              click: () => {
                mainWindow.webContents.send('menu-theme-change', 'win98');
              }
            },
            {
              label: 'Windows 95',
              type: 'radio',
              click: () => {
                mainWindow.webContents.send('menu-theme-change', 'win95');
              }
            },
            {
              label: 'Classic Green',
              type: 'radio',
              click: () => {
                mainWindow.webContents.send('menu-theme-change', 'green');
              }
            },
            {
              label: 'Amber Terminal',
              type: 'radio',
              click: () => {
                mainWindow.webContents.send('menu-theme-change', 'amber');
              }
            }
          ]
        },
        { type: 'separator' },
        {
          label: 'Toggle Sidebar',
          accelerator: 'CmdOrCtrl+B',
          click: () => {
            mainWindow.webContents.send('menu-toggle-sidebar');
          }
        },
        { type: 'separator' },
        {
          label: 'Developer Tools',
          accelerator: 'F12',
          click: () => {
            mainWindow.webContents.toggleDevTools();
          }
        }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About Retro RSS Aggregator',
              message: 'Retro RSS Aggregator v1.0.0',
              detail: 'A nostalgic RSS feed reader with Windows 98 styling.\n\nBuilt with Electron and classic web technologies.\n\nFeatures:\n• RSS feed parsing and management\n• Windows 98 authentic styling\n• Multiple themes\n• Article organization\n• Keyboard shortcuts\n• OPML import/export'
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// RSS Feed Parser
async function parseRSSFeed(url) {
  try {
    console.log(`Fetching RSS feed: ${url}`);
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Retro RSS Aggregator/1.0.0'
      },
      timeout: 10000
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const xmlData = await response.text();
    const parser = new xml2js.Parser({
      trim: true,
      normalize: true,
      normalizeTags: true,
      explicitArray: false
    });
    
    const result = await parser.parseStringPromise(xmlData);
    
    let feedData = {
      title: 'Unknown Feed',
      description: '',
      link: '',
      articles: []
    };
    
    // Handle RSS 2.0
    if (result.rss && result.rss.channel) {
      const channel = result.rss.channel;
      feedData.title = channel.title || 'Unknown Feed';
      feedData.description = channel.description || '';
      feedData.link = channel.link || '';
      
      const items = Array.isArray(channel.item) ? channel.item : [channel.item].filter(Boolean);
      
      feedData.articles = items.map((item, index) => ({
        id: `${Date.now()}-${index}`,
        title: item.title || 'Untitled',
        link: item.link || '',
        description: item.description || item.summary || '',
        pubDate: item.pubdate || item.published || new Date().toISOString(),
        author: item.author || item.creator || 'Unknown Author',
        guid: item.guid || item.id || `${url}-${index}`,
        read: false,
        saved: false
      }));
    }
    
    // Handle Atom feeds
    else if (result.feed) {
      const feed = result.feed;
      feedData.title = feed.title || 'Unknown Feed';
      feedData.description = feed.subtitle || feed.description || '';
      feedData.link = feed.link ? (feed.link.href || feed.link) : '';
      
      const entries = Array.isArray(feed.entry) ? feed.entry : [feed.entry].filter(Boolean);
      
      feedData.articles = entries.map((entry, index) => ({
        id: `${Date.now()}-${index}`,
        title: entry.title || 'Untitled',
        link: entry.link ? (entry.link.href || entry.link) : '',
        description: entry.summary || entry.content || '',
        pubDate: entry.published || entry.updated || new Date().toISOString(),
        author: entry.author ? (entry.author.name || entry.author) : 'Unknown Author',
        guid: entry.id || `${url}-${index}`,
        read: false,
        saved: false
      }));
    }
    
    return {
      success: true,
      feedData: feedData
    };
    
  } catch (error) {
    console.error('Error parsing RSS feed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// IPC handlers
ipcMain.handle('open-external', async (event, url) => {
  try {
    await shell.openExternal(url);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('read-file', async (event, filePath) => {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('write-file', async (event, filePath, data) => {
  try {
    fs.writeFileSync(filePath, data, 'utf8');
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('parse-rss-feed', async (event, url) => {
  return await parseRSSFeed(url);
});

ipcMain.handle('fetch-multiple-feeds', async (event, feedUrls) => {
  const results = await Promise.allSettled(
    feedUrls.map(url => parseRSSFeed(url))
  );
  
  return results.map((result, index) => ({
    url: feedUrls[index],
    success: result.status === 'fulfilled',
    data: result.status === 'fulfilled' ? result.value : null,
    error: result.status === 'rejected' ? result.reason.message : null
  }));
});

// Menu event handlers
ipcMain.on('menu-new-feed', () => {
  mainWindow.webContents.send('menu-new-feed');
});

ipcMain.on('menu-new-group', () => {
  mainWindow.webContents.send('menu-new-group');
});

ipcMain.on('menu-refresh-all', () => {
  mainWindow.webContents.send('menu-refresh-all');
});

ipcMain.on('menu-theme-change', (event, theme) => {
  mainWindow.webContents.send('menu-theme-change', theme);
});

ipcMain.on('menu-toggle-sidebar', () => {
  mainWindow.webContents.send('menu-toggle-sidebar');
});

app.whenReady().then(() => {
  createWindow();
  createMenu();
  
  // Handle certificate errors for RSS feeds
  app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
    if (url.includes('rss') || url.includes('feed')) {
      event.preventDefault();
      callback(true);
    } else {
      callback(false);
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Handle protocol for deep linking (optional)
app.setAsDefaultProtocolClient('retro-rss');

// Prevent navigation to external URLs in the main window
app.on('web-contents-created', (event, contents) => {
  contents.on('will-navigate', (navigationEvent, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    
    if (parsedUrl.origin !== 'file://') {
      navigationEvent.preventDefault();
    }
  });
});

console.log('Retro RSS Aggregator main process started');
