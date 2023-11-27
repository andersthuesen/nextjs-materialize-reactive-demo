import { Subscribe } from "@/components/subscribe";
import { sql } from "@/services/db";
import { redis } from "@/services/redis";
import { MaybeRow, PendingQuery, RowList } from "postgres";

async function subscribe<T extends MaybeRow[]>(
  query: PendingQuery<T>
): Promise<[RowList<T>, string]> {
  // Create UUID

  const uuid = Math.random().toString(36).slice(7);

  const test = await sql`${query}`.describe();
  const serializedQuery = JSON.stringify(query);

  await redis.set(`query:${uuid}`, serializedQuery, "EX", 60);

  // Create subscription

  return [await query, uuid];
}

export default async function Home({
  params: { slug },
}: {
  params: { slug: string };
}) {
  const [currentCount, uuid] = await subscribe(sql`
    SELECT count(*) AS count FROM counts
    WHERE slug = ${slug}
  `);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1>{slug}</h1>
      <h2>Current count: {currentCount.at(0)?.count}</h2>
      <h2>UUID: {uuid}</h2>
      <form>
        <button
          formAction={async () => {
            "use server";
            await sql`
              INSERT INTO counts (slug) VALUES (${slug})
            `;
          }}
        >
          Add count
        </button>
      </form>
      <Subscribe uuid={uuid} />
    </main>
  );
}
