import { Toggle } from "@/components/ui/toggle"
import { BoldIcon, ItalicIcon, UnderlineIcon } from "lucide-react"

export function Pattern() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <Toggle aria-label="Toggle bold" defaultPressed>
        <BoldIcon
        />
      </Toggle>
      <Toggle aria-label="Toggle italic">
        <ItalicIcon
        />
      </Toggle>
      <Toggle aria-label="Toggle underline">
        <UnderlineIcon
        />
      </Toggle>
    </div>
  )
}