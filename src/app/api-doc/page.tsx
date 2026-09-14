import { getApiDocs } from "@/lib/swagger"
import ReactSwagger from "./react-swagger"

export const metadata = {
  title: "API Documentation | Headcount Planning",
  description:
    "Swagger API documentation for Headcount Planning Next.js Backend",
}

export default async function ApiDocPage() {
  const spec = await getApiDocs()
  return (
    <main className="min-h-screen bg-white">
      <ReactSwagger spec={spec} />
    </main>
  )
}
