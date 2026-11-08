import { definePersona } from '../core/define'
import type { GalleryItem } from '../core/types'

/**
 * Demo persona — a fictional photographer.
 * Placeholder photos come from picsum.photos (Unsplash License) and are random per seed,
 * so captions are neutral. Replace with your own images in /public.
 */
const photo = (seed: string, w: number, h: number, alt: string, category: string, exif?: string): GalleryItem => ({
  src: `https://picsum.photos/seed/${seed}/${w}/${h}`,
  width: w,
  height: h,
  alt,
  category,
  exif,
})

export default definePersona({
  id: 'photographer',
  label: 'Photographer',
  template: 'photographer',
  defaultScheme: 'dark',

  meta: {
    title: 'Kai Lindqvist — Photographer',
    description: 'Landscape, portrait and editorial photography from the far north. Available for commissions worldwide.',
    keywords: ['photographer', 'landscape photography', 'portrait', 'editorial', 'Norway'],
  },

  person: {
    name: 'Kai Lindqvist',
    shortName: 'Kai Lindqvist',
    role: 'Photographer',
    location: 'Tromsø, Norway',
    timeZone: 'Europe/Oslo',
    email: 'studio@example.com',
    availability: { status: 'open', label: 'Taking commissions for 2027' },
  },

  socials: [
    { label: 'Instagram', href: 'https://instagram.com', icon: 'instagram', handle: '@kai.north' },
    { label: 'Vimeo', href: 'https://vimeo.com', icon: 'vimeo', handle: 'kailindqvist' },
    { label: 'Email', href: 'mailto:studio@example.com', icon: 'mail', handle: 'studio@example.com' },
  ],

  hero: {
    eyebrow: 'Photography · 69°N',
    title: 'Light, *at the\nedge* of the world.',
    subtitle: 'Landscapes, portraits and quiet stories from the Arctic — for magazines, brands and people who still print photographs.',
    images: [
      'https://picsum.photos/seed/aurora-north/1920/1200',
      'https://picsum.photos/seed/fjord-mist/1920/1200',
      'https://picsum.photos/seed/polar-night/1920/1200',
    ],
    ctas: [
      { label: 'View portfolio', href: '#gallery', variant: 'primary' },
      { label: 'Book a shoot', href: '#contact', variant: 'ghost' },
    ],
  },

  sections: [
    {
      type: 'gallery',
      nav: 'Portfolio',
      eyebrow: 'Portfolio',
      title: 'Selected frames',
      layout: 'masonry',
      filters: true,
      items: [
        photo('north-1', 900, 1200, 'Landscape study No. 01', 'Landscape', '35mm · f/8 · 1/250s'),
        photo('north-2', 1200, 800, 'Landscape study No. 02', 'Landscape', '50mm · f/5.6 · 1/500s'),
        photo('north-3', 900, 1100, 'Portrait study No. 03', 'Portrait', '85mm · f/1.8 · 1/200s'),
        photo('north-4', 1200, 900, 'Landscape study No. 04', 'Landscape', '24mm · f/11 · 1/125s'),
        photo('north-5', 900, 1300, 'Editorial study No. 05', 'Editorial', '35mm · f/2.8 · 1/320s'),
        photo('north-6', 1200, 800, 'Landscape study No. 06', 'Landscape', '50mm · f/4 · 1/160s'),
        photo('north-7', 900, 1200, 'Portrait study No. 07', 'Portrait', '85mm · f/2 · 1/250s'),
        photo('north-8', 1200, 850, 'Editorial study No. 08', 'Editorial', '35mm · f/2 · 1/60s'),
        photo('north-9', 900, 1150, 'Landscape study No. 09', 'Landscape', '70mm · f/8 · 1/800s'),
        photo('north-10', 1200, 800, 'Editorial study No. 10', 'Editorial', '28mm · f/5.6 · 1/250s'),
        photo('north-11', 900, 1200, 'Portrait study No. 11', 'Portrait', '85mm · f/1.4 · 1/400s'),
        photo('north-12', 1200, 900, 'Landscape study No. 12', 'Landscape', '24mm · f/9 · 1/100s'),
      ],
    },
    {
      type: 'marquee',
      nav: false,
      title: 'Published in',
      items: ['North Magazine', 'Fjell Outdoor', 'Arctic Review', 'Polar Journal', 'Lumen Quarterly', 'Saltwater Press'],
    },
    {
      type: 'stats',
      nav: false,
      title: 'Numbers',
      items: [
        { value: 14, label: 'Years behind the lens' },
        { value: 38, label: 'Countries' },
        { value: 120, suffix: 'k', label: 'Frames archived' },
        { value: 9, label: 'Published books' },
      ],
    },
    {
      type: 'services',
      nav: 'Services',
      eyebrow: 'Commissions',
      title: 'Ways to work together',
      items: [
        { icon: 'aperture', title: 'Editorial', text: 'Assignments for magazines and newspapers, on location anywhere.', price: 'from €900 / day' },
        { icon: 'camera', title: 'Portraits', text: 'Natural-light portraits for artists, founders and families.', price: 'from €450' },
        { icon: 'film', title: 'Brand & campaigns', text: 'Story-driven imagery for outdoor and lifestyle brands.', price: 'on request' },
      ],
    },
    {
      type: 'testimonials',
      nav: false,
      eyebrow: 'Clients',
      title: 'Kind words',
      items: [
        { quote: 'Kai comes back with pictures that make the whole team go quiet. Every single time.', name: 'Sofia Bergström', role: 'Photo Editor, North Magazine' },
        { quote: 'Patient, kind and absurdly talented. Our campaign outperformed every previous season.', name: 'Erik Dahl', role: 'Brand Director, Fjell Outdoor' },
      ],
    },
    {
      type: 'about',
      nav: 'About',
      eyebrow: 'About',
      title: 'Patience is my favourite lens.',
      image: 'https://picsum.photos/seed/kai-portrait/800/1000',
      body: [
        'I grew up between a fishing village and a darkroom. Fourteen years later, I still shoot film for personal work and wait hours for the right light.',
        'My work has appeared in North Magazine, Arctic Review and Lumen Quarterly.',
      ],
      facts: [
        { label: 'Cameras', value: 'Leica M11, Hasselblad 907X' },
        { label: 'Based in', value: 'Tromsø' },
        { label: 'Travels', value: 'Worldwide' },
      ],
    },
    {
      type: 'contact',
      nav: 'Contact',
      title: 'Let’s make',
      rotating: [
        'something timeless.',
        'a story.',
      ],
      text: 'Tell me about the story you want to tell. Dates, place, mood — anything helps.',
      form: true,
    },
  ],
})
