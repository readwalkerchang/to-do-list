// Todo API 重寫練習：精簡版
// 對齊 server.js：headers、readBody、sendJson、async requestListener。

// 1. 載入 http、uuidv4、errorHandle。

// 2. 建立 todos 空陣列。

// 3. 建立共用 headers。

// 4. 建立 readBody(req)。
//    用 Promise 包住 req.on('data')、req.on('end')、req.on('error')。
//    最後 resolve 完整 body 字串。

// 5. 建立 sendJson(res, statusCode, payload)。
//    統一 writeHead，並 end JSON 字串。

// 6. 建立 async requestListener(req, res)。
//    印出 req.url 和 req.method。

// 7. GET /todo
//    sendJson 200，回傳 { status: success, data: todos }，然後 return。

// 8. POST /todo
//    try 裡 await readBody、JSON.parse。
//    title 必須是非空字串。
//    合法就 push { title, id }。
//    成功回傳 todos；錯誤呼叫 errorHandle(res) 並 return。

// 9. DELETE /todo
//    清空 todos，回傳 todos，然後 return。

// 10. DELETE /todo/:id
//     用 startsWith('/todo/') 判斷。
//     取 id，findIndex。
//     找不到就 errorHandle。
//     找到就 splice(index, 1)，回傳 todos。

// 11. PATCH /todo/:id
//     try 裡 await readBody、JSON.parse 取 title。
//     取 id，findIndex。
//     index 找不到或 title 不是非空字串，就 errorHandle。
//     合法就更新 todos[index].title，回傳 todos。

// 12. OPTIONS
//     sendJson 200，回傳 { status: success }，然後 return。

// 13. 404
//     sendJson 404，回傳 status、req.url、req.method、message。

// 14. createServer(requestListener)，listen(3000)。

// 測試：GET -> POST -> GET -> PATCH -> DELETE /todo/:id -> DELETE /todo。
