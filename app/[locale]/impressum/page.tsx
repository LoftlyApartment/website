import type { Metadata } from 'next';
import { LegalPage, LegalSection } from '@/components/legal/LegalPage';

export const metadata: Metadata = {
  title: 'Impressum',
  description: 'Impressum und rechtliche Angaben der Loftly Apartment GmbH gemäß §5 TMG',
};

const tableOfContents = [
  { id: 'angaben', title: '1. Angaben gemäß § 5 TMG' },
  { id: 'vertreten', title: '2. Vertreten durch' },
  { id: 'kontakt', title: '3. Kontakt' },
  { id: 'register', title: '4. Registereintrag' },
  { id: 'umsatzsteuer', title: '5. Umsatzsteuer-Identifikationsnummer' },
  { id: 'verantwortlich', title: '6. Verantwortlich für den Inhalt' },
  { id: 'haftung-inhalte', title: '7. Haftung für Inhalte' },
  { id: 'haftung-links', title: '8. Haftung für Links' },
  { id: 'urheberrecht', title: '9. Urheberrecht' },
];

export default function ImpressumPage() {
  return (
    <LegalPage
      title="Impressum"
      lastUpdated="30. Oktober 2025"
      tableOfContents={tableOfContents}
    >
      <LegalSection id="angaben" title="1. Angaben gemäß § 5 TMG">
        <p>
          <strong>Loftly Apartment GmbH</strong><br />
          Gesellschaft mit beschränkter Haftung
        </p>
        <p>
          Lübecker Straße 49<br />
          10559 Berlin<br />
          Deutschland
        </p>
      </LegalSection>

      <LegalSection id="vertreten" title="2. Vertreten durch">
        <p>
          Die Loftly Apartment GmbH wird vertreten durch die Geschäftsführer:
        </p>
        <ul>
          <li>Kerim Ay</li>
          <li>Fabian Streckfuß</li>
        </ul>
      </LegalSection>

      <LegalSection id="kontakt" title="3. Kontakt">
        <p>
          <strong>Telefon:</strong> +49 163 3595589<br />
          <strong>E-Mail:</strong> info@loftlyapartment.de
        </p>
        <p>
          Für Anfragen und Buchungen stehen wir Ihnen von Montag bis Freitag zwischen 9:00 und 18:00 Uhr zur Verfügung.
          Bei Notfällen ist unsere 24/7-Hotline für Gäste erreichbar.
        </p>
      </LegalSection>

      <LegalSection id="register" title="4. Registereintrag">
        <p>
          Eintragung im Handelsregister:<br />
          <strong>Registergericht:</strong> Amtsgericht Charlottenburg<br />
          <strong>Registernummer:</strong> HRB 274913 B
        </p>
      </LegalSection>

      <LegalSection id="umsatzsteuer" title="5. Umsatzsteuer-Identifikationsnummer">
        <p>
          Gemäß §27 a Umsatzsteuergesetz:<br />
          <strong>USt-IdNr.:</strong> DE123456789
        </p>
        <p className="text-sm italic">
          Hinweis: Die Umsatzsteuer-Identifikationsnummer wird nach Erteilung durch das Finanzamt aktualisiert.
        </p>
      </LegalSection>

      <LegalSection id="verantwortlich" title="6. Verantwortlich für den Inhalt">
        <p>
          Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV:
        </p>
        <p>
          Kerim Ay<br />
          Fabian Streckfuß<br />
          Lübecker Straße 49<br />
          10559 Berlin
        </p>
      </LegalSection>

      <LegalSection id="haftung-inhalte" title="7. Haftung für Inhalte">
        <p>
          Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den
          allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht
          verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen
          zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
        </p>
        <p>
          Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen
          Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt
          der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden
          Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.
        </p>
      </LegalSection>

      <LegalSection id="haftung-links" title="8. Haftung für Links">
        <p>
          Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben.
          Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der
          verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
        </p>
        <p>
          Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft.
          Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar. Eine permanente
          inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete Anhaltspunkte einer
          Rechtsverletzung nicht zumutbar.
        </p>
        <p>
          Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Links umgehend entfernen.
        </p>
      </LegalSection>

      <LegalSection id="urheberrecht" title="9. Urheberrecht">
        <p>
          Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem
          deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung
          außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen
          Autors bzw. Erstellers.
        </p>
        <p>
          Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet.
          Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden die Urheberrechte
          Dritter beachtet. Insbesondere werden Inhalte Dritter als solche gekennzeichnet.
        </p>
        <p>
          Sollten Sie trotzdem auf eine Urheberrechtsverletzung aufmerksam werden, bitten wir um einen
          entsprechenden Hinweis. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Inhalte
          umgehend entfernen.
        </p>
      </LegalSection>

      <div className="mt-8 p-4 bg-neutral-100 rounded-lg">
        <h3 className="font-semibold text-neutral-900 mb-2">Streitschlichtung</h3>
        <p className="text-sm text-neutral-700">
          Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:
          <a
            href="https://ec.europa.eu/consumers/odr/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline ml-1"
          >
            https://ec.europa.eu/consumers/odr/
          </a>
        </p>
        <p className="text-sm text-neutral-700 mt-2">
          Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
          Verbraucherschlichtungsstelle teilzunehmen.
        </p>
      </div>
    </LegalPage>
  );
}
