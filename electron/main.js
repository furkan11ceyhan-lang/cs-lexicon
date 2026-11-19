const { app, BrowserWindow, Menu, nativeTheme } = require("electron");
const path = require("path");

let mainWindow = null;

function createWindow() {
  const isDark = nativeTheme.shouldUseDarkColors;

  mainWindow = new BrowserWindow({
    width: 860,
    height: 760,
    minWidth: 480,
    minHeight: 580,
    title: "CS Lexicon",
    backgroundColor: isDark ? "#0f1218" : "#f6f4ef",
    icon: path.join(__dirname, "..", "icons", "icon-512.png"),
    autoHideMenuBar: process.platform !== "darwin",
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  mainWindow.loadFile(path.join(__dirname, "..", "index.html"));

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

function createMenu() {
  const isMac = process.platform === "darwin";

  const template = [
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [
              { role: "about", label: "CS Lexicon Hakkında" },
              { type: "separator" },
              { role: "hide", label: "Gizle" },
              { role: "hideOthers", label: "Diğerlerini Gizle" },
              { role: "unhide", label: "Tümünü Göster" },
              { type: "separator" },
              { role: "quit", label: "Çıkış" }
            ]
          }
        ]
      : []),
    {
      label: "Düzen",
      submenu: [
        { role: "undo", label: "Geri Al" },
        { role: "redo", label: "Yinele" },
        { type: "separator" },
        { role: "cut", label: "Kes" },
        { role: "copy", label: "Kopyala" },
        { role: "paste", label: "Yapıştır" },
        { role: "selectAll", label: "Tümünü Seç" }
      ]
    },
    {
      label: "Görünüm",
      submenu: [
        { role: "reload", label: "Yeni Kelime (Yenile)" },
        { type: "separator" },
        { role: "resetZoom", label: "Normal Boyut" },
        { role: "zoomIn", label: "Yakınlaştır" },
        { role: "zoomOut", label: "Uzaklaştır" },
        { type: "separator" },
        { role: "togglefullscreen", label: "Tam Ekran" }
      ]
    },
    {
      label: "Pencere",
      submenu: [
        { role: "minimize", label: "Simge Durumuna Küçült" },
        ...(isMac ? [{ role: "zoom", label: "Büyüt" }] : []),
        { role: "close", label: "Pencereyi Kapat" }
      ]
    }
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

app.whenReady().then(() => {
  createMenu();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
