import { CRPCInstrumentation } from '@cybermp/rpc-otel';
import { logs } from '@opentelemetry/api-logs';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-proto';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import {
  LoggerProvider,
  SimpleLogRecordProcessor,
} from '@opentelemetry/sdk-logs';
import { NodeSDK } from '@opentelemetry/sdk-node';

const initMetrics = () => {
  const authHeader = process.env.OTEL_EXPORTER_OTLP_HEADERS;

  if (
    !authHeader ||
    !process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT ||
    !process.env.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT
  ) {
    return;
  }

  const logExporter = new OTLPLogExporter({
    url: process.env.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT,
    headers: { Authorization: authHeader },
  });

  const loggerProvider = new LoggerProvider({
    processors: [new SimpleLogRecordProcessor({ exporter: logExporter })],
  });

  logs.setGlobalLoggerProvider(loggerProvider);

  const traceExporter = new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT,
    headers: {
      Authorization: authHeader,
    },
  });

  const sdk = new NodeSDK({
    serviceName: 'cybermp-freeroam-server',
    traceExporter,
    instrumentations: [new CRPCInstrumentation()],
  });

  sdk.start();

  process.on('SIGTERM', () => {
    sdk
      .shutdown()
      .then(() => console.log('Tracing terminated'))
      .catch((error) => console.error('Error terminating tracing', error))
      .finally(() => process.exit(0));
  });
};

void initMetrics();
