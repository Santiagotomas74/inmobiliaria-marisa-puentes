"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Menu, X, User, LogOut } from "lucide-react";
import type { NavbarProps } from "./Navbar.types";
import { useRouter } from "next/navigation";

export default function Navbar({ items }: NavbarProps) {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        let res = await fetch(`/api/me`, {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) {
          const data = await res.json().catch(() => null);

          if (res.status === 401 && data?.error === "TokenExpired") {
            const refreshRes = await fetch(`/api/refresh`, {
              method: "POST",
              credentials: "include",
            });

            if (!refreshRes.ok) throw new Error();

            res = await fetch(`/api/me`, {
              method: "GET",
              credentials: "include",
            });
          } else {
            throw new Error();
          }
        }

        const data = await res.json();
        setUserName(data.user.name || data.user.email);
        setIsLoggedIn(true);
      } catch {
        setIsLoggedIn(false);
        setUserName(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const handleLogout = async () => {
    await fetch(`/api/logout`, {
      method: "POST",
      credentials: "include",
    });

    setIsLoggedIn(false);
    setUserName(null);
    router.refresh();
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (loading) return null;

  return (
    <>
      <nav
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? "bg-white/70 backdrop-blur-md shadow-sm"
            : "bg-white"
        }`}
      >
      <div className="relative w-full h-24 lg:h-28 flex items-center px-6 lg:px-10 text-gray-900">

  {/* LEFT */}
  <div className="flex items-center">
    <Link href="/" className="flex items-center">
      <div className="relative h-16 lg:h-20 w-[180px] lg:w-[260px]">
        <Image
          src="/logo2.png"
          alt="Logo Inmobiliaria"
          fill
          className="object-contain"
          priority
        />
      </div>
    </Link>
  </div>

  {/* CENTER DESKTOP */}
  <ul className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center gap-8 text-lg">
    {items.map((item) => (
      <li key={item.href} className="group relative">
        <Link
          href={item.href}
          className="relative text-gray-700 transition-colors duration-300 group-hover:text-black h-full flex items-center"
        >
          {item.label}
          <span className="absolute left-1/2 -bottom-1 h-[2px] w-0 bg-blue-500 transition-all duration-300 group-hover:w-full group-hover:left-0"></span>
        </Link>
      </li>
    ))}
  </ul>

  {/* RIGHT */}
  <div className="ml-auto flex items-center gap-4">

    {/* 🔥 BOTÓN MOBILE (ahora a la derecha) */}
    <button
      onClick={() => setIsMenuOpen(true)}
      className="lg:hidden"
    >
      <Menu size={24} />
    </button>

    {/* DESKTOP ACTIONS */}
    <Link
      href="/tasaciones"
      className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl
                 text-gray-700 transition-all duration-300 bg-green-400
                 hover:text-black hover:bg-gray-100 hover:-translate-y-[2px]"
    >
      <span className="font-medium">Tasaciones</span>
    </Link>

    {isLoggedIn && (
      <div className="hidden lg:flex items-center gap-4">
        <Link
          href="/user/dashboard"
          className="flex items-center gap-2 px-4 py-2 rounded-xl
                     text-gray-700 transition-all duration-300
                     hover:text-black hover:bg-gray-100 hover:-translate-y-[2px]"
        >
          <User size={23} />
          <span className="font-medium">{userName}</span>
        </Link>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-xl
                     text-red-500 transition-all duration-300
                     hover:bg-red-50 hover:text-red-600 hover:-translate-y-[2px]"
        >
          <LogOut size={20} />
          <span className="font-medium">Salir</span>
        </button>
      </div>
    )}
  </div>
</div>
      </nav>

      {/* Overlay mobile */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* SIDEBAR MOBILE */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-white/95 backdrop-blur-xl
                    shadow-2xl z-50 transform transition-all duration-300 lg:hidden
                    ${
                      isMenuOpen
                        ? "translate-x-0 opacity-100"
                        : "-translate-x-full opacity-0"
                    }`}
      >
        <div className="flex items-center justify-between p-5 border-b">

          {/* LOGO MOBILE */}
          <div className="relative h-10 w-[120px]">
            <Image
              src="/logo2.png"
              alt="Logo Inmobiliaria"
              fill
              className="object-contain"
            />
          </div>

          <button
            onClick={() => setIsMenuOpen(false)}
            className="p-2 rounded-lg text-gray-600 hover:bg-blue-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <ul className="flex flex-col gap-2 p-6">
          {items.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="block py-3 px-4 rounded-xl text-gray-700 font-medium hover:bg-gray-100 hover:text-black"
              >
                {item.label}
              </Link>
            </li>
          ))}
          {/* DESKTOP ACTIONS */}
    <Link
      href="/tasaciones"
      onClick={() => setIsMenuOpen(false)}
      className=" lg:flex items-center gap-2 px-4 py-2 rounded-xl
                 text-gray-700 transition-all duration-300 bg-green-400
                 hover:text-black hover:bg-gray-100 hover:-translate-y-[2px]"
    >
      <span className="font-medium">Tasaciones</span>
    </Link>
          
        </ul>

        <div className="border-t p-6 flex flex-col gap-3">
          {isLoggedIn && (
            <>
              <Link
                href="/user/dashboard"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-2 py-3 px-4 rounded-xl text-gray-700 hover:bg-gray-100"
              >
                <User size={18} />
                <span>{userName}</span>
              </Link>

              <button
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="flex items-center gap-2 py-3 px-4 rounded-xl text-red-500 hover:bg-red-50"
              >
                <LogOut size={18} />
                <span>Salir</span>
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}