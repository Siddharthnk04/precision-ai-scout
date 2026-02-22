/**
 * Lightweight internal analytics layer.
 * Logs events to the console for monitoring user interactions.
 */
export function track(event: string) {
    console.log(`[analytics] ${event}`);
}
