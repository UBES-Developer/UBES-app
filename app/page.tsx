'use client';

import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Calendar, GraduationCap } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    }
    checkUser();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">

      {/* Hero Section */}
      <section className="flex-1 flex flex-col justify-center items-center px-6 py-24 text-center space-y-8 max-w-4xl mx-auto">
        <div className="space-y-4">
          <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
            UBES Portal
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto">
            The Unified Engineering Student Portal. Your entire academic life, streamlined in one powerful interface.
          </p>
        </div>

        <div className="flex gap-4 items-center">
          {loading ? (
            <Button disabled>Loading...</Button>
          ) : user ? (
            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-8" asChild>
              <Link href="/dashboard/student">
                Enter Portal <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <>
              <Button size="lg" className="bg-black hover:bg-slate-800 text-white rounded-full px-8" asChild>
                <Link href="/login">Log In</Link>
              </Button>
              <Button size="lg" variant="outline" className="rounded-full px-8" asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 text-left w-full">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="bg-indigo-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Calendar className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Smart Scheduling</h3>
            <p className="text-slate-500 text-sm">Conflict-free exam booking and intelligent timetable management.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="bg-emerald-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <GraduationCap className="h-6 w-6 text-emerald-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Academic Tracking</h3>
            <p className="text-slate-500 text-sm">Real-time grade monitoring and transcript access at your fingertips.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="bg-amber-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <BookOpen className="h-6 w-6 text-amber-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Resource Hub</h3>
            <p className="text-slate-500 text-sm">Centralized access to lecture notes, past papers, and video tutorials.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-slate-400 text-sm border-t border-slate-200">
        <p>© 2026 UBES Portal. Built for the future of engineering.</p>
      </footer>
    </div>
  );
}
