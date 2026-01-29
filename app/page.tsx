"use client";

import { useState, useEffect } from "react";
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
  Zap,
  CheckCircle,
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
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Logo size="md" />
            <div className="hidden md:flex items-center space-x-8">
              <a href="#about" className="text-gray-600 hover:text-blue-600 transition">About</a>
              <a href="#features" className="text-gray-600 hover:text-blue-600 transition">Features</a>
              <a href="#skills" className="text-gray-600 hover:text-blue-600 transition">Skills</a>
              <a href="#contact" className="text-gray-600 hover:text-blue-600 transition">Contact</a>
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
      <section className="pt-24 pb-16 md:pt-32 md:pb-24 bg-gradient-to-br from-blue-50 via-white to-amber-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                  <Star className="w-3 h-3 mr-1" /> DCET Rank 48 | RVCE CSE
                </Badge>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Crack DCET with{" "}
                  <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                    Rank 48
                  </span>{" "}
                  Mentorship
                </h1>
                <p className="text-lg md:text-xl text-gray-600 max-w-xl">
                  Learn from Mohammed Adnan, who secured All-Karnataka Rank 48 in DCET and is now pursuing CSE at R.V. College of Engineering.
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                <Link href="/register?role=student">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 h-12 px-8">
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
                    <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white flex items-center justify-center text-white text-xs font-bold">
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <p className="text-gray-600">
                  <span className="font-bold text-gray-900">500+</span> Students enrolled
                </p>
              </div>
            </div>

            {/* Founder Photo & Info */}
            <div className="relative">
              <div className="relative mx-auto w-fit">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-amber-400 rounded-3xl blur-3xl opacity-20 scale-110" />
                <div className="relative bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-2">
                  <Image
                    src="/founder.png"
                    alt="Mohammed Adnan - Founder"
                    width={400}
                    height={500}
                    className="rounded-2xl object-cover"
                    priority
                  />
                </div>
                {/* Floating Achievement Cards */}
                <div className="absolute -left-8 top-1/4 bg-white rounded-xl shadow-xl p-3 animate-pulse">
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
                <div className="absolute -right-8 bottom-1/4 bg-white rounded-xl shadow-xl p-3">
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
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {achievements.map((item, index) => (
              <div key={index} className="text-center text-white">
                <p className="text-4xl md:text-5xl font-bold">{item.number}</p>
                <p className="text-blue-100 font-medium">{item.label}</p>
                <p className="text-blue-200 text-sm">{item.sublabel}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Motivation Quote */}
      <section className="py-8 bg-amber-50 border-y border-amber-100">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-lg md:text-xl text-gray-700 italic">
            "{motivationQuotes[currentQuote].quote}"
          </p>
          <p className="mt-2 text-amber-700 font-medium">
            — {motivationQuotes[currentQuote].author}
          </p>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-blue-100 text-blue-800">About the Founder</Badge>
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
                  in Bengaluru — <strong>R.V. College of Engineering (RVCE)</strong> — where I shifted to 
                  the Computer Science and Engineering (CSE) branch.
                </p>
                <p>
                  Transitioning from EEE to CSE was challenging, but I embraced it with confidence. In my 
                  3rd semester, I scored <strong>9+ SGPA</strong>, and since then, I have maintained strong 
                  academic performance with a current <strong>CGPA of 9.09</strong>.
                </p>
                <p>
                  My journey of continuous learning and growth led me to secure a placement at 
                  <strong> Red Hat</strong>, a renowned US-based technology company.
                </p>
              </div>
            </div>
            <div className="space-y-6">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-0">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Academic Journey</h3>
                  <div className="space-y-4">
                    {[
                      { year: "SSLC", score: "91.52%", school: "CKS" },
                      { year: "Diploma (EEE)", score: "9.8 CGPA", school: "Polytechnic" },
                      { year: "DCET", score: "Rank 48", school: "All Karnataka" },
                      { year: "B.E. (CSE)", score: "9.09 CGPA", school: "RVCE Bengaluru" },
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b border-blue-200 last:border-0">
                        <div>
                          <p className="font-semibold text-gray-900">{item.year}</p>
                          <p className="text-sm text-gray-600">{item.school}</p>
                        </div>
                        <Badge className="bg-blue-600">{item.score}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-blue-100 text-blue-800">Platform Features</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Everything You Need to Succeed
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Our comprehensive platform provides all the tools and resources you need to crack DCET with flying colors.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-amber-100 text-amber-800">Technical Expertise</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Skills & Competencies
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Strong foundation in programming and computer science fundamentals
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {skills.map((skill, index) => (
              <div
                key={index}
                className="group p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-lg shadow flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    <skill.icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{skill.name}</p>
                    <p className="text-xs text-gray-500">{skill.category}</p>
                  </div>
                </div>
              </div>
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
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 h-12 px-8">
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

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-blue-100 text-blue-800">Get in Touch</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Contact Us
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="text-center border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Phone</h3>
                <a href="tel:9844942547" className="text-blue-600 hover:underline">
                  9844942547
                </a>
              </CardContent>
            </Card>
            <Card className="text-center border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Email</h3>
                <a href="mailto:muhammedadnan50007@gmail.com" className="text-blue-600 hover:underline text-sm">
                  muhammedadnan50007@gmail.com
                </a>
              </CardContent>
            </Card>
            <Card className="text-center border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Location</h3>
                <p className="text-gray-600">
                  Bengaluru, Karnataka
                </p>
              </CardContent>
            </Card>
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
            <p className="mt-2 text-sm">Made with dedication by Mohammed Adnan (Rank 48)</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
