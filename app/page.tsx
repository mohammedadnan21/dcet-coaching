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
  Play,
  Sparkles,
  ArrowRight,
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
  { number: "9.09", label: "Current CGPA", sublabel: "RVCE CSE" },
];

const features = [
  { icon: Video, title: "Live Classes", description: "Interactive Zoom sessions with expert faculty" },
  { icon: BookOpen, title: "Recorded Lectures", description: "Access to all recorded classes anytime" },
  { icon: Target, title: "Mock Tests", description: "Regular assessments with detailed analytics" },
  { icon: Trophy, title: "Rankings", description: "Track your progress with peer comparisons" },
  { icon: MessageCircle, title: "24/7 Support", description: "AI chatbot and faculty assistance" },
  { icon: Users, title: "Community", description: "Connect with fellow DCET aspirants" },
];

// Memoized 3D Card Component for performance
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
    
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

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
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    if (!cardRef.current) return;
    cardRef.current.style.transform = "perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)";
  }, []);

  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
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

// Memoized Feature Card for performance
const FeatureCard = memo(function FeatureCard({ 
  feature, 
  index 
}: { 
  feature: typeof features[0]; 
  index: number;
}) {
  return (
    <Card3D intensity={15}>
      <Card className="bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-shadow duration-300 h-full">
        <CardContent className="p-6">
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-5">
            <feature.icon className="w-7 h-7 text-blue-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
          <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
        </CardContent>
      </Card>
    </Card3D>
  );
});

// Memoized Contact Card
const ContactCard = memo(function ContactCard({ 
  contact 
}: { 
  contact: { icon: any; title: string; value: string; href: string | null };
}) {
  return (
    <Card3D intensity={20}>
      <Card className="bg-white border border-gray-100 shadow-sm hover:shadow-lg transition-shadow duration-300 text-center h-full">
        <CardContent className="p-8">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <contact.icon className="w-7 h-7 text-blue-500" />
          </div>
          <h3 className="font-bold text-gray-900 text-lg mb-2">{contact.title}</h3>
          {contact.href ? (
            <a href={contact.href} className="text-blue-600 hover:text-blue-700 hover:underline text-sm">
              {contact.value}
            </a>
          ) : (
            <p className="text-gray-600 text-sm">{contact.value}</p>
          )}
        </CardContent>
      </Card>
    </Card3D>
  );
});

// Memoized Stats Card
const StatsCard = memo(function StatsCard({ 
  item, 
  index 
}: { 
  item: typeof achievements[0]; 
  index: number;
}) {
  return (
    <Card3D intensity={25}>
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center text-white border border-white/20 hover:bg-white/15 transition-colors">
        <p className="text-4xl md:text-5xl font-bold mb-1">{item.number}</p>
        <p className="text-blue-100 font-semibold">{item.label}</p>
        <p className="text-blue-200/80 text-sm mt-1">{item.sublabel}</p>
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
    <div className="min-h-screen bg-white">
      {/* Navigation - Clean & Professional */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Logo size="md" />
            <div className="hidden md:flex items-center space-x-8">
              <a href="#about" className="text-gray-600 hover:text-blue-600 transition font-medium">About</a>
              <a href="#features" className="text-gray-600 hover:text-blue-600 transition font-medium">Features</a>
              <a href="#skills" className="text-gray-600 hover:text-blue-600 transition font-medium">Skills</a>
              <a href="#contact" className="text-gray-600 hover:text-blue-600 transition font-medium">Contact</a>
            </div>
            <div className="flex items-center space-x-3">
              <Link href="/login">
                <Button variant="outline" className="hidden sm:flex">Login</Button>
              </Link>
              <Link href="/register?role=student">
                <Button className="bg-blue-600 hover:bg-blue-700">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24 bg-gradient-to-br from-blue-50 via-white to-amber-50 relative overflow-hidden">
        {/* Subtle Background Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-200/20 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-0 px-4 py-1.5">
                  <Star className="w-4 h-4 mr-1.5 fill-amber-500 text-amber-500" /> DCET Rank 48 | RVCE CSE
                </Badge>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Crack DCET with{" "}
                  <span className="text-blue-600">Rank 48</span>{" "}
                  Mentorship
                </h1>
                <p className="text-lg md:text-xl text-gray-600 max-w-xl leading-relaxed">
                  Learn from Mohammed Adnan, who secured All-Karnataka Rank 48 in DCET and is now pursuing CSE at R.V. College of Engineering.
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                <Link href="/register?role=student">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 h-12 px-8 shadow-lg shadow-blue-500/25">
                    <GraduationCap className="w-5 h-5 mr-2" />
                    Join as Student
                  </Button>
                </Link>
                <Link href="/register?role=teacher">
                  <Button size="lg" variant="outline" className="h-12 px-8">
                    <BookOpen className="w-5 h-5 mr-2" />
                    Join as Teacher
                  </Button>
                </Link>
              </div>
              <div className="flex items-center gap-8 pt-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white flex items-center justify-center text-white text-xs font-bold shadow-md">
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <p className="text-gray-600">
                  <span className="font-bold text-gray-900">500+</span> Students enrolled
                </p>
              </div>
            </div>

            {/* Founder Photo with Subtle 3D */}
            <div className="relative">
              <Card3D intensity={30} className="relative mx-auto w-fit">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-amber-400 rounded-3xl blur-3xl opacity-20 scale-110" />
                <div className="relative bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-2 shadow-2xl">
                  <Image
                    src="/founder.png"
                    alt="Mohammed Adnan - Founder"
                    width={400}
                    height={500}
                    className="rounded-2xl object-cover"
                    priority
                    loading="eager"
                  />
                </div>
                
                {/* Floating Cards - Subtle Animation */}
                <div className="absolute -left-8 top-1/4 bg-white rounded-xl shadow-lg p-3 animate-float">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">48</p>
                      <p className="text-xs text-gray-500">DCET Rank</p>
                    </div>
                  </div>
                </div>
                
                <div className="absolute -right-8 bottom-1/4 bg-white rounded-xl shadow-lg p-3 animate-float" style={{ animationDelay: "1s" }}>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Award className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-900">Red Hat</p>
                      <p className="text-xs text-gray-500">Placed at</p>
                    </div>
                  </div>
                </div>
              </Card3D>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Clean 3D Glass Cards */}
      <section className="py-14 bg-gradient-to-r from-blue-600 to-blue-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {achievements.map((item, index) => (
              <StatsCard key={index} item={item} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Motivation Quote */}
      <section className="py-10 bg-gradient-to-r from-amber-50 to-orange-50 border-y border-amber-100">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Sparkles className="w-6 h-6 text-amber-500 mx-auto mb-3" />
          <p className="text-lg md:text-xl text-gray-700 italic leading-relaxed">
            "{motivationQuotes[currentQuote].quote}"
          </p>
          <p className="mt-3 text-amber-700 font-semibold">
            — {motivationQuotes[currentQuote].author}
          </p>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-blue-100 text-blue-800 border-0">About the Founder</Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Mohammed Adnan
              </h2>
              <div className="prose prose-lg text-gray-600 space-y-4">
                <p>
                  I completed my SSLC at CKS, scoring <strong>91.52%</strong>, and later chose to pursue a 
                  Diploma in Electrical and Electronics Engineering (EEE). With consistent dedication and 
                  hard work, I graduated with an impressive <strong>CGPA of 9.8</strong>.
                </p>
                <p>
                  Aiming higher, I prepared intensely for the DCET exam and secured an <strong>All-India 
                  Rank of 48</strong> across Karnataka and <strong>2nd Rank in Hassan district</strong>. 
                  This achievement opened the door for me to join one of the top engineering institutions 
                  in Bengaluru — <strong>R.V. College of Engineering (RVCE)</strong>.
                </p>
                <p>
                  My journey of continuous learning and growth led me to secure a placement at
                  <strong> Red Hat</strong>, a renowned US-based technology company.
                </p>
              </div>
            </div>
            <div>
              <Card3D intensity={20}>
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-0 shadow-lg">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-blue-600" />
                      Academic Journey
                    </h3>
                    <div className="space-y-4">
                      {[
                        { year: "SSLC", score: "91.52%", school: "CKS" },
                        { year: "Diploma (EEE)", score: "9.8 CGPA", school: "Polytechnic" },
                        { year: "DCET", score: "Rank 48", school: "All Karnataka" },
                        { year: "B.E. (CSE)", score: "9.09 CGPA", school: "RVCE Bengaluru" },
                      ].map((item, index) => (
                        <div key={index} className="flex items-center justify-between py-2 border-b border-blue-200/50 last:border-0">
                          <div>
                            <p className="font-semibold text-gray-900">{item.year}</p>
                            <p className="text-sm text-gray-600">{item.school}</p>
                          </div>
                          <Badge className="bg-blue-600 hover:bg-blue-600">{item.score}</Badge>
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

      {/* Features Section - Clean 3D Cards */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-blue-100 text-blue-800 border-0">Platform Features</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Everything You Need to Succeed
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
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
      <section id="skills" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-amber-100 text-amber-800 border-0">Technical Expertise</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Skills & Competencies
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Strong foundation in programming and computer science fundamentals
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {skills.map((skill, index) => (
              <Card3D key={index} intensity={25}>
                <div className="group p-4 bg-gray-50 rounded-xl hover:bg-blue-50 hover:shadow-md transition-all cursor-pointer border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                      <skill.icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{skill.name}</p>
                      <p className="text-xs text-gray-500">{skill.category}</p>
                    </div>
                  </div>
                </div>
              </Card3D>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-blue-800">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Start Your DCET Journey?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join hundreds of students who are preparing for DCET with expert guidance and proven strategies.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/register?role=student">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 h-12 px-8 shadow-lg">
                Start Learning Today
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/login?role=admin">
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10 h-12 px-8">
                <Shield className="w-5 h-5 mr-2" />
                Admin Login
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section - Clean 3D Cards */}
      <section id="contact" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-blue-100 text-blue-800 border-0">Get in Touch</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
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
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <Logo size="lg" className="mb-4 [&_span]:text-white [&_*]:text-white" />
              <p className="text-gray-400 max-w-md">
                Premier DCET coaching platform founded by Mohammed Adnan, who secured All-Karnataka Rank 48 
                and is currently pursuing CSE at RVCE.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#about" className="hover:text-white transition">About</a></li>
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><a href="#contact" className="hover:text-white transition">Contact</a></li>
                <li><Link href="/login" className="hover:text-white transition">Login</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">For Users</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/register?role=student" className="hover:text-white transition">Student Registration</Link></li>
                <li><Link href="/register?role=teacher" className="hover:text-white transition">Teacher Registration</Link></li>
                <li><Link href="/login?role=admin" className="hover:text-white transition">Admin Portal</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} DCET Coaching. All rights reserved.</p>
            <p className="mt-2 text-sm">Made with ❤️ by Mohammed Adnan (Rank 48)</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
