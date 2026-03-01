import { Field } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FileTextIcon, ImageIcon, VideoIcon, MusicIcon, ArchiveIcon } from "lucide-react"

const categories = [
  {
    value: "documents",
    label: "Documents",
    icon: (
      <FileTextIcon className="size-4" />
    ),
  },
  {
    value: "images",
    label: "Images",
    icon: (
      <ImageIcon className="size-4" />
    ),
  },
  {
    value: "videos",
    label: "Videos",
    icon: (
      <VideoIcon className="size-4" />
    ),
  },
  {
    value: "audio",
    label: "Audio",
    icon: (
      <MusicIcon className="size-4" />
    ),
  },
  {
    value: "archives",
    label: "Archives",
    icon: (
      <ArchiveIcon className="size-4" />
    ),
  },
]

export function Pattern() {
  return (
    <Field className="max-w-xs">
      <Select defaultValue={categories[0].value}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select category" />
        </SelectTrigger>
        <SelectContent position="popper">
          <SelectGroup>
            {categories.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                <span className="flex items-center gap-2">
                  {category.icon}
                  <span>{category.label}</span>
                </span>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </Field>
  )
}