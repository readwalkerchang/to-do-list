// Todo API 重寫練習：精簡版提示

// 1. 載入 http、uuidv4、errorHandle。

// 2. 建立 todos 空陣列。

// 3. 建立 requestListener(req, res)。

// 4. 在 requestListener 裡：
//    - 印出 req.url、req.method
//    - 建立 headers
//    - 建立 body 空字串
//    - 用 req.on('data') 收 body

// 5. GET /todo
//    回傳 todos。

// 6. POST /todo
//    - 用 req.on('end') 等 body 收完
//    - try 裡 JSON.parse(body)
//    - 檢查 title 是否存在
//    - 建立 { title, id }
//    - todos.push(...)
//    - 回傳 todos
//    - 錯誤時呼叫 errorHandle(res)

// 7. DELETE /todo
//    清空 todos，回傳 todos。

// 8. DELETE /todo/:id
//    - 用 req.url 取出 id
//    - 用 findIndex 找位置
//    - 找到：splice(index, 1)，回傳 todos
//    - 找不到：errorHandle(res)

// 9. PATCH /todo/:id
//    - 用 req.on('end') 等 body 收完
//    - try 裡取出 title 和 id
//    - 用 findIndex 找位置
//    - 找到且 title 存在：更新 title，回傳 todos
//    - 否則：errorHandle(res)

// 10. OPTIONS
//     回傳 200 和 headers。

// 11. 其他路徑
//     回傳 404 JSON。

// 12. 建立 server，監聽 3000。

// 測試順序：
// GET /todo
// POST /todo
// PATCH /todo/:id
// DELETE /todo/:id
// DELETE /todo
