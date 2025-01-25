import type { PluginData } from "@cloudflare/pages-plugin-cloudflare-access";
interface Env {
  KV: KVNamespace;
}
export const onRequest: PagesFunction<unknown, any, PluginData> = async ({
  data,
}) => {
  return new Response(
    `Hello, ${data.cloudflareAccess.JWT.payload.email || "service user"}!`
  );
};
