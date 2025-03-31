const Company = require('../models/company');
const {authenticate} = require("./userService");

const createCompany = async (data) => {
    return Company.create(data);
};

const getCompanies = async () => {
    return Company.find();
};

const getCompanyById = async (id) => {
    return Company.findById(id);
};

const updateCompany = async (id, data) => {
    return Company.updateOne(id, {$set: data});
};

const deleteCompany = async (id) => {
    return Company.updateOne(id, {$set: {isDeleted: true}});
};

module.exports = {createCompany, authenticate, getCompanies, getCompanyById, updateCompany, deleteCompany};