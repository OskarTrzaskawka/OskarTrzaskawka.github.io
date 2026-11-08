import { definePersona } from '../core/define'

/**
 * Oskar's own portfolio — developer template, data pulled from github.com/OskarTrzaskawka.
 */
export default definePersona({
  id: 'oskar',
  label: 'Oskar',
  template: 'developer',
  defaultScheme: 'dark',

  meta: {
    title: 'Oskar T — AI & Full-Stack Developer',
    description:
      'AI & Full-Stack Developer from Poland. Building Muzes — digital services. Next.js, TypeScript, React, Node.js, MongoDB, Docker, Rust & Tauri.',
    keywords: ['OskarTrzaskawka', 'full-stack developer', 'AI developer', 'TypeScript', 'React', 'Next.js', 'Tauri', 'Rust', 'Poland'],
  },

  person: {
    name: 'Oskar T',
    shortName: 'OskarTrzaskawka',
    role: 'AI & Full-Stack Developer',
    location: 'Poland',
    timeZone: 'Europe/Warsaw',
    avatar: '/avatar.jpg',
    availability: { status: 'open', label: 'Open to work' },
  },

  socials: [
    { label: 'GitHub', href: 'https://github.com/OskarTrzaskawka', icon: 'github', handle: 'OskarTrzaskawka' },
    { label: 'Discord', href: 'https://discord.com/users/776832810052354048', icon: 'discord', handle: 'Discord' },
    { label: 'Muzes', href: 'https://muzes.xyz/', icon: 'globe', handle: 'muzes.xyz' },
  ],

  hero: {
    eyebrow: 'AI & Full-Stack Developer · Poland',
    title: 'I build *fast, modern*\nsoftware for',
    rotating: ['the web.', 'the desktop.', 'Discord.', 'real people.'],
    subtitle:
      'I’m Oskar — I build full-stack web apps, desktop tools and AI-powered products. Currently building Muzes, a digital services provider.',
    ctas: [
      { label: 'See my work', href: '#work', variant: 'primary' },
      { label: 'GitHub', href: 'https://github.com/OskarTrzaskawka', variant: 'ghost', icon: 'github' },
    ],
  },

  sections: [
    {
      type: 'projects',
      id: 'work',
      nav: 'Work',
      eyebrow: 'Selected work',
      title: 'Things I’ve shipped.',
      intro: 'Projects from my GitHub. Click any card for details.',
      layout: 'spotlight',
      filters: true,
      items: [
        {
          id: 'lumenrpc',
          title: 'LumenRPC',
          category: 'Desktop',
          year: '2026',
          role: 'Author',
          status: 'Released',
          summary:
            'Modern Discord Rich Presence manager for Windows: live preview, 7 timer modes, automations, schedule and templates.',
          body: [
            'LumenRPC lets you design and control your Discord Rich Presence from a native Windows app — with a live preview of how it looks on your profile.',
            'Seven timer modes, automations, a schedule and reusable templates. Built with Tauri 2, a Rust core and a React interface.',
          ],
          tags: ['Tauri', 'Rust', 'React', 'TypeScript', 'Discord'],
          image: '/projects/lumenrpc.png',
          imageFit: 'contain',
          links: [
            { label: 'Download', href: 'https://github.com/OskarTrzaskawka/LumenRPC/releases/latest', icon: 'zap' },
            { label: 'GitHub', href: 'https://github.com/OskarTrzaskawka/LumenRPC', icon: 'github' },
          ],
        },
        {
          id: 'persona-folio',
          title: 'Persona Folio',
          category: 'Open source',
          year: '2026',
          role: 'Author',
          summary: 'One codebase, many portfolios. A config-driven portfolio engine — the one you’re looking at right now.',
          body: [
            'Four templates (developer, designer, photographer, minimal), 14 composable sections, a ⌘K command palette, live GitHub data and build-time SEO.',
            'Pick a persona in .env, edit one typed data file, ship to GitHub Pages.',
          ],
          tags: ['React', 'TypeScript', 'Vite', 'Tailwind CSS'],
          image: '/projects/persona-folio.jpg',
          imageFit: 'contain',
          links: [{ label: 'GitHub', href: 'https://github.com/OskarTrzaskawka/persona-folio', icon: 'github' }],
        },
      ],
    },
    {
      type: 'github',
      nav: 'GitHub',
      eyebrow: 'Live from GitHub',
      title: 'Open source activity.',
      intro: 'Pulled live from the GitHub API.',
      username: 'OskarTrzaskawka',
      privateRepos: true,
      exclude: ['OskarTrzaskawka.github.io'],
      limit: 6,
      contributions: true,
      languages: true,
    },
    {
      type: 'skills',
      nav: 'Skills',
      eyebrow: 'Toolbox',
      title: 'What I work with.',
      variant: 'tags',
      groups: [
        { name: 'Frontend', items: [{ name: 'Next.js' }, { name: 'React' }, { name: 'TypeScript' }, { name: 'Tailwind CSS' }] },
        { name: 'Backend', items: [{ name: 'Node.js' }, { name: 'MongoDB' }, { name: 'REST APIs' }] },
        { name: 'Desktop & infra', items: [{ name: 'Tauri' }, { name: 'Rust' }, { name: 'Docker' }, { name: 'PowerShell' }] },
        { name: 'AI', items: [{ name: 'LLM integrations' }, { name: 'AI-powered apps' }] },
      ],
    },
    {
      type: 'terminal',
      nav: 'Terminal',
      eyebrow: 'Try it',
      title: 'Ask the terminal.',
      intro: 'A tiny shell running in your browser. Try help, whoami, projects or stack.',
      prompt: 'oskar@portfolio',
      commands: {
        stack: 'Next.js · TypeScript · React · Node.js · MongoDB · Docker · Rust · Tauri',
        muzes: 'Muzes — digital services provider → https://muzes.xyz/',
        coffee: '☕ Brewing… done. Productivity +12%.',
      },
    },
    {
      type: 'about',
      nav: 'About',
      eyebrow: 'About',
      title: 'AI & full-stack developer from Poland.',
      body: [
        'I build web apps, backends and desktop tools — from Discord Rich Presence managers in Tauri and Rust to full-stack products on Next.js and Node.js.',
        'Right now I’m building Muzes, a digital services provider.',
      ],
      facts: [
        { label: 'Based in', value: 'Poland' },
        { label: 'Building', value: 'Muzes' },
        { label: 'Focus', value: 'Full-stack & AI' },
        { label: 'On GitHub since', value: '2021' },
      ],
    },
    {
      type: 'contact',
      nav: 'Contact',
      title: 'Let’s build',
      rotating: ['your next product.', 'something fast.', 'something useful.'],
      text: 'Have a project in mind? Message me on Discord, GitHub or through Muzes.',
      form: false,
    },
  ],
})
