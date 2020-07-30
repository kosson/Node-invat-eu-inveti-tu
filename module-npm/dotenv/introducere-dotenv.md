# dotenv

Este un modul fără alte dependințe care încarcă variabilele de mediu dintr-un fișier `.env` într-un `process.env`.

Instalezi cu `npm install dotenv`. Creezi fișierul `.env` în care pui variabilele de mediu necesare rulării aplicației.

```text
DB_HOST=localhost
DB_USER=root
DB_PASS=s1mpl3
```

Apoi faci apela la metoda `require('dotenv').config()` cât mai sus în cod.

## Resurse

- [The twelve-factor app](https://12factor.net/config)
