const mongoose = require('mongoose');
const companySchema = new mongoose.Schema({
    name: {type: String, required: true, unique: true},
    description: {type: String, required: true},
    location: {type: String, required: true},
  },
  {timestamps: true},
);

module.exports= mongoose.models.Company || mongoose.model('Company', companySchema);