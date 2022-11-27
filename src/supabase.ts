import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const supabase = createClient(
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  process.env.SUPABASE_API_URL!,
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!
);

export default supabase;
