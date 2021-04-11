# Modelul Observer

Acest model vizează definirea unui obiect numit *subiect* care poate anunța un set de *observatori* (listeners) despre apariția unei modificări de stare. Împreună cu modelul Reactive și callback-urile, definește natura de lucru în Node.js.

Acest model diferă de cel bazat pe callback-uri pentru că, spre deosebire de callback, unde rezultatul este propagat unui singur listener, acesta va notifica mai mulți observatori.

În Node.js modelul Observer este oferit direct prin clasa `EventEmitter`. Această clasă permite înregistrarea mai multor listeneri, care vor fi invocați în funcție de ce eveniment apare. Pentru a avea acces la această clasă, trebuie cerută din modulul nucleu `events`.

```javascript
import {EventEmitter} from 'events';
const emitorNou = new EventEmitter();
```

Metodele pe care le pune la dispoziție un obiect `EventEmitter` sunt:

- `on(event, listener)`, fiind o metodă care permite înregistrarea unui nou listener;
- `once(event, listener)`, fiind înregistrat un listener care după prima apelare este eliminat;
- `emit(event, [arg1], [arg2], [...])`, fiind posibilă pasarea de argumente suplimentare tuturor funcțiilor listener;
- `removeListener(event, listener)`, fiind o metodă ce elimină un listener pentru tipul de eveniment specificat.

## Crearea și utilizarea unui EventEmitter

Pentru exemplificare, vom explora un exemplu oferit în lucrarea *Node.js Design Patterns* de Mario Casciaro și Luciano Mammino.

```javascript
import { EventEmitter } from 'events';
import { readFile }     from 'fs';

function cautăCuRegex (fișiere, regex) {
  const instanțăEm = new EventEmitter(); // construiește obiectul Emitter

  // prelucrează fișierele
  const fișier;
  for (fișier of fișiere) {

    // citește fiecare fișier, caută fragmentul desemnat,
    readFile(fișier, 'utf8', (err, conținut) => {
      if (err) {
        return instanțăEm.emit('error', err); // emite eroare
      }
      instanțăEm.emit('fileread', fișier); // emite eveniment `fileread` de îndată ce fișierul este citit

      // caută în fișier
      const șablon = conținut.match(regex);
      if (șablon) {
        // pentru fiecare fragment care se potrivește criteriului, emite eveniment `found`
        șablon.forEach(elem => instanțăEm.emit('found', fișier, elem));
      }
    });
  }

  // returnează instanța de Emitter
  return instanțăEm;
}

cautăCuRegex(['fisier1.txt', 'fisier2.txt'], /salut \w+/g)
  .on('fileread', fișier => console.log(`Am citit fișierul ${fișier}`))
  .on('found',    (fișier, șablon) => console.log(`Am găsit fragmentul ${șablon} în fișierul ${fișier}`))
  .on('error',    err => console.error(`Eroarea apărută este ${err.message}`));
```

Mai util ar fi să moștenim de la clasă și să o extindem. Acest lucru va permite transformarea propriei clase în una Observable.

```javascript
import { EventEmitter } from 'events';
import { readFile }     from 'fs';

class CautăCuRegex extends EventEmitter {
  constructor (regex) {
    super(); // mijlocește accesul la entitățile interne ale EventEmitter
    this.regex = regex;
    this.fișiere = [];
  }
  adaugăFișier (fișier) {
    this.fișiere.push(file);
    return this;
  }
  cautăFragment () {
    const fișier;
    for (fișier of this.fișiere) {
      // urmează un task asincron
      readFile(fișier, 'utf8', (err, conținut) => {
        if (err) {
          return this.emit('error', err); // emite eroare
        }
        this.emit('fileread', fișier); // emite eveniment `fileread` de îndată ce fișierul este citit

        // caută în fișier
        const șablon = conținut.match(this.regex);
        if (șablon) {
          // pentru fiecare fragment care se potrivește criteriului, emite eveniment `found`
          șablon.forEach(elem => this.emit('found', fișier, elem));
        }
      });
    }
    return this;
  }
}

const instanțăCăutare1 = new CautăCuRegex(/salut \w+/g);
instanțăCăutare1
  .adaugăFișier('fișier1.txt')
  .adaugăFișier('fișier2.txt')
  .cautăFragment()
  .on('found', (fișier, șablon) => console.log(`Am găsit fragmentul ${șablon} în fișierul ${fișier}`))
  .on('error', err => console.error(`Eroarea apărută este ${err.message}`));
```

Un alt exemplu este obiectul `Server` al modulului nucleu `http` al Node.js, care moșenește din `EventEmitter`, fapt care-i permite să emită evenimente precum `request`, `connection` sau `closed`. Un alt moștenitoral lui `EventEmitter` sunt stream-urile.

## Evitarea scurgerilor de memorie

Ca regulă de bază, dacă un receptor nu mai este necesar, *dezabonează-l* (șterge-l). Ca efect, se vor colecta la gunoi obiectele din scope-ul funcției cu rol de receptor, eliberând astfel memoria.

```javascript
emitter.removeListener('nume_eveniment', identificatorListener);
```

`EventEmitter` are un mecanism de avertizare, care se declanșează, de regulă după ce un anumit număr de receptori au fost înregistrați. Dacă este ok să ai mai mult de 10 receptori înregistrați, poți modifica limita folosind metoda `setMaxListeners()` pe care `EventEmitter` o pune la dispoziție.

Un alt lucru foarte important este evitarea emiterii aceluiași eveniment din cod sicron, dar și asincron.

Reține faptul că în cazul evenimentelor emise asincron, putem înregistra receptori chiar și după ce task-ul care le-a emis a fost declanșat. Acest lucru este posibil pentru că evenimentele vor executa receptorii abia în următorul ciclu al buclei evenimentelor.

```javascript
const instanțăCăutare1 = new CautăCuRegex(/salut \w+/g);
instanțăCăutare1
  .adaugăFișier('fișier1.txt')
  .adaugăFișier('fișier2.txt')
  .cautăFragment()
  .on('found', (fișier, șablon) => console.log(`Am găsit fragmentul ${șablon} în fișierul ${fișier}`))
  .on('error', err => console.error(`Eroarea apărută este ${err.message}`));
```

Observă faptul că evenimentele au fost emise abia după apelarea task-ului `cautăFragment()`. Dar dacă metoda `cautăFragment()` ar fi fost una sincronă în natura sa, evenimentele apelate după aceasta, nu ar găsi receptori înregistrați.

```javascript
import { EventEmitter } from 'events';
import { readFile }     from 'fs';

class CautăCuRegex extends EventEmitter {
  constructor (regex) {
    super(); // mijlocește accesul la entitățile interne ale EventEmitter
    this.regex = regex;
    this.fișiere = [];
  }
  adaugăFișier (fișier) {
    this.fișiere.push(file);
    return this;
  }
  cautăFragment () {
    const fișier;
    for (fișier of this.fișiere) {
      var conținut;
      // citirea sincronă a fișierelor
      try {
        conținut = readFileSync(fișier, 'utf8');
      } catch (error) {
        this.emit('error', error);
      }
      this.emit('fileread', fișier);

      // caută în fișier
      const șablon = conținut.match(this.regex);
      if (șablon) {
        // pentru fiecare fragment care se potrivește criteriului, emite eveniment `found`
        șablon.forEach(elem => this.emit('found', fișier, elem));
      }
    }
    return this;
  }
}
const instanțăCăutare1 = new CautăCuRegex(/salut \w+/g);
instanțăCăutare1
  .adaugăFișier('fișier1.txt')
  .adaugăFișier('fișier2.txt')
  .cautăFragment()
  .on('found', (fișier, șablon) => console.log(`Am găsit fragmentul ${șablon} în fișierul ${fișier}`)); // nu va fi invocat receptorul
```
