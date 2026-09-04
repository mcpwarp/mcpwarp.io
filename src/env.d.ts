/// <reference types="astro/client" />

// Starlight's internal virtual modules used when overriding built-in
// components (Header, Footer, ...). Starlight doesn't ship ambient types
// for these, so they're declared here loosely typed as `any` — the same
// modules Starlight's own default component implementations import.
// See https://starlight.astro.build/reference/overrides/
declare module 'virtual:starlight/user-config' {
  const config: any;
  export default config;
}

declare module 'virtual:starlight/components/*' {
  const Component: (_props: any) => any;
  export default Component;
}
