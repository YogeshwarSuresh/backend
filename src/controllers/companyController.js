const express = require('express');
const companyService = require('../services/companyService.js');
const authMiddleware = require('../middlewares/authMiddleware.js');

const router = express.Router();

// Create a new company (Protected - Admin Only)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const company = await companyService.createCompany(req.body);
    return res.send({ data: company });
  } catch (error) {
    return res.send({ error: error.message });
  }
});

// Get all companies
router.get('/', async (req, res) => {
  try {
    const companies = await companyService.getCompanies();
    return res.send({ data: companies });
  } catch (error) {
    return res.send({ error: error.message });
  }
});

// Get company by ID
router.get('/:companyId', async (req, res) => {
  try {
    const company = await companyService.getCompanyById(req.params.companyId);
    return res.send({ data: company });
  } catch (error) {
    return res.send({ error: error.message });
  }
});

// Update company details (Protected - Admin Only)
router.put('/:companyId', authMiddleware, async (req, res) => {
  try {
    const updatedCompany = await companyService.updateCompany(req.params.companyId, req.body);
    return res.send({ data: updatedCompany });
  } catch (error) {
    return res.send({ error: error.message });
  }
});

// Delete a company (Protected - Admin Only)
router.delete('/:companyId', authMiddleware, async (req, res) => {
  try {
    const message = await companyService.deleteCompany(req.params.companyId);
    return res.send({ data: message });
  } catch (error) {
    return res.send({ error: error.message });
  }
});

module.exports = router;