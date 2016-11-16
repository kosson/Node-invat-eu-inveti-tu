So the main confusing thing to understand is that `mongoose.SchemaTypes` has stuff you only use when defining mongoose schemas, and `mongoose.Types` has the stuff you use when creating data objects you want to store in the database or query objects.

So mongoose.Types.ObjectId("51bb793aca2ab77a3200000d") works, will give you an object you can store in the database or use in queries, and will throw an exception if given an invalid ID string.

findOne takes a query object and passes a single model instance to the callback. And findById is literally a wrapper of findOne({_id: id}) (see source code here). Just find takes a query object and passes an array of matching model instances to the callback.

Just go slow. It's confusing but I can guarantee you you are getting confused and not hitting bugs in mongoose at this point. It's a pretty mature library, but it takes some time to get the hang of it.

The other suspect thing I see in your snippet is not using new when instantiating ChildClass. Beyond that, you'll need to post your schema code in order for us to help you tract down any CastErrors that remain.
