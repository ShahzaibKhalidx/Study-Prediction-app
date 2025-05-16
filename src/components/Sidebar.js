'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import {
  Home,
  LayoutDashboard,
  Upload,
  Users,
  Brain,
  BarChart,
  FileText,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error.message);
    }
  };

  const navLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/upload', label: 'Upload', icon: Upload },
    { href: '/students', label: 'Students', icon: Users },
    { href: '/predict', label: 'Predict', icon: Brain },
    { href: '/visualization', label: 'Visualization', icon: BarChart },
    { href: '/analysis', label: 'Analysis', icon: FileText },
    { href: '/improvement', label: 'Improvement', icon: FileText },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <Button
        variant="ghost"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Sidebar */}
      <Card
        className={`fixed top-0 left-0 h-full w-64 bg-card shadow-lg flex flex-col p-4 transition-transform duration-300 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:w-64 z-40`}
      >
        <div className="mb-8 flex items-center space-x-2">
          <span className="text-2xl font-bold text-primary">EduPredict</span>
        </div>
        <nav className="flex flex-col space-y-1 flex-grow">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Button
                variant="ghost"
                className="w-full justify-start text-muted-foreground hover:text-primary hover:bg-primary/10"
              >
                <link.icon className="mr-2 h-4 w-4" />
                {link.label}
              </Button>
            </Link>
          ))}
        </nav>
        <Button
          variant="destructive"
          onClick={handleLogout}
          className="mt-auto flex items-center"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </Card>

      {/* Overlay for mobile when sidebar is open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
}