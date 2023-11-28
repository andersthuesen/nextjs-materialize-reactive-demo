import { LiveCounter } from "@/components/live-counter";
import { sql } from "@/services/db";
import { redis } from "@/services/redis";
import { MaybeRow, PendingQuery, RowList } from "postgres";

async function subscribe<T extends MaybeRow[]>(
  query: PendingQuery<T>
): Promise<[RowList<T>, string]> {
  // Create UUID
  const uuid = Math.random().toString(36).slice(7);
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
  const [currentCountData, uuid] = await subscribe(sql<{ count: number }[]>`
    SELECT count(*) AS count FROM counts
    WHERE slug = ${slug}
  `);

  const currentCount = currentCountData[0];

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1>{slug}</h1>
      <LiveCounter initialCount={currentCount!} uuid={uuid} />
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
    </main>
  );
}
