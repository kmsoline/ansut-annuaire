import Section from "../../components/Section";

export const metadata = {
  title: "Politique de Confidentialité",
  description: "Politique de confidentialité de DIME GROUPE - Protection des données personnelles.",
};

export default function ConfidentialitePage() {
  return (
    <main>
      <Section title="Politique de Confidentialité" subtitle="Protection des données personnelles">
        <div className="max-w-3xl mx-auto space-y-6 text-sm text-[color-mix(in_oklch,var(--foreground)_75%,transparent)]">
          <div className="rounded-xl border border-white/10 p-6 glass">
            <h2 className="text-lg font-semibold mb-3">1. Collecte des données</h2>
            <p>
              DIME GROUPE collecte les données personnelles suivantes :
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Nom et prénom</li>
                <li>Adresse email</li>
                <li>Numéro de téléphone</li>
                <li>Informations relatives à votre projet</li>
                <li>Données de navigation (cookies)</li>
              </ul>
            </p>
          </div>

          <div className="rounded-xl border border-white/10 p-6 glass">
            <h2 className="text-lg font-semibold mb-3">2. Utilisation des données</h2>
            <p>
              Les données collectées sont utilisées pour :
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Répondre à vos demandes de contact et devis</li>
                <li>Fournir nos services</li>
                <li>Améliorer notre site et nos services</li>
                <li>Vous envoyer des communications relatives à nos services (avec votre consentement)</li>
                <li>Analyser le trafic du site</li>
              </ul>
            </p>
          </div>

          <div className="rounded-xl border border-white/10 p-6 glass">
            <h2 className="text-lg font-semibold mb-3">3. Conservation des données</h2>
            <p>
              Les données personnelles sont conservées pendant la durée nécessaire aux finalités pour lesquelles elles ont été collectées, conformément à la réglementation en vigueur.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 p-6 glass">
            <h2 className="text-lg font-semibold mb-3">4. Partage des données</h2>
            <p>
              DIME GROUPE ne vend, ne loue ni ne partage vos données personnelles à des tiers, sauf :
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Lorsque cela est nécessaire pour fournir nos services</li>
                <li>Lorsque la loi l'exige</li>
                <li>Avec votre consentement explicite</li>
              </ul>
            </p>
          </div>

          <div className="rounded-xl border border-white/10 p-6 glass">
            <h2 className="text-lg font-semibold mb-3">5. Vos droits</h2>
            <p>
              Conformément à la réglementation sur la protection des données, vous disposez des droits suivants :
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Droit d'accès à vos données personnelles</li>
                <li>Droit de rectification</li>
                <li>Droit à l'effacement</li>
                <li>Droit à la limitation du traitement</li>
                <li>Droit à la portabilité</li>
                <li>Droit d'opposition</li>
              </ul>
              <br />
              Pour exercer ces droits, contactez-nous à : contact@dimegroupe.ci
            </p>
          </div>

          <div className="rounded-xl border border-white/10 p-6 glass">
            <h2 className="text-lg font-semibold mb-3">6. Cookies</h2>
            <p>
              Ce site utilise des cookies pour améliorer l'expérience utilisateur et analyser le trafic.
              <br />
              Vous pouvez configurer votre navigateur pour refuser les cookies, mais cela peut affecter certaines fonctionnalités du site.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 p-6 glass">
            <h2 className="text-lg font-semibold mb-3">7. Sécurité</h2>
            <p>
              DIME GROUPE met en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données personnelles contre tout accès non autorisé, perte, destruction ou altération.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 p-6 glass">
            <h2 className="text-lg font-semibold mb-3">8. Modifications</h2>
            <p>
              DIME GROUPE se réserve le droit de modifier cette politique de confidentialité à tout moment.
              <br />
              Les modifications seront publiées sur cette page avec la date de mise à jour.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 p-6 glass">
            <h2 className="text-lg font-semibold mb-3">9. Contact</h2>
            <p>
              Pour toute question concernant cette politique de confidentialité, contactez-nous :
              <br />
              <strong>Email :</strong> contact@dimegroupe.ci
              <br />
              <strong>Adresse :</strong> Abidjan, Côte d'Ivoire
            </p>
          </div>
        </div>
      </Section>
    </main>
  );
}

