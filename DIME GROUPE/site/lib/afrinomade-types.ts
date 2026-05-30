// ============================================================
// AFRINOMADE — Types partagés
// ============================================================

export type StatutDemande = 'nouveau' | 'en_cours' | 'cote' | 'confirme' | 'annule';
export type SourceDemande = 'site' | 'whatsapp' | 'telephone' | 'email' | 'manuel';

/** Une ligne d'un itinéraire jour par jour */
export interface JourItineraire {
  jour: string;          // "J1 (03/07)"
  ville: string;         // "Dakar"
  programme: string;     // "Accueil AIBD — Transfert — Corniche"
  hebergement?: string;  // "Hôtel Dakar"
  temps_route?: string;  // "1h-1h30"
}

/** Une formule tarifaire (Standard, Premium, etc.) */
export interface FormuleCotation {
  id: string;            // "standard" | "premium" | uuid
  nom: string;           // "Standard Confort" | "Premium Famille"
  description?: string;  // sous-titre de la formule
  lignes: LigneCotation[];
}

export interface AfriNomadeDemande {
  id?: string;
  created_at?: string;
  updated_at?: string;
  statut?: StatutDemande;
  source?: SourceDemande; // canal d'entrée de la demande
  reference?: string;     // ex: AN-SN-2026-001
  // Coordonnées
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  pays_residence?: string;
  // Destination
  pays_destination?: string;
  villes?: string[];
  type_service?: string;
  date_depart?: string;
  date_retour?: string;
  nb_nuits?: number;
  nb_adultes?: number;
  nb_enfants?: number;
  ages_enfants?: string;
  // Hébergement
  type_hebergement?: string;
  preference_localisation?: string[];
  nb_chambres?: number;
  equipements?: string[];
  // Activités
  activites?: string[];
  // Transport
  type_vehicule?: string;
  type_chauffeur?: string;
  langue_guide?: string;
  // Budget
  budget?: string;
  besoins_particuliers?: string;
  commentaire?: string;
  // Itinéraire jour par jour
  itineraire?: JourItineraire[];
  // Cotation — une seule formule (rétro-compat)
  cotation?: LigneCotation[];
  // Multi-formules (Standard + Premium + …)
  formules?: FormuleCotation[];
  // Formule sélectionnée par le client
  formule_choisie?: string; // id de la FormuleCotation
  montant_total?: number;
  montant_par_personne?: number;
  acompte?: number;
}

export interface LigneCotation {
  id: string;
  poste: string;
  description?: string;
  cout_reel: number;
  quantite: number;
  unite: string;
  prix_client: number; // cout_reel * marge
  total_cout: number;
  total_facture: number;
  marge_pct: number;
  custom?: boolean;
  /** "catalogue" = prix issu de la BDD, "forfait" = prix de fallback hardcodé */
  source_prix?: "catalogue" | "forfait";
}

export interface AfriNomadeCatalogue {
  id?: string;
  categorie: 'hebergement' | 'transport' | 'guide' | 'repas' | 'equipements' | 'activites';
  pays?: string;
  label: string;
  prix_basse_saison?: number;
  prix_haute_saison?: number;
  prix_transfert?: number;
  prix_demi_journee?: number;
  prix_journee?: number;
  prix_par_personne?: number;
  unite?: string;
  actif?: boolean;
}

export const STATUT_LABELS: Record<StatutDemande, string> = {
  nouveau: 'Nouveau',
  en_cours: 'En cours',
  cote: 'Coté',
  confirme: 'Confirmé',
  annule: 'Annulé',
};

export const STATUT_COLORS: Record<StatutDemande, string> = {
  nouveau: '#0BA5A4',
  en_cours: '#CFAE63',
  cote: '#3B82F6',
  confirme: '#22C55E',
  annule: '#EF4444',
};

export const PAYS_DESTINATIONS: Record<string, { flag: string; villes: string[] }> = {
  'Côte d\'Ivoire': {
    flag: '🇨🇮',
    villes: ['Abidjan', 'Assinie', 'Grand-Bassam', 'Yamoussoukro', 'San Pedro', 'Bouaké', 'Man', 'Korhogo'],
  },
  'Sénégal': {
    flag: '🇸🇳',
    villes: ['Dakar', 'Île de Gorée', 'Lac Rose', 'Saly', 'Saint-Louis', 'Casamance', 'Delta du Saloum', 'Parc Niokolo-Koba', 'Touba'],
  },
  'Ghana': {
    flag: '🇬🇭',
    villes: ['Accra', 'Cape Coast', 'Kumasi', 'Châteaux historiques', 'Kakum National Park'],
  },
  'Maroc': {
    flag: '🇲🇦',
    villes: ['Marrakech', 'Casablanca', 'Fès', 'Chefchaouen', 'Désert d\'Agafay', 'Essaouira'],
  },
  'Bénin': {
    flag: '🇧🇯',
    villes: ['Cotonou', 'Ouidah', 'Ganvié', 'Porto-Novo', 'Route des esclaves'],
  },
  'Togo': {
    flag: '🇹🇬',
    villes: ['Lomé', 'Kpalimé', 'Togoville', 'Cascade de Kpimé'],
  },
};

// Calcule prix client avec marge ≥15%, arrondi au 500 FCFA supérieur
export function calcPrixClient(coutReel: number, marge = 0.15): number {
  const raw = coutReel * (1 + marge);
  const arrondi = Math.ceil(raw / 500) * 500;
  // Vérifier que la marge est bien ≥15%
  const margeEffective = (arrondi - coutReel) / coutReel;
  if (margeEffective < marge) return Math.ceil((coutReel * (1 + marge)) / 500) * 500 + 500;
  return arrondi;
}
