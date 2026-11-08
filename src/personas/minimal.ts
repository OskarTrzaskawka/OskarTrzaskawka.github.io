import { definePersona } from '../core/define'

/** Demo persona — a fictional product engineer & writer. Text-first, print-friendly. */
export default definePersona({
  id: 'minimal',
  label: 'Minimal / CV',
  template: 'minimal',
  defaultScheme: 'light',

  meta: {
    title: 'Sam Rivera — Product Engineer & Writer',
    description: 'Product engineer writing about craft, calm software and the web platform.',
    keywords: ['product engineer', 'writer', 'resume', 'web platform'],
  },

  person: {
    name: 'Sam Rivera',
    role: 'Product Engineer & Writer',
    location: 'Lisbon, Portugal',
    timeZone: 'Europe/Lisbon',
    email: 'sam@example.com',
    resume: '#',
    availability: { status: 'closed', label: 'Not looking — happy at Fieldnote' },
  },

  socials: [
    { label: 'GitHub', href: 'https://github.com', icon: 'github', handle: 'samrivera' },
    { label: 'Bluesky', href: 'https://bsky.app', icon: 'bluesky', handle: '@sam.dev' },
    { label: 'RSS', href: '#writing', icon: 'rss', handle: 'Subscribe' },
  ],

  hero: {
    title: 'Sam Rivera',
    subtitle:
      'Product engineer at Fieldnote. Previously at Skyline Cloud and Cartwheel. I write about building *calm software* — fast, quiet, and respectful of people’s attention.',
  },

  sections: [
    {
      type: 'experience',
      nav: 'Work',
      eyebrow: 'Work',
      title: 'Experience',
      items: [
        { role: 'Senior Product Engineer', org: 'Fieldnote', href: '#', period: '2024 — now', place: 'Remote', summary: 'Sync engine, keyboard-first interactions and the new insights view.', tags: ['TypeScript', 'React', 'GraphQL'] },
        { role: 'Software Engineer', org: 'Skyline Cloud', href: '#', period: '2021 — 2024', place: 'Remote', summary: 'Dashboard performance and the deployment timeline. Cut p95 load time by 48%.', tags: ['Next.js', 'Edge', 'Postgres'] },
        { role: 'Frontend Developer', org: 'Cartwheel', href: '#', period: '2018 — 2021', place: 'Toronto', summary: 'Design-system components and checkout accessibility.', tags: ['React', 'a11y', 'Design systems'] },
      ],
    },
    {
      type: 'writing',
      nav: 'Writing',
      eyebrow: 'Writing',
      title: 'Recent essays',
      posts: [
        { title: 'Calm software is a feature', date: '2026-10-02', href: '#', excerpt: 'Every notification is a withdrawal from someone’s attention account.', readTime: 7, tag: 'Craft' },
        { title: 'The platform caught up', date: '2026-07-18', href: '#', excerpt: 'View transitions, popovers, anchor positioning — the web finally ships the primitives we kept rebuilding.', readTime: 11, tag: 'Web' },
        { title: 'Keyboard first, mouse friendly', date: '2026-03-04', href: '#', excerpt: 'Designing command palettes that people actually use.', readTime: 6, tag: 'UX' },
        { title: 'On writing small pull requests', date: '2025-11-21', href: '#', excerpt: 'Review is a conversation. Keep it short enough to finish.', readTime: 5, tag: 'Process' },
      ],
    },
    {
      type: 'projects',
      nav: 'Projects',
      eyebrow: 'Side projects',
      title: 'Things I made',
      layout: 'list',
      items: [
        { id: 'quiet', title: 'Quiet', year: '2025', summary: 'A browser extension that batches notifications into two daily digests.', tags: ['Extension', '12k users'], links: [{ label: 'Website', href: '#' }] },
        { id: 'tinyfeed', title: 'tinyfeed', year: '2024', summary: 'A 3kb RSS reader that runs entirely in a single HTML file.', tags: ['Open source', '2.1k ★'], links: [{ label: 'GitHub', href: '#' }] },
        { id: 'kbd', title: 'kbd.fyi', year: '2023', summary: 'Searchable keyboard shortcut cheat-sheets for 200+ apps.', tags: ['Web'], links: [{ label: 'Website', href: '#' }] },
      ],
    },
    {
      type: 'skills',
      eyebrow: 'Toolbox',
      title: 'Skills',
      variant: 'columns',
      groups: [
        { name: 'Languages', items: [{ name: 'TypeScript' }, { name: 'Rust' }, { name: 'SQL' }, { name: 'Go' }] },
        { name: 'Frontend', items: [{ name: 'React' }, { name: 'CSS' }, { name: 'Web APIs' }, { name: 'a11y' }] },
        { name: 'Backend', items: [{ name: 'Node.js' }, { name: 'Postgres' }, { name: 'GraphQL' }, { name: 'Redis' }] },
      ],
    },
    {
      type: 'contact',
      nav: 'Contact',
      title: 'Say hello',
      text: 'I answer every email — usually within a week. No recruiters, please.',
    },
  ],

  footer: { note: 'Typeset in Newsreader & Inter. No cookies, no trackers.' },
})
