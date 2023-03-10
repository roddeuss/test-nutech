const express = require("express");
const router = express.Router();
const Product = require('../models/product');
const multer = require("multer");
const fs = require('fs');

// image upload
var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads');
    },
    filename: function(req,file,cb) {
        cb(null, file.fieldname +"_"+ Date.now() +"_"+ file.originalname)
    },
});

var fileFilter = function (req, file, cb) {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
        cb(null, true);
    } else {
        cb(new Error('Only PNG and jpg images are allowed.'));
    }
};

var upload = multer({
    storage: storage,
    limits: {
        fileSize: 100000 // in bytes
    },
    fileFilter: fileFilter
}).single("image");

//insert a product
router.post('/add', upload, async (req, res) => {
    const product = new Product({
        name: req.body.name,
        buyPrice: req.body.buyPrice,
        sellPrice: req.body.sellPrice,
        stock: req.body.stock,
        imageProduct: req.file.filename
    });

    try {
        await product.save();
        req.session.message = {
            type: 'success',
            message: 'Success Add Product',
        };
        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Unable to save the product.'});
    }
});

router.get('/', (req, res) => {
   Product.find()
        .then(products => {
            res.render('index', {
                title: 'Home Page',
                products: products
            });
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({error: 'Unable to retrieve products from the database.'});
        });
});

router.get('/add', (req, res) => {
    res.render('add_product', {title: 'Add Product'});
});


//edit product
router.get('/edit/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        res.render('edit_product', { title: 'Edit Product', product: product });
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Unable to retrieve the product.'});
    }
});

// updateProduct
router.post('/update/:id', upload, async (req, res) => {
    let id = req.params.id;
    let product = {};
    product.name = req.body.name;
    product.buyPrice = req.body.buyPrice;
    product.sellPrice = req.body.sellPrice;
    product.stock = req.body.stock;
    if (req.file) {
        product.imageProduct = req.file.filename;
    } else {
        product.imageProduct = req.body.old_image;
    }

    try {
        await Product.findByIdAndUpdate(id, product);
        req.session.message = {
            type: 'success',
            message: 'Success Update Product',
        };
        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Unable to update the product.'});
    }
});

//delete product
router.get('/delete/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (product.imageProduct) {
            fs.unlinkSync(`./uploads/${product.imageProduct}`);
        }

        await Product.findByIdAndRemove(req.params.id);

        req.session.message = {
            type: 'success',
            message: 'Product successfully deleted'
        };

        res.redirect('/');
    } catch (error) {
        console.error(error);
        req.session.message = {
            type: 'error',
            message: 'Unable to delete the product.'
        };
        res.redirect('/');
    }
});

module.exports = router;
