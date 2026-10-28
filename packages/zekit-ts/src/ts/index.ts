export * from "./schemas";
export * from "./receipt";
export * from "./zip321";
export * from "./ua";

export const ZEKIT_TAGLINE =
  "Shielded Tx in Minutes. Stop integrating 8 components. Use one kit.";

/**
 * Initialize the underlying `zekit-wasm` WebAssembly module when running in browsers.
 *
 * TODO(Phase 2): Load generated `pkg/zekit_wasm.js` module with graceful fallback.
 */
export async function initZeKitWasm(): Promise<void> {
  // TODO(Phase 2): Dynamically initialize wasm-pack output when available
}
