# Worker threads

Modulul `worker_threads` permite utilizarea mai multor fire de execuție care evaluează cod JavaScript în paralel.

Folosind acest mecanism poți crea procese noi pentru a gestiona task-urile, care, altfel, ar bloca firul principal de execuție. Node.js folosește două tipuri de fire de execuție. Firul principal care este gestionat de *event loop* și câteva fire de execuție auxiliare în ceea ce numim *worker pool*, fiind implementat în `libuv`. Acest *worker pool* creează și getionează fire de execuție separate, care execută codul sincron. Altfel, s-ar bloca firul principal. Atunci când se ajunge la un rezultat, acesta este returnat *event loop*-ului, care va executa mai apoi callback-ul ce are în sarcină tratarea acestui rezultat. Worker pool-ul este folosit de module precum `fs`, în cazul I/O intensiv sau `crypto` pentru CPU intensiv. Acest model de lucru intern, permite scrierea de cod precum în exemplul următor:

```javascript
fs.readFile(path.join(__dirname, './date.json'), (err, rezultat) => {
 if (err) {
   return null;
 }
 rezultate.log(content.toString());
});
```

Un *thread worker* este un fragment de cod, de regulă scris în propriul fișier, cu ajutorul căruia se creează fire de execuție dedicate. Termenii de *thread worker*, *worker* sau simplul *thread* se folosesc interșanjabil. Documentația Node.js enunță clar faptul că „workers (threads) sunt utili pentru a gestiona operațiuni JavaScript care sunt CPU intensive” și „nu ajută prea mult cu sarcinile I/O intensive”. „Operațiunile I/O asincrone native ale Node.js sunt mult mai eficiente decât ar putea fi workerii”.

Concret, ai putea folosi workerii pentru:

- sortări de date,
- algoritmi de căutare,
- redimensionări de imagine,
- compresie video,
- factorizări de numere mari,
- verificarea integrității fișierelor prin aplicarea unui algoritm criptografic de hashing

Spre deosebire de `child_process` sau `cluster`, `worker_threads` pot folosi memorie în comun și fac transfer de instanțe `ArrayBuffer` ori folosesc în comun instanțe `SharedArrayBuffer`.

## Crearea unui worker

Pentru a crea un worker, mai întâi trebuie instanțiată clasa `Worker`. Vom folosi exemplu pe care documentația oficială îl prezintă. Pentru fiecare apelare a funcției `parse()`, este creat un *worker thread*.

```javascript
const {
  Worker, isMainThread, parentPort, workerData
} = require('worker_threads');

if (isMainThread) {
  module.exports = function parseJSAsync(script) {
    return new Promise((resolve, reject) => {
      const worker = new Worker(__filename, {
        workerData: script
      });
      worker.on('message', resolve);
      worker.on('error', reject);
      worker.on('exit', (code) => {
        if (code !== 0)
          reject(new Error(`Worker stopped with exit code ${code}`));
      });
    });
  };
} else {
  const { parse } = require('some-js-parsing-library');
  const script = workerData;
  parentPort.postMessage(parse(script));
}
```

Inițierea unui worker ține de instanțierea prin furnizarea căii către fișierul în care este scris workerul și un obiect a cărui proprietate `workerData` este fragmentul de date la care dorim să aibă acces workerul în timpul funcționării.

## Evenimente

### error

Acest eveniment este emis atunci când există o excepție care nu este tratată de worker. Workerul își va încheia execuția și va lăsa callback-ul să trateze eroarea mai departe.

Semnătura este

```javascript
worker.on('error', (error) => {})
```

### exit

Acest eveniment este emis atunci când un worker iese din execuție. În cazul în care a fost apelat `process.exit()` în timp ce workerul rula, atunci valoarea codului de exit va fi pasată drept argument callback-ului dedicat.

```javascript
worker.on('exit', (exitCode) => {});
```

### online

Acest eveniment este emis atunci când un worker încheie parcurgerea codului JavaScript și începe să se execute. Este folosit în cazurile în care ai nevoie de informații privind rularea workerului.

```javascript
worker.on('online', () => {});
```

### message

Acest eveniment este emis atunci când un worker trimite date unui fir părinte.

```javascript
worker.on('message', (data) => {});
```

## Cazuistică

### Redimensionare de imagine

```javascript
// worker-redimensionare-img.js
const { parentPort, workerData } = require("worker_threads");
const sharp = require("sharp");

async function resize () {
    const {imagePath, size, outputPath} = workerData;
    console.log("Datele de lucru ale workerului sunt ", workerData);
    // opțional:
    sharp(imagePath).metadata().then((res) => {
      console.log(res);
    })
    await sharp(imagePath)
        .resize(size.w, size.h, {fit: "cover"})
        .toFile(outputPath + "/" + "redimensionat-" + Date.now() + ".jpg");

    // trimite mesajul înapoi către firul principal de execuție
    parentPort.postMessage({done:true});
}
resize()
```

și

```javascript
const { Worker } = require("worker_threads");

const imageResizer = function (imagePath, size, outputPath) {
  return new Promise((resolve, reject) => {

    const worker = new Worker(__dirname + "/worker-redimensionare-img.js", {
      workerData: {
        imagePath: imagePath,
        size: size,
        outputPath: outputPath
      }
    });

    worker.on("message", resolve);
    worker.on("error", reject);

    worker.on("exit", (code) => {
      if (code  !==  0) {
        reject (new Error(`Worker-ul s-a oprit având exit code ${code}`));
      }
    });

  });
};

module.exports = imageResizer
```

## Recomandări

În loc să creezi câte un worker atunci când ai nevoie, cel mai bine este să creezi un worker pool.

## Resurse

- [Worker threads | nodejs.org/docs/latest/api](https://nodejs.org/docs/latest/api/worker_threads.html)
- [A complete guide to threads in Node.js](https://blog.logrocket.com/a-complete-guide-to-threads-in-node-js-4fa3898fe74f/)
- [Using AsyncResource for a Worker thread pool | nodejs.org/docs/latest/api](https://nodejs.org/docs/latest/api/async_hooks.html#async-resource-worker-pool)
- [How worker threads boosted my Node application | levelup.gitconnected.com](https://levelup.gitconnected.com/how-worker-threads-boosted-my-node-application-9ff23abb8927)
