import { api } from "encore.dev/api";
import { SQLDatabase } from "encore.dev/storage/sqldb";
import { randomBytes } from "node:crypto";
import { APIError } from "encore.dev/api";
interface URL {
  id: string; // short-form URL id
  url: string; // complete URL, in long form
}

interface ShortenParams {
  url: string; // the URL to shorten
}

const db = new SQLDatabase("url", { migrations: "./migrations" });


// Shortens a URL.
export const shorten = api(
  { method: "POST", path: "/url", expose: true },
  async ({ url }: ShortenParams): Promise<URL> => {
    const id = randomBytes(6).toString("base64url");
    await db.exec`
      INSERT INTO url (id, original_url)
      VALUES (${id}, ${url})
    `;
    return { id, url };
  }
);




export const get = api(
  { method: "GET", path: "/url/:id", expose: true },
  async ({ id }: { id: string }): Promise<URL> => {
    const row = await db.queryRow`
      SELECT original_url FROM url WHERE id = ${id}
    `;
    if (!row) throw APIError.notFound("url not found");
    return { id, url: row.original_url };
  }
);

