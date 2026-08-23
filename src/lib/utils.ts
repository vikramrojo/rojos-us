/**
 * Join class names, skipping anything falsy.
 *
 * Replaces clsx + tailwind-merge. The merge half existed to resolve conflicting
 * Tailwind utilities (`px-2` beating `px-4`); with utilities gone there is
 * nothing to resolve, and a component class never conflicts with another.
 */
export function cn(...inputs: (string | false | null | undefined)[]): string {
  return inputs.filter(Boolean).join(' ')
}

export function formatDate(date: Date) {
  return Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

export function calculateWordCountFromHtml(
  html: string | null | undefined,
): number {
  if (!html) return 0
  const textOnly = html.replace(/<[^>]+>/g, '')
  return textOnly.split(/\s+/).filter(Boolean).length
}

export function readingTime(wordCount: number): string {
  const readingTimeMinutes = Math.max(1, Math.round(wordCount / 200))
  return `${readingTimeMinutes} min read`
}

/**
 * The indent level for a TOC entry, as a `data-depth` value.
 *
 * Returns undefined for depths that are not indented, so the attribute is
 * omitted entirely rather than rendered empty. Styling lives in
 * styles/components/toc.css; this used to return Tailwind class names, which
 * meant markup classes were being generated from TypeScript.
 */
export function getHeadingDepth(depth: number): number | undefined {
  return depth >= 3 && depth <= 6 ? depth : undefined
}
