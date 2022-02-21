# Aggregate.prototype.session

Setează o sesiune de lucru pentru agregarea curentă. Este util pentru realizarea de tranzacții.

```javascript
const session = await Model.startSession();
await Model.aggregate(..).session(session);
```
