# Express.js

Express este o bibliotecă de cod care în combinație cu nodejs are capacitatea de a servi pagini web și alte resurse. Pe scurt, poți face un server.

## Folosirea middleware-ului

În Express, middleware-ul este *consumat* cu `use()`. Din tot middleware-ul folosit cu Express, singurul care a fost păstrat intern este cel responsabil de servirea paginilor statice.

```javascript
app.use(express.static(__dirname + '/public'));
```
