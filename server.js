// ============================================
// JSON Server + Auth 設定檔 (ES Module)
// ============================================

import jsonServer from 'json-server';
import auth from 'json-server-auth';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// ES Module 需要手動取得 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================
// 1. 建立 Server 實例
// ============================================
const server = jsonServer.create();
const middlewares = jsonServer.defaults(); // 內建 CORS、靜態檔案、logger 等

// ============================================
// 2. 資料庫路徑設定（支援 Volume 持久化）
// ============================================

// 來源資料庫：專案目錄中的 db.json（作為初始資料模板）
const sourceDb = path.join(__dirname, 'db.json');

// 判斷執行環境
const isProd = process.env.NODE_ENV === 'production';

// 目標資料庫路徑
// - 生產環境：/data/db.json（掛載 Volume 的位置）
// - 開發環境：專案目錄的 db.json
const dbDirectory = isProd ? '/data' : __dirname;
const dbPath = path.join(dbDirectory, 'db.json');

// ============================================
// 3. 自動初始化資料庫
// ============================================
// 當 Volume 剛掛載時，/data 是空的
// 這段程式會自動複製初始資料，避免 crash
if (!fs.existsSync(dbPath)) {
  console.log('目標資料庫不存在，正在初始化...');

  // 確保目標資料夾存在
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  // 從來源複製一份到目標位置
  fs.copyFileSync(sourceDb, dbPath);
  console.log('資料庫初始化完成！');
}

// 建立 router（讀取資料庫）
const router = jsonServer.router(dbPath);

// ============================================
// 4. 設定 json-server-auth
// ============================================

// 綁定資料庫（json-server-auth 必要步驟）
server.db = router.db;

// 權限規則設定
// 格式說明：
// - 600: 需登入才能寫，可公開讀
// - 640: 需登入才能寫，登入者才能讀
// - 660: 需登入才能讀寫
const rules = auth.rewriter({
  '/users*': '/660/users$1',
  '/private-data*': '/660/private-data$1',
});

// ============================================
// 5. 套用 Middleware（順序重要！）
// ============================================
server.use(middlewares);  // 預設 middleware（CORS、logger 等）
server.use(rules);        // 權限路由規則
server.use(auth);         // 驗證中介軟體
server.use(router);       // API 路由

// ============================================
// 6. 啟動 Server
// ============================================

// Zeabur 會自動注入 PORT 環境變數
const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log(`JSON Server with Auth is running on port ${port}`);
  console.log(`Database path: ${dbPath}`);
});