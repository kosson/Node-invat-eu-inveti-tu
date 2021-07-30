# Aplicație de streaming în browser

Sursa: https://github.com/webdevjourneyWDJ/Node-JS-Streams/blob/main/http.js
Explicație video (lb. engleză): https://www.youtube.com/watch?v=CiGnubZC5cs

```javascript
const {createServer} = require('http');
const {stat, createReadStream, createWriteStream} = require('fs');
const fileInfo = promisify(stat); // promisificarea lui `stat`. ESTE DEJA PROMISIFICAT!
const {promisify} = require('util');
const multiparty = require('multiparty');

const filename = './nume_fisier.mp4';

const sendOGVideo = async (req, res) => {
  const {size} = await fileInfo(filename);
  const range = req.headers.range;
  // cazul în care browserul cere range-ul pentru video
  if (range) {
    let [start, end] = range.replace(/bytes=/, '').split('-');

    start = parseInt(start, 10);
    end = end ? parseInt(end, 10) : size - 1;

    // 206 Partial content
    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${size}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': (start - end) + 1,
      'Content-Type': 'video/mp4'
    })
    // `req` este un readable stream, iar `res` este un writable
    createReadStream(filename, {start, end}).pipe(res);
  } else {
    res.writeHead(200, {
      'Content-Length': size,
      'Content-Type': 'video/mp4'
    });
    createReadStream(filename).pipe(res);
  }
};

createServer((req, res) => {
  // cazul în care cererea este încărcarea fișierului
  if (req.method === "POST") {
    let form = new multiparty.Form();
    // `part` va fi chiar fișierul care a fost introdus la upload prin intermediul lui input.
    form.on('part', (part) => {
      part
        .pipe(createWriteStream(`./copy/${part.filename}`))
        .on('close', () => {
          res.writeHead(200, { 'Content-Type': 'text/html'});
          res.end(`<h1>Fișier încărcat: ${part.filename}</h1>`);
        })
    });
    form.parse(req);
  }  else if (req.url === "/og") {
    sendOGVideo(req, res);
  } else {
    res.writeHead(200, {'Content-Type': 'text/html'})
    res.end(`
      <form enctype="multipart/form-data" method="POST" action="/">
        <input type="file" name="upload-file">
        <button>Încarcă fișier</button>
      </form>
    `)
  }
}).listen(3000, () => console.log('pe 3000'));
```
