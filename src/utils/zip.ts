/**
 * Minimal, dependency-free ZIP writer (STORE / no compression).
 * Perfect for bundling SVG, PNG and TXT assets into one download.
 */

export interface ZipEntry {
  /** Path inside the archive, e.g. "logos/resqlink-mark.svg". */
  name: string;
  data: Uint8Array | string;
}

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

export function createZip(entries: ZipEntry[]): Blob {
  const encoder = new TextEncoder();
  const now = new Date();

  const local: number[] = [];
  const central: number[] = [];
  let offset = 0;

  const w16 = (target: number[], value: number) => {
    target.push(value & 0xff, (value >>> 8) & 0xff);
  };
  const w32 = (target: number[], value: number) => {
    target.push(
      value & 0xff,
      (value >>> 8) & 0xff,
      (value >>> 16) & 0xff,
      (value >>> 24) & 0xff
    );
  };
  const wBytes = (target: number[], bytes: Uint8Array) => {
    for (let i = 0; i < bytes.length; i++) target.push(bytes[i]);
  };

  const time =
    ((now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1)) & 0xffff;
  const date =
    (((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate()) & 0xffff;

  entries.forEach((entry) => {
    const nameBytes = encoder.encode(entry.name);
    const data = typeof entry.data === 'string' ? encoder.encode(entry.data) : entry.data;
    const crc = crc32(data);
    const size = data.length;
    const localOffset = offset;

    // ---- local file header
    w32(local, 0x04034b50);
    w16(local, 20);
    w16(local, 0);
    w16(local, 0); // store
    w16(local, time);
    w16(local, date);
    w32(local, crc);
    w32(local, size);
    w32(local, size);
    w16(local, nameBytes.length);
    w16(local, 0);
    wBytes(local, nameBytes);
    wBytes(local, data);

    offset += 30 + nameBytes.length + size;

    // ---- central directory record
    w32(central, 0x02014b50);
    w16(central, 20);
    w16(central, 20);
    w16(central, 0);
    w16(central, 0);
    w16(central, time);
    w16(central, date);
    w32(central, crc);
    w32(central, size);
    w32(central, size);
    w16(central, nameBytes.length);
    w16(central, 0);
    w16(central, 0);
    w16(central, 0);
    w16(central, 0);
    w32(central, 0);
    w32(central, localOffset);
    wBytes(central, nameBytes);
  });

  const centralSize = central.length;
  const end: number[] = [];
  w32(end, 0x06054b50);
  w16(end, 0);
  w16(end, 0);
  w16(end, entries.length);
  w16(end, entries.length);
  w32(end, centralSize);
  w32(end, offset);
  w16(end, 0);

  const all = new Uint8Array(local.length + central.length + end.length);
  all.set(local, 0);
  all.set(central, local.length);
  all.set(end, local.length + central.length);

  return new Blob([all], { type: 'application/zip' });
}
