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
    else if(req.url.startsWith('/todo/')  && req.method === 'DELETE'){
        const id = req.url.split('/').pop();
        const index = todos.findIndex(elem => elem.id === id);
        console.log(index)
        if(index !== -1){
            todos.splice(index,1);
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
    else if(req.url.startsWith('/todo/')  && req.method === 'PATCH'){
        req.on('end', () =>{
            try{
                const todoTitle = JSON.parse(body).title;
                const id = req.url.split('/').pop();
                const index = todos.findIndex(elem => elem.id === id);
                console.log(index)
                if(index !== -1 && todoTitle !== undefined){
                    todos[index].title = todoTitle;
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
            catch{
                errorHandle(res);
            }
        })

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