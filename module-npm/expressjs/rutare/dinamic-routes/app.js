const express = require('express');
const router  = express.Router();
const app     = express();
const morgan  = require('morgan');

app.use(morgan('combined'));

app.get('/', function (req, res) {
  res.send("Salut");
});

// Rutări statice
let apit1 = require('./routes/apit1');
// console.log("modulul pentru apit1 este ", apit1);
app.use('/api/apit1', apit1);

// === Rutare dinamică ===
let dynamicRouter, droutes = ['apit2'];
function initDynRouter (err, req, res, next) {
  if (err) {
    console.error(err);
  }
  // console.log("Acum are valoarea: ", router);
  dynamicRouter = express.Router();
  // console.log("Acum are valoarea: ", router);
  // aici ar trebui să fac importul și montarea rutelor
  for (let i = 0; i < droutes.length; i++) {
    console.log("calea este ", droutes[i]);
    dynamicRouter.use(`/api/${droutes[i]}`, require(`./routes/${droutes[i]}`));
  }
};
initDynRouter();
app.use((req, res, next) => router(req, res, next));
app.use((req, res, next) => dynamicRouter(req, res, next));



app.listen('3000', () => console.log('Pe 3000'));

// Gestionează erorile
app.use((req, res, next) => {
    const err = new Error('Nu am ajuns la calea dorită');
    err.status = 404;
    next(err);
});

app.use((err, req, res, next) => {
    res.status(err.status || 500).json({error: {message: err.message}});
});
