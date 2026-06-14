// Todo API 重寫練習：精簡版
// 對齊 server.js：headers、readBody、sendJson、async requestListener。

// 1. 載入 http、uuidv4、errorHandle。
const http = require('http');
const {v4: uuidv4} = require('uuid');
const errorHandle = require('./errorHandle')
// 2. 建立 todos 空陣列。
const todos = [];

// 3. 建立共用 headers。
const headers = {
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'PATCH, POST, GET, OPTIONS, DELETE',
  'Content-Type': 'application/json',
};

// 4. 建立 readBody(req)。
//    用 Promise 包住 req.on('data')、req.on('end')、req.on('error')。
//    最後 resolve 完整 body 字串。
const readBody = (req) => new Promise((resolve, reject) => {
    let body = '';
    req.setEncoding('utf8');
    req.on('data', chunk => {
        body += chunk;
    });
    req.on('end', () => 
        resolve(body)
    );
    req.on('error', reject);
})

// 5. 建立 sendJson(res, statusCode, payload)。
//    統一 writeHead，並 end JSON 字串。
const sendJson = (res, statusCode, payload) =>{
    res.writeHead(statusCode, headers);
    res.end(JSON.stringify(payload));
}

// 6. 建立 async requestListener(req, res)。
//    印出 req.url 和 req.method。
const requestListener = async (req, res) =>{


// 7. GET /todo
//    sendJson 200，回傳 { status: success, data: todos }，然後 return。
  if(req.url === '/todo' && req.method === 'GET'){
    sendJson(res, 200, {
        status: "Success",
        data: todos
    })
    return
  }

// 8. POST /todo
//    try 裡 await readBody、JSON.parse。
//    title 必須是非空字串。
//    合法就 push { title, id }。
//    成功回傳 todos；錯誤呼叫 errorHandle(res) 並 return。
  if(req.url === '/todo' && req.method === 'POST'){
    try{
        const body = await readBody(req);
        const data = JSON.parse(body);
        if(data.title.trim() !== ''){
            todos.push({
                title: data.title,
                id: uuidv4()
            })
            sendJson(res, 200, {
                status: "Success",
                data: todos
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

// 9. DELETE /todo
//    清空 todos，回傳 todos，然後 return。
  if(req.url === '/todo' && req.method === 'DELETE'){
    todos.length = 0;
    sendJson(res, 200, {
        status: "Success",
        data: todos
    })
    return;
  }

// 10. DELETE /todo/:id
//     用 startsWith('/todo/') 判斷。
//     取 id，findIndex。
//     找不到就 errorHandle。
//     找到就 splice(index, 1)，回傳 todos。
    if (req.url.startsWith('/todo/') && req.method === 'DELETE') {
        const id = req.url.split('/').pop();
        const index = todos.findIndex((elem) => elem.id === id);

        if (index !== -1) {
            todos.splice(index, 1);

            return sendJson(res, 200, {
                status: "Success",
                data: todos
            });
        } else {
            errorHandle(res);
        }
    }

// 11. PATCH /todo/:id
//     try 裡 await readBody、JSON.parse 取 title。
//     取 id，findIndex。
//     index 找不到或 title 不是非空字串，就 errorHandle。
//     合法就更新 todos[index].title，回傳 todos。
  if(req.url.startsWith('/todo/') && req.method === 'PATCH'){
    try{
        const body = await readBody(req);
        const data = JSON.parse(body);
        const id = req.url.split('/').pop();
        const index = todos.findIndex((elem) => elem.id === id);
        if(data.title.trim() !== '' && index !== -1 && typeof data.title === 'string' ){
            todos[index].title = data.title;
            sendJson(res, 200, {
                status: "Success",
                data: todos
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

// 12. OPTIONS
//     sendJson 200，回傳 { status: success }，然後 return。
  if(req.method === 'OPTIONS'){
    sendJson(res, 200, {
        status: "Success",
        data: todos
    })
    return
  }

// 13. 404
//     sendJson 404，回傳 status、req.url、req.method、message。
  sendJson(res, 404, {
    status: 404,
    data:{url: req.url, method:req.method},
    message: "找不到頁面"
  })
  return
}
// 14. createServer(requestListener)，listen(3000)。
const server = http.createServer(requestListener);
server.listen(3000, ()=>{
    console.log('Server running on port 3000');
});

// 測試：GET -> POST -> GET -> PATCH -> DELETE /todo/:id -> DELETE /todo。
