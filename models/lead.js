const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema({
  leadId: String,
  formId: String,
  createdTime: Date,
  fieldData: [
    {
      name: String,
      values: [String]
    }
  ]
});

module.exports = mongoose.model('Lead', LeadSchema,'Leads');
