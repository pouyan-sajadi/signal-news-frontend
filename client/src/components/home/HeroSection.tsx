import { ArrowDown } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

export function HeroSection() {
  const heroRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const hero = heroRef.current
    if (!hero) return

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame = 0

    const update = () => {
      frame = 0
      const progress = motion.matches ? 0 : Math.min(Math.max(0, window.scrollY) / Math.max(1, hero.offsetHeight * .68), 1)
      hero.style.setProperty('--signal-progress', progress.toFixed(3))
    }

    function schedule() {
      if (!frame) frame = window.requestAnimationFrame(update)
    }

    schedule()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    motion.addEventListener('change', schedule)
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      motion.removeEventListener('change', schedule)
    }
  }, [])

  return (
    <section ref={heroRef} className="signal-hero" aria-labelledby="hero-title">
      <div className="hero-art" aria-hidden="true">
        <div className="hero-grid" />
        <div className="hero-wave hero-wave-primary" />
        <div className="hero-wave hero-wave-secondary" />
        <div className="hero-trace" />
        <div className="hero-point" />
      </div>
      <div className="hero-copy page-width">
        <h1 id="hero-title">See what matters<br /> in tech.</h1>
        <p>One big story. The wider pulse. Your own questions.</p>
        <Link to="/#market-story" className="hero-link">
          Read today’s story <ArrowDown size={17} aria-hidden="true" />
        </Link>
      </div>
    </section>
  )
}
