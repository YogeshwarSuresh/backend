const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const dotenv = require("dotenv");
const cors = require('cors');
const path = require('path');
dotenv.config();

const dbConnect = require("./config/dbConnect");
const userController = require("./controllers/userController");
const productController = require("./controllers/productController");
const companyController = require('./controllers/companyController');
const priceController = require("./controllers/priceController");
const inventoryController = require("./controllers/inventoryController");
const orderController = require("./controllers/orderController");
const cartController = require("./controllers/cartController");

const app = express();
dbConnect().then(() => console.log("DB Connected"));
app.use(logger('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use('/user', userController);
app.use('/product', productController);
app.use('/company', companyController);
app.use('/price', priceController);
app.use('/inventory', inventoryController);
app.use('/order', orderController);
app.use('/cart', cartController);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});