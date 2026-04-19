"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MessageSquare,
  Mail,
  MapPin,
  ArrowLeft,
  Send,
  Clock,
  Building2,
  Printer,
  Download
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { companyName } from "@/lib/data/info";

// --- SECTIONS FOR SIDEBAR ---
const SECTIONS = [
  { id: "get-in-touch", title: "Get in Touch" },
  { id: "message-form", title: "Send a Message" },
  { id: "locations", title: "Global Offices" },
  { id: "faq", title: "Common Questions" },
];

export default function ContactPage() {
  const [activeSection, setActiveSection] = useState("get-in-touch");
  const [formStatus, setFormStatus] = useState<"idle" | "submitting" | "success">("idle");

  // Scroll Spy Logic
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;
      for (const section of SECTIONS) {
        const element = document.getElementById(section.id);
        if (element && element.offsetTop <= scrollPosition && (element.offsetTop + element.offsetHeight) > scrollPosition) {
          setActiveSection(section.id);
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({ top: element.offsetTop - 120, behavior: "smooth" });
    }
  };

  const handlePrint = () => window.print();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus("submitting");

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFormStatus("success");
        setFormData({ name: "", email: "", subject: "", message: "" }); // Reset form
      } else {
        // Handle error state appropriately
        console.error("Form submission failed");
        setFormStatus("idle");
        // You might want to add an error state to show a message to the user
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setFormStatus("idle");
    }
  };

  return (
    <main className="min-h-screen bg-background relative print:bg-white print:text-black">

      {/* Global Print Styles */}
      <style jsx global>{`
        @media print {
          @page { margin: 2cm; }
          nav, footer, header, aside, #print, .no-print { display: none !important; }
          body { background: white !important; color: black !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>

      {/* --- BACKGROUND FX --- */}
      <div className="fixed inset-0 z-0 pointer-events-none print:hidden overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/5 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-20 lg:py-28 print:py-0 print:px-0">

        {/* --- HEADER --- */}
        <div className="mb-16 md:mb-24 print:mb-8">
          <Link
            href="/"
            id="print"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-brand-500 transition-colors mb-8 group no-print"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-500 no-print"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Support & Sales</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-5xl font-bold tracking-tight text-foreground print:text-black"
              >
                Contact Us
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-muted-foreground max-w-2xl text-lg print:text-gray-600"
              >
                Our team is ready to help you optimize your logistics and investment portfolio. Reach out via email, phone, or visit our global offices.
              </motion.p>
            </div>

            <div className="flex gap-3 no-print">
              <Button
                onClick={handlePrint}
                variant="outline"
                className="gap-2 hidden sm:flex border-border hover:bg-muted"
              >
                <Download className="h-4 w-4" /> Save Info
              </Button>
              <Button
                onClick={handlePrint}
                variant="ghost"
                size="icon"
                className="sm:hidden"
              >
                <Printer className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* --- MAIN LAYOUT --- */}
        <div className="grid lg:grid-cols-[280px_1fr] gap-12 lg:gap-20 relative items-start">

          {/* SIDEBAR */}
          <aside className="hidden lg:block sticky top-28 no-print h-fit">
            <div className="space-y-2 border-l border-border/50 pl-4">
              {SECTIONS.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`
                     block w-full text-left text-sm py-2 px-2 rounded-lg transition-all duration-300
                     ${activeSection === section.id
                      ? "font-semibold text-brand-500 bg-brand-500/5 translate-x-1"
                      : "text-muted-foreground hover:text-foreground hover:translate-x-1"
                    }
                   `}
                >
                  {section.title}
                </button>
              ))}
            </div>

            {/* Quick Status */}
            <div className="mt-8 p-4 rounded-xl border border-border bg-card/50 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-semibold text-foreground">Support Online</span>
              </div>
              <p className="text-xs text-muted-foreground">Typical reply time: &lt; 5 mins</p>
            </div>
          </aside>

          {/* CONTENT AREA */}
          <div className="space-y-20 print:space-y-8">

            {/* 1. DIRECT CONTACT GRID */}
            <section id="get-in-touch" className="scroll-mt-32">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Card 1 */}
                <div className="p-6 rounded-2xl border border-border bg-card/50 hover:border-brand-500/30 transition-all group">
                  <div className="h-10 w-10 rounded-lg bg-brand-500/10 flex items-center justify-center text-brand-500 mb-4 group-hover:scale-110 transition-transform">
                    <Mail className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-lg text-foreground">General Support</h3>
                  <p className="text-sm text-muted-foreground mb-4">For account issues and general inquiries.</p>
                  <a href="mailto:support@trustedgebroker.com" className="text-sm font-semibold text-brand-500 hover:underline">
                    support@{companyName.toLowerCase().replace(/\s/g, '')}.com
                  </a>
                </div>

                {/* Card 2 */}
                <div className="p-6 rounded-2xl border border-border bg-card/50 hover:border-brand-500/30 transition-all group">
                  <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 mb-4 group-hover:scale-110 transition-transform">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-lg text-foreground">Institutional Sales</h3>
                  <p className="text-sm text-muted-foreground mb-4">For high-volume partners and API access.</p>
                  <a href="mailto:sales@trustedgebroker.com" className="text-sm font-semibold text-blue-500 hover:underline">
                    sales@{companyName.toLowerCase().replace(/\s/g, '')}.com
                  </a>
                </div>
              </div>
            </section>

            {/* 2. MESSAGE FORM */}
            <section id="message-form" className="scroll-mt-32 print:hidden">
              <div className="rounded-[2.5rem] overflow-hidden border border-border bg-card relative">
                <div className="absolute top-0 right-0 p-32 bg-brand-500/10 blur-[100px] rounded-full pointer-events-none" />

                <div className="p-8 md:p-12 relative z-10">
                  <h2 className="text-2xl font-bold text-foreground mb-6">Send us a message</h2>

                  {formStatus === "success" ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-8 text-center"
                    >
                      <div className="h-12 w-12 bg-emerald-500 rounded-full flex items-center justify-center text-white mx-auto mb-4">
                        <Send className="h-6 w-6" />
                      </div>
                      <h3 className="text-xl font-bold text-emerald-500 mb-2">Message Sent!</h3>
                      <p className="text-muted-foreground">We'll get back to you shortly.</p>
                      <Button onClick={() => setFormStatus("idle")} variant="outline" className="mt-6">Send Another</Button>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                          <Input
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="John Doe"
                            className="bg-background/50 border-border focus:border-brand-500 h-12"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                          <Input
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="john@example.com"
                            className="bg-background/50 border-border focus:border-brand-500 h-12"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Subject</label>
                        <Input
                          name="subject"
                          value={formData.subject}
                          onChange={handleInputChange}
                          placeholder="How can we help?"
                          className="bg-background/50 border-border focus:border-brand-500 h-12"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Message</label>
                        <Textarea
                          name="message"
                          value={formData.message}
                          onChange={handleInputChange}
                          placeholder="Tell us more about your inquiry..."
                          className="bg-background/50 border-border focus:border-brand-500 min-h-[150px]"
                          required
                        />
                      </div>

                      <Button
                        type="submit"
                        size="lg"
                        className="w-full md:w-auto rounded-full px-8 bg-foreground text-background hover:bg-foreground/90 font-bold"
                        disabled={formStatus === "submitting"}
                      >
                        {formStatus === "submitting" ? "Sending..." : "Send Message"}
                      </Button>
                    </form>
                  )}
                </div>
              </div>
            </section>

            {/* 3. GLOBAL LOCATIONS (MAP) */}
            <section id="locations" className="scroll-mt-32">
              <div className="flex items-center gap-3 mb-8">
                <MapPin className="h-6 w-6 text-brand-500" />
                <h2 className="text-2xl font-bold text-foreground">Global Offices</h2>
              </div>

              <div className="relative rounded-3xl overflow-hidden border border-border bg-[#050505] h-[400px] flex items-center justify-center group">
                {/* Abstract Map Background */}
                <div className="absolute inset-0 opacity-20 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')] bg-cover bg-center mix-blend-screen invert dark:invert-0" />

                {/* Location Dots */}
                <div className="relative w-full max-w-3xl h-full">
                  {/* London */}
                  <div className="absolute top-[28%] left-[48%] flex flex-col items-center group/pin">
                    <div className="h-3 w-3 bg-brand-500 rounded-full animate-ping absolute" />
                    <div className="h-3 w-3 bg-brand-500 rounded-full relative shadow-[0_0_20px_rgba(var(--brand-500),0.5)] cursor-pointer" />
                    <div className="mt-2 bg-card border border-border px-3 py-1 rounded-lg text-xs font-bold text-foreground opacity-0 group-hover/pin:opacity-100 transition-opacity whitespace-nowrap">
                      London HQ
                    </div>
                  </div>

                  {/* New York */}
                  <div className="absolute top-[32%] left-[28%] flex flex-col items-center group/pin">
                    <div className="h-3 w-3 bg-white rounded-full relative cursor-pointer" />
                    <div className="mt-2 bg-card border border-border px-3 py-1 rounded-lg text-xs font-bold text-foreground opacity-0 group-hover/pin:opacity-100 transition-opacity whitespace-nowrap">
                      New York
                    </div>
                  </div>

                  {/* Singapore */}
                  <div className="absolute top-[55%] right-[22%] flex flex-col items-center group/pin">
                    <div className="h-3 w-3 bg-white rounded-full relative cursor-pointer" />
                    <div className="mt-2 bg-card border border-border px-3 py-1 rounded-lg text-xs font-bold text-foreground opacity-0 group-hover/pin:opacity-100 transition-opacity whitespace-nowrap">
                      Singapore
                    </div>
                  </div>
                </div>
              </div>

              {/* Office Details */}
              <div className="grid md:grid-cols-3 gap-6 mt-8">
                {[
                  { city: "London (HQ)", address: "1 Canada Square, Canary Wharf", hours: "9am - 6pm BST" },
                  { city: "New York", address: "4 World Trade Center, NY", hours: "9am - 6pm EST" },
                  { city: "Singapore", address: "Marina Bay Financial Centre", hours: "9am - 6pm SGT" }
                ].map((office, i) => (
                  <div key={i} className="p-4 rounded-xl border border-border bg-card/30">
                    <h4 className="font-bold text-foreground mb-1">{office.city}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{office.address}</p>
                    <div className="flex items-center gap-2 text-xs text-brand-500 font-medium">
                      <Clock className="h-3 w-3" /> {office.hours}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 4. FAQ TEASER */}
            <section id="faq" className="scroll-mt-32 print:break-inside-avoid">
              <div className="rounded-2xl bg-muted/30 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="text-lg font-bold text-foreground">Need quick answers?</h3>
                  <p className="text-sm text-muted-foreground">Check our Support Center for FAQs regarding KYC, plans, and tracking.</p>
                </div>
                <Button variant="outline" className="shrink-0 rounded-full border-border bg-background hover:bg-muted">
                  <Link href="/support">Visit Support Center</Link>
                </Button>
              </div>
            </section>

            {/* Print Only Footer */}
            <div className="hidden print:block pt-8 border-t border-gray-200 mt-8">
              <p className="text-sm text-gray-500">
                {companyName} Contact Information • Printed on {new Date().toLocaleDateString()}.
              </p>
            </div>

          </div>
        </div>

      </div>
    </main>
  );
}
