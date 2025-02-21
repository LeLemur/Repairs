// utils/taxCalculator.js – Determine tax rate based on state
exports.calculateTaxForState = (state) => {
  switch (state.toUpperCase()) {
    case 'CA': return 0.075;
    case 'NY': return 0.085;
    case 'TX': return 0.0625;
    default: return 0.06;
  }
};
