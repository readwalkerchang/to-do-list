// 1. 載入 Node.js 內建的 http 模組。
//    關鍵字提示：
//    const、http、require、'http'
const http = require('http');
// 2. 建立 requestListener 函式。
//    這個函式會處理瀏覽器送來的 request，並回傳 response。
//    函式格式提示：
//    const requestListener = (req, res) => {
//        這裡放第 3、4、5 步
//    };
const requestListener = (req, res) => {
    console.log(req.url);
    console.log(req.method);
    res.writeHead(200, {"Content-Type":"text/plain"});
    res.write('Hello World');
    res.end();
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
