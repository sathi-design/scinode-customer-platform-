import Link from "next/link";
import {
  FlaskConical, Factory, Microscope, ArrowRight,
  CheckCircle2, Shield, Zap, Globe,
  BarChart3, Users, FileText, ChevronRight,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";

const FEATURES = [
  { icon: BarChart3, title: "Real-time Dashboards",     desc: "Role-specific analytics with live project and proposal tracking" },
  { icon: Users,     title: "Collaboration Hub",        desc: "Connect CROs, manufacturers, and scientists on a single platform" },
  { icon: FileText,  title: "Smart Proposals",          desc: "Structured proposal workflows with status tracking and notifications" },
  { icon: Shield,    title: "Compliance Ready",         desc: "Built-in certification management and GMP/ICH compliance tracking" },
  { icon: Zap,       title: "Instant Matching",         desc: "AI-powered matching between project requirements and supplier capabilities" },
  { icon: Globe,     title: "Global Network",           desc: "Access verified suppliers across 60+ countries" },
];

const ROLES = [
  {
    icon: FlaskConical,
    role: "CRO",
    title: "Contract Research Organizations",
    desc: "Showcase your clinical research capabilities, manage proposals, and collaborate on multi-phase trials.",
    features: ["Project & proposal management", "Clinical trial tracking", "Collaboration tools"],
    accentColor: "#2ACB83",
    bg: "#E8FBF2",
    href: "/signup",
  },
  {
    icon: Factory,
    role: "Manufacturing",
    title: "CDMO / CMO / API Facilities",
    desc: "Track production orders, manage batch records, and demonstrate your GMP compliance credentials.",
    features: ["Production order management", "Capacity planning", "Regulatory compliance"],
    accentColor: "#0077CC",
    bg: "#E6F3FB",
    href: "/signup/manufacturer",
  },
  {
    icon: Microscope,
    role: "Scientist",
    title: "Researchers & Consultants",
    desc: "Connect your expertise with cutting-edge pharma projects and expand your research collaborations.",
    features: ["Research portfolio showcase", "Collaboration matching", "Publication tracking"],
    accentColor: "#6237C7",
    bg: "#EDE8FB",
    href: "/signup",
  },
];

const STATS = [
  { value: "2,400+", label: "Verified Suppliers" },
  { value: "18,000+", label: "Projects Completed" },
  { value: "60+", label: "Countries" },
  { value: "99.2%", label: "SLA Compliance" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ── Navigation ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#020202] border-b border-white/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/">
            <div className="bg-white rounded-lg px-3 py-1.5 inline-block">
              <Logo height={22} />
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            {["Features", "For CROs", "Manufacturing", "Scientists"].map((item) => (
              <a key={item} href="#" className="text-white/45 text-sm hover:text-white transition-colors">{item}</a>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login"
              className="text-white/45 hover:text-white text-sm font-medium transition-colors px-3 py-1.5">
              Sign in
            </Link>
            <Link href="/signup"
              className="bg-primary text-[#020202] text-sm font-medium rounded-lg px-4 py-1.5 hover:bg-[#22b874] transition-colors">
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="pt-28 pb-20 px-4 bg-[#020202]">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-primary text-xs font-medium">Now in open beta — 2,400+ suppliers onboarded</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-semibold text-white leading-tight">
            The Supplier Portal
            <br />
            <span className="text-primary">Built for Pharma</span>
          </h1>
          <p className="mt-6 text-lg text-white/45 max-w-2xl mx-auto leading-relaxed">
            SCINODE connects CROs, manufacturing facilities, and scientists on one intelligent platform.
            Manage proposals, track projects, and close deals — all in one place.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/signup"
              className="inline-flex items-center justify-center gap-2 bg-primary text-[#020202] font-medium rounded-lg px-6 py-3 hover:bg-[#22b874] transition-colors">
              Start for free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/login"
              className="inline-flex items-center justify-center gap-2 border border-white/20 text-white font-medium rounded-lg px-6 py-3 hover:border-white/40 transition-colors">
              Sign in to portal
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="max-w-3xl mx-auto mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center border border-white/8 rounded-xl p-4">
              <p className="text-2xl font-semibold text-white">{stat.value}</p>
              <p className="text-xs text-white/45 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Role Cards ── */}
      <section className="py-20 px-4 bg-bg-page">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-semibold text-text-primary">Built for every pharma role</h2>
            <p className="text-text-muted mt-3 max-w-xl mx-auto">
              Choose your role and get a personalized dashboard, workflows, and matching.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ROLES.map((role) => {
              const Icon = role.icon;
              return (
                <div key={role.role} className="card-standard group hover:border-[#B3B7BD]/80 transition-colors">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: role.bg }}
                  >
                    <Icon className="w-6 h-6" style={{ color: role.accentColor }} />
                  </div>
                  <div className="inline-block px-2 py-0.5 rounded text-xs font-medium mb-2"
                    style={{ backgroundColor: role.bg, color: role.accentColor }}>
                    {role.role}
                  </div>
                  <h3 className="text-base font-medium text-text-primary mt-1">{role.title}</h3>
                  <p className="text-sm text-text-muted mt-2 leading-relaxed">{role.desc}</p>
                  <ul className="mt-4 space-y-2">
                    {role.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-xs text-text-body">
                        <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: role.accentColor }} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href={role.href}
                    className="mt-5 inline-flex items-center gap-1 text-sm font-medium transition-colors"
                    style={{ color: role.accentColor }}>
                    Get started <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section className="py-20 px-4 bg-white border-t border-bg-subtle">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-semibold text-text-primary">
              Everything your team needs
            </h2>
            <p className="text-text-muted mt-3">
              From proposals to delivery — SCINODE covers the full engagement lifecycle.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="p-5 rounded-xl border border-[#B3B7BD]/30 hover:border-[#B3B7BD]/60 transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-bg-success flex items-center justify-center mb-3">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="text-sm font-medium text-text-primary">{feature.title}</h3>
                  <p className="text-xs text-text-muted mt-1.5 leading-relaxed">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-4 bg-[#020202]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-display font-semibold text-white">
            Ready to join the network?
          </h2>
          <p className="text-white/45 mt-3 leading-relaxed">
            Join 2,400+ verified suppliers already using SCINODE to manage their pharma business.
          </p>
          <Link href="/signup"
            className="mt-8 inline-flex items-center gap-2 bg-primary text-[#020202] font-medium rounded-lg px-8 py-3 hover:bg-[#22b874] transition-colors">
            Create your free account
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-[#020202] border-t border-white/8 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/">
            <div className="bg-white rounded-lg px-2.5 py-1 inline-block">
              <Logo height={16} />
            </div>
          </Link>
          <p className="text-white/25 text-xs">© 2025 Scimplify. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
