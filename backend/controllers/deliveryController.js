const serviceabilityService = require('../services/serviceability.service');

exports.checkServiceability = (req, res) => {
  const result = serviceabilityService.check(req.query.pincode);
  res.json({ success: true, ...result });
};

exports.getCoverage = (req, res) => {
  res.json({ success: true, ...serviceabilityService.coverage() });
};
