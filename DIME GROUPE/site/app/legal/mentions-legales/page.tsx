import Section from "../../components/Section";
import ScrollAnimation from "../../components/ScrollAnimation";

export const metadata = {
  title: "Mentions Légales",
  description: "Mentions légales de DIME GROUPE - Informations sur l'entreprise et les conditions d'utilisation du site.",
};

export default function MentionsLegalesPage() {
  return (
    <main>
      <Section title="Mentions Légales" subtitle="Informations légales">
        <div className="max-w-3xl mx-auto space-y-6 text-sm text-[color-mix(in_oklch,var(--foreground)_75%,transparent)]">
          <ScrollAnimation animation="fadeInUp" delay={0}>
            <div className="rounded-xl border border-white/10 p-6 glass card-hover-3d depth-shadow hover-lift">
              <h2 className="text-lg font-semibold mb-3 text-lift">Éditeur du site</h2>
            <p>
              <strong>DIME GROUPE</strong>
              <br />
              Société basée en Côte d'Ivoire
              <br />
              Abidjan, Côte d'Ivoire
            </p>
            <p className="mt-3">
              <strong>Email :</strong> contact@dimegroupe.ci
              <br />
              <strong>Téléphone :</strong> +225 07 00 00 00 00
            </p>
            </div>
          </ScrollAnimation>

          <ScrollAnimation animation="fadeInUp" delay={100}>
            <div className="rounded-xl border border-white/10 p-6 glass card-hover-3d depth-shadow hover-lift">
              <h2 className="text-lg font-semibold mb-3 text-lift">Directeur de publication</h2>
              <p>Le directeur de publication est le représentant légal de DIME GROUPE.</p>
            </div>
          </ScrollAnimation>

          <ScrollAnimation animation="fadeInUp" delay={200}>
            <div className="rounded-xl border border-white/10 p-6 glass card-hover-3d depth-shadow hover-lift">
              <h2 className="text-lg font-semibold mb-3 text-lift">Hébergement</h2>
              <p>
                Le site est hébergé par :
                <br />
                [Nom de l'hébergeur]
                <br />
                [Adresse de l'hébergeur]
              </p>
            </div>
          </ScrollAnimation>

          <ScrollAnimation animation="fadeInUp" delay={300}>
            <div className="rounded-xl border border-white/10 p-6 glass card-hover-3d depth-shadow hover-lift">
              <h2 className="text-lg font-semibold mb-3 text-lift">Propriété intellectuelle</h2>
              <p>
                L'ensemble du contenu de ce site (textes, images, vidéos, logos, etc.) est la propriété exclusive de DIME GROUPE, sauf mention contraire.
                <br />
                Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite sans autorisation écrite préalable de DIME GROUPE.
              </p>
            </div>
          </ScrollAnimation>

          <ScrollAnimation animation="fadeInUp" delay={400}>
            <div className="rounded-xl border border-white/10 p-6 glass card-hover-3d depth-shadow hover-lift">
              <h2 className="text-lg font-semibold mb-3 text-lift">Protection des données personnelles</h2>
              <p>
                Les données personnelles collectées sur ce site sont traitées conformément à notre politique de confidentialité.
                <br />
                Conformément à la loi sur la protection des données, vous disposez d'un droit d'accès, de rectification et de suppression de vos données personnelles.
              </p>
            </div>
          </ScrollAnimation>

          <ScrollAnimation animation="fadeInUp" delay={500}>
            <div className="rounded-xl border border-white/10 p-6 glass card-hover-3d depth-shadow hover-lift">
              <h2 className="text-lg font-semibold mb-3 text-lift">Cookies</h2>
              <p>
                Ce site utilise des cookies pour améliorer l'expérience utilisateur et analyser le trafic.
                <br />
                En continuant à naviguer sur ce site, vous acceptez l'utilisation de cookies.
              </p>
            </div>
          </ScrollAnimation>

          <ScrollAnimation animation="fadeInUp" delay={600}>
            <div className="rounded-xl border border-white/10 p-6 glass card-hover-3d depth-shadow hover-lift">
              <h2 className="text-lg font-semibold mb-3 text-lift">Limitation de responsabilité</h2>
              <p>
                DIME GROUPE ne pourra être tenu responsable des dommages directs et indirects causés au matériel de l'utilisateur, lors de l'accès au site, et résultant soit de l'utilisation d'un matériel ne répondant pas aux spécifications, soit de l'apparition d'un bug ou d'une incompatibilité.
              </p>
            </div>
          </ScrollAnimation>

          <ScrollAnimation animation="fadeInUp" delay={700}>
            <div className="rounded-xl border border-white/10 p-6 glass card-hover-3d depth-shadow hover-lift">
              <h2 className="text-lg font-semibold mb-3 text-lift">Droit applicable</h2>
              <p>
                Les présentes mentions légales sont régies par le droit ivoirien.
                <br />
                En cas de litige, les tribunaux d'Abidjan seront seuls compétents.
              </p>
            </div>
          </ScrollAnimation>
        </div>
      </Section>
    </main>
  );
}

