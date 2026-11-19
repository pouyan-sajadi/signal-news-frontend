import { History, Menu } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { Button } from './ui/button'
import { ThemeToggle } from './ui/theme-toggle'
import { UserProfile } from './UserProfile'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'

const destinations = [
  { label: 'Today’s story', id: 'market-story' },
  { label: 'Tech dashboard', id: 'dashboard-section' },
  { label: 'Create a report', id: 'top-search-section' },
]

interface HeaderProps {
  isDesktopSidebarOpen: boolean
  setIsDesktopSidebarOpen: (isOpen: boolean) => void
  setIsMobileSidebarOpen: (isOpen: boolean) => void
}

export function Header({ isDesktopSidebarOpen, setIsDesktopSidebarOpen, setIsMobileSidebarOpen }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="signal-header">
      <div className="header-inner">
        <Link to="/" className="brand-mark" aria-label="HeySignal home">
          <img className="brand-glyph" src="/favicon.svg" alt="" width={29} height={29} />HeySignal
        </Link>
        <nav className="signal-nav" aria-label="Main navigation">
          {destinations.map(({ label, id }) => (
            <Link key={id} to={`/#${id}`}>{label}</Link>
          ))}
        </nav>
        <div className="header-tools">
          <div className="header-desktop-tools">
            <Button variant="ghost" size="icon" aria-label="Report history" aria-expanded={isDesktopSidebarOpen}
              onClick={() => setIsDesktopSidebarOpen(!isDesktopSidebarOpen)}>
              <History size={18} aria-hidden="true" />
            </Button>
            <ThemeToggle />
          </div>
          <UserProfile />
          <div className="header-mobile-tools">
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="More options"><Menu size={20} /></Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64" aria-describedby={undefined}>
                <SheetTitle className="display-type">More options</SheetTitle>
                <div className="header-more">
                  <Button variant="ghost" onClick={() => {
                    setMenuOpen(false)
                    setIsMobileSidebarOpen(true)
                  }}>Report history</Button>
                  <Link to="/about" onClick={() => setMenuOpen(false)}>About</Link>
                  <ThemeToggle />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
