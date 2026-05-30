"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface SearchResult {
  title: string;
  description: string;
  url: string;
  category: string;
}

const SEARCH_INDEX: SearchResult[] = [
  // Services
  { title: "Infrastructure & IT", description: "Noms de domaine, hébergement, serveurs, réseaux et cloud", url: "/services", category: "Services" },
  { title: "Conseil & Stratégie", description: "Formations, coaching, transformation digitale et IT", url: "/services", category: "Services" },
  { title: "Communication & Événementiel", description: "Événements, photo, identité visuelle, e-mail marketing, community management, SEO/SEA et vidéo", url: "/services", category: "Services" },
  { title: "Développement & Applications", description: "Sites web, e-commerce, applications mobiles, ERP et outils métiers", url: "/services", category: "Services" },
  { title: "Tourisme & Loisirs (AfriNomade)", description: "Excursions, résidences, bons plans, transport et logistique touristique", url: "/afrinomade", category: "Services" },
  
  // Pages
  { title: "À propos", description: "Découvrez l'histoire, la mission, les valeurs et l'équipe de DIME GROUPE", url: "/about", category: "Pages" },
  { title: "Portfolio", description: "Découvrez nos réalisations : sites web, identités visuelles, événements, applications", url: "/portfolio", category: "Pages" },
  { title: "Blog", description: "Actualités, conseils et tendances digitales par DIME GROUPE", url: "/blog", category: "Pages" },
  { title: "Contact", description: "Contactez-nous pour discuter de votre projet ou obtenir un devis", url: "/contact", category: "Pages" },
  { title: "FAQ", description: "Questions fréquentes sur nos services et prestations", url: "/faq", category: "Pages" },
  
  // Articles de blog
  { title: "Transformation digitale en 2025", description: "Découvrez les tendances de la transformation digitale pour 2025 et comment les entreprises ivoiriennes peuvent en profiter", url: "/blog/transformation-digitale-2025", category: "Blog" },
  { title: "SEO local en Côte d'Ivoire", description: "Comment optimiser votre référencement local pour attirer les clients ivoiriens", url: "/blog/seo-local-cote-ivoire", category: "Blog" },
  { title: "Choisir son hébergement web", description: "Guide complet pour choisir le meilleur hébergement web selon vos besoins", url: "/blog/choisir-hebergement-web", category: "Blog" },
  { title: "E-commerce en Côte d'Ivoire", description: "L'essor du e-commerce en Côte d'Ivoire : opportunités, défis et stratégies", url: "/blog/e-commerce-cote-ivoire", category: "Blog" },
  
  // AfriNomade
  { title: "Excursions AfriNomade", description: "Organisation d'excursions et voyages sur mesure en Côte d'Ivoire", url: "/afrinomade/excursions", category: "AfriNomade" },
  { title: "Résidences AfriNomade", description: "Résidences meublées et maisons d'hôtes premium en Côte d'Ivoire", url: "/afrinomade/residences", category: "AfriNomade" },
  { title: "Transport touristique", description: "Chauffeur privé, transferts et location de véhicules", url: "/afrinomade/transport", category: "AfriNomade" },
  { title: "Bons plans & Restaurants", description: "City guide, recommandations de restaurants et lieux branchés", url: "/afrinomade/bons-plans", category: "AfriNomade" },
];

export default function Search() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (value: string) => {
    setQuery(value);
    setSelectedIndex(-1);
    if (value.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const searchTerm = value.toLowerCase();
    const filtered = SEARCH_INDEX.filter(
      (item) =>
        item.title.toLowerCase().includes(searchTerm) ||
        item.description.toLowerCase().includes(searchTerm)
    );

    setResults(filtered.slice(0, 5));
    setIsOpen(filtered.length > 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          setIsOpen(false);
          setQuery("");
          setSelectedIndex(-1);
          router.push(results[selectedIndex].url);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  return (
    <div ref={searchRef} className="relative">
      <div className="relative">
        <input
          type="search"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && results.length > 0 && setIsOpen(true)}
          placeholder="Rechercher..."
          className="input-glass w-full rounded-md px-4 py-2 pl-10 text-sm outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-label="Rechercher sur le site"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-controls="search-results"
          role="combobox"
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[color-mix(in_oklch,var(--foreground)_65%,transparent)]">
          🔍
        </span>
      </div>

      {isOpen && results.length > 0 && (
        <div
          id="search-results"
          className="absolute z-50 mt-2 w-full rounded-xl glass glass-strong shadow-lg"
          role="listbox"
          aria-label="Résultats de recherche"
          style={{ position: "relative", zIndex: 50 }}
        >
          <div className="max-h-96 overflow-y-auto p-2">
            {results.map((result, index) => (
              <Link
                key={index}
                href={result.url}
                onClick={() => {
                  setIsOpen(false);
                  setQuery("");
                  setSelectedIndex(-1);
                }}
                className={`block rounded-lg p-3 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                  selectedIndex === index
                    ? "bg-[color-mix(in_oklch,var(--primary)_15%,transparent)] border-2 border-primary"
                    : "hover:bg-[color-mix(in_oklch,var(--primary)_10%,transparent)]"
                }`}
                role="option"
                aria-selected={selectedIndex === index}
                tabIndex={-1}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{result.title}</p>
                    <p className="mt-1 text-xs text-[color-mix(in_oklch,var(--foreground)_70%,transparent)] line-clamp-2">
                      {result.description}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-[color-mix(in_oklch,var(--foreground)_60%,transparent)]">
                    {result.category}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

