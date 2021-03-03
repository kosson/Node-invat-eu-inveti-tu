# Routare

Să presupunem că avem o rută în `/app/routes/electronice/index.js`. O rută este un plugin scris de noi, adică o funcție exportată care primește o instanța fastify și opțiuni. Pentru că funcția cu rol de handler a rutei este una asincronă, ceea ce va fi returnat, va fi chiar răspunsul către client.

```javascript
'use strict'

module.exports = async function (fastify, opts) {
  fastify.get('/', async function (request, reply) {
    return [
      {id: 'A1', name: 'Vacuum Cleaner', rrp: '99.99', info: 'The suckiest vacuum in the world.'},
      {id: 'A2', name: 'Leaf Blower', rrp: '303.33', info: 'This product will blow your socks off.'}
    ]
  })
}
```

Dacă este returnat un obiect sau un arrau, acestea vor fi convertite într-un răspuns JSON. Un șablon general ar fi următoarea secvență.

```javascript
'use strict'
module.exports = async function (fastify, opts) {
  fastify.get('/', async function (request, reply) {
    return {DATELE SPRE CLIENT}
  })
}
```
