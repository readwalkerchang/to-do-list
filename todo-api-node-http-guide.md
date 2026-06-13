# Todo API：Node.js 原生 HTTP Server 教學文件

這份文件用來解釋目前 `server.js` 的寫法。  
它是一個用 Node.js 原生 `http` 模組寫出來的 Todo API server。

目前這份 server 支援：

- `GET /todo`：取得所有 todo
- `POST /todo`：新增一筆 todo
- `DELETE /todo`：刪除全部 todo
- `DELETE /todo/:id`：刪除單一 todo
- `PATCH /todo/:id`：修改單一 todo 的 title
- `OPTIONS`：處理 CORS 預檢請求
- 其他路徑：回傳 404

## 整體架構

`server.js` 可以分成幾個區塊：

1. 載入模組
2. 建立資料儲存陣列
3. 建立共用 headers
4. 建立 helper function
5. 建立 requestListener
6. 在 requestListener 裡判斷不同 API
7. 建立 server 並啟動

## 1. 載入模組

```js
const http = require('http');
const { v4: uuidv4 } = require('uuid');
const errorHandle = require('./errorHandle');
```

### `http`

`http` 是 Node.js 內建模組。  
它可以用來建立 HTTP server。

這個專案裡會用到：

```js
http.createServer(...)
```

### `uuidv4`

```js
const { v4: uuidv4 } = require('uuid');
```

這是「物件解構賦值 + 重新命名」。

意思是：

```text
從 uuid 套件裡拿出 v4，
但在目前檔案裡把它命名成 uuidv4。
```

之後可以用：

```js
uuidv4()
```

產生一組唯一 ID。

### `errorHandle`

```js
const errorHandle = require('./errorHandle');
```

這是載入自己寫的錯誤處理函式。  
當使用者傳錯資料、找不到 todo、JSON 格式錯誤時，就可以呼叫：

```js
errorHandle(res);
```

## 2. 建立 todos 陣列

```js
const todos = [];
```

這個陣列是目前 server 暫時存資料的地方。

每一筆 todo 會長得像：

```js
{
  title: '管理月曆',
  id: '一組 uuid'
}
```

注意：這只是暫存在記憶體裡。  
如果你停止 server 再重新啟動，資料會消失。

## 3. 建立共用 headers

```js
const headers = {
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'PATCH, POST, GET, OPTIONS, DELETE',
  'Content-Type': 'application/json',
};
```

headers 是 response 的額外資訊。  
它不是主要資料內容，而是告訴瀏覽器或 Postman：「這份回應是什麼格式、允許哪些方法」。

### `Content-Type`

```js
'Content-Type': 'application/json'
```

代表 server 回傳的是 JSON。

### CORS headers

這幾個是 CORS 相關設定：

```js
Access-Control-Allow-Headers
Access-Control-Allow-Origin
Access-Control-Allow-Methods
```

簡單說，它們是讓瀏覽器知道：

```text
前端可以從不同來源呼叫這個 API。
允許使用 GET、POST、PATCH、DELETE、OPTIONS。
```

## 4. readBody helper

```js
const readBody = (req) => new Promise((resolve, reject) => {
  let body = '';

  req.setEncoding('utf8');
  req.on('data', (chunk) => {
    body += chunk;
  });
  req.on('end', () => resolve(body));
  req.on('error', reject);
});
```

這個函式的目的：

```text
把 request body 完整讀完，最後回傳 body 字串。
```

POST 和 PATCH 會從 Postman 傳資料進來，例如：

```json
{
  "title": "管理月曆"
}
```

在 Node.js 原生 `http` 裡，body 不會直接給你。  
你要自己用事件慢慢接收。

### `req.on('data')`

```js
req.on('data', (chunk) => {
  body += chunk;
});
```

request body 可能會分成很多小段傳進來。  
每一小段叫做 `chunk`。

這行的意思是：

```text
每收到一段資料，就加到 body 後面。
```

### `req.on('end')`

```js
req.on('end', () => resolve(body));
```

代表 request body 全部收完了。  
這時候才可以安全地處理完整 body。

### 為什麼要用 Promise？

因為目前 `server.js` 想用這種寫法：

```js
const body = await readBody(req);
```

`await` 只能等待 Promise。  
所以 `readBody` 回傳 Promise，讓程式可以等 body 收完再往下做。

## 5. sendJson helper

```js
const sendJson = (res, statusCode, payload) => {
  res.writeHead(statusCode, headers);
  res.end(JSON.stringify(payload));
};
```

這個函式的目的：

```text
統一回傳 JSON response。
```

如果每個 API 都自己寫：

```js
res.writeHead(...)
res.write(...)
res.end()
```

會重複很多次。

所以把它包成：

```js
sendJson(res, 200, { status: 'success', data: todos });
```

### `JSON.stringify`

JavaScript 物件不能直接當作 HTTP response body 回傳。  
要先轉成 JSON 字串：

```js
JSON.stringify(payload)
```

例如：

```js
{ status: 'success' }
```

會變成：

```json
{"status":"success"}
```

## 6. requestListener

```js
const requestListener = async (req, res) => {
  console.log(req.url);
  console.log(req.method);
  ...
};
```

`requestListener` 是 server 收到 request 時會執行的函式。

兩個參數：

```text
req：request，使用者送進來的東西
res：response，server 要回傳出去的東西
```

因為裡面會用：

```js
await readBody(req)
```

所以前面要加：

```js
async
```

## 7. GET /todo

```js
if (req.url === '/todo' && req.method === 'GET') {
  sendJson(res, 200, { status: 'success', data: todos });
  return;
}
```

這個 API 是取得所有 todos。

條件：

```text
路徑是 /todo
方法是 GET
```

回傳：

```json
{
  "status": "success",
  "data": []
}
```

### 為什麼要 `return`？

```js
return;
```

代表這個 request 已經處理完了。  
不要繼續往下面的其他 API 判斷走。

## 8. POST /todo

```js
if (req.url === '/todo' && req.method === 'POST') {
  try {
    const body = await readBody(req);
    const data = JSON.parse(body);

    if (typeof data.title !== 'string' || data.title.trim() === '') {
      errorHandle(res);
      return;
    }

    todos.push({ title: data.title, id: uuidv4() });
    sendJson(res, 200, { status: 'success', data: todos });
    return;
  } catch (error) {
    errorHandle(res);
    return;
  }
}
```

這個 API 是新增 todo。

Postman body 應該送：

```json
{
  "title": "管理月曆"
}
```

### `await readBody(req)`

```js
const body = await readBody(req);
```

等 request body 完整接收完。

### `JSON.parse`

```js
const data = JSON.parse(body);
```

把 JSON 字串轉成 JavaScript 物件。

例如：

```json
{"title":"管理月曆"}
```

轉成：

```js
{ title: '管理月曆' }
```

### 檢查 title

```js
typeof data.title !== 'string' || data.title.trim() === ''
```

這裡檢查兩件事：

```text
title 必須是字串
title 不能是空字串
```

所以這些都不合法：

```json
{}
```

```json
{ "title": "" }
```

```json
{ "title": 123 }
```

### 新增 todo

```js
todos.push({ title: data.title, id: uuidv4() });
```

建立新物件，放進 todos 陣列。

## 9. DELETE /todo

```js
if (req.url === '/todo' && req.method === 'DELETE') {
  todos.length = 0;
  sendJson(res, 200, { status: 'success', data: todos });
  return;
}
```

這個 API 是刪除全部 todos。

### 為什麼用 `todos.length = 0`？

因為 todos 是這樣宣告的：

```js
const todos = [];
```

`const` 不能重新指定：

```js
todos = [];
```

所以要清空原本的陣列：

```js
todos.length = 0;
```

## 10. DELETE /todo/:id

```js
if (req.url.startsWith('/todo/') && req.method === 'DELETE') {
  const id = req.url.split('/').pop();
  const index = todos.findIndex((item) => item.id === id);

  if (index === -1) {
    errorHandle(res);
    return;
  }

  todos.splice(index, 1);
  sendJson(res, 200, { status: 'success', data: todos });
  return;
}
```

這個 API 是刪除單一 todo。

例如：

```text
DELETE /todo/e812db83-4dc3-40aa-aa56-0bd27829ff02
```

### `startsWith`

```js
req.url.startsWith('/todo/')
```

代表只要路徑是 `/todo/` 開頭就符合。

例如：

```text
/todo/abc
/todo/123
```

都符合。

### 取出 id

```js
const id = req.url.split('/').pop();
```

如果 URL 是：

```text
/todo/abc123
```

就會得到：

```js
abc123
```

### `findIndex`

```js
const index = todos.findIndex((item) => item.id === id);
```

找出符合 id 的 todo 在陣列裡的位置。

如果找不到，會回傳：

```js
-1
```

### `splice`

```js
todos.splice(index, 1);
```

意思是：

```text
從 index 這個位置開始，刪除 1 筆資料。
```

這就是刪除單一 todo 的核心。

## 11. PATCH /todo/:id

```js
if (req.url.startsWith('/todo/') && req.method === 'PATCH') {
  try {
    const body = await readBody(req);
    const { title } = JSON.parse(body);
    const id = req.url.split('/').pop();
    const index = todos.findIndex((item) => item.id === id);

    if (index === -1 || typeof title !== 'string' || title.trim() === '') {
      errorHandle(res);
      return;
    }

    todos[index].title = title;
    sendJson(res, 200, { status: 'success', data: todos });
    return;
  } catch (error) {
    errorHandle(res);
    return;
  }
}
```

這個 API 是修改單一 todo 的 title。

例如：

```text
PATCH /todo/abc123
```

Body：

```json
{
  "title": "更新後的標題"
}
```

### 解構取 title

```js
const { title } = JSON.parse(body);
```

意思是從解析後的物件中取出 `title`。

等同於：

```js
const data = JSON.parse(body);
const title = data.title;
```

### 更新資料

```js
todos[index].title = title;
```

找到那一筆 todo 後，只更新它的 title。

## 12. OPTIONS

```js
if (req.method === 'OPTIONS') {
  sendJson(res, 200, { status: 'success' });
  return;
}
```

`OPTIONS` 常見於瀏覽器的 CORS 預檢請求。

簡單說，瀏覽器有時候會先問 server：

```text
我可以用 PATCH、DELETE、POST 這些方法嗎？
```

server 回 200，代表允許。

## 13. 404

```js
sendJson(res, 404, {
  status: 'false',
  data: { url: req.url, method: req.method },
  message: '找不到頁面',
});
```

如果前面所有條件都不符合，就會走到這裡。

例如：

```text
GET /abc
```

就會回：

```json
{
  "status": "false",
  "data": {
    "url": "/abc",
    "method": "GET"
  },
  "message": "找不到頁面"
}
```

## 14. 建立並啟動 server

```js
const server = http.createServer(requestListener);
server.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

### `http.createServer`

建立一個 server。

```js
requestListener
```

會在每次收到 request 時被執行。

### `server.listen(3000)`

讓 server 監聽 port 3000。

啟動後可以用 Postman 打：

```text
http://localhost:3000/todo
```

## 重要概念整理

### req 和 res

```text
req = 使用者送進來的 request
res = server 回傳出去的 response
```

讀取使用者送來的資料，用 `req`。  
回傳資料給使用者，用 `res`。

### route 判斷

這個專案沒有用 Express，所以要自己判斷：

```js
req.url
req.method
```

例如：

```js
req.url === '/todo' && req.method === 'GET'
```

### JSON.parse 和 JSON.stringify

```js
JSON.parse(...)
```

把 JSON 字串轉成 JavaScript 物件。

```js
JSON.stringify(...)
```

把 JavaScript 物件轉成 JSON 字串。

### try / catch

`JSON.parse` 遇到錯誤格式會讓程式出錯。  
所以 POST 和 PATCH 用 `try/catch` 包起來。

### return 的作用

每個 API 回傳完 response 後都會 `return`。

這樣可以避免：

```text
同一個 request 被後面的路由繼續處理。
```

### helper function 的好處

`readBody` 和 `sendJson` 是 helper function。

它們的好處是：

```text
把重複的程式集中在同一個地方，
讓每個 API route 只專心處理自己的邏輯。
```

## 建議閱讀順序

1. 先看最下面的 `createServer` 和 `listen`
2. 再看 `requestListener`
3. 再看 GET `/todo`
4. 再看 POST `/todo`
5. 再看 DELETE 和 PATCH
6. 最後回頭看 `readBody` 和 `sendJson`

## 建議測試順序

1. `GET /todo`
2. `POST /todo`
3. `GET /todo`
4. `PATCH /todo/:id`
5. `DELETE /todo/:id`
6. `DELETE /todo`
7. 傳錯 JSON 測試錯誤處理
8. 傳不存在的 id 測試錯誤處理
9. 打不存在的路徑測試 404
