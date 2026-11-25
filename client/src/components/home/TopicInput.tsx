import { Search } from "lucide-react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Card } from "../ui/card"
import { PreferencesPanel } from "./PreferencesPanel"
import { ReportPreferences } from "../../pages/HomePage"

interface TopicInputProps {
  value: string
  onChange: (value: string) => void
  onGenerate: () => void
  disabled?: boolean
  preferences: ReportPreferences
  onPreferencesChange: (preferences: ReportPreferences) => void
}

export function TopicInput({ 
  value, 
  onChange, 
  onGenerate, 
  disabled = false,
  preferences,
  onPreferencesChange
}: TopicInputProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!disabled) {
      onGenerate()
    }
  }

  return (
    <Card className="p-4 sm:p-5 bg-card shadow-none">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            id="report-topic"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            aria-label="Report topic"
            placeholder="What do you want to understand?"
            className="pl-10 h-12 placeholder:text-sm"
            disabled={disabled}
          />
        </div>

        {/* Integrated Preferences Panel */}
        <PreferencesPanel
          preferences={preferences}
          onChange={onPreferencesChange}
        />

        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <p id="report-timing-note" className="text-sm text-muted-foreground">
            Reports can take several minutes.
          </p>
          <Button
            type="submit"
            size="lg"
            className="ml-auto px-5"
            aria-describedby="report-timing-note"
            disabled={!value.trim() || disabled}
          >
            {disabled ? "Generating..." : "Generate report"}
          </Button>
        </div>
      </form>
    </Card>
  )
}
