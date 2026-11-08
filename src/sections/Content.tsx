import { ArrowUpRight, Check, Copy, Quote, Send } from 'lucide-react'
import { motion } from 'motion/react'
import { useActionState } from 'react'
import { Avatar } from '../components/Chrome'
import { Icon } from '../components/Icon'
import { Counter, Initials, Reveal, Rich, Rotator, SectionHead } from '../components/primitives'
import { asset } from '../core/define'
import { useCopy } from '../core/hooks'
import { useStore } from '../core/store'
import type {
  AboutSection, ContactSection, ExperienceSection, MarqueeSection, ProcessSection, ServicesSection,
  SkillsSection, StatsSection, TestimonialsSection, WritingSection,
} from '../core/types'
import { ui } from '../core/ui'

type P<S> = { section: S; index: number }

export function About({ section, index }: P<AboutSection>) {
  return (
    <div className="container">
      <SectionHead eyebrow={section.eyebrow} title={section.title} intro={section.intro} index={index} />
      <div className="about" data-has-image={!!section.image}>
        {section.image && (
          <Reveal className="about-image">
            <img src={asset(section.image)} alt="" loading="lazy" />
          </Reveal>
        )}
        <Reveal className="about-body">
          {section.body.map((p, i) => (
            <p key={i}>
              <Rich text={p} />
            </p>
          ))}
        </Reveal>
        {section.facts && (
          <Reveal as="div" className="facts" delay={0.1}>
            <dl>
              {section.facts.map((f) => (
                <div key={f.label}>
                  <dt>{f.label}</dt>
                  <dd>{f.value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        )}
      </div>
    </div>
  )
}

export function Skills({ section, index }: P<SkillsSection>) {
  const variant = section.variant ?? 'meters'
  return (
    <div className="container">
      <SectionHead eyebrow={section.eyebrow} title={section.title} intro={section.intro ?? section.note} index={index} />
      <div className={`skills skills-${variant}`}>
        {section.groups.map((g, gi) => (
          <Reveal key={g.name} className="skill-group" delay={gi * 0.08}>
            <h3>{g.name}</h3>
            {variant === 'meters' ? (
              <ul>
                {g.items.map((s, i) => (
                  <li key={s.name} className="skill-row">
                    <div className="skill-label">
                      <strong>{s.name}</strong>
                      {s.note && <small>{s.note}</small>}
                      {s.level !== undefined && <b>{s.level}%</b>}
                    </div>
                    {s.level !== undefined && (
                      <div className="meter" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={s.level} aria-label={s.name}>
                        <motion.i
                          initial={{ scaleX: 0 }}
                          whileInView={{ scaleX: s.level / 100 }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.2, delay: 0.1 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                        />
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="tags tags-lg">
                {g.items.map((s) => (
                  <li key={s.name}>{s.name}</li>
                ))}
              </ul>
            )}
          </Reveal>
        ))}
      </div>
    </div>
  )
}

export function Experience({ section, index }: P<ExperienceSection>) {
  return (
    <div className="container">
      <SectionHead eyebrow={section.eyebrow} title={section.title} intro={section.intro} index={index} />
      <ol className="timeline">
        {section.items.map((item, i) => (
          <Reveal as="li" key={item.org + item.period} delay={i * 0.06}>
            <span className="timeline-period">{item.period}</span>
            <div className="timeline-body">
              <h3>
                {item.role}{' '}
                <span className="at">
                  @{' '}
                  {item.href ? (
                    <a href={item.href} target="_blank" rel="noreferrer">
                      {item.org}
                    </a>
                  ) : (
                    item.org
                  )}
                </span>
              </h3>
              {item.place && <small>{item.place}</small>}
              <p>{item.summary}</p>
              {item.tags && (
                <ul className="tags">
                  {item.tags.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              )}
            </div>
          </Reveal>
        ))}
      </ol>
    </div>
  )
}

export function Services({ section, index }: P<ServicesSection>) {
  return (
    <div className="container">
      <SectionHead eyebrow={section.eyebrow} title={section.title} intro={section.intro} index={index} />
      <div className="services">
        {section.items.map((s, i) => (
          <Reveal as="article" key={s.title} className="service" delay={i * 0.08}>
            <span className="service-icon">
              <Icon name={s.icon ?? 'sparkles'} className="size-5" />
            </span>
            <span className="service-index">{String(i + 1).padStart(2, '0')}</span>
            <h3>{s.title}</h3>
            <p>{s.text}</p>
            {s.bullets && (
              <ul className="service-bullets">
                {s.bullets.map((b) => (
                  <li key={b}>
                    <Check className="size-3.5" />
                    {b}
                  </li>
                ))}
              </ul>
            )}
            {s.price && <strong className="service-price">{s.price}</strong>}
          </Reveal>
        ))}
      </div>
    </div>
  )
}

export function Process({ section, index }: P<ProcessSection>) {
  return (
    <div className="container">
      <SectionHead eyebrow={section.eyebrow} title={section.title} intro={section.intro} index={index} />
      <ol className="process">
        {section.steps.map((s, i) => (
          <Reveal as="li" key={s.title} delay={i * 0.08}>
            <span>{String(i + 1).padStart(2, '0')}</span>
            <h3>{s.title}</h3>
            <p>{s.text}</p>
          </Reveal>
        ))}
      </ol>
    </div>
  )
}

export function Testimonials({ section, index }: P<TestimonialsSection>) {
  return (
    <div className="container">
      <SectionHead eyebrow={section.eyebrow} title={section.title} intro={section.intro} index={index} />
      <div className="testimonials">
        {section.items.map((t, i) => (
          <Reveal as="article" key={t.name} className="testimonial" delay={i * 0.08}>
            <Quote className="quote-mark" aria-hidden="true" />
            <blockquote>{t.quote}</blockquote>
            <footer>
              {t.avatar ? <img src={asset(t.avatar)} alt="" className="avatar" /> : <Initials name={t.name} className="avatar" />}
              <span>
                <strong>{t.name}</strong>
                <small>{t.role}</small>
              </span>
            </footer>
          </Reveal>
        ))}
      </div>
    </div>
  )
}

export function Stats({ section }: P<StatsSection>) {
  return (
    <div className="container">
      <h2 className="sr-only">{section.title}</h2>
      <dl className="stats">
        {section.items.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.06}>
            <dd>
              <Counter value={s.value} prefix={s.prefix} suffix={s.suffix} />
            </dd>
            <dt>{s.label}</dt>
          </Reveal>
        ))}
      </dl>
    </div>
  )
}

export function Marquee({ section }: P<MarqueeSection>) {
  const row = [...section.items, ...section.items]
  return (
    <div className="marquee" aria-label={section.title}>
      <div className="marquee-track">
        {row.map((item, i) => (
          <span key={i} aria-hidden={i >= section.items.length}>
            {item}
            <b>✺</b>
          </span>
        ))}
      </div>
    </div>
  )
}

export function Writing({ section, index }: P<WritingSection>) {
  return (
    <div className="container">
      <SectionHead eyebrow={section.eyebrow} title={section.title} intro={section.intro} index={index} />
      <ol className="posts">
        {section.posts.map((p, i) => (
          <Reveal as="li" key={p.title} delay={i * 0.05}>
            <a href={p.href} className="post">
              <time dateTime={p.date}>{new Date(p.date).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}</time>
              <span className="post-main">
                <strong>{p.title}</strong>
                {p.excerpt && <span>{p.excerpt}</span>}
              </span>
              <span className="post-meta">
                {p.tag && <em>{p.tag}</em>}
                {p.readTime && (
                  <small>
                    {p.readTime} {ui.minRead}
                  </small>
                )}
              </span>
            </a>
          </Reveal>
        ))}
      </ol>
    </div>
  )
}

type FormState = { status: 'idle' | 'sent' | 'error' }

export function Contact({ section }: P<ContactSection>) {
  const { persona } = useStore()
  const { copied, copy } = useCopy()
  const email = persona.person.email
  const endpoint = import.meta.env.VITE_CONTACT_ENDPOINT
  const accessKey = import.meta.env.VITE_CONTACT_ACCESS_KEY

  const [state, action, pending] = useActionState<FormState, FormData>(async (_prev, data) => {
    if (!endpoint) {
      const subject = encodeURIComponent(`Hello from ${data.get('name')}`)
      const body = encodeURIComponent(`${data.get('message')}\n\n— ${data.get('name')} (${data.get('email')})`)
      location.href = `mailto:${email}?subject=${subject}&body=${body}`
      return { status: 'idle' }
    }
    try {
      const res = await fetch(endpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
      return { status: res.ok ? 'sent' : 'error' }
    } catch {
      return { status: 'error' }
    }
  }, { status: 'idle' })

  return (
    <div className="container contact">
      <Reveal as="header" className="contact-head">
        <h2>
          <Rich text={section.title} />
          {section.rotating && (
            <>
              <br />
              <Rotator words={section.rotating} />
            </>
          )}
        </h2>
        <p className="lead">{section.text}</p>
      </Reveal>
      <div className="contact-grid" data-form={!!section.form && !!email}>
        <Reveal className="contact-links">
          {email && (
            <div className="contact-email">
              <a href={`mailto:${email}`}>
                <Icon name="mail" className="size-5" />
                <span>{email}</span>
                <ArrowUpRight className="size-4" />
              </a>
              <button className="icon-btn" onClick={() => copy(email)} aria-label={ui.copyEmail} title={ui.copyEmail}>
                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              </button>
              <span className="sr-only" aria-live="polite">
                {copied ? ui.copied : ''}
              </span>
            </div>
          )}
          {persona.socials
            .filter((s) => s.icon !== 'mail')
            .map((s) => (
              <a key={s.href} href={s.href} target="_blank" rel="noreferrer" className="contact-link">
                <Icon name={s.icon} className="size-5" />
                <span>
                  <strong>{s.label}</strong>
                  {s.handle && <small>{s.handle}</small>}
                </span>
                <ArrowUpRight className="size-4" />
              </a>
            ))}
        </Reveal>
        {section.form && email && (
          <Reveal className="contact-form-wrap" delay={0.1}>
            {state.status === 'sent' ? (
              <div className="form-done" role="status">
                <Check className="size-6" />
                <p>{ui.sent}</p>
              </div>
            ) : (
              <form action={action} className="contact-form">
                <div className="field-row">
                  <label>
                    <span>{ui.name}</span>
                    <input name="name" required autoComplete="name" placeholder="Jane Doe" />
                  </label>
                  <label>
                    <span>{ui.email}</span>
                    <input name="email" type="email" required autoComplete="email" placeholder="jane@company.com" />
                  </label>
                </div>
                <label>
                  <span>{ui.message}</span>
                  <textarea name="message" required rows={5} placeholder="Tell me about your project…" />
                </label>
                {accessKey && <input type="hidden" name="access_key" value={accessKey} />}
                <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" className="hp" aria-hidden="true" />
                <button className="btn btn-primary" disabled={pending}>
                  {pending ? ui.sending : ui.send}
                  <Send className="size-4" />
                </button>
                {state.status === 'error' && (
                  <p className="form-error" role="alert">
                    {ui.sendError}
                  </p>
                )}
              </form>
            )}
          </Reveal>
        )}
      </div>
      <Reveal className="contact-sign">
        <Avatar />
        <span>
          {persona.person.name} · {persona.person.role}
        </span>
      </Reveal>
    </div>
  )
}
