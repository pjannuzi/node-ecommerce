const path = require('path');

const express = require('express');

const errorController = require('./controllers/error');
const sequelize = require('./util/database');
const Product = require('./models/product');
const User = require('./models/user');
const Cart = require('./models/cart');
const CartItem = require('./models/cart-item');
const Order = require('./models/order');
const OrderItem = require('./models/order-item');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    User.findByPk(1)
    .then(user => {
        req.user = user;
        next();
    })
    .catch(err => console.log(err));
});

app.use('/admin',  adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

Product.belongsTo(User, {constraints: true, onDelete: 'CASCADE'});
Product.belongsToMany(Cart, { through: CartItem });
User.hasMany(Product);
User.hasOne(Cart);
User.hasMany(Order);
Cart.belongsTo(User);
Cart.belongsToMany(Product, { through: CartItem });
Order.belongsTo(User);
Order.belongsToMany(Product, { through: OrderItem });


sequelize
//.sync({force: true})
.sync()
.then(result => {
    return User.findByPk(1);
})
.then(user =>{
    if (!user){
        return User.create({name: 'Pedro', email:'pjannuzi@gmail.com'});
    }
    return user;
})
.then(user =>{
    return user.createCart();
    
})
.then(cart => {
    app.listen(3000);
})
.catch(err => {
    console.log(err)
});

