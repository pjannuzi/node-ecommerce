const getDb = require('../util/database').getDb;
const mongodb = require('mongodb');

const ObjectId = mongodb.ObjectId;

class User {
    constructor(username, email) {
        this.name = username;
        this.email = email
    }

    save() {
    const db = getDb();
    return db.collection('users').insertOne(this)
    .then(result => {
        console.log('User created');
    })
    .catch(err => console.log(err))
    }

    addToCart(product) {
        
    }

    static findById(userId) {
        const db = getDb();
        return db.collection('users')
        .findOne({_id: new ObjectId(userId)})
        .then(user => {
            return user;
        })
        .catch(err => console.log(err));
    }
}

module.exports = User;