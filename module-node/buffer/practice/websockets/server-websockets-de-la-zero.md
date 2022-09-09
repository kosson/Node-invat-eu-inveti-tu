# Server websockets de la zero

Această aplicație a fost creată în scop demonstrativ de Erick Wendel, pe care o găsiți explicată la https://youtu.be/qFoFKLI3O8w. Ceea ce o face foarte interesantă este lucrul intens cu `Buffer`.

```javascript
// implementare server (server.js)
import {createServer, Server} from 'http';
import crypto from 'crypto';

const PORT = 3000;
const WEBSOCKET_MAGIC_KEY = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"; // https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/Writing_WebSocket_servers#server_handshake_response
const SEVEN_BITS_INT_MARK = 125;
const SIXTEEN_BITS_INT_MARK = 126;
const SIXTYFOUR_BITS_INT_MARK = 127;
const MASK_KEY_BYTES_LENGTH = 4;
const OPCODE_TEXT = 0x01; // este un bingur bit în binar (reprezentare hex)

// Lucrăm pe biți. de ex: parseInt('1000000', 2)
const FIRST_BIT = 128; // adică biții din byte arată astfel: '1000000'
const MAXIMUM_SIXTEEN_BITS_INTEGER = 2 ** 16 // 0 to 65536

const server = createServer((request, response) => {
  response.writeHead(200);
  response.end('Salut, prietene!');
});

/**
 * o funcție a cărei unică sarcină este să creeze headerele pentru handshake
 * este apelată de onSocketUpgrade pentru a crea valoarea lui headers
 * @param {String} id 
 */
function prepareHandshakeHeaders (id) {
  let acceptKey = createSocketAccept(id);
  // vezi că trebuie lăsată ultima linie goală; nu uita
  let headers = [
    "HTTP/1.1 101 Switching Protocols",
    "Upgrade: websocket",
    "Connection: Upgrade",
    `Sec-WebSocket-Accept: ${acceptKey}`,
    ""
  ].map(line => line.concat('\r\n')).join('');
  // conform: https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/Writing_WebSocket_servers#server_handshake_response
  return headers;
};

// funcția creează răspunsul pentru a face handshake-ul conform:
// https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/Writing_WebSocket_servers#server_handshake_response
function createSocketAccept (id) {
  let sha1obj = crypto.createHash('sha1');
  sha1obj.update(id + WEBSOCKET_MAGIC_KEY);
  return sha1obj.digest('base64');
};

/**
 * Funcția face conectarea cu serverul de socketuri creând headerele necesare
 * Are rol de callback pentru `server.on('upgrade'`
 * @param {Object} req 
 * @param {Object} socket 
 * @param {Object} head 
 */
function onSocketUpgrade (req, socket, head) {
  const {'sec-websocket-key': webClientSocketKey} = req.headers;
  console.log(`${webClientSocketKey} s-a conectat!`);
  
  const headers = prepareHandshakeHeaders(webClientSocketKey);

  // răspunde cu headerele nou construite  mai sus
  socket.write(headers);

  // ce se petrece atunci când serverul este gata de a primi mesaje
  socket.on('readable', () => socketOnReadable(socket));
}
server.on('upgrade', onSocketUpgrade);

function socketOnReadable (socket) {
  // Când te conectezi la un server de socketuri, se așteaptă ca datele să fie mascaradate

  // consumă primul byte
  socket.read(1); // 1 înseamnă 1 byte

  // determină dimensiunea payload-ului. pentru asta, citețti încă un byte după ce l-ai consumat pe primul
  const [markerAndPyloadLength] = socket.read(1);
  const lengthIndicatorInBits = markerAndPyloadLength - FIRST_BIT; // pentru că primul bit este o constantă și nu avem nevoie de el. Este valoarea `1` pentru mesajele client2server, adică 128 (`1000000`) din byte

  let messageLength = 0;

  if (lengthIndicatorInBits <= SEVEN_BITS_INT_MARK) {
    messageLength = lengthIndicatorInBits; // mesajul va fi chiar payload-ul
  } else if (lengthIndicatorInBits === SIXTEEN_BITS_INT_MARK) {
    // cazul în care ai mesaje de mari dimensiuni transformă în unsigned, big-endian 16 bit integer, adică de la 0 la 65K sau 2 la puterea a 16-a
    messageLength = socket.read(2).readUint16BE(0); // trebuie consumați cei dou byte care stau deasupra... vezi schema 
  } else {
    throw new Error(`mesajul este prea mare. Nu gestionez mesaje de 64 bit`);
  }

  const maskKey = socket.read(MASK_KEY_BYTES_LENGTH);
  const encoded = socket.read(messageLength); // va crea un Buffer de date
  const decoded = unmask(encoded, maskKey);
  const received = decoded.toString('utf8');

  console.log(`Datele inainte de a fi parsate`. received);

  const data = JSON.parse(received); // Acestea sunt datele primite
  console.log(`Mesajul primit din client este `, data);

  // TEST de trimitere a unui mesaj în client
  const msg = JSON.stringify(data);
  sendMessage(msg, socket); // vezi mai jos functia  
};

/**
 * funcția asigură decodarea (de-mascaradarea) datelor
 * @param {*} encodedBuffer 
 * @param {*} maskKey 
 * @returns 
 */
function unmask (encodedBuffer, maskKey) {
  let finalBuffer = Buffer.from(encodedBuffer); // faci o copie de lucru a Buffer-ului

  // Operatorul XOR este necesar. Returnează 1 dacă doi biți sunt diferiți (operanzii) și 0 dacă sunt identici.
  // de ex: (71).toString(2).padStart("8", 0) = '01000111'
  // iar    (53).toString(2).padStart("8", 0) = '00110101'
  // rezultatul operațiunii XOR este             01110010 apoi -> parseInt('01110010', 2) = 114
  // același lucru ca și (71 ^ 53).toString(2).padStart('8', 0); rezultatul este '01110010', adică 114

  // decodarea este chiar valoarea char code-ului rezultat -> String.fromCharCode(parseInt("01110010", 2)); rezultă `r`
  /* === Operațiunile de mai sus defalcate === */
  const fillWithZeros = (t) => t.padStart(8, "0"); // te asiguri că stringul ce reprezintă biții din byte sunt completați cu zero
  const toBinay = (t) => fillWithZeros(t.toString(2)); // transformarea în binar
  const fromBinaryToDecimal = (t) => parseInt(toBinay(t), 2); //transformare din binar în zecimal
  const getCharFormBinary = (t) =>  String.fromCharCode(fromBinaryToDecimal(t));

  // pentru că maskKey are doar 4 bytes
  // index % 4 === 0, 1, 2, 3 fiind biții cu rol de index necesari pentru a decoda mesajul

  let index;
  for (index = 0; index < encodedBuffer.length; index++) {
    finalBuffer[index] = encodedBuffer[index] ^ maskKey[index % MASK_KEY_BYTES_LENGTH];

    const logger = {
      unmaskingCalcultator: `${toBinay(encodedBuffer[index])} ^ ${maskKey[index % MASK_KEY_BYTES_LENGTH]} = ${toBinay(finalBuffer[index])}`,
      decoded: getCharFormBinary(finalBuffer[index])
    };
    // AFIȘAREA MESAJELOR LOGGER-ului
    console.log(`Loggerul zice: `, logger);
  }
  return finalBuffer;
}

/* === TRIMITE UN MESAJ ÎN CLIENT ===*/

/**
 * Funcția are rolul de a pregăti datele care constituie mesajul
 * Apelată de: `socketOnReadable()`
 * Apelează: `prepareMessage()`
 * @param {String} msg 
 * @param {Object} socket 
 */
function sendMessage (msg, socket) {
  const dataFrame = prepareMessage(msg);
  socket.write(dataFrame);
};

// PREGĂTIREA DATAFRAME-ului necesar trimiterii unui mesaj în client.
function prepareMessage (message) {
  const msg = Buffer.from(message);
  const messageSize = msg.length;

  let dataFrameBuffer;

  // 0x80 === 128 în binar
  // Cum ajungi la valoarea `0x80` în JavaScript: '0x' + Math.abs(128).toString(16)
  const firstByte = 0x80 | OPCODE_TEXT; // aceasta este reprezentarea unui singur frame plus textul în UTF8.
  if (messageSize <= SEVEN_BITS_INT_MARK) {
    // constituim un array al byte-ilor
    const bytes = [firstByte];
    dataFrameBuffer = Buffer.from(bytes.concat(messageSize)); // facem asta pentru că Bufferul trebuie să conțină și dimensiunea mesajului
  } else if (messageSize <= MAXIMUM_SIXTEEN_BITS_INTEGER) {
    const offsetFourBytes = 4; // pentru că aici va intra întregul volum de date
    const target = Buffer.allocUnsafe(offsetFourBytes);
    target[0] = firstByte;
    target[1] = SIXTEEN_BITS_INT_MARK | 0x0; // pentru a ști dimensiunea măștii
    target.writeUint16BE(messageSize, 2); // scrie datele care au dimensiunea de 2 bytes
    dataFrameBuffer = target;
    // ce s-a făcut mai sus:
    // S-au alocat 4 bytes
    // prima poziție [0] va fi ocupată de suma `0x80 | OPCODE_TEXT`, adică 0x80 care este 128 plus unu, adică 129 (0x81) ceea ce este combinație dintre FIN CODE cu OPCODE
    // pe a doua poziție [1] vom avea 126 (SIXTEEN_BITS_INT_MARK), care este marker al lungimii payload-ului plus indicatorul ce semnalează masca, adică un bit
    // pe poziția a treia [2] vom avea de la 0 - lungimea conținutului
    // pe poziția a patra [3] vom avea de la 171 - lungimea conținutului
    // de la [4] încolo sunt byte-ii care au rămas care este chiar conținutul mesajului
  } else {
    throw new Error('Mesajul este prea mare ca dimensiune');
  }

  // Atunci când trimiți mesaje din backend spre client, acestea nu trebuie mascaradate
  const totalLength = dataFrameBuffer.byteLength + messageSize;
  // Acum că ai `totalLength`, trebuie creat un nou Buffer în care să concatenezi message
  console.log(`Dimensiunea totală a Buffer-ului este: `, totalLength);
  const dataFrameResponse = concatBuffers([dataFrameBuffer, msg], totalLength); 
  return dataFrameResponse;
}

/**
 * Funcția fac un merge de două buffere
 * Apelată în `prepareMessage()`
 * @param {Array} bufferList un Array de buffere
 * @param {Number} totalLength lungimea totală a Buffer-ului cu tot cu mesaj
 * @return {Buffer} Bufferul completat cu date 
 */
function concatBuffers (bufferList, totalLength) {
  const target = Buffer.allocUnsafe(totalLength); // creezi un Buffer gol cu un număr de element cât lungimea totală a mesajului
  let offsetBuffer = 0; // necesar pentru a poziționa datele în Bufferul creat mai sus.
  
  // fă mergingul bufferelor din Array-ul de Buffere primit
  let buffer;
  for (buffer of bufferList) {
    target.set(buffer, offsetBuffer);
    offsetBuffer += buffer.length;
  }
  return target;
};

server.listen(PORT, () => {console.log('Server ascultă pe ', PORT)});

// managementul erorilor
["uncaughtException", "unhandledRejection"].forEach(event => {
  process.on(event, (error) => {
    console.error('Ceva nu este în regulă', event, `message: ${error.stack || error}`);
  });
});
```

Clientul este o simplă pagină web cu o mică aplicație JavaScript inline.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Client de WS</title>
</head>
<body>
  <output id="messages"></output>
  <script>
    const messages = document.getElementById("messages");

    // creează un socket și leagă-te la server făcând upgrade la conexiune
    const socket = new WebSocket("ws://localhost:3000");
    // în spate se face handshake-ul, serverul trimite `Sec-WebSocket-Key`, iar headerul `Sec-Websocket-Accept` este

    socket.onopen = (event) => {
      console.log('Conectat la server')
      const id = Math.round(Math.random() * 100);
      console.log(`Trimit datele:`, id);
      const data = JSON.stringify(
      [
        {
          id,
          name: `Cineva Mare`,
          addr: {
            street: `Via mare`,
            nr: 12
          }
        },
        {
          id,
          name: `Marele Jack`,
          addr: {
            street: `Aeroportului`,
            nr: '11bis'
          }
        },
      ]);
      socket.send(data);
    };

    socket.onmessage = (message) => {
      console.log('Mesajul primit ', message);
      messages.innerHTML += `<br/> ${message.data}`;
    };
    socket.onerror = (error) => console.error('Eroarea de socket este ', error);
    socket.onclose = (event) => console.log('Deconectat de la server');
  </script>
</body>
</html>
```

## Resurse

https://www.programiz.com/javascript/bitwise-operators
https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/Writing_WebSocket_servers
https://www.bigbinary.com/blog/ruby-pack-unpack
https://blog.pusher.com/websockets-from-scratch/
https://github.com/pusher/websockets-from-scratch-tutorial
https://github.com/websockets/ws
https://www.quora.com/Which-is-the-maximum-16-bit-signed-integer
https://github.com/websockets/ws/blob/975382178f8a9355a5a564bb29cb1566889da9ba/lib/sender.js#L466
https://ruby-doc.org/core-2.2.0/Array.html#pack-method
https://datatracker.ietf.org/doc/html/draft-ietf-hybi-thewebsocketprotocol-17#section-5
https://nodejs.org/docs/latest-v17.x/api/buffer.html
https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/Writing_WebSocket_servers#format
https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/Writing_WebSocket_server
https://stackoverflow.com/a/11077172/4087199
https://www.techtarget.com/searchnetworking/definition/big-endian-and-little-endian
https://en.wikipedia.org/wiki/Reliability_(computer_networking)
https://github.com/ErickWendel/websockets-with-nodejs-from-scratch