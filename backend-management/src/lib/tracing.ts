import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME, SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

const sdk = new NodeSDK({
    resource: resourceFromAttributes({
        [ATTR_SERVICE_NAME]: process.env.OTEL_SERVICE_NAME || 'backend-management',
        [SemanticResourceAttributes.SERVICE_VERSION]: process.env.OTEL_SERVICE_VERSION || '1.0.0',
        [SemanticResourceAttributes.SERVICE_NAMESPACE]: process.env.OTEL_SERVICE_NAMESPACE || 'url-shortener',
    }),
    traceExporter: new OTLPTraceExporter({
        url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4317/v1/traces',
    }),
    instrumentations: [
        getNodeAutoInstrumentations({
            '@opentelemetry/instrumentation-http': {
                enabled: true,
            },
            '@opentelemetry/instrumentation-express': {
                enabled: true,
            },
            '@opentelemetry/instrumentation-pg': {
                enabled: true,
            },
        }),
    ],
});

export function initTracing() {
    sdk.start();
    console.log('Tracing initialized');

    process.on('SIGTERM', () => {
        sdk
            .shutdown()
            .then(() => console.log('Tracing terminated'))
            .catch((error: Error) => console.log('Error terminating tracing', error))
            .finally(() => process.exit(0));
    });
} 