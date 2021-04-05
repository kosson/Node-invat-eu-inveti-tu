# Child Process

Node folosește un singur proces principal, dar uneori ai nevoie să pornești un subproces pentru a rula alte programe necesare. Aceste procese pe care le poți iniția, pot comunica între ele. Modulul `child_process` permite acest lucru.

Sunt patru metode de a crea procese copil în NodeJS:

- metoda `spawn()`,
- metoda `fork()`,
- metoda `exec()`,
- metoda `execFile()`.

## Metoda spawn

Acest modul permite să inițiezi execuția unor alte procese care pot fi folosite pentru a rula comenzi sau programe. Acest lucru este posibil prin executarea metodei `child_process.spawn()`.

```javascript
const { spawn } = require('child_process');
const ls = spawn('ls', ['-lh', '/usr']);
```
