"use client";

import { useState, useEffect, useRef, memo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/logo";
import {
  GraduationCap,
  BookOpen,
  Trophy,
  Users,
  Video,
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  ChevronRight,
  Star,
  Target,
  Award,
  Code,
  Database,
  Globe,
  Cpu,
  Shield,
  Sparkles,
} from "lucide-react";

const motivationQuotes = [
  { quote: "Success is not final, failure is not fatal: It is the courage to continue that counts.", author: "Winston Churchill" },
  { quote: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { quote: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { quote: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela" },
  { quote: "Hard work beats talent when talent doesn't work hard.", author: "Tim Notke" },
];

const skills = [
  { name: "Python", icon: Code, category: "Programming" },
  { name: "Java", icon: Code, category: "Programming" },
  { name: "C/C++", icon: Code, category: "Programming" },
  { name: "Data Structures", icon: Database, category: "Core CS" },
  { name: "Algorithms", icon: Cpu, category: "Core CS" },
  { name: "Web Development", icon: Globe, category: "Development" },
  { name: "Database Management", icon: Database, category: "Core CS" },
  { name: "Operating Systems", icon: Shield, category: "Core CS" },
];

const achievements = [
  { number: "48", label: "DCET Rank", sublabel: "All Karnataka" },
  { number: "2nd", label: "Hassan District", sublabel: "Top Performer" },
  { number: "9.8", label: "Diploma CGPA", sublabel: "EEE Branch" },
  { number: "9.10", label: "Current CGPA", sublabel: "RVCE CSE" },
];

const features = [
  { icon: Video, title: "Live Classes", description: "Interactive Zoom sessions with expert faculty" },
  { icon: BookOpen, title: "Recorded Lectures", description: "Access to all recorded classes anytime" },
  { icon: Target, title: "Mock Tests", description: "Regular assessments with detailed analytics" },
  { icon: Trophy, title: "Rankings", description: "Track your progress with peer comparisons" },
  { icon: MessageCircle, title: "24/7 Support", description: "AI chatbot and faculty assistance" },
  { icon: Users, title: "Community", description: "Connect with fellow DCET aspirants" },
];

const Card3D = memo(function Card3D({ 
  children, 
  className = "",
  intensity = 10 
}: { 
  children: React.ReactNode; 
  className?: string;
  intensity?: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>();

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      if (!cardRef.current) return;
      const card = cardRef.current;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = (y - centerY) / intensity;
      const rotateY = (centerX - x) / intensity;
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });
  }, [intensity]);

  const handleMouseLeave = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (!cardRef.current) return;
    cardRef.current.style.transform = "perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)";
  }, []);

  useEffect(() => {
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`transition-transform duration-200 ease-out will-change-transform ${className}`}
      style={{ transformStyle: "preserve-3d" }}
    >
      {children}
    </div>
  );
});

const FeatureCard = memo(function FeatureCard({ 
  feature, 
  index 
}: { 
  feature: typeof features[0]; 
  index: number;
}) {
  return (
    <Card3D intensity={15}>
      <Card className="bg-stone-900 border border-amber-900/20 hover:border-amber-700/40 shadow-sm hover:shadow-xl hover:shadow-amber-900/10 transition-all duration-300 h-full">
        <CardContent className="p-6">
          <div className="w-14 h-14 bg-amber-900/20 rounded-2xl flex items-center justify-center mb-5">
            <feature.icon className="w-7 h-7 text-amber-500" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
          <p className="text-stone-400 text-sm leading-relaxed">{feature.description}</p>
        </CardContent>
      </Card>
    </Card3D>
  );
});

const ContactCard = memo(function ContactCard({ 
  contact 
}: { 
  contact: { icon: any; title: string; value: string; href: string | null };
}) {
  return (
    <Card3D intensity={20}>
      <Card className="bg-stone-900 border border-amber-900/20 hover:border-amber-700/40 shadow-sm hover:shadow-lg transition-all duration-300 text-center h-full">
        <CardContent className="p-8">
          <div className="w-16 h-16 bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-5">
            <contact.icon className="w-7 h-7 text-amber-500" />
          </div>
          <h3 className="font-bold text-white text-lg mb-2">{contact.title}</h3>
          {contact.href ? (
            <a href={contact.href} className="text-amber-400 hover:text-amber-300 hover:underline text-sm">
              {contact.value}
            </a>
          ) : (
            <p className="text-stone-400 text-sm">{contact.value}</p>
          )}
        </CardContent>
      </Card>
    </Card3D>
  );
});

const StatsCard = memo(function StatsCard({ 
  item, 
  index 
}: { 
  item: typeof achievements[0]; 
  index: number;
}) {
  return (
    <Card3D intensity={25}>
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center text-white border border-amber-500/20 hover:border-amber-500/40 hover:bg-white/15 transition-colors">
        <p className="text-4xl md:text-5xl font-bold mb-1 text-amber-400">{item.number}</p>
        <p className="text-amber-200/90 font-semibold">{item.label}</p>
        <p className="text-stone-400 text-sm mt-1">{item.sublabel}</p>
      </div>
    </Card3D>
  );
});

export default function LandingPage() {
  const [currentQuote, setCurrentQuote] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % motivationQuotes.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-stone-950">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-stone-950/90 backdrop-blur-md border-b border-amber-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Logo size="md" />
            <div className="hidden md:flex items-center space-x-8">
              <a href="#about" className="text-stone-400 hover:text-amber-400 transition font-medium">About</a>
              <a href="#features" className="text-stone-400 hover:text-amber-400 transition font-medium">Features</a>
              <a href="#skills" className="text-stone-400 hover:text-amber-400 transition font-medium">Skills</a>
              <a href="#contact" className="text-stone-400 hover:text-amber-400 transition font-medium">Contact</a>
            </div>
            <div className="flex items-center space-x-3">
              <Link href="/login">
                <Button variant="outline" className="hidden sm:flex border-amber-700/50 text-amber-400 hover:bg-amber-900/20 hover:text-amber-300">Login</Button>
              </Link>
              <Link href="/register?role=student">
                <Button className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white shadow-lg shadow-amber-900/30">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24 relative overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/3 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-amber-900/30 text-amber-400 hover:bg-amber-900/40 border border-amber-700/30 px-4 py-1.5">
                  <Star className="w-4 h-4 mr-1.5 fill-amber-500 text-amber-500" /> DCET Mentorship by Rank 48 (RVCE)
                </Badge>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                  <span className="bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 bg-clip-text text-transparent">Wintrix</span>{" "}
                  Academy
                </h1>
                <p className="text-lg md:text-xl text-stone-400 max-w-xl leading-relaxed">
                  <span className="text-amber-400 font-medium">Guidance. Strategy. Success.</span> Empowering <span className="text-white font-semibold">DCET 2027</span> Aspirants with mentorship from Mohammed Adnan, who secured All-Karnataka Rank 48 and is now pursuing CSE at RVCE.
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                <Link href="/register?role=student">
                  <Button size="lg" className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white h-12 px-8 shadow-lg shadow-amber-900/40">
                    <GraduationCap className="w-5 h-5 mr-2" />
                    Join as Student
                  </Button>
                </Link>
                <Link href="/register?role=teacher">
                  <Button size="lg" variant="outline" className="h-12 px-8 border-amber-700/50 text-amber-400 hover:bg-amber-900/20">
                    <BookOpen className="w-5 h-5 mr-2" />
                    Join as Teacher
                  </Button>
                </Link>
              </div>
              <div className="flex items-center gap-8 pt-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 border-2 border-stone-950 flex items-center justify-center text-white text-xs font-bold shadow-md">
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <p className="text-stone-400">
                  <span className="font-bold text-white">50+</span> Students enrolled
                </p>
              </div>
            </div>

            {/* Founder Photo */}
            <div className="relative">
              <Card3D intensity={30} className="relative mx-auto w-fit">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-amber-800 rounded-3xl blur-3xl opacity-15 scale-110" />
                <div className="relative bg-gradient-to-br from-stone-800 to-stone-900 rounded-3xl p-2 shadow-2xl border border-amber-900/30">
                  <Image
                    src="/founder.png"
                    alt="Mohammed Adnan - Founder"
                    width={400}
                    height={500}
                    className="rounded-2xl object-cover w-full max-w-[400px] h-auto"
                    priority
                    loading="eager"
                  />
                </div>
                
                <div className="absolute -left-4 md:-left-8 top-1/4 bg-stone-900 border border-amber-800/30 rounded-xl shadow-lg p-3 animate-float hidden sm:block">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-amber-900/30 rounded-lg flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">48</p>
                      <p className="text-xs text-stone-400">DCET Rank</p>
                    </div>
                  </div>
                </div>
                
                <div className="absolute -right-4 md:-right-8 bottom-1/4 bg-stone-900 border border-amber-800/30 rounded-xl shadow-lg p-3 animate-float hidden sm:block" style={{ animationDelay: "1s" }}>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-green-900/30 rounded-lg flex items-center justify-center">
                      <Award className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-white">Red Hat</p>
                      <p className="text-xs text-stone-400">Placed at</p>
                    </div>
                  </div>
                </div>
              </Card3D>
            </div>
          </div>
        </div>

      </section>

      {/* Stats Section */}
      <section className="py-14 bg-gradient-to-r from-stone-900 via-stone-900 to-stone-900 relative overflow-hidden border-y border-amber-900/20">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(180,83,9,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(180,83,9,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {achievements.map((item, index) => (
              <StatsCard key={index} item={item} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Motivation Quote */}
      <section className="py-10 bg-stone-900/50 border-b border-amber-900/20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Sparkles className="w-6 h-6 text-amber-500 mx-auto mb-3" />
          <p className="text-lg md:text-xl text-stone-300 italic leading-relaxed">
            &ldquo;{motivationQuotes[currentQuote].quote}&rdquo;
          </p>
          <p className="mt-3 text-amber-500 font-semibold">
            — {motivationQuotes[currentQuote].author}
          </p>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-stone-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-amber-900/30 text-amber-400 border border-amber-700/30">About the Founder</Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Mohammed Adnan
              </h2>
              <div className="prose prose-lg text-stone-400 space-y-4">
                <p>
                  I completed my SSLC at CKS, scoring <strong className="text-white">91.52%</strong>, and later chose to pursue a 
                  Diploma in Electrical and Electronics Engineering (EEE). With consistent dedication and 
                  hard work, I graduated with an impressive <strong className="text-white">CGPA of 9.8</strong>.
                </p>
                <p>
                  Aiming higher, I prepared intensely for the DCET exam and secured <strong className="text-amber-400">State
                  Rank 48</strong> across Karnataka and <strong className="text-amber-400">2nd Rank in Hassan district</strong>. 
                  This achievement opened the door for me to join one of the top engineering institutions 
                  in Bengaluru — <strong className="text-white">R.V. College of Engineering (RVCE)</strong>.
                </p>
                <p>
                  My journey of continuous learning and growth led me to secure a placement at
                  <strong className="text-white"> Red Hat</strong>, a renowned US-based technology company.
                </p>
              </div>
            </div>
            <div>
              <Card3D intensity={20}>
                <Card className="bg-stone-900 border border-amber-900/20">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-amber-500" />
                      Academic Journey
                    </h3>
                    <div className="space-y-4">
                      {[
                        { year: "SSLC", score: "91.52%", school: "CKS" },
                        { year: "Diploma (EEE)", score: "9.8 CGPA", school: "Polytechnic" },
                        { year: "DCET", score: "Rank 48", school: "All Karnataka" },
                        { year: "B.E. (CSE)", score: "9.10 CGPA", school: "RVCE Bengaluru" },
                      ].map((item, index) => (
                        <div key={index} className="flex items-center justify-between py-2 border-b border-amber-900/20 last:border-0">
                          <div>
                            <p className="font-semibold text-white">{item.year}</p>
                            <p className="text-sm text-stone-500">{item.school}</p>
                          </div>
                          <Badge className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white border-0">{item.score}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Card3D>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-stone-900/50 border-y border-amber-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-amber-900/30 text-amber-400 border border-amber-700/30">The Vision Behind Wintrix</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Team <span className="gradient-text-gold">WINTRIX</span>
            </h2>
            <p className="text-stone-500 text-sm max-w-md mx-auto">
              Building WINTRIX to guide serious students towards success.
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="group bg-stone-900 border border-amber-900/20 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-[0_0_40px_rgba(180,83,9,0.12)] hover:border-amber-700/40">
              <div className="grid md:grid-cols-5 gap-0">
                <div className="md:col-span-2 relative">
                  <Image
                    src="/team-jnanesh.png"
                    alt="Jnanesh Gowda - Director & Brand Architect"
                    width={500}
                    height={600}
                    className="w-full h-full object-cover min-h-[320px]"
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-stone-950/90 to-transparent p-6 md:hidden">
                    <h3 className="text-xl font-bold text-white">Jnanesh Gowda</h3>
                    <p className="text-amber-400 text-sm font-medium">Director & Brand Architect</p>
                  </div>
                </div>

                <div className="md:col-span-3 p-6 sm:p-8 flex flex-col justify-center">
                  <div className="hidden md:block mb-4">
                    <h3 className="text-2xl font-bold text-white">Jnanesh Gowda</h3>
                    <p className="text-amber-400 font-medium mt-1">Director & Brand Architect — Wintrix Academy</p>
                  </div>
                  <p className="text-stone-400 text-sm leading-relaxed mb-5 md:mt-0 mt-4">
                    Turning confusion into <span className="text-amber-400 font-medium">clarity</span> and effort into <span className="text-amber-400 font-medium">results</span> — that&apos;s what drives Wintrix forward.
                  </p>

                  <div className="space-y-3 mb-6">
                    {[
                      { title: "New-age learning strategies", desc: "Approaches built for today's learners — connecting deeply with how students actually study and grow." },
                      { title: "Purpose-driven outreach", desc: "Every message and campaign is crafted with clear intent, backed by data and direction." },
                      { title: "Structured content design", desc: "High-impact scripts and systems that make learning feel simple, organized, and memorable." },
                      { title: "Results by design", desc: "At Wintrix, success isn't left to chance — it's engineered from day one." },
                    ].map((item, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                        <div>
                          <p className="text-amber-400 font-semibold text-sm">{item.title}</p>
                          <p className="text-stone-400 text-xs leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div>
                    <p className="text-stone-500 text-xs font-medium uppercase tracking-wider mb-3">Focus Areas</p>
                    <div className="flex flex-wrap gap-2">
                      {["Brand Strategy", "Marketing & Growth", "Content & Script Design", "Student Psychology"].map((area) => (
                        <span key={area} className="px-3 py-1.5 bg-amber-900/20 border border-amber-900/30 rounded-lg text-amber-400 text-xs font-medium">
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>

                  <p className="mt-6 text-stone-500 text-xs italic">
                    &ldquo;I don&apos;t follow trends — I build systems that win.&rdquo;
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-stone-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-amber-900/30 text-amber-400 border border-amber-700/30">Platform Features</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Everything You Need to Succeed
            </h2>
            <p className="mt-4 text-lg text-stone-400 max-w-2xl mx-auto">
              Our comprehensive platform provides all the tools and resources you need to crack DCET with flying colors.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <FeatureCard key={index} feature={feature} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="py-20 bg-stone-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-amber-900/30 text-amber-400 border border-amber-700/30">Technical Expertise</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Skills & Competencies
            </h2>
            <p className="mt-4 text-lg text-stone-400 max-w-2xl mx-auto">
              Strong foundation in programming and computer science fundamentals
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {skills.map((skill, index) => (
              <Card3D key={index} intensity={25}>
                <div className="group p-4 bg-stone-900 rounded-xl hover:bg-stone-800 hover:shadow-md hover:shadow-amber-900/10 transition-all cursor-pointer border border-amber-900/10 hover:border-amber-700/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-900/20 rounded-lg shadow-sm flex items-center justify-center group-hover:bg-amber-900/30 transition-colors">
                      <skill.icon className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">{skill.name}</p>
                      <p className="text-xs text-stone-500">{skill.category}</p>
                    </div>
                  </div>
                </div>
              </Card3D>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-stone-900 via-amber-950/30 to-stone-900 border-y border-amber-900/20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Start Your DCET Journey?
          </h2>
          <p className="text-xl text-stone-400 mb-8 max-w-2xl mx-auto">
            Join our growing community of DCET aspirants preparing with expert guidance and proven strategies.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/register?role=student">
              <Button size="lg" className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white h-12 px-8 shadow-lg shadow-amber-900/40">
                Start Learning Today
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/login?role=admin">
              <Button size="lg" variant="outline" className="text-amber-400 border-amber-700/50 hover:bg-amber-900/20 h-12 px-8">
                <Shield className="w-5 h-5 mr-2" />
                Admin Login
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-stone-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-amber-900/30 text-amber-400 border border-amber-700/30">Get in Touch</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Contact Us
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { icon: Phone, title: "Phone", value: "9844942547", href: "tel:9844942547" },
              { icon: Mail, title: "Email", value: "muhammedadnan50007@gmail.com", href: "mailto:muhammedadnan50007@gmail.com" },
              { icon: MapPin, title: "Location", value: "Bengaluru, Karnataka", href: null },
            ].map((contact, index) => (
              <ContactCard key={index} contact={contact} />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-900 border-t border-amber-900/20 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <Logo size="lg" className="mb-4" />
              <p className="text-stone-500 max-w-md">
                Wintrix Academy — Guidance. Strategy. Success. Founded by Mohammed Adnan (DCET Rank 48, RVCE CSE).
              </p>
            </div>
            <div>
              <h4 className="font-bold text-amber-400 mb-4">Quick Links</h4>
              <ul className="space-y-2 text-stone-500">
                <li><a href="#about" className="hover:text-amber-400 transition">About</a></li>
                <li><a href="#features" className="hover:text-amber-400 transition">Features</a></li>
                <li><a href="#skills" className="hover:text-amber-400 transition">Skills</a></li>
                <li><a href="#contact" className="hover:text-amber-400 transition">Contact</a></li>
                <li><Link href="/login" className="hover:text-amber-400 transition">Login</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-amber-400 mb-4">For Users</h4>
              <ul className="space-y-2 text-stone-500">
                <li><Link href="/register?role=student" className="hover:text-amber-400 transition">Student Registration</Link></li>
                <li><Link href="/register?role=teacher" className="hover:text-amber-400 transition">Teacher Registration</Link></li>
                <li><Link href="/login?role=admin" className="hover:text-amber-400 transition">Admin Portal</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-amber-900/20 mt-8 pt-8 text-center text-stone-500">
            <p>&copy; {new Date().getFullYear()} Wintrix Academy. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
