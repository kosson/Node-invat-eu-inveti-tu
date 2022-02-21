# Aggregate.prototype.allowDiskUse

Metoda setează opțiunea `allowDiskUse` petru un query de agregare.

```javascript
await Model.aggregate([{ $match: { foo: 'bar' } }]).allowDiskUse(true);
```

Parametri:
- o valoare Boolean care indică serverului că poate folosi stocarea datelor în timpul agregării;
- un array de taguri opționale pentru query.
