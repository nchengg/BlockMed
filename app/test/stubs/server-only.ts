// No-op stand-in for Next.js "server-only" under vitest. The real package has
// no runtime outside a Next build; it exists to fail the build if a server
// module is imported into a client bundle.
export {};
