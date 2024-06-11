import client from 'prom-client';

// Create a Registry which registers the metrics
const register = new client.Registry();

// Add a default label which is added to all metrics
register.setDefaultLabels({
  app: 'example-app'
});

// Enable the collection of default metrics
client.collectDefaultMetrics({ register });

// Create a custom histogram metric for request durations
const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route', 'code']
});

// Register the histogram
register.registerMetric(httpRequestDurationMicroseconds);

export { register, httpRequestDurationMicroseconds };