// @ts-nocheck
import destr from "destr";

export interface ResponseMap {
  blob: Blob;
  text: string;
  arrayBuffer: ArrayBuffer;
  stream: ReadableStream<Uint8Array>;
}

export type ResponseType = keyof ResponseMap | "json";

const JSON_RE = /^application\/(?:[\w!#$%&*.^`~-]*\+)?json(;.+)?$/i;

const textTypes = new Set([
  "image/svg",
  "application/xml",
  "application/xhtml",
  "application/html",
]);

export function detectResponseType(_contentType = ""): ResponseType {
  if (!_contentType) {
    return "json";
  }

  // Value might look like: `application/json; charset=utf-8`
  const contentType = _contentType.split(";").shift() || "";

  if (JSON_RE.test(contentType)) {
    return "json";
  }

  // TODO
  // if (contentType === 'application/octet-stream') {
  //   return 'stream'
  // }

  if (textTypes.has(contentType) || contentType.startsWith("text/")) {
    return "text";
  }

  return "blob";
}

export default () => {
  const nullBodyResponses = new Set([101, 204, 205, 304]);
  const _fetch = globalThis.$fetch;
  async function $$fetch(arg1, options = {}, ...rest) {
    return await _fetch(arg1, {
      ...options,
      async onResponse(context) {
        if (!context.response.body) {
          const allowParse = !nullBodyResponses.has(context.response.status) &&
            context.options.method !== "HEAD";
          if (allowParse) {
            const responseType = (context.options.parseResponse
              ? "json"
              : context.options.responseType) || detectResponseType(
                context.response.headers.get("content-type") || "",
              );
            switch (responseType) {
              case "json": {
                const data = await context.response.text();
                const parseFunction = context.options.parseResponse || destr;
                context.response._data = parseFunction(data);
                break;
              }
              case "stream": {
                context.response._data = context.response.body || // @ts-ignore Compatible with QQ Browser on iOS
                  context.response._bodyInit?.stream() || // @ts-ignore Compatible with QQ Browser on iOS
                  context.response._bodyBlob?.stream();
                break;
              }
              default: {
                context.response._data = await context.response[responseType]();
              }
            }
          }
        }
        if (options.onResponse) {
          return await options.onResponse(context);
        }
      },
    }, ...rest);
  }

  globalThis.$fetch = $$fetch.bind(_fetch);

  Object.keys(_fetch).forEach((key) => {
    globalThis.$fetch[key] = _fetch[key];
  });
};
