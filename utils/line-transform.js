export const allowedExtensions = [
  ".ts",
  ".png",
  ".jpg",
  ".webp",
  ".ico",
  ".html",
  ".js",
  ".css",
  ".txt",
];

export function createLineTransform(baseUrl) {
  let buffer = "";

  return new TransformStream({
    transform(chunk, controller) {
      const text = buffer + new TextDecoder().decode(chunk);
      const lines = text.split(/\r?\n/);
      buffer = lines.pop() || "";

      const processed = lines
        .map((line) => {
          if (line.endsWith(".m3u8") || line.endsWith(".ts")) {
            return `m3u8-proxy?url=${baseUrl}${line}`;
          }
          if (allowedExtensions.some((ext) => line.endsWith(ext))) {
            return `m3u8-proxy?url=${line}`;
          }
          return line;
        })
        .join("\n");

      controller.enqueue(new TextEncoder().encode(processed + "\n"));
    },
    flush(controller) {
      if (buffer) {
        const line = buffer;
        let final = line;
        if (line.endsWith(".m3u8") || line.endsWith(".ts")) {
          final = `m3u8-proxy?url=${baseUrl}${line}`;
        } else if (allowedExtensions.some((ext) => line.endsWith(ext))) {
          final = `m3u8-proxy?url=${line}`;
        }
        controller.enqueue(new TextEncoder().encode(final));
      }
    },
  });
}
