import type { IconMap, SocialLink, Site } from '@/types'

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
  Website: 'lucide:globe',
  GitHub: 'lucide:github',
  LinkedIn: 'lucide:linkedin',
  Twitter: 'lucide:twitter',
  Email: 'lucide:mail',
  RSS: 'lucide:rss',
}
