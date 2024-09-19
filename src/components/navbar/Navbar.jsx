'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Menu, X, FileText, Copy, Check, Search } from 'lucide-react'
import Link from "next/link";
import Image from 'next/image';
// import { UserButton } from '@clerk/nextjs';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

    return (
      <nav className="bg-black bg-opacity-90 shadow-md sticky pt-2 pb-2 top-0 z-50">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link href={"/"}>
                <div className="flex-shrink-0 flex items-center">
                  <div className="flex items-center pt-2 pb-2">
                    <Image
                      src="/logo1.png"
                      alt="Logo"
                      layout="intrinsic"
                      width={60} 
                      height={20} 
                      className="object-contain"
                    />
                  </div>
                  <span className="ml-2 text-xl font-bold text-white">PIReT</span>
                </div>
              </Link>
            </div>
            <div className="-mr-2 flex items-center">
              <button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-expanded={isMenuOpen}
                aria-label="Toggle menu"
              >
                {isMenuOpen ? (
                  <div className="absolute right-0 mt-2 w-48 bg-black text-white shadow-lg">
                    <X className="block h-6 w-6 text-white" aria-hidden="true" />
                    <ul>
                      <li><a href="/" className="block px-4 py-2">Home</a></li>
                      <li><a href="/" className="block px-4 py-2">About</a></li>
                      <li><a href="/" className="block px-4 py-2">Services</a></li>
                      <li><a href="/" className="block px-4 py-2">Contact</a></li>
                    </ul>
                  </div>
                ) : (
                  <Menu className="block h-6 w-6 text-white" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>
    );
  };
  
  export default Navbar;