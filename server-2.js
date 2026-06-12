// 練習目標：
// 重新寫一次 Todo API server。
// 這份檔案只放提示，不放完整程式碼。
// 請你照著註解一步一步把程式補上。

// 1. 載入需要的模組。
//    需要用到：
//    - Node.js 內建的 http 模組
//    - uuid 套件裡面的 v4 方法，並把它改名成 uuidv4
//    - 你自己寫好的 errorHandle

// 2. 建立 todos 陣列。
//    這個陣列用來暫時存放所有 todo。
//    一開始可以是空陣列。

// 3. 建立 requestListener 函式。
//    這個函式需要兩個參數：
//    - req：使用者送進來的 request
//    - res：server 要回傳出去的 response

// 4. 在 requestListener 裡面，先印出 request 資訊。
//    可以印：
//    - req.url
//    - req.method
//    這樣你在 terminal 可以看到 Postman 打了哪個 API。

// 5. 在 requestListener 裡面，建立 headers 物件。
//    headers 裡面需要設定：
//    - Access-Control-Allow-Headers
//    - Access-Control-Allow-Origin
//    - Access-Control-Allow-Methods
//    - Content-Type: application/json

// 6. 在 requestListener 裡面，準備接收 request body。
//    建立一個空字串 body。
//    使用 req.on('data', ...) 接收 chunk。
//    每收到一段 chunk，就把它加到 body 後面。

// 7. 寫 GET /todo。
//    條件：
//    - req.url 等於 /todo
//    - req.method 等於 GET
//    要做的事：
//    - 回傳 200
//    - 回傳 JSON
//    - JSON 裡面包含 status: success
//    - JSON 裡面包含 data: todos
//    - 最後要結束 response

// 8. 寫 POST /todo。
//    條件：
//    - req.url 等於 /todo
//    - req.method 等於 POST
//    要注意：
//    - POST 需要等 body 全部接收完，所以邏輯要放在 req.on('end', ...) 裡。
//    - JSON.parse(body) 要放在 try 裡，避免 JSON 格式錯誤時 server crash。
//    要做的事：
//    - 從 body 取出 title
//    - 檢查 title 不是 undefined
//    - 建立一個新的 todo 物件
//    - todo 物件需要 title 和 id
//    - id 使用 uuidv4 產生
//    - 把新的 todo 放進 todos 陣列
//    - 回傳 status: success 和 data: todos
//    - 如果 title 不存在，呼叫 errorHandle(res)
//    - 如果 JSON.parse 出錯，呼叫 errorHandle(res)

// 9. 寫 DELETE /todo。
//    這個 API 是刪除全部 todos。
//    條件：
//    - req.url 等於 /todo
//    - req.method 等於 DELETE
//    要做的事：
//    - 清空 todos 陣列
//    - 回傳 status: success 和 data: todos
//    提醒：
//    - 如果 todos 是 const 宣告，不要用 todos = []
//    - 可以改變陣列長度來清空原本的陣列

// 10. 寫 DELETE /todo/:id。
//     這個 API 是刪除單一 todo。
//     條件：
//     - req.url 是以 /todo/ 開頭
//     - req.method 等於 DELETE
//     要做的事：
//     - 從 req.url 取出最後面的 id
//     - 用 findIndex 找出 todos 裡 id 相同的那一筆位置
//     - 如果 index 不是 -1，代表有找到
//     - 找到時，用 splice 刪除那一筆
//     - 回傳 status: success 和 data: todos
//     - 找不到時，呼叫 errorHandle(res)
//     提醒：
//     - 這裡不能清空整個 todos
//     - 刪除單筆時，只刪 index 那一筆

// 11. 寫 PATCH /todo/:id。
//     這個 API 是修改單一 todo 的 title。
//     條件：
//     - req.url 是以 /todo/ 開頭
//     - req.method 等於 PATCH
//     要注意：
//     - PATCH 也需要讀 body，所以邏輯要放在 req.on('end', ...) 裡。
//     - JSON.parse(body) 要放在 try 裡。
//     要做的事：
//     - 從 body 取出新的 title
//     - 從 req.url 取出 id
//     - 用 findIndex 找出 todos 裡 id 相同的那一筆位置
//     - 如果 index 不是 -1，而且 title 不是 undefined，就更新那一筆 todo 的 title
//     - 回傳 status: success 和 data: todos
//     - 找不到 id 或 title 不存在時，呼叫 errorHandle(res)
//     - JSON 格式錯誤時，呼叫 errorHandle(res)

// 12. 寫 OPTIONS。
//     條件：
//     - req.method 等於 OPTIONS
//     要做的事：
//     - 回傳 200
//     - 帶上 headers
//     - 結束 response

// 13. 寫 404。
//     如果前面的 route 都沒有符合，就走到這裡。
//     要做的事：
//     - 回傳 404
//     - 回傳 JSON
//     - JSON 裡面可以包含：
//       - status: false
//       - data: 目前的 req.url 和 req.method
//       - message: 找不到頁面
//     - 最後結束 response

// 14. 建立 server。
//     使用 http 模組建立 server。
//     把 requestListener 傳進去。

// 15. 啟動 server。
//     監聽 port 3000。
//     寫完後，在 terminal 執行：
//     node server-2.js

// 16. 建議測試順序：
//     - GET /todo：確認一開始可以拿到 todos
//     - POST /todo：新增一筆 todo
//     - GET /todo：確認新增成功
//     - PATCH /todo/:id：修改剛剛新增的 todo
//     - DELETE /todo/:id：刪除剛剛新增的 todo
//     - DELETE /todo：清空全部 todos
//     - 測試錯誤 id：確認會走 errorHandle
//     - 測試錯誤路徑：確認會走 404
