// 1. 載入 Node.js 內建的 http 模組。
//    關鍵字提示：
//    const、http、require、'http'
const http = require('http');
const { v4: uuidv4 } = require('uuid');
const errorHandle = require('./errorHandle');
const todos = [];

const requestListener = (req, res) => {
    console.log(req.url);
    console.log(req.method);
    const headers = {
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'PATCH, POST, GET,OPTIONS,DELETE',
        'Content-Type': 'application/json'
    }
    let body = "";  
    req.on('data',(chunk)=>{
        body += chunk;
    });

    if(req.url === '/todo' && req.method === 'GET'){
        res.writeHead(200,headers);
        res.write(JSON.stringify({
            "status":"success",
            "data":todos,
        }));
        res.end();
    }
    else if(req.url === '/todo' && req.method === 'POST'){
        req.on('end',()=>{
            try{
                const data = JSON.parse(body);
                if(data.title !== undefined){
                    const todo = {
                        "title":data.title,
                        "id":uuidv4()
                    };
                    todos.push(todo);
                    res.writeHead(200,headers);
                    res.write(JSON.stringify({
                        "status":"success",
                        "data":todos,
                    }));
                    res.end();   
                }
                else{
                    errorHandle(res);
                }
            }
            catch(er){
                errorHandle(res);
            }
          
        })
    }
    else if(req.url === '/todo' && req.method === 'DELETE'){
        res.writeHead(200,headers);
        todos.length = 0;
        res.write(JSON.stringify({
            "status":"success",
            "data":todos,
        }));
        res.end();
    }
    else if(req.method === 'OPTIONS'){
        res.writeHead(200,headers);
        res.end()
    }
    else{
        res.writeHead(404, headers);
        res.write(JSON.stringify({
            "status":"false",
            "data":{url:req.url,method:req.method},
            "message":"找不到頁面"
        }));
        res.end();
    }

}

const server = http.createServer(requestListener);
server.listen(3000);

// 3. 在 requestListener 裡，先設定 response header。
//    要使用的方法：
//    res.writeHead(...)
//    你需要自己放入兩個參數：
//    第一個參數：HTTP 狀態碼，成功時使用 200
//    第二個參數：一個物件，用來設定 Content-Type 是 text/plain

// 4. 接著在 requestListener 裡，寫入要回傳的文字內容。
//    要使用的方法：
//    res.write(...)
//    你需要自己放入一個參數：
//    一段字串，例如想讓瀏覽器看到的文字

// 5. 最後在 requestListener 裡，結束 response。
//    要使用的方法：
//    res.end()
//    這個方法不一定要放參數。
//    它的作用是告訴瀏覽器：伺服器已經回應完了。

// 6. 建立 server。
//    要使用的方法：
//    http.createServer(...)
//    你需要自己放入一個參數：
//    第 2 步建立好的 requestListener

// 7. 讓 server 開始監聽 port。
//    要使用的方法：
//    server.listen(...)
//    你需要自己放入一個參數：
//    port number，這次練習使用 3000

// 8. 寫完後，在 terminal 執行：
//    node server.js
//    然後打開瀏覽器進入：
//    http://localhost:3000
