import { definePersona } from '../core/define'

/**
 * Demo persona — a fictional full-stack developer.
 * Copy this file, change the data, and set VITE_PERSONA to its id.
 */
export default definePersona({
  id: 'developer',
  label: 'Developer',
  template: 'developer',
  defaultScheme: 'dark',

  meta: {
    title: 'Alex Carter — Full-stack Developer',
    description: 'Full-stack developer building fast, accessible products with TypeScript, React, Node.js and Rust.',
    keywords: ['full-stack developer', 'TypeScript', 'React', 'Node.js', 'Rust', 'open source'],
  },

  person: {
    name: 'Alex Carter',
    shortName: 'alex.dev',
    role: 'Full-stack Developer',
    location: 'Berlin, Germany',
    timeZone: 'Europe/Berlin',
    email: 'alex@example.com',
    resume: '#',
    availability: { status: 'open', label: 'Available for freelance' },
  },

  socials: [
    { label: 'GitHub', href: 'https://github.com/octocat', icon: 'github', handle: 'octocat' },
    { label: 'LinkedIn', href: 'https://linkedin.com', icon: 'linkedin', handle: 'alexcarter' },
    { label: 'X', href: 'https://x.com', icon: 'x', handle: '@alexcodes' },
    { label: 'Email', href: 'mailto:alex@example.com', icon: 'mail', handle: 'alex@example.com' },
  ],

  hero: {
    eyebrow: 'Full-stack developer · Berlin',
    title: 'I build *fast, delightful*\nsoftware for',
    rotating: ['the web.', 'startups.', 'developers.', 'real people.'],
    subtitle:
      'I’m Alex — I design APIs, ship polished interfaces and care about the details that make products feel instant. 8 years, 40+ shipped projects.',
    ctas: [
      { label: 'See my work', href: '#work', variant: 'primary' },
      { label: 'Get in touch', href: '#contact', variant: 'ghost' },
    ],
  },

  sections: [
    {
      type: 'projects',
      id: 'work',
      nav: 'Work',
      eyebrow: 'Selected work',
      title: 'Things I’ve shipped.',
      intro: 'A few projects I designed, built and still maintain. Click any card for the full story.',
      layout: 'spotlight',
      filters: true,
      items: [
        {
          id: 'nimbus',
          title: 'Nimbus',
          category: 'Product',
          featured: true,
          year: '2025 — now',
          role: 'Founder & lead engineer',
          status: 'Live · 3.2k teams',
          summary: 'A self-hosted deploy platform: git push, preview URLs, zero-downtime rollbacks — on your own servers.',
          body: [
            'Nimbus started as a weekend script to deploy side projects and grew into a platform used by 3,200 teams. It builds containers from any repo, gives every pull request its own preview URL and rolls back in under two seconds.',
            'The control plane is written in Rust, the dashboard in React with a real-time event stream, and everything runs on a single $5 VPS for small teams.',
          ],
          tags: ['Rust', 'TypeScript', 'React', 'Docker', 'Postgres'],
          metrics: [
            { label: 'Teams', value: '3.2k' },
            { label: 'Deploys / day', value: '18k' },
            { label: 'Rollback', value: '<2s' },
          ],
          art: { seed: 4, palette: ['#22d3ee', '#a78bfa', '#0b1020'] },
          links: [
            { label: 'Website', href: '#', icon: 'globe' },
            { label: 'GitHub', href: '#', icon: 'github' },
          ],
        },
        {
          id: 'pulsewave',
          title: 'Pulsewave',
          category: 'Bot',
          year: '2024',
          role: 'Solo developer',
          summary: 'Music & moderation bot serving 40k community servers with self-hosted audio nodes.',
          body: [
            'Slash commands, high-quality playback, auto-moderation and a web dashboard sharing the same Node.js services as the bot.',
          ],
          tags: ['TypeScript', 'Node.js', 'WebSocket', 'Redis'],
          metrics: [
            { label: 'Servers', value: '40k' },
            { label: 'Uptime', value: '99.97%' },
          ],
          art: { seed: 12, palette: ['#4ade80', '#22d3ee', '#052e16'] },
        },
        {
          id: 'ledger',
          title: 'ledger-cli',
          category: 'Open source',
          year: '2023',
          role: 'Maintainer',
          summary: 'Plain-text accounting in your terminal. Blazing fast, scriptable, 2.4k ★ on GitHub.',
          tags: ['Rust', 'CLI', 'Open source'],
          art: { seed: 27, palette: ['#f59e0b', '#ef4444', '#1c1917'] },
          links: [{ label: 'GitHub', href: '#', icon: 'github' }],
        },
        {
          id: 'atlas-ui',
          title: 'Atlas UI',
          category: 'Open source',
          year: '2022',
          role: 'Co-author',
          summary: 'Accessible, headless React components with 100% keyboard support and zero runtime CSS.',
          tags: ['React', 'a11y', 'TypeScript'],
          art: { seed: 33, palette: ['#f472b6', '#818cf8', '#1e1b4b'] },
          links: [{ label: 'Docs', href: '#', icon: 'book' }],
        },
      ],
    },
    {
      type: 'stats',
      nav: false,
      title: 'Numbers',
      items: [
        { value: 8, suffix: '+', label: 'Years of experience' },
        { value: 40, suffix: '+', label: 'Projects shipped' },
        { value: 12, suffix: 'k', label: 'GitHub stars earned' },
        { value: 99, suffix: '%', label: 'Lighthouse average' },
      ],
    },
    {
      type: 'github',
      nav: 'GitHub',
      eyebrow: 'Live from GitHub',
      title: 'Open source activity.',
      intro: 'Pulled live from the GitHub API — set VITE_GITHUB_USERNAME to show yours.',
      username: 'octocat',
      limit: 6,
      contributions: true,
      languages: true,
    },
    {
      type: 'skills',
      nav: 'Skills',
      eyebrow: 'Toolbox',
      title: 'What I work with.',
      note: 'Self-assessed working confidence — not certification scores.',
      variant: 'meters',
      groups: [
        {
          name: 'Frontend',
          items: [
            { name: 'TypeScript', level: 95, note: 'Daily driver' },
            { name: 'React', level: 92, note: 'Since 2017' },
            { name: 'CSS', level: 88, note: 'Modern layout & motion' },
          ],
        },
        {
          name: 'Backend & infra',
          items: [
            { name: 'Node.js', level: 90, note: 'APIs & workers' },
            { name: 'Rust', level: 74, note: 'Performance-critical bits' },
            { name: 'Postgres', level: 80, note: 'Schema design & tuning' },
          ],
        },
      ],
    },
    {
      type: 'experience',
      nav: 'Experience',
      eyebrow: 'Career',
      title: 'Where I’ve worked.',
      items: [
        { role: 'Senior Software Engineer', org: 'Northwind Labs', period: '2022 — now', place: 'Berlin', summary: 'Leading the platform team. Moved 60 services to a single deploy pipeline and cut CI time by 70%.', tags: ['TypeScript', 'Kubernetes', 'Rust'] },
        { role: 'Full-stack Engineer', org: 'Brightside', period: '2019 — 2022', place: 'Remote', summary: 'Built the customer dashboard from scratch; grew it to 200k monthly users.', tags: ['React', 'Node.js', 'GraphQL'] },
        { role: 'Frontend Developer', org: 'Pixel & Co.', period: '2017 — 2019', place: 'Amsterdam', summary: 'Agency work for 30+ clients. Learned to ship fast and say no politely.', tags: ['JavaScript', 'Vue', 'CSS'] },
      ],
    },
    {
      type: 'terminal',
      nav: 'Terminal',
      eyebrow: 'Try it',
      title: 'Ask the terminal.',
      intro: 'A tiny shell running in your browser. Try help, whoami, projects or sudo.',
      prompt: 'alex@portfolio',
      commands: {
        stack: 'TypeScript · React · Node.js · Rust · Postgres · Docker',
        coffee: '☕ Brewing… done. Productivity +12%.',
        hobbies: 'Climbing, synthesizers and mechanical keyboards.',
      },
    },
    {
      type: 'testimonials',
      nav: false,
      eyebrow: 'Kind words',
      title: 'People I’ve worked with.',
      items: [
        { quote: 'Alex is the engineer you hand the scariest migration to. It ships on time and nobody notices — which is the point.', name: 'Priya Natarajan', role: 'CTO, Northwind Labs' },
        { quote: 'Equal parts product sense and engineering depth. Our dashboard went from “ugh” to “wow” in one quarter.', name: 'Tom Okafor', role: 'Head of Product, Brightside' },
      ],
    },
    {
      type: 'about',
      nav: 'About',
      eyebrow: 'About',
      title: 'Engineer by trade, tinkerer by nature.',
      body: [
        'I started coding by modding games at 13 and never stopped. Today I help startups go from prototype to product without losing speed — or their sanity.',
        'When I’m not shipping, I climb, build synthesizers and contribute to open source.',
      ],
      facts: [
        { label: 'Based in', value: 'Berlin' },
        { label: 'Experience', value: '8 years' },
        { label: 'Focus', value: 'DX, performance, a11y' },
        { label: 'Editor', value: 'Neovim + Zed' },
      ],
    },
    {
      type: 'contact',
      nav: 'Contact',
      title: 'Let’s build',
      rotating: ['your next product.', 'something fast.', 'something useful.'],
      text: 'Have a project in mind? Drop me a line — I reply within 24 hours.',
      form: true,
    },
  ],
})
