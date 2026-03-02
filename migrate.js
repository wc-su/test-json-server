import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 判斷要讀取 Zeabur 的 Volume 還是本地端的檔案
const dbPath = process.env.JSON_DB_PATH || path.join(__dirname, 'db.json');

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