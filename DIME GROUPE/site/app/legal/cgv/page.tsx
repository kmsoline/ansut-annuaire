import Section from "../../components/Section";

export const metadata = {
  title: "Conditions Générales de Vente",
  description: "Conditions générales de vente de DIME GROUPE - CGV applicables à tous nos services.",
};

export default function CGVPage() {
  return (
    <main>
      <Section title="Conditions Générales de Vente" subtitle="CGV">
        <div className="max-w-3xl mx-auto space-y-6 text-sm text-[color-mix(in_oklch,var(--foreground)_75%,transparent)]">
          <div className="rounded-xl border border-white/10 p-6 glass">
            <h2 className="text-lg font-semibold mb-3">Article 1 - Objet</h2>
            <p>
              Les présentes Conditions Générales de Vente (CGV) régissent les relations contractuelles entre DIME GROUPE et ses clients pour tous les services proposés.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 p-6 glass">
            <h2 className="text-lg font-semibold mb-3">Article 2 - Services</h2>
            <p>
              DIME GROUPE propose les services suivants :
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Infrastructure & IT (hébergement, serveurs, cloud)</li>
                <li>Conseil & Stratégie (formations, transformation digitale)</li>
                <li>Communication & Événementiel (identité visuelle, photo, vidéo, marketing)</li>
                <li>Développement & Applications (sites web, e-commerce, applications mobiles)</li>
                <li>Tourisme & Loisirs via AfriNomade</li>
              </ul>
            </p>
          </div>

          <div className="rounded-xl border border-white/10 p-6 glass">
            <h2 className="text-lg font-semibold mb-3">Article 3 - Commande</h2>
            <p>
              Toute commande est soumise à l'acceptation préalable de DIME GROUPE.
              <br />
              Un devis détaillé est établi pour chaque projet et doit être accepté par le client avant le début des travaux.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 p-6 glass">
            <h2 className="text-lg font-semibold mb-3">Article 4 - Prix</h2>
            <p>
              Les prix sont exprimés en francs CFA (FCFA) ou en euros (EUR) selon les cas.
              <br />
              Les prix sont valables pour la durée indiquée sur le devis.
              <br />
              DIME GROUPE se réserve le droit de modifier ses prix à tout moment, sous réserve de ne pas affecter les commandes déjà acceptées.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 p-6 glass">
            <h2 className="text-lg font-semibold mb-3">Article 5 - Paiement</h2>
            <p>
              Le paiement s'effectue selon les modalités convenues dans le devis :
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Acompte à la commande (30-50% selon le projet)</li>
                <li>Solde à la livraison</li>
                <li>Pour les projets d'envergure, un échéancier peut être établi</li>
              </ul>
              <br />
              Les modes de paiement acceptés : virement bancaire, Mobile Money (Orange Money, MTN Money), carte bancaire.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 p-6 glass">
            <h2 className="text-lg font-semibold mb-3">Article 6 - Livraison</h2>
            <p>
              Les délais de livraison sont indiqués dans le devis et sont donnés à titre indicatif.
              <br />
              En cas de retard de livraison, DIME GROUPE informera le client dans les plus brefs délais.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 p-6 glass">
            <h2 className="text-lg font-semibold mb-3">Article 7 - Garantie</h2>
            <p>
              DIME GROUPE garantit la conformité de ses prestations aux spécifications convenues.
              <br />
              Une période de garantie est incluse pour les sites web et applications (généralement 3 mois après la livraison).
            </p>
          </div>

          <div className="rounded-xl border border-white/10 p-6 glass">
            <h2 className="text-lg font-semibold mb-3">Article 8 - Rétractation et annulation</h2>
            <p>
              Pour les services de prestations intellectuelles, le droit de rétractation prévu par la loi ne s'applique pas.
              <br />
              En cas d'annulation par le client, les sommes déjà versées peuvent être conservées selon les travaux déjà effectués.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 p-6 glass">
            <h2 className="text-lg font-semibold mb-3">Article 9 - Propriété intellectuelle</h2>
            <p>
              Pour les projets sur mesure, le client est propriétaire du code source et des créations réalisées après paiement complet.
              <br />
              DIME GROUPE conserve le droit d'utiliser les réalisations à des fins de promotion (portfolio), sauf mention contraire.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 p-6 glass">
            <h2 className="text-lg font-semibold mb-3">Article 10 - Litiges</h2>
            <p>
              En cas de litige, les parties s'engagent à rechercher une solution amiable.
              <br />
              À défaut, les tribunaux d'Abidjan seront seuls compétents.
            </p>
          </div>
        </div>
      </Section>
    </main>
  );
}

