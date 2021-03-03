# fastify-module

Acest modul este folosit pentru a dez-incapsula un plugin. Pentru a realiza acest lucru, mai întâi îl ceri și apoi îi pasezi funcția vare primește instanța de fastify și opțiunile.

```javascript
'use strict'
const fp = require('fastify-plugin');

const catToPrefix = {
  electronics: 'A',
  confectionery: 'B'
};

const calculateID = (idPrefix, data) => {
  const sorted = [...(new Set(data.map(({id}) => id)))];
  const next = Number(sorted.pop().slice(1)) + 1;
  return  ` ${idPrefix}${next} `;
};

module.exports = fp(async function (fastify, opts) {
  fastify.decorateRequest('mockDataInsert', function insert (category, data) {
    const request = this;
    const idPrefix = catToPrefix[category];
    const id = calculateID(idPrefix, data);
    data.push({id, ...request.body});
  })
});
```

Orice modificare vei face instanței de fastify, se va repercuta pentru tot serviciul care va importa modulul modificat cu fastify-module. Dacă nu am pasa funcția exportată lui `fp`, orice modificări s-ar aplica instanței de fastify care i-a fost pasată ar fi valabile doar modulului în sine și plugin-urilor descendenți. Modificările instanței de fastify se fac aplicând o metodă decorator. În exemplul de mai sus, decorează/adaugă la obiectul request o metodă numită `mockDataInsert`. Decoratorul `mockDataInsert` este funcția numită `insert`. Legătura `this` a decoratorului în acest caz este chiar obiectul request pe care este apelată `insert`. Acest lucru, în scenariul în care secvența de cod rula (o cerere POST), înseamnă că este permis accesul la datele din corpul cererii accesând request.body.

Într-o rută ai putea avea următorul cod care demonstrează funcționalitatea.

```javascript
'use strict'

const data = [
  {id: 'B1', name: 'Chocolate Bar', rrp: '22.40', info: 'Delicious overpriced chocolate.'}
]

module.exports = async function (fastify, opts) {
  fastify.get('/', async function (request, reply) {
    return data
  })
  fastify.post('/', async function (request, reply) {
    request.mockDataInsert(opts.prefix.slice(1), data)
    return data
  })
}
```

## Resurse

- [Plugins | Documentation (latest — v3.12.0)](https://www.fastify.io/docs/latest/Plugins/)
- [Decorators | Documentation (latest — v3.12.0)](https://www.fastify.io/docs/latest/Decorators/)
