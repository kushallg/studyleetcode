import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { PROBLEMS } from "../lib/problems";

config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local"
  );
  process.exit(1);
}

const supabase = createClient(url, key);

async function main() {
  console.log(`Seeding ${PROBLEMS.length} problems...`);

  // Upsert in chunks to avoid payload limits.
  const chunkSize = 100;
  for (let i = 0; i < PROBLEMS.length; i += chunkSize) {
    const chunk = PROBLEMS.slice(i, i + chunkSize);
    const { error } = await supabase.from("problems").upsert(chunk, { onConflict: "id" });
    if (error) {
      console.error(`Chunk ${i / chunkSize + 1} failed:`, error.message);
      process.exit(1);
    }
    console.log(`  inserted ${Math.min(i + chunkSize, PROBLEMS.length)}/${PROBLEMS.length}`);
  }

  // Sanity check counts per pattern + interleave_group distribution.
  const byGroup: Record<number, number> = {};
  for (const p of PROBLEMS) byGroup[p.interleave_group] = (byGroup[p.interleave_group] ?? 0) + 1;
  console.log("Interleave groups:", byGroup);
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
