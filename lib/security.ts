import { URL } from "url";

/**
 * Validates if a URL is a safe public URL to fetch from.
 * Blocks SSRF by preventing access to internal, reserved, and private IP ranges.
 */
export function isSafePublicUrl(input: string): boolean {
    try {
        const url = new URL(input);

        // Only allow http and https
        if (url.protocol !== "http:" && url.protocol !== "https:") {
            return false;
        }

        const host = url.hostname;

        // Reject IP literals (e.g., http://127.0.0.1)
        // This is a basic check; real-world production might use dns-lookup to resolve hostnames.
        const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
        if (ipRegex.test(host)) {
            return isPublicIp(host);
        }

        // Block common internal/local hostnames
        const localHostnames = ["localhost", "local", "internal", "intranet", "dev"];
        if (localHostnames.includes(host.toLowerCase())) {
            return false;
        }

        return true;
    } catch (err) {
        return false;
    }
}

/**
 * Checks if an IP address is in a public range.
 * Portability: This covers common private and reserved ranges.
 */
function isPublicIp(ip: string): boolean {
    const parts = ip.split(".").map(Number);

    // Private network ranges:
    // 10.0.0.0 - 10.255.255.255
    if (parts[0] === 10) return false;
    // 172.16.0.0 - 172.31.255.255
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return false;
    // 192.168.0.0 - 192.168.255.255
    if (parts[0] === 192 && parts[1] === 168) return false;

    // Local Loopback: 127.0.0.0/8
    if (parts[0] === 127) return false;

    // Link Local: 169.254.0.0/16
    if (parts[0] === 169 && parts[1] === 254) return false;

    // Reserved/Experimental ranges
    if (parts[0] === 0 || parts[0] >= 224) return false;

    return true;
}
