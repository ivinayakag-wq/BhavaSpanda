import { ArrowRight, Heart, Play, Shield, CheckCircle, Users, Download, Sparkles, HeartHandshake, Sprout, MessageCircleHeart, CircleCheck, Compass, Lock, Globe } from "lucide-react";
import FadeUp from "@/components/FadeUp";

const SocialIcons = [
  () => <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
  () => <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>,
  () => <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
  () => <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>,
];

/* Indian face IDs from pravatar.cc */
const INDIAN = { woman1: 44, woman2: 45, woman3: 26, man1: 68, man2: 64, man3: 53, man4: 57, elder: 62, couple1: 32, couple2: 47 };

export default function Home() {
  return (
    <div className="font-body" style={{ background: "#FAFAF8" }}>

      {/* ═══════ NAVBAR ═══════ */}
      <nav className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between px-6 py-4 md:px-12" style={{ background: "rgba(250,250,248,0.9)", backdropFilter: "blur(12px)" }}>
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: "#EC4899" }}>
            <Heart className="h-5 w-5 text-white" fill="white" />
          </div>
          <span className="font-name text-lg font-bold" style={{ color: "#1A1A1A" }}>Isha Connect</span>
        </div>
        <div className="hidden items-center gap-8 md:flex">
          <a href="#how-it-works" className="text-sm font-medium transition-colors hover:text-[#EC4899]" style={{ color: "#6B655A" }}>Features</a>
          <a href="#communities" className="text-sm font-medium transition-colors hover:text-[#EC4899]" style={{ color: "#6B655A" }}>Communities</a>
          <a href="#trust" className="text-sm font-medium transition-colors hover:text-[#EC4899]" style={{ color: "#6B655A" }}>About</a>
          <a href="#contact" className="text-sm font-medium transition-colors hover:text-[#EC4899]" style={{ color: "#6B655A" }}>Contact</a>
        </div>
        <a href="/auth"
          className="flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-[0.97]"
          style={{ background: "#EC4899" }}>
          Get App <Download className="h-4 w-4" />
        </a>
      </nav>

      {/* ═══════ HERO ═══════ */}
      <section className="relative min-h-dvh overflow-hidden pt-20" style={{ background: "#FAFAF8" }}>
        <div className="pointer-events-none absolute -right-20 -top-20 h-[250px] w-[250px] rounded-full opacity-15 sm:-right-32 sm:-top-32 sm:h-[500px] sm:w-[500px] sm:opacity-20" style={{ background: "linear-gradient(135deg, #EC4899, #F472B6)" }} />
        <div className="pointer-events-none absolute -left-10 bottom-20 h-[150px] w-[150px] rounded-full opacity-10 sm:-left-20 sm:h-[300px] sm:w-[300px]" style={{ background: "#EC4899" }} />

        <div className="relative mx-auto flex min-h-[calc(100vh-80px)] max-w-6xl flex-col items-center justify-center gap-12 px-6 lg:flex-row lg:gap-16 lg:px-12">
          <div className="relative z-10 max-w-xl text-center lg:text-left">
            <FadeUp>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold" style={{ background: "rgba(236,72,153,0.08)", color: "#EC4899" }}>
                <Sparkles className="h-3.5 w-3.5" /> For Spiritual Seekers
              </div>
              <h1 className="font-name leading-tight" style={{ fontSize: "clamp(36px, 5.5vw, 64px)", fontWeight: 700, color: "#1A1A1A" }}>
                Find Someone Who <span style={{ color: "#EC4899" }}>Truly Gets</span> Your Path
              </h1>
            </FadeUp>
            <FadeUp delay={0.1}>
              <p className="mt-5 text-lg md:text-xl" style={{ color: "#6B655A" }}>
                Not another dating app. A conscious matchmaking platform built by spiritual seekers, for spiritual seekers. Powered by insights, not swipes.
              </p>
            </FadeUp>
            <FadeUp delay={0.2}>
              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
                <a href="/auth"
                  className="inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-base font-semibold text-white shadow-lg transition-all hover:brightness-110 active:scale-[0.97]"
                  style={{ background: "#EC4899", boxShadow: "0 4px 20px rgba(236,72,153,0.35)" }}>
                  Yes, Let&apos;s Go... <ArrowRight className="h-4 w-4" />
                </a>
                <button type="button" className="inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold transition-all hover:bg-gray-100"
                  style={{ color: "#1A1A1A", border: "1px solid #E5E5E5" }}>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full" style={{ background: "#EC4899" }}>
                    <Play className="h-3.5 w-3.5 text-white" fill="white" />
                  </div>
                  Watch Intro Video
                </button>
              </div>
            </FadeUp>
            <FadeUp delay={0.3}>
              <div className="mt-8 flex items-center gap-3 lg:justify-start">
                <div className="flex -space-x-2">
                  {[INDIAN.woman1, INDIAN.man1, INDIAN.woman2, INDIAN.man2].map((img) => (
                    <img key={img} src={`https://i.pravatar.cc/80?img=${img}`} alt="" className="h-9 w-9 rounded-full border-2 border-white object-cover" loading="lazy" />
                  ))}
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: "#1A1A1A" }}>30k+ Active Seekers</p>
                  <p className="text-[11px]" style={{ color: "#6B655A" }}>Isha, ISKCON, Osho & more</p>
                </div>
              </div>
            </FadeUp>
          </div>

          <FadeUp delay={0.2} className="relative z-10">
            <div className="relative" style={{ width: 320, height: 520 }}>
              <div className="absolute left-0 top-0 overflow-hidden rounded-[2rem] border-[6px] shadow-2xl" style={{ width: 280, height: 500, borderColor: "#1A1A1A", background: "#fff" }}>
                <img src={`https://i.pravatar.cc/600?img=${INDIAN.woman1}`} alt="" className="h-full w-full object-cover" loading="lazy" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-5">
                  <p className="text-xl font-bold text-white">Priya, 26</p>
                  <p className="text-xs text-white/80">Isha Meditator · Coimbatore</p>
                  <div className="mt-2 flex gap-2">
                    <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] text-white">Yoga</span>
                    <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] text-white">Meditation</span>
                  </div>
                </div>
              </div>
              <div className="absolute -right-8 top-16 rounded-2xl p-3 shadow-xl" style={{ background: "white", width: 160 }}>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full" style={{ background: "#EC4899" }}>
                    <Heart className="h-4 w-4 text-white" fill="white" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold" style={{ color: "#1A1A1A" }}>Match Activity</p>
                    <p className="text-[9px]" style={{ color: "#6B655A" }}>3 new today</p>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-4 -left-4 rounded-2xl px-3 py-2 shadow-xl" style={{ background: "white" }}>
                <p className="text-[10px] font-bold" style={{ color: "#EC4899" }}>30k+</p>
                <p className="text-[8px]" style={{ color: "#6B655A" }}>seekers</p>
              </div>
            </div>
          </FadeUp>
        </div>

        <div className="pointer-events-none absolute bottom-8 left-6 hidden flex-col gap-3 lg:flex">
          {SocialIcons.map((Icon, i) => (
            <div key={i} className="pointer-events-auto flex h-9 w-9 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-gray-100" style={{ color: "#6B655A" }}>
              <Icon />
            </div>
          ))}
        </div>
      </section>

      {/* ═══════ FREE TO USE BANNER ═══════ */}
      <section className="px-6 py-6 md:px-12 md:py-8" style={{ background: "rgba(236,72,153,0.04)", borderTop: "1px solid rgba(236,72,153,0.08)", borderBottom: "1px solid rgba(236,72,153,0.08)" }}>
        <div className="mx-auto max-w-4xl text-center">
          <FadeUp>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: "rgba(236,72,153,0.1)" }}>
                <CheckCircle className="h-5 w-5" style={{ color: "#EC4899" }} />
              </div>
              <div>
                <p className="font-name text-xl font-bold md:text-2xl" style={{ color: "#1A1A1A" }}>
                  100% Free to Use — No Hidden Costs
                </p>
                <p className="mt-1 text-sm" style={{ color: "#6B655A" }}>
                  All features included. No premium tiers. No paywalls. Just meaningful connections.
                </p>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ═══════ WE ARE YOU ═══════ */}
      <section className="px-6 py-16 md:px-12 md:py-24" style={{ background: "#FFFFFF" }}>
        <div className="mx-auto max-w-6xl">
          <FadeUp>
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="font-name text-3xl font-bold md:text-4xl" style={{ color: "#1A1A1A" }}>
                We Understand Because <span style={{ color: "#EC4899" }}>We Are You</span>
              </h2>
              <p className="mt-4 text-lg leading-relaxed" style={{ color: "#6B655A" }}>
                We&apos;re spiritual seekers ourselves. We know the struggle of finding someone who truly understands your path, your practices, and your values. This is why we built this — for ourselves and for you.
              </p>
            </div>
          </FadeUp>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { icon: HeartHandshake, title: "The Loneliness of the Path", desc: "Walking the spiritual path can feel isolating when those around you don't understand your journey. We know this feeling intimately." },
              { icon: MessageCircleHeart, title: "The Need for Deep Connection", desc: "You deserve a partner who doesn't just tolerate your practices but celebrates them with you. Someone who truly 'gets it.'" },
              { icon: Sprout, title: "Growth Through Togetherness", desc: "When two seekers walk together, the journey becomes richer, more beautiful, and more fulfilling." },
            ].map((card, i) => {
              const Icon = card.icon;
              return (
                <FadeUp key={card.title} delay={0.1 * (i + 1)}>
                  <div className="rounded-2xl border p-8 text-center transition-shadow hover:shadow-lg" style={{ borderColor: "#EBEBEB", background: "#FAFAF8" }}>
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full" style={{ background: "rgba(236,72,153,0.08)" }}>
                      <Icon className="h-7 w-7" style={{ color: "#EC4899" }} />
                    </div>
                    <h3 className="mt-5 font-name text-lg font-bold" style={{ color: "#1A1A1A" }}>{card.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed" style={{ color: "#6B655A" }}>{card.desc}</p>
                  </div>
                </FadeUp>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════ HOW IT WORKS ═══════ */}
      <section id="how-it-works" className="px-6 py-16 md:px-12 md:py-24" style={{ background: "#FFF5F7" }}>
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-center gap-12 lg:flex-row lg:items-start">
            <FadeUp className="relative flex-1">
              <div className="relative mx-auto" style={{ width: 300, height: 480 }}>
                <div className="rounded-[2rem] border-[5px] shadow-2xl" style={{ width: 280, height: 460, borderColor: "#1A1A1A", background: "#F3F4F6" }}>
                  <img src={`https://i.pravatar.cc/600?img=${INDIAN.man1}`} alt="" className="h-full w-full rounded-[2rem] object-cover" loading="lazy" />
                </div>
                <div className="absolute -right-4 top-20 rounded-xl px-3 py-1.5 shadow-lg" style={{ background: "white" }}>
                  <p className="text-[10px] font-semibold" style={{ color: "#EC4899" }}>Devotee</p>
                </div>
                <div className="absolute -left-8 bottom-32 w-44 rounded-xl p-3 shadow-lg" style={{ background: "white" }}>
                  <p className="text-[10px] font-bold" style={{ color: "#1A1A1A" }}>Match Activity</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <img src={`https://i.pravatar.cc/40?img=${INDIAN.woman2}`} alt="" className="h-6 w-6 rounded-full object-cover" loading="lazy" />
                    <div>
                      <p className="text-[9px] font-semibold" style={{ color: "#1A1A1A" }}>Meera Sharma</p>
                      <p className="text-[8px]" style={{ color: "#6B655A" }}>Pune, Maharashtra</p>
                    </div>
                  </div>
                </div>
              </div>
            </FadeUp>

            <div className="flex-1 space-y-6">
              <FadeUp>
                <h2 className="font-name text-3xl font-bold md:text-4xl" style={{ color: "#1A1A1A" }}>How It Works</h2>
              </FadeUp>
              {[
                { icon: Compass, title: "Spiritual Matching", desc: "We match based on practices, values, and spiritual depth — not just photos." },
                { icon: MessageCircleHeart, title: "Meaningful Conversations", desc: "Connect through AI-powered icebreakers based on shared spiritual interests." },
                { icon: Shield, title: "Community First", desc: "Join a trusted community of verified seekers from your spiritual tradition." },
              ].map((card, i) => {
                const Icon = card.icon;
                return (
                  <FadeUp key={card.title} delay={0.1 * (i + 1)}>
                    <div className="flex items-start gap-4 rounded-2xl p-5 transition-shadow hover:shadow-md" style={{ background: "white" }}>
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full" style={{ background: "rgba(236,72,153,0.08)" }}>
                        <Icon className="h-6 w-6" style={{ color: "#EC4899" }} />
                      </div>
                      <div>
                        <h3 className="font-name text-base font-bold" style={{ color: "#1A1A1A" }}>{card.title}</h3>
                        <p className="mt-1 text-sm leading-relaxed" style={{ color: "#6B655A" }}>{card.desc}</p>
                      </div>
                    </div>
                  </FadeUp>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ COMMUNITIES ═══════ */}
      <section id="communities" className="px-6 py-16 md:px-12 md:py-24" style={{ background: "#FAFAF8" }}>
        <div className="mx-auto max-w-6xl">
          <FadeUp>
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="font-name text-3xl font-bold md:text-4xl" style={{ color: "#1A1A1A" }}>
                A Home for <span style={{ color: "#EC4899" }}>Every Spiritual Seeker</span>
              </h2>
              <p className="mt-4 text-lg leading-relaxed" style={{ color: "#6B655A" }}>
                We serve seekers from all spiritual traditions. Whether you&apos;re an Isha meditator,
                an ISKCON devotee, an Osho follower, or walking any other path — this is your community.
              </p>
            </div>
          </FadeUp>

          <FadeUp delay={0.1}>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              {["Isha Foundation", "ISKCON", "Osho", "Art of Living", "Brahma Kumaris", "Transcendental Meditation", "Yoga Alliance", "And more..."].map((name) => (
                <span key={name}
                  className="inline-flex items-center gap-2 rounded-full border px-5 py-2 text-sm font-medium transition-all hover:shadow-md"
                  style={{ borderColor: "#EBEBEB", background: "#FFFFFF", color: "#1A1A1A" }}>
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: "#EC4899" }} />
                  {name}
                </span>
              ))}
            </div>
          </FadeUp>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { icon: Shield, title: "Your Privacy is Sacred", desc: "Even developers cannot access your personal data. Your journey stays yours." },
              { icon: CircleCheck, title: "Every Profile is Verified", desc: "Real seekers, real intentions, real trust. No fake accounts, no bots." },
              { icon: Users, title: "Built by Seekers, For Seekers", desc: "We're in this together. This platform was born from our own need for connection." },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <FadeUp key={item.title} delay={0.1 * (i + 1)}>
                  <div className="flex flex-col items-center gap-3 rounded-xl p-6 text-center transition-shadow hover:shadow-md" style={{ background: "#FFFFFF" }}>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full" style={{ background: "rgba(236,72,153,0.08)" }}>
                      <Icon className="h-6 w-6" style={{ color: "#EC4899" }} />
                    </div>
                    <h3 className="text-base font-bold" style={{ color: "#1A1A1A" }}>{item.title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: "#6B655A" }}>{item.desc}</p>
                  </div>
                </FadeUp>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════ SMART MATCH ═══════ */}
      <section id="smart-match" className="px-6 py-16 md:px-12 md:py-24" style={{ background: "#FFFFFF" }}>
        <div className="mx-auto max-w-6xl text-center">
          <FadeUp>
            <h2 className="font-name text-3xl font-bold md:text-4xl" style={{ color: "#1A1A1A" }}>AI-Powered Smart Match</h2>
            <p className="mt-3 text-base md:text-lg" style={{ color: "#6B655A" }}>We look beyond photos to find someone who truly aligns with your path</p>
          </FadeUp>

          <FadeUp delay={0.15} className="relative mt-12">
            <div className="flex flex-col items-center justify-center gap-6 md:flex-row md:gap-0">
              <div className="relative z-10">
                <div className="rounded-[2rem] shadow-xl" style={{ width: 240, height: 320, background: "#F3F4F6" }}>
                  <img src={`https://i.pravatar.cc/500?img=${INDIAN.woman3}`} alt="" className="h-full w-full rounded-[2rem] object-cover" loading="lazy" />
                </div>
                <div className="absolute -left-12 top-12 rounded-xl px-3 py-2 shadow-lg" style={{ background: "white" }}>
                  <p className="text-[10px] font-bold" style={{ color: "#1A1A1A" }}>Yoga Practice</p>
                  <p className="text-[9px]" style={{ color: "#6B655A" }}>Daily Shambhavi</p>
                </div>
              </div>

              <div className="relative z-20 flex flex-col items-center gap-1 px-4 md:px-8">
                <Heart className="h-6 w-6" style={{ color: "#EC4899" }} fill="#EC4899" />
                <Heart className="h-4 w-4" style={{ color: "#F472B6" }} fill="#F472B6" />
                <Heart className="h-5 w-5" style={{ color: "#EC4899" }} fill="#EC4899" />
                <Heart className="h-3 w-3" style={{ color: "#F472B6" }} fill="#F472B6" />
              </div>

              <div className="relative z-10">
                <div className="rounded-[2rem] shadow-xl" style={{ width: 240, height: 320, background: "#F3F4F6" }}>
                    <img src={`https://i.pravatar.cc/500?img=${INDIAN.man3}`} alt="" className="h-full w-full rounded-[2rem] object-cover" loading="lazy" />
                </div>
                <div className="absolute -right-12 top-12 rounded-xl px-3 py-2 shadow-lg" style={{ background: "white" }}>
                  <p className="text-[10px] font-bold" style={{ color: "#1A1A1A" }}>14 Common Songs</p>
                  <p className="text-[9px]" style={{ color: "#6B655A" }}>Kirtan lovers</p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <div className="rounded-xl px-4 py-2.5 shadow-lg" style={{ background: "white" }}>
                <p className="text-[11px] font-bold" style={{ color: "#1A1A1A" }}>2 Common Places</p>
                <p className="text-[9px]" style={{ color: "#6B655A" }}>Dhyanalinga, Isha Yoga Center</p>
              </div>
              <div className="rounded-xl px-4 py-2.5 shadow-lg" style={{ background: "white" }}>
                <p className="text-[11px] font-bold" style={{ color: "#1A1A1A" }}>Shared Practice</p>
                <p className="text-[9px]" style={{ color: "#6B655A" }}>Surya Kriya, Yogasanas</p>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ═══════ VERIFIED PROFILES ═══════ */}
      <section id="features" className="px-6 py-16 md:px-12 md:py-24" style={{ background: "#FFF5F7" }}>
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-12 lg:flex-row">
          <FadeUp className="flex-1">
            <h2 className="font-name text-3xl font-bold md:text-4xl" style={{ color: "#1A1A1A" }}>
              Only Real Verified Profiles <br />Are Allowed To Join <span style={{ color: "#16a34a" }}>✓</span>
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed" style={{ color: "#6B655A" }}>
              Every profile is manually verified. No fake accounts, no bots. Just real seekers looking for meaningful connections.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button type="button" className="inline-flex items-center gap-3 rounded-full border px-6 py-3 text-sm font-semibold transition-all hover:bg-gray-50" style={{ borderColor: "#E5E5E5", color: "#1A1A1A" }}>
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                Coming Soon for iOS
              </button>
              <button type="button" className="inline-flex items-center gap-3 rounded-full border px-6 py-3 text-sm font-semibold transition-all hover:bg-gray-50" style={{ borderColor: "#E5E5E5", color: "#1A1A1A" }}>
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 010 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.8 8.99l-2.3 2.302-8.636-8.634z"/></svg>
                Coming Soon for Android
              </button>
            </div>
          </FadeUp>
          <FadeUp delay={0.15} className="relative flex-1">
            <div className="relative mx-auto" style={{ width: 300, height: 380 }}>
              <div className="rounded-[2rem] shadow-2xl" style={{ width: 280, height: 360, background: "#F3F4F6" }}>
                <img src={`https://i.pravatar.cc/500?img=${INDIAN.man4}`} alt="" className="h-full w-full rounded-[2rem] object-cover" loading="lazy" />
              </div>
              <div className="absolute -right-4 bottom-16 rounded-2xl rounded-br-sm p-3 shadow-xl" style={{ background: "white", maxWidth: 200 }}>
                <p className="text-[11px] font-semibold" style={{ color: "#1A1A1A" }}>Namaste! How are you?</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <img src={`https://i.pravatar.cc/40?img=${INDIAN.woman1}`} alt="" className="h-5 w-5 rounded-full object-cover" loading="lazy" />
                  <div>
                    <p className="text-[9px] font-semibold" style={{ color: "#1A1A1A" }}>Ananya Reddy</p>
                    <p className="text-[8px]" style={{ color: "#6B655A" }}>2.5km Away</p>
                  </div>
                </div>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ═══════ TRUST ═══════ */}
      <section id="trust" className="px-6 py-16 md:px-12 md:py-24" style={{ background: "#FAFAF8" }}>
        <div className="mx-auto max-w-6xl">
          <FadeUp>
            <h2 className="mb-10 text-center font-name text-3xl font-bold md:text-4xl" style={{ color: "#1A1A1A" }}>
              Built on Trust, Privacy &amp; <span style={{ color: "#EC4899" }}>Deep Understanding</span>
            </h2>
          </FadeUp>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { icon: Lock, title: "Uncompromising Privacy", desc: "Your journey is yours. Your data stays yours. We don't sell, share, or misuse what you trust us with. Period." },
              { icon: Compass, title: "Deep Understanding", desc: "We don't just match profiles. We match practices, values, and spiritual aspirations. Because that's what truly matters." },
              { icon: Globe, title: "Community First", desc: "This isn't a product. It's a community gathering space where meaningful connections naturally bloom. You belong here." },
            ].map((col, i) => {
              const Icon = col.icon;
              return (
                <FadeUp key={col.title} delay={0.1 * (i + 1)}>
                  <div className="flex flex-col items-center gap-4 rounded-2xl border p-8 text-center transition-shadow hover:shadow-lg" style={{ borderColor: "#EBEBEB", background: "#FFFFFF" }}>
                    <div className="flex h-14 w-14 items-center justify-center rounded-full" style={{ background: "rgba(236,72,153,0.08)" }}>
                      <Icon className="h-7 w-7" style={{ color: "#EC4899" }} />
                    </div>
                    <h3 className="mt-1 font-name text-lg font-bold" style={{ color: "#1A1A1A" }}>{col.title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: "#6B655A" }}>{col.desc}</p>
                  </div>
                </FadeUp>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════ STATS ═══════ */}
      <section className="px-6 py-16 md:px-12 md:py-20" style={{ background: "#FFFFFF" }}>
        <div className="mx-auto max-w-5xl">
          <FadeUp>
            <div className="overflow-hidden rounded-3xl p-8 md:p-12" style={{ background: "#1A1A1A" }}>
              <div className="flex flex-col items-center gap-10 md:flex-row md:items-start">
                <div className="flex-1">
                  <h3 className="font-name text-xl font-bold text-white md:text-2xl">Find Your Person. Start Your Story.</h3>
                  <p className="mt-2 text-sm text-white/60">Join thousands of spiritual seekers finding love every day.</p>
                  <div className="relative mt-8 h-48">
                    <svg className="absolute inset-0 h-full w-full" style={{ opacity: 0.2 }}>
                      <line x1="30%" y1="20%" x2="60%" y2="50%" stroke="#EC4899" strokeWidth="1" />
                      <line x1="60%" y1="50%" x2="80%" y2="30%" stroke="#EC4899" strokeWidth="1" />
                      <line x1="60%" y1="50%" x2="40%" y2="80%" stroke="#EC4899" strokeWidth="1" />
                      <line x1="40%" y1="80%" x2="15%" y2="65%" stroke="#EC4899" strokeWidth="1" />
                      <line x1="80%" y1="30%" x2="90%" y2="70%" stroke="#EC4899" strokeWidth="1" />
                    </svg>
                    {[
                      { img: INDIAN.man1, x: "25%", y: "15%" },
                      { img: INDIAN.woman1, x: "55%", y: "40%" },
                      { img: INDIAN.man3, x: "75%", y: "25%" },
                      { img: INDIAN.woman3, x: "35%", y: "70%" },
                      { img: INDIAN.elder, x: "12%", y: "58%" },
                      { img: INDIAN.man2, x: "85%", y: "65%" },
                    ].map((p, i) => (
                      <div key={i} className="absolute" style={{ left: p.x, top: p.y, transform: "translate(-50%, -50%)" }}>
                        <img src={`https://i.pravatar.cc/80?img=${p.img}`} alt="" className="h-10 w-10 rounded-full border-2 shadow-lg" style={{ borderColor: "#EC4899" }} loading="lazy" />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-6 text-center md:text-left">
                  {[
                    { number: "15k+", label: "Dates And Matches Everyday" },
                    { number: "1,458", label: "New Member Sign Ups Everyday" },
                    { number: "30k+", label: "Members from around the world" },
                  ].map((stat) => (
                    <div key={stat.label}>
                      <p className="font-name text-3xl font-bold" style={{ color: "#EC4899" }}>{stat.number}</p>
                      <p className="text-sm text-white/60">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ═══════ FOOTER ═══════ */}
      <footer id="contact" className="px-6 py-10 md:px-12" style={{ background: "#FAFAF8", borderTop: "1px solid #EBEBEB" }}>
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: "#EC4899" }}>
              <Heart className="h-4 w-4 text-white" fill="white" />
            </div>
            <span className="font-name text-base font-bold" style={{ color: "#1A1A1A" }}>Isha Connect</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#how-it-works" className="text-sm font-medium transition-colors hover:text-[#EC4899]" style={{ color: "#6B655A" }}>Features</a>
            <a href="#communities" className="text-sm font-medium transition-colors hover:text-[#EC4899]" style={{ color: "#6B655A" }}>Communities</a>
            <a href="#trust" className="text-sm font-medium transition-colors hover:text-[#EC4899]" style={{ color: "#6B655A" }}>About</a>
            <a href="#contact" className="text-sm font-medium transition-colors" style={{ color: "#EC4899" }}>Contact</a>
          </div>
          <div className="flex items-center gap-3">
            {SocialIcons.map((Icon, i) => (
              <a key={i} href="#" className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-gray-100" style={{ color: "#6B655A" }}>
                <Icon />
              </a>
            ))}
          </div>
        </div>
        <p className="mt-6 text-center text-xs" style={{ color: "#6B655A" }}>
          &copy; {new Date().getFullYear()} Isha Connect — Built by seekers, for seekers. Privacy First.
        </p>
      </footer>
    </div>
  );
}
