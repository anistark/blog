const fs = require('fs');

// Reads width/height straight out of the image header so the templates can emit
// og:image:width / og:image:height without pulling in an image library.
// Returns null for anything it does not recognise.
module.exports = function imageSize(filePath) {
  let buf;
  try {
    buf = fs.readFileSync(filePath);
  } catch (err) {
    return null;
  }

  // PNG: 8 byte signature, then an IHDR chunk holding width/height big endian.
  if (buf.length > 24 && buf.readUInt32BE(0) === 0x89504e47) {
    return {
      width: buf.readUInt32BE(16),
      height: buf.readUInt32BE(20),
      type: 'image/png',
    };
  }

  // GIF: "GIF87a"/"GIF89a", then width/height little endian.
  if (buf.length > 10 && buf.toString('ascii', 0, 3) === 'GIF') {
    return {
      width: buf.readUInt16LE(6),
      height: buf.readUInt16LE(8),
      type: 'image/gif',
    };
  }

  // WEBP: a RIFF container whose first chunk carries the size, in one of three
  // shapes depending on how the file was encoded.
  if (
    buf.length > 30 &&
    buf.toString('ascii', 0, 4) === 'RIFF' &&
    buf.toString('ascii', 8, 12) === 'WEBP'
  ) {
    const chunk = buf.toString('ascii', 12, 16);
    if (chunk === 'VP8X') {
      return {
        width: buf.readUIntLE(24, 3) + 1,
        height: buf.readUIntLE(27, 3) + 1,
        type: 'image/webp',
      };
    }
    if (chunk === 'VP8 ') {
      return {
        width: buf.readUInt16LE(26) & 0x3fff,
        height: buf.readUInt16LE(28) & 0x3fff,
        type: 'image/webp',
      };
    }
    if (chunk === 'VP8L') {
      const bits = buf.readUInt32LE(21);
      return {
        width: (bits & 0x3fff) + 1,
        height: ((bits >> 14) & 0x3fff) + 1,
        type: 'image/webp',
      };
    }
    return null;
  }

  // JPEG: walk the segment markers until a start-of-frame carries the size.
  if (buf.length > 4 && buf.readUInt16BE(0) === 0xffd8) {
    let offset = 2;
    while (offset + 9 < buf.length) {
      if (buf[offset] !== 0xff) {
        offset += 1;
        continue;
      }
      const marker = buf[offset + 1];
      // SOF0..SOF15, minus the three markers in that range that are not frames.
      const isStartOfFrame =
        marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker);
      if (isStartOfFrame) {
        return {
          width: buf.readUInt16BE(offset + 7),
          height: buf.readUInt16BE(offset + 5),
          type: 'image/jpeg',
        };
      }
      offset += 2 + buf.readUInt16BE(offset + 2);
    }
  }

  return null;
};
