import { execSync } from "child_process"
import fs from "fs"
import path from "path"

// Check if .env file exists
const envPath = path.join(process.cwd(), ".env.local")
if (!fs.existsSync(envPath)) {
  console.error("Error: .env.local file not found. Please create it with your Supabase credentials.")
  process.exit(1)
}

// Read .env file
const envContent = fs.readFileSync(envPath, "utf8")
const envVars = envContent.split("\n").reduce(
  (acc, line) => {
    const match = line.match(/^([^=]+)=(.*)$/)
    if (match) {
      acc[match[1]] = match[2]
    }
    return acc
  },
  {} as Record<string, string>,
)

// Check for required environment variables
const requiredVars = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_PROJECT_ID",
]

const missingVars = requiredVars.filter((varName) => !envVars[varName])
if (missingVars.length > 0) {
  console.error(`Error: Missing required environment variables: ${missingVars.join(", ")}`)
  process.exit(1)
}

try {
  // Link to Supabase project
  console.log("Linking to Supabase project...")
  execSync(`npx supabase link --project-ref ${envVars.SUPABASE_PROJECT_ID}`, {
    stdio: "inherit",
    env: {
      ...process.env,
      SUPABASE_ACCESS_TOKEN: envVars.SUPABASE_ACCESS_TOKEN || "",
    },
  })

  // Push database migrations
  console.log("Pushing database migrations...")
  execSync("npx supabase db push", { stdio: "inherit" })

  // Generate TypeScript types
  console.log("Generating TypeScript types...")
  execSync("npx supabase gen types typescript --project-id ${envVars.SUPABASE_PROJECT_ID} > lib/database.types.ts", {
    stdio: "inherit",
  })

  console.log("✅ Database setup complete!")
} catch (error) {
  console.error("Error setting up database:", error)
  process.exit(1)
}
