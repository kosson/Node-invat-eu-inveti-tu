# Rularea Node.js

## Clustering

Atunci când un program Node.js rulează pe un pocesor multicore, poți folosi mai multe de un nucleu pentru a crește scalabilitatea.

Este recomandabil ca Node.js să fie rulat în modul `cluster` atunci când sunt așteptate sarcini mai grele din partea sa.

Ceea ce se va petrece atunci când folosim clustering-ul este că se vor inițializa mai mulți workeri, care vor balansa capacitatea de prelucrare a lui Node.js.

Pentru a porni clusteringul ai nevoie să chemi biblioteca de cod și să declari un master.

```javascript
const cluster = require('cluster');

if (cluster.isMaster) {
    // daca am chemat cluster, deja avem un master.
    cluster.fork();
    // iar index.js va fi executat în modul child.
    cluster.fork(); // o nouă instanță a event loop-ului (un child)
    cluster.fork(); // o nouă instanță a event loop-ului (un child)
    cluster.fork(); // o nouă instanță a event loop-ului (un child)
} else {
    // modul child
	const express = require('express');
	const app = express();

	// simulează lucrul la ceva
	function facCeva (perioada) {
		let start = Date.now();
		while (Date.now() - start < perioada ) {
			// stai in buclă până se întrunește condiția
		}
	};

	app.get('/', (res, req) => {
			facCeva(5000); // se va înregistra o întârziere de 5 secunde.
			res.send('Salve');
    });
    
    app.get('/alta', (req, res) => {
        res.send('S-a încărcat folosind un copil');
    });

	app.listen(3000);
};
```

Ceea ce se petrece la momentul în care `index.js` este parcurs de Node.js este că se va instanția un manager al clusterului - `console.log(cluster.isMaster); // true`. 

Dacă `index.js` va fi executat în modul master, se va apela `cluster.fork()`. Abia acest proces, va executa din nou `index.js` de data aceasta în modul *slave* sau *child* setând `cluster.isMaster` la `false`, ceea ce permite executarea ramurii `else` care instanțiază copiii. Fii foarte atent că fiecare child va avea la dispoziție câte un pool cu patru thread-uri.

Pe ramura `else`, avem executarea serverului care se face întotdeauna în modul *child*.

Fiecare `cluster.fork()` reprezintă câte o instanță a event loop-ului. Ceea ce am realizat este că de fiecare dată când va exista câte o instanță care îndeplinește o sarcină care are șansa de a bloca event-loop-ul, se vor gestiona alte cereri pe instanțierea unei noi bucle într-un copil.

## Resurse

https://nodejs.org/api/cluster.html