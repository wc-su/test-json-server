const jsonServer = require('json-server');
const auth = require('json-server-auth');
const path = require('path');

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'db.json'));
const middlewares = jsonServer.defaults();

// 2. 綁定資料庫 (這是 json-server-auth 運作的必要步驟)
server.db = router.db;

// 3. 設定權限規則 (可選)
// 這裡可以定義哪些路徑需要權限，例如：
// /users: 只有登入者(660)才能讀寫
// /private-data: 只有登入者(660)才能讀寫
// 其他預設遵循 json-server-auth 規則
const rules = auth.rewriter({
  // 格式： 路由: 權限等級 (660 代表需登入才能讀寫，600 代表需登入才能寫但可公開讀)
  "/users*": "/660/users$1",
  "/private-data*": "/660/private-data$1" 
});


server.use(middlewares);
server.use(rules); // 套用自訂路由規則
server.use(auth);  // 套用驗證中介軟體
server.use(router);

// 4. 設定 Port
// Zeabur 會自動注入 PORT 環境變數，必須優先使用
const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log(`JSON Server with Auth is running on port ${port}`);
});