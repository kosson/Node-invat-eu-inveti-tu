# Rularea Node.js

## Clustering

Atunci când un program Node.js rulează pe un procesor multicore, poți folosi mai multe de un nucleu pentru a crește scalabilitatea.

Este recomandabil ca Node.js să fie rulat în modul `cluster` atunci când sunt așteptate sarcini mai grele din partea sa. Ceea ce se va petrece atunci când folosim clustering-ul este că se vor inițializa mai mulți workeri, care vor balansa capacitatea de prelucrare a lui NodeJS. Pornirea lui NodeJS este recomandabilă în cluster mode.

Pentru a porni clusteringul ai nevoie să chemi biblioteca de cod și să declari un master. Modulul `cluster` este unul standard pentru NodeJS așa cum este `fs`, de exemplu.

```javascript
// fiecare copil, va avea la dispoziție doar un singur thread
process.env.UV_THREADPOOL_SIZE = 1;
const cluster = require('cluster');

// Dacă fișierul se execută în master mode
if (cluster.isMaster) {
    // daca am chemat cluster, deja avem un master.
    cluster.fork();
    // iar index.js va fi executat în modul child.
    cluster.fork(); // o nouă instanță a event loop-ului (un child)
    cluster.fork(); // o nouă instanță a event loop-ului (un child)
    cluster.fork(); // o nouă instanță a event loop-ului (un child)
} else {
    // modul child care nu pornește niciun cluster
	const express = require('express');
	const app = express();
	const crypto = require('crypto');

	// simulează lucrul la ceva
	function facCeva (perioada) {
		let start = Date.now();
		while (Date.now() - start < perioada ) {
			// stai in buclă până se întrunește condiția
		}
	};

	app.get('/', (req, res) => {
			// facCeva(5000); // se va înregistra o întârziere de 5 secunde.
			crypto.pbkdf2('a','b', 100000, 512, 'sha512', () => {
				res.send('Salutare, fac ceva care blocheaza event loop-ul');
			});
			// res.send('Salve');
    });

    app.get('/rutarapida', (req, res) => {
        res.send('S-a încărcat folosind un copil');
    });

	app.listen(3000);
};
```

Ceea ce se petrece la momentul în care `index.js` este parcurs de Node.js este că se va instanția un manager care va gestiona cluster-ul: `console.log(cluster.isMaster); // true`. Acest manager de cluster este responsabil pentru pornirea de instațe ale worker-ilor. Nu depăși numărul de workeri peste numărul de nuclee ale procesorului. În acest caz, nucleele existente vor încerca să facă câte puțin din toate sarcinile.

Dacă `index.js` va fi executat în modul master, se va apela `cluster.fork()`. Abia acest proces, va executa pentru a doua oară `index.js`, dar de data aceasta în modul *slave* sau *child* setând `cluster.isMaster` la `false`, ceea ce permite executarea ramurii `else`, care instanțiază copiii. Fii foarte atent că fiecare child va avea la dispoziție câte un pool cu patru thread-uri.

Pe ramura `else`, avem executarea serverului care se face întotdeauna în modul *child*.

Fiecare `cluster.fork()` reprezintă câte o instanță a event loop-ului. Ceea ce am realizat este că de fiecare dată când va exista câte o instanță care îndeplinește o sarcină care are șansa de a bloca event-loop-ul, se vor gestiona alte cereri pe instanțierea unei noi bucle într-un copil.

## Benchmarking

```bash
# -c este concurency (conexiuni în același timp)
ab -c 50 -n 500 http://localhost:3000/rutarapida
# -n 500 - fă 500 de cereri.
```

În producție vei folosi un cluster manager precum PM2.


## Resurse

https://nodejs.org/api/cluster.html
