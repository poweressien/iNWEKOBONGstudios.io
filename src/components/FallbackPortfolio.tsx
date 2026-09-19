import { portfolio } from '@/data/portfolio'
import { projects } from '@/data/projects'

export function FallbackPortfolio() {
  return (
    <div className="h-full w-full overflow-y-auto bg-[#05050b] text-white">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <div className="font-mono text-xs tracking-[0.3em] text-[#6ea8ff]">3D VIEW UNAVAILABLE ON THIS DEVICE</div>
        <h1 className="font-display mt-3 text-4xl font-bold">{portfolio.name}</h1>
        <p className="mt-1 text-lg text-[#a685ff]">{portfolio.role} · {portfolio.studio}</p>
        <p className="mt-6 text-white/80 leading-relaxed">{portfolio.bio}</p>

        <section className="mt-10">
          <h2 className="font-display text-xl font-semibold text-[#6ea8ff]">Skills</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {portfolio.skills.map((s) => (
              <span key={s.name} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm">
                {s.name}
              </span>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-xl font-semibold text-[#ffd9a8]">Experience</h2>
          <div className="mt-3 space-y-4">
            {portfolio.experience.map((exp) => (
              <div key={exp.title} className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="font-medium">{exp.title} · <span className="text-white/60">{exp.org}</span></div>
                <div className="text-sm text-white/50">{exp.period}</div>
                <p className="mt-1 text-sm text-white/70">{exp.description}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm text-white/60">
            <span className="text-[#ffd9a8] font-medium">Education — </span>
            {portfolio.education}
          </p>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-xl font-semibold text-[#5ee6b0]">Projects</h2>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {projects.map((p) => (
              <div key={p.id} className="rounded-xl border border-white/10 bg-white/5 p-4" style={{ borderLeftColor: p.accent, borderLeftWidth: 3 }}>
                <div className="font-display font-semibold">{p.title}</div>
                <p className="mt-1 text-sm text-white/70">{p.description}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {p.tech.map((t) => (
                    <span key={t} className="rounded-full bg-white/5 px-2 py-0.5 font-mono text-[10px] text-white/60">{t}</span>
                  ))}
                </div>
                {p.githubUrl && (
                  <a href={p.githubUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs text-[#6ea8ff] underline">
                    View on GitHub
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10 mb-16">
          <h2 className="font-display text-xl font-semibold text-[#6ea8ff]">Contact</h2>
          <div className="mt-3 flex flex-wrap gap-3 text-sm">
            <a href={`mailto:${portfolio.email}`} className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 hover:bg-white/10">Email</a>
            <a href={portfolio.githubUrl} target="_blank" rel="noreferrer" className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 hover:bg-white/10">GitHub</a>
            {portfolio.linkedinUrl && (
              <a href={portfolio.linkedinUrl} target="_blank" rel="noreferrer" className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 hover:bg-white/10">LinkedIn</a>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
