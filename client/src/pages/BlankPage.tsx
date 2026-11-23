import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"

export function BlankPage() {
  return (
    <section className="info-page">
      <h1>Page not found</h1>
      <Button asChild>
        <Link to="/">Back to HeySignal</Link>
      </Button>
    </section>
  )
}
