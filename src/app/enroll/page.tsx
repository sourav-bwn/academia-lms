"use client";

import { useState } from "react";
import Link from "next/link";
import {
  User,
  GraduationCap,
  Languages,
  Phone,
  Mail,
  BookOpen,
  Send,
  CheckCircle,
  ArrowLeft,
  Sparkles,
} from "lucide-react";

const COURSES = [
  "WBCS English",
  "BANK English",
  "SSC English",
  "CGL English",
  "CBSE Class V",
  "CBSE Class VI",
  "CBSE Class VII",
  "CBSE Class VIII",
  "CBSE Class IX",
  "CBSE Class X",
  "CBSE Class XI",
  "CBSE Class XII",
  "ICSE Class V",
  "ICSE Class VI",
  "ICSE Class VII",
  "ICSE Class VIII",
  "ICSE Class IX",
  "ICSE Class X",
  "ICSE Class XI",
  "ICSE Class XII",
  "State Board Class V",
  "State Board Class VI",
  "State Board Class VII",
  "State Board Class VIII",
  "State Board Class IX",
  "State Board Class X",
  "State Board Class XI",
  "State Board Class XII",
  "Spoken English",
];

const CLASSES = [
  "Class V",
  "Class VI",
  "Class VII",
  "Class VIII",
  "Class IX",
  "Class X",
  "Class XI",
  "Class XII",
  "Competitive Exam Aspirant",
  "Working Professional",
];

const MEDIUMS = ["English", "Hindi", "Bengali", "Other"];

export default function EnrollPage() {
  const [form, setForm] = useState({
    name: "",
    className: "",
    medium: "",
    contact: "",
    email: "",
    course: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Send email via Web3Forms (client-side only - free plan)
      const emailRes = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_key: "7ec08303-325f-4c82-ad68-6e64c18b3e2d",
          subject: `New Admission Enquiry - ${form.name} | ACADEMIA`,
          from_name: "ACADEMIA LMS",
          to_email: "souravbwn77@gmail.com",
          replyto: form.email,
          name: form.name,
          class: form.className,
          medium: form.medium,
          contact: form.contact,
          email: form.email,
          course: form.course,
          message: `New Admission Enquiry Received\n\nStudent Details:\n- Name: ${form.name}\n- Class: ${form.className}\n- Medium: ${form.medium}\n- Contact: ${form.contact}\n- Email: ${form.email}\n- Desired Course: ${form.course}\n\nPlease contact the student at ${form.contact} or reply to ${form.email}.\n\n---\nThis email was sent from ACADEMIA LMS`,
        }),
      });

      const emailData = await emailRes.json();

      if (emailData.success) {
        setSubmitted(true);
      } else {
        throw new Error("Failed to send enquiry. Please try again.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to submit. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 pt-24 pb-12">
        <div className="w-full max-w-lg text-center">
          <div className="glass-card p-12 rounded-3xl space-y-6 animate-scale-in">
            <div className="w-20 h-20 rounded-full bg-primary-container/20 flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-3xl font-black font-headline text-on-surface">
              We Will Contact You Soon!
            </h2>
            <div className="space-y-3">
              <p className="text-on-surface-variant text-lg leading-relaxed">
                Thank you, <span className="font-bold text-primary">{form.name}</span>!
              </p>
              <p className="text-on-surface-variant">
                Your admission request for{" "}
                <span className="font-bold text-on-surface">{form.course}</span>{" "}
                has been received successfully.
              </p>
              <div className="pt-4 border-t border-outline-variant/20">
                <p className="text-on-surface-variant text-sm">
                  Our lead educator <span className="font-bold">Arindam Dutta</span>{" "}
                  will contact you at
                </p>
                <p className="text-primary font-bold text-lg mt-1">
                  {form.contact}
                </p>
                <p className="text-on-surface-variant text-sm mt-1">
                  within 24 hours.
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                href="/"
                className="gradient-btn justify-center flex-1"
              >
                <ArrowLeft size={18} />
                Back to Home
              </Link>
              <a
                href="https://wa.me/7908656395"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-6 py-4 rounded-full border border-outline-variant/30 bg-surface-container-low hover:bg-surface-container-high transition-colors font-bold text-on-surface-variant flex-1"
              >
                <Phone size={18} />
                WhatsApp Us
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-12 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-container/20 border border-primary-container/30">
            <Sparkles className="text-primary w-4 h-4" />
            <span className="text-primary font-bold text-sm tracking-wide">
              Start Your Journey
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black font-headline text-on-surface tracking-tight">
            Admission <span className="text-primary">Enquiry</span>
          </h1>
          <p className="text-on-surface-variant max-w-md mx-auto">
            Fill in your details below and our team will reach out to you for
            course enrollment and further guidance.
          </p>
        </div>

        {/* Form Card */}
        <div className="glass-card p-8 md:p-10 rounded-3xl">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-error-container/50 text-error text-sm font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-on-surface-variant mb-2">
                Full Name <span className="text-error">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="input-field !pl-12"
                  required
                />
              </div>
            </div>

            {/* Class & Medium Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-on-surface-variant mb-2">
                  Class / Level <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-outline w-5 h-5 z-10" />
                  <select
                    name="className"
                    value={form.className}
                    onChange={handleChange}
                    className="input-field !pl-12 appearance-none cursor-pointer"
                    required
                  >
                    <option value="">Select Class</option>
                    {CLASSES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-on-surface-variant mb-2">
                  Medium <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <Languages className="absolute left-4 top-1/2 -translate-y-1/2 text-outline w-5 h-5 z-10" />
                  <select
                    name="medium"
                    value={form.medium}
                    onChange={handleChange}
                    className="input-field !pl-12 appearance-none cursor-pointer"
                    required
                  >
                    <option value="">Select Medium</option>
                    {MEDIUMS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Contact & Email Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-on-surface-variant mb-2">
                  Contact Number <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
                  <input
                    type="tel"
                    name="contact"
                    value={form.contact}
                    onChange={handleChange}
                    placeholder="10-digit mobile number"
                    className="input-field !pl-12"
                    pattern="[0-9]{10}"
                    maxLength={10}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-on-surface-variant mb-2">
                  Email Address <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    className="input-field !pl-12"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Desired Course */}
            <div>
              <label className="block text-sm font-semibold text-on-surface-variant mb-2">
                Desired Course <span className="text-error">*</span>
              </label>
              <div className="relative">
                <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-outline w-5 h-5 z-10" />
                <select
                  name="course"
                  value={form.course}
                  onChange={handleChange}
                  className="input-field !pl-12 appearance-none cursor-pointer"
                  required
                >
                  <option value="">Select Course</option>
                  <optgroup label="Competitive Exams">
                    {COURSES.filter((c) =>
                      ["WBCS", "BANK", "SSC", "CGL", "Spoken"].some((k) =>
                        c.includes(k)
                      )
                    ).map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="CBSE Board">
                    {COURSES.filter((c) => c.startsWith("CBSE")).map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="ICSE Board">
                    {COURSES.filter((c) => c.startsWith("ICSE")).map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="State Board">
                    {COURSES.filter((c) => c.startsWith("State")).map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="gradient-btn w-full justify-center !py-5 !text-base"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send size={18} />
                  Submit Admission Enquiry
                </>
              )}
            </button>
          </form>

          {/* Footer note */}
          <p className="text-center text-on-surface-variant text-xs mt-6">
            By submitting, you agree to be contacted by ACADEMIA regarding your
            admission enquiry.
          </p>
        </div>

        {/* Contact Info */}
        <div className="mt-8 text-center space-y-3">
          <p className="text-on-surface-variant text-sm">
            Need immediate assistance?
          </p>
          <div className="flex justify-center gap-4">
            <a
              href="tel:7908656395"
              className="flex items-center gap-2 text-primary font-bold text-sm hover:underline"
            >
              <Phone size={16} />
              7908656395
            </a>
            <a
              href="mailto:souravbwn77@gmail.com"
              className="flex items-center gap-2 text-primary font-bold text-sm hover:underline"
            >
              <Mail size={16} />
              souravbwn77@gmail.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
