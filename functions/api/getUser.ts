import { getIdentity } from "@cloudflare/pages-plugin-cloudflare-access/api";

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

  const cookies = getCookies(context.request);
  if (!cookies.CF_Authorization) {
    return new Response("unauthorized", { status: 401 });
  }
  const identity = await getIdentity({
    jwt: cookies.CF_Authorization,
    domain: "https://kaimenkogaku.cloudflareaccess.com/",
  });
  if (!identity) {
    return new Response("invalid user", { status: 401 });
  }
  const user_uuid = identity?.user_uuid || "";

  return new Response(user_uuid, { status: 200 });
};
