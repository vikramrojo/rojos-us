export type Site = {
  title: string
  description: string
  href: string
  author: string
  locale: string
  featuredPostCount: number
  postsPerPage: number
}

export type SocialLink = {
  href: string
  label: string
}

/**
 * An icon renderable in a template.
 *
 * Deliberately structural: `@lucide/astro` types its icons as
 * `(props: IconProps) => unknown`, while a local `.astro` file compiles to an
 * `AstroComponentFactory` with a different signature. Nothing in Astro's public
 * types covers both, so this is the common denominator.
 */
export type IconComponent = (...args: any[]) => unknown

export type IconMap = {
  [key: string]: IconComponent
}
