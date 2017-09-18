const http = require('http')
const TodoServer = require('./todoServer')
const todoServer = new TodoServer(0)

//create a server object:
http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Access-Control-Allow-Credentials', req.headers.origin ? 'true' : 'false')
  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', 'GET,POST,OPTIONS')
    res.end()
    return
  }

  const username = (
      (req.headers.cookie||'')
        .split('; ')
        .find(x => x.startsWith('username=')) || 'username='
    )
    .substr('username='.length)

  if (req.url.startsWith ('/login')) {
    const auth = JSON.parse(decodeURIComponent(req.url.substr(req.url.indexOf('?')+1)))

    res.setHeader('Set-Cookie', 'username=' + auth.username)
    res.write('Logged in')
    res.end()
    return
  }

  if (req.url.startsWith ('/who')) {
    res.write('Hello: '+username)
    res.end()
    return
  }

  if (!req.url.startsWith('/redux')) {
    return error(res, 'only `/redux` is valid')
  }

  const user = (req.headers.cookies || '')

  if (req.method === 'GET') {
    try {
      const event = JSON.parse(decodeURIComponent(req.url.substr(req.url.indexOf('?')+1)))
      processEvent(res, username, event)
    } catch (ex) {
      return error(res, ex+'')
    }
  } else if (req.method === 'POST') {
    const bodyBuffer = [];
    req.on('error', (err) => {
      return error(res, 'error in body')
    }).on('data', (chunk) => {
      bodyBuffer.push(chunk);
    }).on('end', () => {
      const event = JSON.parse(decodeURIComponent(Buffer.concat(bodyBuffer).toString()))
      processEvent(res, username, event)
    });
  } else {
    return error(res, 'only GET and POST supported')
  }
}).listen(3001); //the server object listens on port 8080

function error (res, msg) {
  res.statusCode = 400
  res.write('Not supported: ' + msg); //write a response to the client
  res.end(); //end the response
}

function processEvent (res, username, event) {
  if (!event.type) {
    return error(res, 'event does not have "type"')
  }

  todoServer.onAction(event, username)
    .then(result => {
      if (Array.isArray(result)) {
        res.write(JSON.stringify(result))
        res.end()
      } else {
        res.write('[]')
        res.end()
      }
    })
    .catch(err => {
      console.error('err:', err)
      error(res, err+'')
    })
}
