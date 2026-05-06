"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Factory, Microscope, ArrowRight } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

interface RoleCard {
  icon: React.ReactNode;
  accentColor: string;
  iconBg: string;
  badge: string;
  title: string;
  desc: string;
  href: string;
}

const ROLES: RoleCard[] = [
  {
    icon: <Factory size={22} />,
    accentColor: "#018E7E",
    iconBg: "rgba(1,142,126,0.1)",
    badge: "Manufacturer",
    title: "CDMO / CMO / API Facilities",
    desc: "Track production orders, manage compliance credentials, and connect with verified pharma buyers.",
    href: "/signup/manufacturer",
  },
  {
    icon: <Microscope size={22} />,
    accentColor: "#6237C7",
    iconBg: "rgba(98,55,199,0.1)",
    badge: "CRO / Scientist",
    title: "CROs, Researchers & Consultants",
    desc: "Showcase research capabilities, manage proposals, and collaborate on cutting-edge pharma projects.",
    href: "/signup/cro-scientist",
  },
];

export default function DemoAccessPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#020202]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Logo */}
        <div className="flex justify-center mb-12">
          <div className="bg-white rounded-lg px-4 py-2">
            <Logo height={28} />
          </div>
        </div>

        {/* Heading */}
        <div className="text-center mb-10">
          <h1 className="text-2xl sm:text-4xl font-semibold text-white mb-3">Choose Your Access</h1>
          <p className="text-sm text-white/45">Select your role to get started with the platform</p>
        </div>

        {/* Role cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
          {ROLES.map((role) => (
            <button
              key={role.badge}
              onClick={() => router.push(role.href)}
              className="bg-[#0d0d0d] border border-white/[0.08] rounded-2xl p-6 text-left hover:border-white/20 transition-all cursor-pointer group"
            >
              {/* Icon */}
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                style={{ background: role.iconBg, color: role.accentColor }}
              >
                {role.icon}
              </div>

              {/* Badge */}
              <div className="mb-3">
                <span
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                  style={{ background: role.iconBg, color: role.accentColor }}
                >
                  {role.badge}
                </span>
              </div>

              {/* Title */}
              <p className="text-[15px] font-semibold text-white mb-2 leading-tight">{role.title}</p>

              {/* Desc */}
              <p className="text-[13px] text-white/50 leading-[20px] mb-4">{role.desc}</p>

              {/* Arrow */}
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: role.iconBg, color: role.accentColor }}
              >
                <ArrowRight size={13} />
              </div>
            </button>
          ))}
        </div>

        {/* Already have account */}
        <p className="text-center text-sm text-white/50">
          Already have an account?{" "}
          <Link href="/login" className="text-[#018E7E] underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
