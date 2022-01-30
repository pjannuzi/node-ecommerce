const Sequelize = require('sequelize');

const sequelize = new Sequelize('node-complete', 'root', 'pedrojannuzi', {
    dialect: 'mysql',
    host: 'localhost'
});

module.exports = Sequelize;
module.exports = sequelize;