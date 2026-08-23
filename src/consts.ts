import GitHubIcon from '@/components/icons/github.astro'
import LinkedInIcon from '@/components/icons/linkedin.astro'
import type { IconMap, SocialLink, Site } from '@/types'
import { Globe, Mail, Rss } from '@lucide/astro'

export const SITE: Site = {
  title: 'V–R',
  description:
    'Vikram Rojo, a designer who pairs product strategy with agentic production at high-growth enterprise startups.',
  href: 'https://rojos.us',
  author: 'vikram',
  locale: 'en-US',
  featuredPostCount: 2,
  postsPerPage: 5,
}

export const NAV_LINKS: SocialLink[] = [
  {
    href: '/about',
    label: 'about',
  },
]

export const SOCIAL_LINKS: SocialLink[] = [
  {
    href: 'https://github.com/vikramrojo',
    label: 'GitHub',
  },
  {
    href: 'https://www.linkedin.com/in/vikramrojo/',
    label: 'LinkedIn',
  },
  {
    href: 'mailto:vikram at rojos.us',
    label: 'Email',
  },
  {
    href: '/rss.xml',
    label: 'RSS',
  },
]

export const ICON_MAP: IconMap = {
  Website: Globe,
  GitHub: GitHubIcon,
  LinkedIn: LinkedInIcon,
  Email: Mail,
  RSS: Rss,
}
