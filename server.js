const http = require('http');
const { v4: uuidv4 } = require('uuid');
const errorHandle = require('./errorHandle');

const todos = [];

const headers = {
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'PATCH, POST, GET, OPTIONS, DELETE',
  'Content-Type': 'application/json',
};

const readBody = (req) => new Promise((resolve, reject) => {
  let body = '';
  req.setEncoding('utf8');
  req.on('data', (chunk) => {
    body += chunk;
  });
  req.on('end', () => resolve(body));
  req.on('error', reject);
});

const sendJson = (res, statusCode, payload) => {
  res.writeHead(statusCode, headers);
  res.end(JSON.stringify(payload));
};

const requestListener = async (req, res) => {
  console.log(req.url);
  console.log(req.method);

  if (req.url === '/todo' && req.method === 'GET') {
    sendJson(res, 200, { status: 'success', data: todos });
    return;
  }

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

  if (req.url === '/todo' && req.method === 'DELETE') {
    todos.length = 0;
    sendJson(res, 200, { status: 'success', data: todos });
    return;
  }

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

  if (req.method === 'OPTIONS') {
    sendJson(res, 200, { status: 'success' });
    return;
  }

  sendJson(res, 404, {
    status: 'false',
    data: { url: req.url, method: req.method },
    message: '找不到頁面',
  });
};

const server = http.createServer(requestListener);
server.listen(3000, () => {
  console.log('Server running on port 3000');
});