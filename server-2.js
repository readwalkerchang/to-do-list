// 練習目標：
// 重新寫一次 server.js 的 Todo API。
// 這份檔案只放提示，不放完整程式碼。
// 寫法要對齊目前 server.js：使用 headers、readBody、sendJson、async requestListener。

// 1. 載入需要的模組。
//    需要載入：
//    - Node.js 內建 http 模組
//    - uuid 套件的 v4，並重新命名成 uuidv4
//    - 本地的 errorHandle
const http = require('http');
const { v4: uuidv4 } = require('uuid');
const errorHandle = require('./errorHandle');

// 2. 建立 todos 陣列。
//    這個陣列用來暫存 todo 資料。
//    一開始是空陣列。
const todos = [];

// 3. 建立 headers 常數。
//    這個 headers 放在 requestListener 外面，因為每個 API 都會共用。
//    需要包含：
//    - Access-Control-Allow-Headers
//    - Access-Control-Allow-Origin
//    - Access-Control-Allow-Methods
//    - Content-Type: application/json
const headers = {
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'PATCH, POST, GET, OPTIONS, DELETE',
  'Content-Type': 'application/json',
};

// 4. 建立 readBody(req) helper。
//    這個 helper 的目標：把 request body 讀完，最後回傳完整 body 字串。
//    寫法方向：
//    - 回傳一個 Promise
//    - 在 Promise 裡建立 body 空字串
//    - 設定 req.setEncoding('utf8')
//    - 用 req.on('data') 把 chunk 加到 body
//    - 用 req.on('end') resolve(body)
//    - 用 req.on('error') reject(error)
const readBody = (req) => new Promise((resolve, reject) => {
    let body = '';
    req.setEncoding('utf8');
    req.on('data', (chunk) => {
        body += chunk;
    });
    req.on('end',() => resolve(body));
    req.on('error',reject);
});


// 5. 建立 sendJson(res, statusCode, payload) helper。
//    這個 helper 的目標：統一回傳 JSON。
//    寫法方向：
//    - 使用 res.writeHead(statusCode, headers)
//    - 使用 res.end(...)
//    - payload 要先轉成 JSON 字串
const sendJson = (res, statusCode, payload) => {
    res.writeHead(statusCode, headers);
    res.end(JSON.stringify(payload));
};

// 6. 建立 async requestListener(req, res)。
//    注意：這裡要加 async，因為 POST 和 PATCH 會 await readBody(req)。
//    一開始可以先印出：
//    - req.url
//    - req.method
const requestListener = async (req, res) => {
 console.log(req.url);
 console.log(req.method);


// 7. 寫 GET /todo。
//    條件：
//    - req.url 等於 /todo
//    - req.method 等於 GET
//    行為：
//    - 使用 sendJson 回傳 200
//    - payload 包含 status: success
//    - payload 包含 data: todos
//    - 回傳後要 return，避免繼續往下跑
if(req.url === '/todo' && req.method === 'GET'){
    sendJson(res, 200, {
        "status":"success",
        "data":todos
    })
    return;
}

// 8. 寫 POST /todo。
//    條件：
//    - req.url 等於 /todo
//    - req.method 等於 POST
//    行為：
//    - 放在 try/catch 裡
//    - await readBody(req) 取得 body 字串
//    - JSON.parse(body) 轉成 data
//    - 檢查 data.title 必須是字串
//    - 檢查 data.title.trim() 不能是空字串
//    - 不合法時呼叫 errorHandle(res)，然後 return
//    - 合法時新增 todo：title 使用 data.title，id 使用 uuidv4()
//    - 把新 todo push 到 todos
//    - 使用 sendJson 回傳 200、status: success、data: todos
//    - catch 裡呼叫 errorHandle(res)，然後 return
if(req.url === '/todo' && req.method === 'POST'){
    try{
        const body = await readBody(req);
        const data = JSON.parse(body);
        if(typeof(data.title)==='string' && data.title.trim() !== ''){
            const todo = {
                "title":data.title,
                "id":uuidv4()
            }
            todos.push(todo);
            sendJson(res, 200, {
                "status": "success",
                "data": todos
            })
            return
        }
        else{
            errorHandle(res);
            return
        }
    }
    catch{
        errorHandle(res);
        return
    }
}

// 9. 寫 DELETE /todo。
//    這個 API 是刪除全部 todos。
//    條件：
//    - req.url 等於 /todo
//    - req.method 等於 DELETE
//    行為：
//    - 清空原本的 todos 陣列
//    - 如果 todos 是 const，不要寫 todos = []
//    - 使用 sendJson 回傳 200、status: success、data: todos
//    - 回傳後 return
if(req.url === '/todo' && req.method === 'DELETE'){
    todos.length = 0;
    sendJson(res, 200, {
        "status":"success",
        "data":todos
    })
    return;
}

// 10. 寫 DELETE /todo/:id。
//     這個 API 是刪除單一 todo。
//     條件：
//     - req.url 以 /todo/ 開頭
//     - req.method 等於 DELETE
//     行為：
//     - 從 req.url 最後一段取出 id
//     - 用 findIndex 找 todos 裡 id 相同的項目
//     - 如果 index 是 -1，呼叫 errorHandle(res)，然後 return
//     - 如果有找到，用 splice(index, 1) 刪除單筆
//     - 使用 sendJson 回傳 200、status: success、data: todos
//     - 回傳後 return
  if(req.url.startsWith('/todo/') && req.method === 'DELETE'){
    const id = req.url.split('/').pop();
    const index = todos.findIndex((elem) => elem.id === id);
    if(index !== -1){
        todos.splice(index,1);
        sendJson(res, 200, {
            "status":"success",
            "data":todos
        })
        return
    }
    else{
        errorHandle(res);
        return
    }
  }

// 11. 寫 PATCH /todo/:id。
//     這個 API 是修改單一 todo 的 title。
//     條件：
//     - req.url 以 /todo/ 開頭
//     - req.method 等於 PATCH
//     行為：
//     - 放在 try/catch 裡
//     - await readBody(req) 取得 body
//     - JSON.parse(body) 並取出 title
//     - 從 req.url 最後一段取出 id
//     - 用 findIndex 找 todos 裡 id 相同的項目
//     - 如果找不到，呼叫 errorHandle(res)，然後 return
//     - 如果 title 不是字串，呼叫 errorHandle(res)，然後 return
//     - 如果 title.trim() 是空字串，呼叫 errorHandle(res)，然後 return
//     - 合法時更新 todos[index].title
//     - 使用 sendJson 回傳 200、status: success、data: todos
//     - catch 裡呼叫 errorHandle(res)，然後 return
  if(req.url.startsWith('/todo/') && req.method === 'PATCH'){
    try{
        const body = await readBody(req);
        const data = JSON.parse(body);
        const id = req.url.split('/').pop();
        const index = todos.findIndex((elem) => elem.id === id);
        if(index !== -1 && typeof(data.title)==='string' 
        && data.title.trim() !== ''){
            todos[index].title = data.title;
            sendJson(res, 200, {
                "status":"success",
                "data":todos
            });
            return;
        }
        else{
            errorHandle(res);
            return;
        }
    }
    catch{
        errorHandle(res);
        return;
    }
  }

// 12. 寫 OPTIONS。
//     條件：
//     - req.method 等於 OPTIONS
//     行為：
//     - 使用 sendJson 回傳 200
//     - payload 可以只放 status: success
//     - 回傳後 return
  if(req.method === 'OPTIONS'){
    sendJson(res, 200, {
        "status":"success",
    })
    return;
  }

// 13. 寫 404。
//     如果前面所有條件都沒有符合，就走到這裡。
//     行為：
//     - 使用 sendJson 回傳 404
//     - payload 包含 status: false
//     - payload 包含 data: req.url 和 req.method
//     - payload 包含 message: 找不到頁面

    sendJson(res, 404,{
        "status": "false",
        "data":  { url: req.url, method: req.method },
        "message": "找不到頁面"
    })
}
// 14. 建立 server。
//     使用 http.createServer(...)
//     把 requestListener 傳進去。
const server = http.createServer(requestListener)

// 15. 啟動 server。
//     監聽 3000。
//     可以加 callback，在 terminal 印出 server 已啟動。
server.listen(3000, ()=> {
    console.log(('Server running on port 3000'))
})

// 測試順序：
// 1. GET /todo
// 2. POST /todo
// 3. GET /todo
// 4. PATCH /todo/:id
// 5. DELETE /todo/:id
// 6. DELETE /todo
// 7. 測試錯誤 id
// 8. 測試錯誤 JSON
// 9. 測試不存在的路徑
