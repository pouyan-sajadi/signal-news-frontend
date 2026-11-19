import { ArrowDown } from 'lucide-react'
import { Link } from 'react-router-dom'

export function HeroSection() {
  return (
    <section className="signal-hero" aria-labelledby="hero-title">
      <div className="hero-art" aria-hidden="true">
        <div className="hero-rings" />
        <div className="hero-beam" />
        <div className="hero-point" />
      </div>
      <div className="hero-copy">
        <h1 id="hero-title">See what matters<br />in tech.</h1>
        <p>One big story. The wider pulse. Your own questions.</p>
        <Link to="/#market-story" className="hero-link">
          Read today’s story <ArrowDown size={17} aria-hidden="true" />
        </Link>
      </div>
    </section>
  )
}
