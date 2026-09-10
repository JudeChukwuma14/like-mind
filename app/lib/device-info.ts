const DEVICE_ID_KEY = "kajola_device_id";

export function getDeviceId(): string {
  try {
    const existing = localStorage.getItem(DEVICE_ID_KEY);
    if (existing) return existing;
    const id = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, id);
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

function detectOS(): string {
  const ua = navigator.userAgent;
  if (/windows/i.test(ua)) return "Windows";
  if (/iphone|ipad|ipod/i.test(ua)) return "iOS";
  if (/android/i.test(ua)) return "Android";
  if (/mac os/i.test(ua)) return "macOS";
  if (/linux/i.test(ua)) return "Linux";
  return "Unknown";
}

/**
 * SHA-256 of a few stable browser properties — matches the backend team's
 * own reference implementation exactly (X-Fingerprint header on
 * /api/Auth/google, and DeviceInfo.fingerprint on /api/User/Register).
 */
export async function computeFingerprint(): Promise<string> {
  const raw = [
    navigator.userAgent,
    navigator.platform,
    navigator.language,
    `${screen.width}x${screen.height}`,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    navigator.hardwareConcurrency,
  ].join("|");

  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}


async function fetchClientIp(): Promise<string> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch("https://api.ipify.org?format=json", { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) return "";
    const data = (await res.json()) as { ip?: string };
    return data.ip ?? "";
  } catch {
    return "";
  }
}

export type DeviceInfo = {
  deviceID: string;
  deviceOS: string;
  fingerprint: string;
  lastIp: string;
};

export async function collectDeviceInfo(): Promise<DeviceInfo> {
  const [fingerprint, lastIp] = await Promise.all([computeFingerprint(), fetchClientIp()]);
  return {
    deviceID: getDeviceId(),
    deviceOS: detectOS(),
    fingerprint,
    lastIp,
  };
}
