## Șablonul Observer

Este un șablon prin care se definește un obiect care trimite notificări către un set de observatori atunci când se modifică starea.

Este folosit atunci când un callback nu mai reușește să ofere funcționalități mai dinamice. Când este ceva mai mult decât un singur lucru.

Problema este că un callback este apelat o singură dată și se declanșează la finalul rulării codului. Un callback nu poate fi eliminat și nici nu poate fi adăugat dinamic.

Dacă la finalizarea execuției unui modul importat ai nevoie doar de un singur event, este îndeajuns să pasezi un callback.

```js
var actiune = require('./actiune')(callback);
```

Pentru a rezolva aceste deficiențe ale callback-urilor, se va folosi șablonul Observer cu emitere de evenimente.

```js
// modul.js
var util = require('util');

var Actiunea = function Actiunea(){
  this.faCeva = function(){
    // cod care face prelucrări
    activitate.emit('done', {amIncheiat: new Date()});
  };
};

util.inherits(Actiunea, require('events').EventEmitter);

module.exports = oActiune;

// main.js
var Actiunea = require('./modul');
var actiune = new Actiunea();

actiune.on('done', function(argument){
  console.log('Treburile au fost făcute la', argument.amIncheiat);
  actiune.removeAllListeners();
});

actiune.faCeva();
```

## Folosirea lui EventEmitter

În Node.js șablonul Observer este disponibil deja prin `EventEmitter`. EventEmitter (prototip al modulului nucleu al Node.js `events`) permite înregistrarea uneia sau a mai multor funcții ca „ascultători” - listeners, care vor fi invocați atunci când un anume eveniment se declanșează.

```js
var EventEmitter = require('events').EventEmitter;  // referință către EventEmmiter
var EventEmitterInstance = new EventEmitter();      // instanțierea unui EventEmitter
```

Metodele de primă utilitate sunt:
- on(event, listener)
- once(event, listener)
- emit(event, [args])
- removeAllListeners(event, listener)

ATENȚIE! Toate metodele vor returna instanța EventEmitterInstance, fapt care permite chaining-ul. Listener-ul este de fapt o funcție după tipicul `function([args])`, care acceptă argumentele la momentul în care evenimentul este emis. `this` al listener-ului este instanța EventEmitter, care, de fapt produce evenimentul.

### on(event, listener)

Permite înregistrarea unui nou „listener”, adică a unei funcții pentru un anumit tip de de eveniment precizat printr-un string.

### once(event, listener)

Permite înregistrarea unui nou listener, care este șters imediat ce evenimentul este emis pentru prima dată.

### emit(event, [args])

Metoda produce un eveniment și oferă argumente suplimentare pentru a fi pasate către „listeners”.

### removeAllListeners(event, listener)

Această metodă șterge un „listener” pentru un anumit tip de eveniment care este specificat.

```js
var EventEmitter = require('events').EventEmitter,
    fs = require('fs');

function cautaInFisier(fisiere, regex) {

  var emitter = new EventEmitter();

  fisiere.forEach(function(fisier) {
    fs.readFile(fisier, 'utf8', function(err, data){
      if(err){
        return emitter.emit('error', err);       // emite error
      };
      emitter.emit('fileread', file);            // emite fileread
      var identificare = null;
      if(identificare = data.match(regex)){
        match.forEach(function(element){
          emitter.emit('found', file, element);  // emite found
        });
      };
    });
  });

  return emitter;
};

cautaInFisier(['salve.txt', 'ceva.csv'], /salut \w+/g)
  .on('fileread', function(fisier){console.log(fisier + 'a fost citit');})
  .on('found', function(fisier, identificare){console.log('Am găsit "' + identificare + '" în fișierul ' + fisier);})
  .on('error', function(err){console.log('Eroare: ' + err.message);});
```

Ca și practică este bine să existe un eveniment asociat erorilor (un listener dedicat) pentru a le putea propaga.

Crearea de observatoare direct din EventEmitter se dovedește a fi insuficient dacă se dorește mai mult decât crearea unor evenimente noi. Pentru o funcționalitate extinsă este nevoie de a face un obiect observator prin extinderea lui EventEmitter.

```js
var EventEmitter = require('events').EventEmitter,
    util = require('util'),
    fs = require('fs');

function CautaInFisier(regex){
  EventEmitter.call(this);
  this.regex = regex;
  this.fisiere = [];
};

util.inherits(cautaInFisier, EventEmitter);
// cautaInFisier extinde EventEmitter prin folosirea lui util.inherits()
// în acest mod se va crea un obiect Onserver.

cautaInFisier.prototype.adaugaFisier = function(fisier){
  this.fisiere.push(fisier);
  return this;
};

cautaInFisier.prototype.cauta = function(){
  var self = this;
  self.files.forEach(function(fisier){
    fs.readFile(fisier, 'utf8', function(err, continut){
      if(err){
        return emitter.emit('error', err);        // emite error
      };
      self.emit('fileread', file);                // emite fileread
      var identificare = null;
      if(identificare = continut.match(self.regex)){
        match.forEach(function(element){
          self.emit('found', file, element);      // emite found
        });
      };
    });
  });
  return this;
};

// cazul de utilizarea a noului obiect Observer
var obiectInCareFaciCautare = new CautaInFisier(/salut \w+/);
obiectInCareFaciCautare.adaugaFisier('salutari.txt')
                       .adaugaFisier('ceva.csv')
                       .cauta()
                       .on('found', function(fisier, identificare){
                         console.log('Am găsit "' + identificare + '" în fișierul ' + file);
                       })
                       .on('error', function(err){
                         console.log('Eroarea emisă: ' + err.message);
                       });

```

Acest șablon de lucru este larg întâlnit în practica Node.js. Cel mai interesant context de aplicare este cel oferit de streamuri.
