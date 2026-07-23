import type { LookupAddress, LookupOptions } from "node:dns";
import { lookup } from "node:dns/promises";
import { request as httpsRequest } from "node:https";
import type { IncomingMessage } from "node:http";
import { isIP, type LookupFunction } from "node:net";
import { Readable } from "node:stream";

export type PublicAddress = {
  address: string;
  family: 4 | 6;
};

type AddressResolver = (hostname: string) => Promise<readonly LookupAddress[]>;

const NON_PUBLIC_IPV4_RANGES: ReadonlyArray<readonly [number, number]> = [
  [0x00000000, 8], // Current network
  [0x0a000000, 8], // Private use
  [0x64400000, 10], // Shared address space
  [0x7f000000, 8], // Loopback
  [0xa9fe0000, 16], // Link-local
  [0xac100000, 12], // Private use
  [0xc0000000, 24], // IETF protocol assignments
  [0xc0000200, 24], // Documentation
  [0xc0586300, 24], // Deprecated 6to4 relay anycast
  [0xc0a80000, 16], // Private use
  [0xc6120000, 15], // Benchmarking
  [0xc6336400, 24], // Documentation
  [0xcb007100, 24], // Documentation
  [0xe0000000, 4], // Multicast
  [0xf0000000, 4], // Reserved and limited broadcast
];

function matchesPrefix(
  bytes: Uint8Array,
  prefix: Uint8Array,
  prefixLength: number,
) {
  const wholeBytes = Math.floor(prefixLength / 8);
  for (let index = 0; index < wholeBytes; index += 1) {
    if (bytes[index] !== prefix[index]) return false;
  }

  const remainingBits = prefixLength % 8;
  if (!remainingBits) return true;
  const mask = (0xff << (8 - remainingBits)) & 0xff;
  return ((bytes[wholeBytes] ?? 0) & mask) === ((prefix[wholeBytes] ?? 0) & mask);
}

function parseIpv4Bytes(address: string) {
  if (isIP(address) !== 4) return null;
  const bytes = address.split(".").map(Number);
  return bytes.length === 4 ? Uint8Array.from(bytes) : null;
}

function parseIpv6Bytes(address: string) {
  if (isIP(address) !== 6 || address.includes("%")) return null;

  let normalized = address.toLowerCase();
  if (normalized.includes(".")) {
    const separator = normalized.lastIndexOf(":");
    const ipv4 = parseIpv4Bytes(normalized.slice(separator + 1));
    if (!ipv4) return null;
    normalized = `${normalized.slice(0, separator)}:${(
      (ipv4[0] << 8) |
      ipv4[1]
    ).toString(16)}:${((ipv4[2] << 8) | ipv4[3]).toString(16)}`;
  }

  const halves = normalized.split("::");
  if (halves.length > 2) return null;
  const left = halves[0] ? halves[0].split(":") : [];
  const right = halves.length === 2 && halves[1] ? halves[1].split(":") : [];
  const missingWords = 8 - left.length - right.length;
  if (
    (halves.length === 1 && missingWords !== 0) ||
    (halves.length === 2 && missingWords < 1)
  ) {
    return null;
  }

  const words = [
    ...left,
    ...Array.from({ length: missingWords }, () => "0"),
    ...right,
  ].map((word) => Number.parseInt(word, 16));
  if (
    words.length !== 8 ||
    words.some((word) => !Number.isInteger(word) || word < 0 || word > 0xffff)
  ) {
    return null;
  }

  return Uint8Array.from(
    words.flatMap((word) => [(word >>> 8) & 0xff, word & 0xff]),
  );
}

function isPublicIpv4(bytes: Uint8Array) {
  const value =
    (((bytes[0] << 24) >>> 0) |
      (bytes[1] << 16) |
      (bytes[2] << 8) |
      bytes[3]) >>>
    0;

  return !NON_PUBLIC_IPV4_RANGES.some(([network, prefixLength]) => {
    const mask =
      prefixLength === 0 ? 0 : (0xffffffff << (32 - prefixLength)) >>> 0;
    return (value & mask) === (network & mask);
  });
}

/**
 * Returns true only for ordinary globally routable IPv4 or IPv6 destinations.
 * Special-purpose ranges are rejected even when they appear through an
 * IPv4-mapped IPv6 spelling.
 */
export function isPublicInternetAddress(address: string) {
  const ipv4 = parseIpv4Bytes(address);
  if (ipv4) return isPublicIpv4(ipv4);

  const ipv6 = parseIpv6Bytes(address);
  if (!ipv6) return false;

  const mappedPrefix = Uint8Array.from([
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0xff, 0xff,
  ]);
  if (matchesPrefix(ipv6, mappedPrefix, 96)) {
    return isPublicIpv4(ipv6.slice(12));
  }

  // Ordinary global unicast addresses are currently allocated from 2000::/3.
  if ((ipv6[0] & 0xe0) !== 0x20) return false;

  // The broad 2001::/23 special-purpose block includes Teredo, benchmarking,
  // ORCHID, AMT, and other protocol assignments rather than website endpoints.
  if (
    matchesPrefix(ipv6, Uint8Array.from([0x20, 0x01, 0x00]), 23) ||
    matchesPrefix(ipv6, Uint8Array.from([0x20, 0x01, 0x0d, 0xb8]), 32) ||
    matchesPrefix(ipv6, Uint8Array.from([0x20, 0x02]), 16) ||
    matchesPrefix(ipv6, Uint8Array.from([0x3f, 0xff, 0x00]), 20)
  ) {
    return false;
  }

  return true;
}

export async function resolvePublicAddresses(
  hostname: string,
  resolver: AddressResolver = (value) =>
    lookup(value, { all: true, verbatim: true }),
) {
  const resolved = await resolver(hostname);
  if (!resolved.length) throw new Error("Homepage address could not be resolved");

  const addresses = resolved.map(({ address, family }) => {
    const detectedFamily = isIP(address);
    if (
      (detectedFamily !== 4 && detectedFamily !== 6) ||
      family !== detectedFamily ||
      !isPublicInternetAddress(address)
    ) {
      throw new Error("Unsafe homepage address");
    }

    return { address, family: detectedFamily } satisfies PublicAddress;
  });

  return [
    ...new Map(
      addresses.map((candidate) => [
        `${candidate.family}:${candidate.address}`,
        candidate,
      ]),
    ).values(),
  ];
}

export function createPinnedAddressLookup(
  target: PublicAddress,
): LookupFunction {
  return (
    _hostname: string,
    options: LookupOptions,
    callback: (
      error: NodeJS.ErrnoException | null,
      address: string | LookupAddress[],
      family?: number,
    ) => void,
  ) => {
    if (options.all) {
      callback(null, [target]);
      return;
    }
    callback(null, target.address, target.family);
  };
}

function responseHeaders(response: IncomingMessage) {
  const headers = new Headers();
  for (const [name, value] of Object.entries(response.headers)) {
    if (Array.isArray(value)) {
      for (const item of value) headers.append(name, item);
    } else if (value !== undefined) {
      headers.set(name, value);
    }
  }
  return headers;
}

function requestPinnedAddress(
  url: URL,
  target: PublicAddress,
  headers: Record<string, string>,
  timeoutMs: number,
) {
  return new Promise<Response>((resolve, reject) => {
    const request = httpsRequest(
      url,
      {
        method: "GET",
        headers,
        lookup: createPinnedAddressLookup(target),
        rejectUnauthorized: true,
        servername: url.hostname,
        signal: AbortSignal.timeout(timeoutMs),
      },
      (incoming) => {
        const status = incoming.statusCode ?? 502;
        const bodyForbidden = status === 204 || status === 205 || status === 304;
        const body = bodyForbidden
          ? null
          : (Readable.toWeb(incoming) as ReadableStream<Uint8Array>);
        resolve(
          new Response(body, {
            status,
            statusText: incoming.statusMessage,
            headers: responseHeaders(incoming),
          }),
        );
      },
    );
    request.once("error", reject);
    request.end();
  });
}

/**
 * Performs an HTTPS GET through an already-validated DNS answer. The custom
 * lookup pins the socket to that address while `servername` and the URL
 * hostname preserve normal certificate and Host-header validation.
 */
export async function fetchPinnedHttps(
  url: URL,
  addresses: readonly PublicAddress[],
  options: {
    headers: Record<string, string>;
    timeoutMs: number;
  },
) {
  const deadline = Date.now() + options.timeoutMs;
  let lastError: unknown = new Error("Homepage unavailable");

  for (const target of addresses) {
    const remainingMs = deadline - Date.now();
    if (remainingMs <= 0) break;
    try {
      return await requestPinnedAddress(
        url,
        target,
        options.headers,
        remainingMs,
      );
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}
