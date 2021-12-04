# Model.countDocuments

Numără documentele în baza unui filtru.

```javascript
Adventure.countDocuments({ type: 'jungle' }, function (err, count) {
  console.log('there are %d jungle adventures', count);
})
```

Dacă se dorește numărarea tuturor documentelor dintr-o colecție de mari dimensiuni, se va folosi `estimatedDocumentCount`.