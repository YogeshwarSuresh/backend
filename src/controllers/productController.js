const express = require('express');
const productService = require('../services/productService');
const authMiddleware = require('../middlewares/authMiddleware.js');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for storing uploaded files
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = 'uploads/products';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    // Create unique filename: timestamp-originalname
    const uniqueFileName = Date.now() + '-' + file.originalname.replace(/\s+/g, '-');
    cb(null, uniqueFileName);
  }
});

// File filter function to accept only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only .jpg, .jpeg, .png, and .webp format allowed!'), false);
  }
};

// Initialize multer upload
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB size limit
  }
});

const router = express.Router();

// Serve static files from uploads directory
router.use('/images', express.static(path.join(__dirname, '../../uploads/products')));

// Create new product with image upload
router.post('/', authMiddleware, async (req, res) => {
  try {
    // If role validation is needed
    if (req.user.role !== "admin") {
      // If file was uploaded, delete it since user isn't authorized
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(403).send({error: 'You do not have permission to perform this action'});
    }


    const product = await productService.createProduct(req.body);
    res.status(201).send({data: product});
  } catch (error) {
    // If file was uploaded but product creation failed, delete file
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(400).send({error: error.message});
  }
});

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await productService.getProductById(req.params.id);
    if (!product) {
      return res.status(404).send({error: 'Product not found'});
    }
    res.send({data: product});
  } catch (error) {
    res.status(400).send({error: error.message});
  }
});

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await productService.getProducts();
    res.send({data: products});
  } catch (error) {
    res.status(400).send({error: error.message});
  }
});

// Update product (with image update)
router.put('/:id', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    if(req.user.role !=="admin") {
      // If file was uploaded, delete it since user isn't authorized
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(403).send({error: 'You do not have permission to perform this action'});
    }

    // Get current product to check for existing image
    const existingProduct = await productService.getProductById(req.params.id);

    // Add image path to update data if a new file was uploaded
    const updateData = req.body;
    if (req.file) {
      // Delete old image if it exists
      if (existingProduct && existingProduct.imagePath) {
        const oldImagePath = path.join(__dirname, '../../uploads/products',
          path.basename(existingProduct.imagePath));
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      updateData.imagePath = `/product/images/${req.file.filename}`;
    }

    const product = await productService.updateProduct(req.params.id, updateData);
    const updatedProduct = await productService.getProductById(req.params.id);
    res.send({data: updatedProduct});
  } catch (error) {
    // If file was uploaded but update failed, delete file
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(400).send({error: error.message});
  }
});

// Delete product
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    if(req.user.role !=="admin") {
      return res.status(403).send({error: 'You do not have permission to perform this action'});
    }

    // Get product to check for image
    const product = await productService.getProductById(req.params.id);

    // Delete product image if it exists
    if (product && product.imagePath) {
      const imagePath = path.join(__dirname, '../../uploads/products',
        path.basename(product.imagePath));
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    const result = await productService.deleteProduct(req.params.id);
    res.send({data: "Deleted product"});
  } catch (error) {
    res.status(400).send({error: error.message});
  }
});

module.exports = router;