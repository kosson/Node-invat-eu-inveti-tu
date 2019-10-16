# Model.create()

Este o metodă care poate fi utilizată în scopul salvării în baza de date a unuia sau a mai multor documente în baza de date.

Astfel, `MyModel.create(docs)` se comportă ca o prescurtare pentru `new MyModel(doc).save()`.

Funcția `create()` apelează în spate pe `save()`;

## Parametri

### docs

Este primul parametru pasat și poate fi de tipul `Array` sau `Object`. Acestea conțin documentele care trebuie inserate. Acestea pot fi chiar un spread.

### [options]

Acesta este un `Object` în care sunt menționate opțiunile ce vor fi pasate lui `save()`. Pentru a specifica opțiuni, trebuie să avem `docs` ca array, nu ca spread.

### [callback]

Este un `Function` care joacă rolul de callback.
