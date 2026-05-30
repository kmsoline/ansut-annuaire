import Link from "next/link";

type CTAButtonProps = {
  href: string;
  variant?: "primary" | "outline" | "inverted";
  size?: "md" | "lg";
  children: React.ReactNode;
  target?: string;
  rel?: string;
  className?: string;
};

export default function CTAButton({ href, variant = "primary", size, children, target, rel, className = "" }: CTAButtonProps) {
  const baseClassName =
    variant === "primary"  ? "btn btn-primary ripple" :
    variant === "inverted" ? "btn ripple" :
    "btn btn-outline ripple";
  const sizeClassName = size === "lg" ? "px-8 py-3.5 text-base" : "";
  // Inverted = bouton blanc sur fond coloré
  const invertedStyle = variant === "inverted"
    ? "bg-white text-[var(--royal-blue)] hover:bg-white/90 border-0 shadow-xl font-semibold"
    : "";
  const finalClassName = `${baseClassName} ${sizeClassName} ${invertedStyle} ${className}`.trim();
  return (
    <Link href={href} className={finalClassName} target={target} rel={rel}>
      {children}
    </Link>
  );
}


