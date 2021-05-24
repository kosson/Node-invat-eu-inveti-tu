# Clasa Cluster

O instanță de Node.js folosește un singur fir de execuție. Pentru a beneficia de performanțele unui sistem multi-core, poți iniția un cluster de procese, care să fie capabile în gestionarea unei încărcări substanțiale.

Din nefericire, procesele copil rulează în izolare și singurul mod de a comunica date între ele este prin trimiterea acestora ca JSON-uri.

O altă soluție este rularea a mai multor instanțe Node.js în același proces.

## Resurse

- [Cluster | nodejs.org/docs/latest/api](https://nodejs.org/docs/latest/api/cluster.html)
- [Use cases for Node workers | blog.logrocket.com](https://blog.logrocket.com/use-cases-for-node-workers/)
- [A complete guide to threads in Node.js](https://blog.logrocket.com/a-complete-guide-to-threads-in-node-js-4fa3898fe74f/)
