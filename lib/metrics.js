const metrics = {
  requests_total: 0,
  webhook_validations_total: 0,
  webhook_accepts_total: 0,
  webhook_rejects_total: 0,
  webhook_errors_total: 0,
  webhook_empty_products_total: 0,
};

function incrementMetric(name, amount = 1) {
  if (typeof metrics[name] !== 'number') {
    metrics[name] = 0;
  }

  metrics[name] += amount;
}

module.exports = {
  metrics,
  incrementMetric,
};
