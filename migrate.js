import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 與 server.js 使用相同的路徑邏輯
const isProd = process.env.NODE_ENV === 'production';
const dbDirectory = isProd ? '/data' : __dirname;
const dbPath = path.join(dbDirectory, 'db.json');

try {
    // 1. 讀取現有資料庫
    const data = fs.readFileSync(dbPath, 'utf8');
    const db = JSON.parse(data);

    // 2. 進行結構修改
    // 移除
    delete db.posts;
    delete db['private-data'];
    // 新增
    if (!db.wishlists) db.wishlists = [];

    // 3. 寫回檔案 (保留縮排)
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
    console.log('✅ 資料庫遷移成功！已刪除 posts, private-data 並新增 carts, whitlists。');
} catch (error) {
    console.error('❌ 遷移失敗：', error);
}