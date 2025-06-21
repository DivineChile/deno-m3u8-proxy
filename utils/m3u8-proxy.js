import {
  createLineTransform,
  allowedExtensions,
} from "../utils/line-transform.js";

export async function m3u8Proxy(ctx) {
  try {
    const url = ctx.request.url.searchParams.get("url");
    if (!url) {
      ctx.response.status = 400;
      ctx.response.body = "url is required";
      return;
    }

    const isStatic = allowedExtensions.some((ext) => url.endsWith(ext));
    const baseUrl = url.substring(0, url.lastIndexOf("/") + 1);

    const response = await fetch(url, {
      headers: {
        Referer: "https://megacloud.club/",
        Accept: "*/*",
      },
    });

    if (!response.ok || !response.body) {
      ctx.response.status = 502;
      ctx.response.body = "Failed to fetch upstream";
      return;
    }

    const headers = new Headers(response.headers);
    if (!isStatic) headers.delete("content-length");

    // Allow CORS
    headers.set("access-control-allow-origin", "*");

    ctx.response.status = 200;
    ctx.response.headers = headers;

    const upstreamStream = response.body;

    const resultStream = isStatic
      ? upstreamStream
      : upstreamStream.pipeThrough(createLineTransform(baseUrl));

    ctx.response.body = resultStream;
  } catch (err) {
    console.error(err);
    ctx.response.status = 500;
    ctx.response.body = "Internal Server Error";
  }
}
