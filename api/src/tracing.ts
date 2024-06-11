import { NodeTracerProvider } from '@opentelemetry/node';
import { SimpleSpanProcessor } from '@opentelemetry/tracing';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { trace } from '@opentelemetry/api';

const initTracing = (serviceName: string) => {
  const provider = new NodeTracerProvider({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
    }),
  });

  const exporter = new JaegerExporter({
    endpoint: 'http://tempo:14268/api/traces', // Replace with your Tempo endpoint
    // If Tempo requires specific headers for authorization, you can add them here
    // headers: {
    //   'Authorization': 'Basic <base64-encoded-auth>'
    // }
  });

  provider.addSpanProcessor(new SimpleSpanProcessor(exporter));

  // Initialize the OpenTelemetry APIs to use the NodeTracerProvider bindings
  provider.register();

  const tracer = trace.getTracer(serviceName);
  return tracer;
};

export default initTracing;