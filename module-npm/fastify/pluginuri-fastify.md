# Serviciile ca pluginuri

Serviciile pe care le folosești cu fastify au logica divizată în ceea ce se numește pluginuri. Un plugin este un modul care exportă o singură funcție. Funcției exportate îi este pastă o instanță fastify și opțiuni.

```javascript
'use strict'

module.exports = async function (fastify, opts) {
  fastify.get('/', async function (request, reply) {
    return [
      {id: 'B1', name: 'Chocolate Bar', rrp: '22.40', info: 'Delicious overpriced chocolate.'}
    ]
  })
}
```

Atenție, plugin-urile bibliotecii de cod fastify sunt instalate separat. Deci, există o diferență între plugin-urile create de programator și cele ale bibliotecii.
