const { app, BrowserWindow, Menu, session, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
let shortcutsPopup;

app.on('ready', () => {
  // Definir o DNS público da AdGuard
  session.defaultSession.resolveProxy = (url, callback) => {
    callback('PROXY 94.140.14.14:853; PROXY 94.140.15.15:853; DIRECT');
  };

  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  });

  const urlToMirror = 'https://duckduckgo.com';

  mainWindow.loadURL(urlToMirror);

  mainWindow.webContents.on('did-finish-load', () => {
    const cookies = mainWindow.webContents.session.cookies;

    cookies.get({}, (error, cookies) => {
      if (error) throw error;

      const cookiesFilePath = path.join(app.getAppPath(), 'cookies.json');
      fs.writeFileSync(cookiesFilePath, JSON.stringify(cookies, null, 2));
    });
  });

  const menuTemplate = [
    {
      label: 'Ações',
      submenu: [
        {
          label: 'Voltar',
          accelerator: 'CmdOrCtrl+Left',
          click() {
            mainWindow.webContents.goBack();
          }
        },
        {
          label: 'Avançar',
          accelerator: 'CmdOrCtrl+Right',
          click() {
            mainWindow.webContents.goForward();
          }
        },
        {
          label: 'Recarregar',
          accelerator: 'CmdOrCtrl+R',
          click() {
            mainWindow.webContents.reload();
          }
        },
        {
          label: 'Home',
          accelerator: 'CmdOrCtrl+H',
          click() {
            mainWindow.loadURL(urlToMirror);
          }
        },
        {
          label: 'Limpar Cookies',
          accelerator: 'CmdOrCtrl+Shift+C',
          click() {
            clearCookies();
          }
        },
        {
          label: 'Guia de Atalhos',
          click() {
            showShortcutsPopup();
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
});

function clearCookies() {
  mainWindow.webContents.session.clearStorageData({
    storages: ['cookies']
  }, () => {
    console.log('Cookies limpos!');
  });
}

function showShortcutsPopup() {
  const shortcutsText = `
    Atalhos do Navegador:
    - Voltar: CmdOrCtrl+Left
    - Avançar: CmdOrCtrl+Right
    - Recarregar: CmdOrCtrl+R
    - Home: CmdOrCtrl+H
    - Limpar Cookies: CmdOrCtrl+Shift+C
  `;

  shortcutsPopup = new BrowserWindow({
    parent: mainWindow,
    width: 400,
    height: 300,
    modal: true,
    show: false,
    webPreferences: {
      nodeIntegration: true
    }
  });

  shortcutsPopup.loadURL(`data:text/html,
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h2 { margin-bottom: 10px; }
          p { white-space: pre-wrap; }
        </style>
      </head>
      <body>
        <h2>Guia de Atalhos</h2>
        <p>${shortcutsText}</p>
      </body>
    </html>`
  );

  shortcutsPopup.once('ready-to-show', () => {
    shortcutsPopup.show();
  });
}
