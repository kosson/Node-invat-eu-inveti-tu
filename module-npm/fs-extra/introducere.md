# fs-extra

Este un înlocuitor pentru biblioteca de cod din API-ul Node.js. Ceea ce o face interesantă, este faptul că rezultatele returnate de metode sunt toate promisiuni.

```javascript
const fs = require('fs-extra');
 
// Async with promises:
fs.copy('/tmp/myfile', '/tmp/mynewfile')
  .then(() => console.log('success!'))
  .catch(err => console.error(err));
 
// Async with callbacks:
fs.copy('/tmp/myfile', '/tmp/mynewfile', err => {
  if (err) return console.error(err)
  console.log('success!');
})
 
// Sync:
try {
  fs.copySync('/tmp/myfile', '/tmp/mynewfile')
  console.log('success!');
} catch (err) {
  console.error(err);
}
 
// Async/Await:
async function copyFiles () {
  try {
    await fs.copy('/tmp/myfile', '/tmp/mynewfile')
    console.log('success!');
  } catch (err) {
    console.error(err);
  }
};
 
copyFiles();
```