const { MongoClient } = require('mongodb');

let _db;

const mongoConnect = (callback) => {
    MongoClient.connect('mongodb+srv://pjannuzi:jannuzi1@cluster0.3mfho.mongodb.net/myFirstDatabase?retryWrites=true&w=majority')
    .then(client => {
    console.log('EVENT: Connected to Database'); 
    _db = client.db();
    callback(client);
    })
    .catch(err => {
        console.log(err)
        throw err;
    });
}

const getDb = () => {
    if (_db) {
        return _db;
    }
    throw 'ERROR: No database found';
}

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;