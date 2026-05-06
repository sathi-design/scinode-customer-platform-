import Image from "next/image";

interface LogoProps {
  /** Height in pixels — width is computed from the SVG aspect ratio (2270:606 ≈ 3.75:1) */
  height?: number;
  className?: string;
}

export function Logo({ height = 28, className }: LogoProps) {
  const width = Math.round(height * (2270 / 606));
  return (
    <Image
      src="/logo.svg"
      alt="SCINODE"
      width={width}
      height={height}
      className={className}
      priority
    />
  );
}
