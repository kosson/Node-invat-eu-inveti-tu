# Child Process

Acest modul permite să inișiezi execuția unor procese adiționale celui `node`. Acest lucru este posibil prin executarea metodei `child_process.spawn()`.

```javascript
const { spawn } = require('child_process');
const ls = spawn('ls', ['-lh', '/usr']);
```