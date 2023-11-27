import { sql } from "@/services/db";
import { redis } from "@/services/redis";
import { NextRequest } from "next/server";

class TaggedTemplateStrings extends Array<string> {
  readonly raw: string[];

  constructor(strings: string[]) {
    super(...strings);
    this.raw = strings;
  }
}

export async function GET(
  req: NextRequest,
  { params: { uuid } }: { params: { uuid: string } }
) {
  console.log("Test");

  // Get SQL query
  const serializedQueryData = await redis.get(`query:${uuid}`);

  if (!serializedQueryData) return new Response("Not found", { status: 404 });

  const responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();
  const encoder = new TextEncoder();

  const queryData = JSON.parse(serializedQueryData);

  const query = sql(
    new TaggedTemplateStrings(queryData.strings),
    ...queryData.args
  );

  sql
    .begin(async (sql) => {
      await sql`DECLARE c CURSOR FOR SUBSCRIBE TO (${query}) WITH (SNAPSHOT)`;

      let abort = false;

      req.signal.addEventListener("abort", () => {
        console.log("aborting");
        abort = true;
      });

      while (!abort) {
        const res = await sql`FETCH ALL c`;
        await writer.write(encoder.encode(`data: ${JSON.stringify(res)}\n\n`));
      }
    })
    .finally(() => {
      writer.close();
    });

  return new Response(responseStream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
