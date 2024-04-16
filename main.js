const { app, BrowserWindow, Menu, session, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

app.on('ready', () => {
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
          label: 'Ir para URL',
          accelerator: 'CmdOrCtrl+U',
          click() {
            goToURL();
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

function goToURL() {
  dialog.showMessageBox(mainWindow, {
    title: 'Ir para URL',
    message: 'Por favor, insira a URL desejada:',
    inputPlaceholder: 'https://duckduckgo.com',
    type: 'question',
    buttons: ['Cancelar', 'Ir']
  }).then((result) => {
    if (!result.canceled) {
      const url = result.inputValue.trim();
      if (url !== '') {
        mainWindow.loadURL(url);
      }
    }
  }).catch((err) => {
    console.log(err);
  });
}