// Third-party (and self-hosted) services MCP Warp relies on. Rendered as a
// table on /privacy/ — see src/pages/privacy.astro. The payment provider row
// is not listed here; it's derived from src/data/paymentProvider.ts and
// rendered separately when a provider is set.
export interface Provider {
  name: string;
  purpose: string;
  selfHosted: boolean;
  privacyUrl: string | null;
}

export const providers: Provider[] = [
  {
    name: 'Cloudflare',
    purpose: 'Network edge: TLS termination and DDoS protection',
    selfHosted: false,
    privacyUrl: 'https://www.cloudflare.com/privacypolicy/',
  },
  {
    name: 'Hosting provider',
    purpose: 'Website and service hosting',
    selfHosted: false,
    privacyUrl: null,
  },
  {
    name: 'Keycloak',
    purpose: 'Authentication for the dashboard, CLI, and MCP-client OAuth',
    selfHosted: true,
    privacyUrl: 'https://www.keycloak.org/privacy',
  },
  {
    name: 'PostgreSQL',
    purpose: 'Account, server, and subscription storage',
    selfHosted: true,
    privacyUrl: null,
  },
  {
    name: 'NATS',
    purpose: 'Internal event streaming',
    selfHosted: true,
    privacyUrl: null,
  },
  {
    name: 'OpenTelemetry',
    purpose: 'Service health monitoring',
    selfHosted: true,
    privacyUrl: null,
  },
];
