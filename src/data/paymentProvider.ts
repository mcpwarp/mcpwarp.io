// Single source of truth for the current payment provider. Used by
// src/components/PaymentProvider.astro (terms.astro, privacy.astro) and
// mirrored inline (with an HTML comment pointing back here) in
// src/content/docs/docs/how-to/billing.md, which can't import components.
//
// No provider is chosen yet. When one is, fill this in, e.g.:
//
// export const paymentProvider: PaymentProvider | null = {
//   name: 'Example Payments, Inc.',
//   shortName: 'Example Payments',
//   url: 'https://example-payments.com',
//   buyerTermsUrl: 'https://example-payments.com/legal/checkout-buyer-terms',
//   privacyUrl: 'https://example-payments.com/legal/privacy-policy',
//   since: 'September 2026',
// };
export type PaymentProvider = {
  name: string;
  shortName: string;
  url: string;
  buyerTermsUrl: string;
  privacyUrl: string;
  since: string;
};

export const paymentProvider: PaymentProvider | null = null;
