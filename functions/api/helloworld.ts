import type { PluginData } from "@cloudflare/pages-plugin-cloudflare-access";
import { getIdentity } from "@cloudflare/pages-plugin-cloudflare-access/api";

interface Env {
  KV: KVNamespace;
}

function getCookies(request: Request): {
  [name: string]: string;
} {
  let result: {
    [name: string]: string;
  } = {};
  const cookieString = request.headers.get("Cookie");
  if (cookieString) {
    const cookies = cookieString.split(";");
    cookies.forEach((cookie) => {
      const cookiePair = cookie.split("=", 2);
      const cookieName = cookiePair[0].trim();
      result[cookieName] = cookiePair[1];
    });
  }
  return result;
}
export const onRequestGet = async (context: any): Promise<Response> => {
  const url = new URL(context.request.url);
  // const cookies = getCookies(context.request);
  /** identity sample
   * {
          "email": "tenshow@test.com",
          "idp": {
            "id": "ae2bcd4a-45ff-e522-a002-5f71fcae932b",
            "type": "onetimepin"
          },
          "geo": {
            "country": "JP"
          },
          "user_uuid": "bb23f14d-5e16-981c-956b-8a0593061e8f",
          "account_id": "633c8797710f8c47e02d660b55d1881a",
          "iat": 1736977860,
          "ip": "2400:fe97:4051:c41:18b9:db65:3b00:a1da",
          "auth_status": "NONE",
          "common_name": "",
          "service_token_id": "",
          "service_token_status": false,
          "is_warp": false,
          "is_gateway": false,
          "device_id": "",
          "version": 0
        }
   */
  // const identity = await getIdentity({
  //   jwt: cookies.CF_Authorization,
  //   domain: "https://kaimenkogaku.cloudflareaccess.com/",
  // });

  // const account_id = identity?.account_id || "";

  // console.log(
  //   `[LOGGING FROM /hello]: Request came from ${context.request.url}`
  // );
  console.log(context);
  console.log(context.data.account_id);
  // console.log(identity);
  // return new Response("hello user account = " + account_id, { status: 200 });
  return new Response("hello user", { status: 200 });
};
