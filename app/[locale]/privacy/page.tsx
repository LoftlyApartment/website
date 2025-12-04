import type { Metadata } from 'next';
import { LegalPage, LegalSection } from '@/components/legal/LegalPage';

export const metadata: Metadata = {
  title: 'Datenschutzerklärung',
  description: 'Datenschutzerklärung der Loftly Apartment GmbH gemäß DSGVO',
};

const tableOfContents = [
  { id: 'einleitung', title: '1. Einleitung und Kontaktdaten' },
  { id: 'verantwortlicher', title: '2. Verantwortlicher' },
  { id: 'datenarten', title: '3. Arten der verarbeiteten Daten' },
  { id: 'zwecke', title: '4. Zwecke der Datenverarbeitung' },
  { id: 'rechtsgrundlagen', title: '5. Rechtsgrundlagen (DSGVO Art. 6)' },
  { id: 'weitergabe', title: '6. Datenweitergabe an Dritte' },
  { id: 'speicherdauer', title: '7. Speicherdauer' },
  { id: 'rechte', title: '8. Ihre Rechte als Betroffener' },
  { id: 'cookies', title: '9. Cookies und Tracking-Technologien' },
  { id: 'drittanbieter', title: '10. Drittanbieter-Dienste' },
  { id: 'sicherheit', title: '11. Datensicherheit' },
  { id: 'kontakt', title: '12. Kontakt für Datenschutzfragen' },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Datenschutzerklärung"
      lastUpdated="30. Oktober 2025"
      tableOfContents={tableOfContents}
    >
      <LegalSection id="einleitung" title="1. Einleitung und Kontaktdaten">
        <p>
          Die Loftly Apartment GmbH nimmt den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln
          Ihre personenbezogenen Daten vertraulich und entsprechend der gesetzlichen Datenschutzvorschriften
          sowie dieser Datenschutzerklärung.
        </p>
        <p>
          Diese Datenschutzerklärung informiert Sie über die Art, den Umfang und den Zweck der Verarbeitung
          personenbezogener Daten durch uns als verantwortliche Stelle.
        </p>
      </LegalSection>

      <LegalSection id="verantwortlicher" title="2. Verantwortlicher">
        <p>
          Verantwortlich für die Datenverarbeitung auf dieser Website ist:
        </p>
        <p>
          <strong>Loftly Apartment GmbH</strong><br />
          Lübecker Straße 49<br />
          10559 Berlin<br />
          Deutschland
        </p>
        <p>
          <strong>Vertreten durch:</strong> Kerim Ay, Fabian Streckfuß<br />
          <strong>Telefon:</strong> +49 163 3595589<br />
          <strong>E-Mail:</strong> info@loftlyapartment.de
        </p>
      </LegalSection>

      <LegalSection id="datenarten" title="3. Arten der verarbeiteten Daten">
        <p>Wir verarbeiten folgende Kategorien personenbezogener Daten:</p>

        <h3 className="text-lg font-semibold mt-4 mb-2">3.1 Persönliche Identifikationsdaten</h3>
        <ul className="list-disc pl-6 space-y-1">
          <li>Vor- und Nachname</li>
          <li>E-Mail-Adresse</li>
          <li>Telefonnummer</li>
          <li>Postanschrift</li>
          <li>Geburtsdatum (bei Buchung erforderlich)</li>
        </ul>

        <h3 className="text-lg font-semibold mt-4 mb-2">3.2 Buchungsdaten</h3>
        <ul className="list-disc pl-6 space-y-1">
          <li>Check-in- und Check-out-Daten</li>
          <li>Anzahl der Gäste</li>
          <li>Sonderwünsche und Präferenzen</li>
          <li>Zahlungsinformationen (verschlüsselt über Stripe)</li>
          <li>Buchungsnummer und -historie</li>
        </ul>

        <h3 className="text-lg font-semibold mt-4 mb-2">3.3 Technische Daten</h3>
        <ul className="list-disc pl-6 space-y-1">
          <li>IP-Adresse</li>
          <li>Browser-Typ und -Version</li>
          <li>Betriebssystem</li>
          <li>Zugriffszeitpunkt</li>
          <li>Cookies und ähnliche Technologien</li>
        </ul>

        <h3 className="text-lg font-semibold mt-4 mb-2">3.4 Kommunikationsdaten</h3>
        <ul className="list-disc pl-6 space-y-1">
          <li>Inhalt von E-Mails und Nachrichten</li>
          <li>Anfragen über Kontaktformulare</li>
          <li>Support-Anfragen und Korrespondenz</li>
        </ul>
      </LegalSection>

      <LegalSection id="zwecke" title="4. Zwecke der Datenverarbeitung">
        <p>Wir verarbeiten Ihre personenbezogenen Daten zu folgenden Zwecken:</p>

        <h3 className="text-lg font-semibold mt-4 mb-2">4.1 Buchungsabwicklung</h3>
        <ul className="list-disc pl-6 space-y-1">
          <li>Bearbeitung und Verwaltung von Buchungen</li>
          <li>Bereitstellung der gebuchten Unterkunft</li>
          <li>Kommunikation bezüglich Ihrer Buchung</li>
          <li>Check-in und Check-out-Verwaltung</li>
        </ul>

        <h3 className="text-lg font-semibold mt-4 mb-2">4.2 Zahlungsabwicklung</h3>
        <ul className="list-disc pl-6 space-y-1">
          <li>Verarbeitung von Zahlungen über Stripe</li>
          <li>Rechnungsstellung</li>
          <li>Verwaltung von Kautionen</li>
        </ul>

        <h3 className="text-lg font-semibold mt-4 mb-2">4.3 Kundenbetreuung</h3>
        <ul className="list-disc pl-6 space-y-1">
          <li>Beantwortung von Anfragen</li>
          <li>24/7-Support während des Aufenthalts</li>
          <li>Bearbeitung von Beschwerden</li>
        </ul>

        <h3 className="text-lg font-semibold mt-4 mb-2">4.4 Website-Funktionalität</h3>
        <ul className="list-disc pl-6 space-y-1">
          <li>Bereitstellung und Verbesserung unserer Website</li>
          <li>Sicherstellung der technischen Funktionalität</li>
          <li>Fehlerdiagnose und -behebung</li>
        </ul>

        <h3 className="text-lg font-semibold mt-4 mb-2">4.5 Rechtliche Verpflichtungen</h3>
        <ul className="list-disc pl-6 space-y-1">
          <li>Erfüllung steuerrechtlicher Pflichten</li>
          <li>Einhaltung von Meldepflichten gemäß Beherbergungsstatistik</li>
          <li>Aufbewahrung buchhalterischer Unterlagen</li>
        </ul>

        <h3 className="text-lg font-semibold mt-4 mb-2">4.6 Marketing (nur mit Einwilligung)</h3>
        <ul className="list-disc pl-6 space-y-1">
          <li>Versand von Newslettern</li>
          <li>Informationen über Angebote und Neuigkeiten</li>
          <li>Kundenzufriedenheitsumfragen</li>
        </ul>
      </LegalSection>

      <LegalSection id="rechtsgrundlagen" title="5. Rechtsgrundlagen (DSGVO Art. 6)">
        <p>Die Verarbeitung Ihrer personenbezogenen Daten erfolgt auf Grundlage folgender Rechtsgrundlagen:</p>

        <h3 className="text-lg font-semibold mt-4 mb-2">5.1 Vertragserfüllung (Art. 6 Abs. 1 lit. b DSGVO)</h3>
        <p>
          Die Verarbeitung ist erforderlich zur Erfüllung des Buchungsvertrags, insbesondere zur Bereitstellung
          der Unterkunft und zur Abwicklung der Zahlung.
        </p>

        <h3 className="text-lg font-semibold mt-4 mb-2">5.2 Rechtliche Verpflichtung (Art. 6 Abs. 1 lit. c DSGVO)</h3>
        <p>
          Die Verarbeitung ist erforderlich zur Erfüllung gesetzlicher Verpflichtungen, insbesondere
          steuerrechtlicher und statistischer Meldepflichten.
        </p>

        <h3 className="text-lg font-semibold mt-4 mb-2">5.3 Berechtigte Interessen (Art. 6 Abs. 1 lit. f DSGVO)</h3>
        <p>
          Die Verarbeitung erfolgt zur Wahrung unserer berechtigten Interessen, z.B.:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Gewährleistung der IT-Sicherheit</li>
          <li>Verbesserung unserer Dienstleistungen</li>
          <li>Geltendmachung rechtlicher Ansprüche</li>
        </ul>

        <h3 className="text-lg font-semibold mt-4 mb-2">5.4 Einwilligung (Art. 6 Abs. 1 lit. a DSGVO)</h3>
        <p>
          Für Marketing-Zwecke verarbeiten wir Ihre Daten nur mit Ihrer ausdrücklichen Einwilligung,
          die Sie jederzeit widerrufen können.
        </p>
      </LegalSection>

      <LegalSection id="weitergabe" title="6. Datenweitergabe an Dritte">
        <p>
          Wir geben Ihre personenbezogenen Daten nur an Dritte weiter, wenn dies für die Vertragserfüllung
          erforderlich ist oder Sie ausdrücklich eingewilligt haben.
        </p>

        <h3 className="text-lg font-semibold mt-4 mb-2">6.1 Zahlungsdienstleister</h3>
        <p>
          <strong>Stripe:</strong> Für die Zahlungsabwicklung nutzen wir Stripe. Dabei werden
          Zahlungsdaten direkt an Stripe übermittelt. Stripe ist PCI-DSS zertifiziert.<br />
          Datenschutzerklärung: <a href="https://stripe.com/de/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">stripe.com/de/privacy</a>
        </p>

        <h3 className="text-lg font-semibold mt-4 mb-2">6.2 Buchungssystem</h3>
        <p>
          <strong>Lodgify:</strong> Wir nutzen Lodgify als Buchungsverwaltungssystem. Buchungsdaten werden
          auf Servern von Lodgify in der EU gespeichert.<br />
          Datenschutzerklärung: <a href="https://www.lodgify.com/privacy-policy/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">lodgify.com/privacy-policy</a>
        </p>

        <h3 className="text-lg font-semibold mt-4 mb-2">6.3 Kein Datenverkauf</h3>
        <p>
          Wir verkaufen Ihre persönlichen Daten niemals an Dritte. Eine Weitergabe erfolgt nur im
          beschriebenen Umfang oder wenn wir gesetzlich dazu verpflichtet sind.
        </p>
      </LegalSection>

      <LegalSection id="speicherdauer" title="7. Speicherdauer">
        <p>
          Wir speichern Ihre personenbezogenen Daten nur so lange, wie es für die jeweiligen Zwecke
          erforderlich ist oder gesetzliche Aufbewahrungsfristen bestehen.
        </p>

        <h3 className="text-lg font-semibold mt-4 mb-2">7.1 Buchungsdaten</h3>
        <p>
          Buchungsdaten werden für <strong>10 Jahre</strong> gespeichert aufgrund steuerrechtlicher
          Aufbewahrungspflichten (§ 147 AO, § 257 HGB).
        </p>

        <h3 className="text-lg font-semibold mt-4 mb-2">7.2 Kommunikationsdaten</h3>
        <p>
          E-Mails und Korrespondenz werden für <strong>3 Jahre</strong> aufbewahrt, sofern nicht
          ein berechtigtes Interesse an längerer Aufbewahrung besteht.
        </p>

        <h3 className="text-lg font-semibold mt-4 mb-2">7.3 Marketing-Daten</h3>
        <p>
          Newsletter-Anmeldungen werden bis zum Widerruf Ihrer Einwilligung gespeichert.
        </p>

        <h3 className="text-lg font-semibold mt-4 mb-2">7.4 Website-Logdaten</h3>
        <p>
          Server-Logdateien werden für <strong>7 Tage</strong> gespeichert und dann automatisch gelöscht.
        </p>
      </LegalSection>

      <LegalSection id="rechte" title="8. Ihre Rechte als Betroffener">
        <p>
          Sie haben gemäß der DSGVO folgende Rechte bezüglich Ihrer personenbezogenen Daten:
        </p>

        <h3 className="text-lg font-semibold mt-4 mb-2">8.1 Recht auf Auskunft (Art. 15 DSGVO)</h3>
        <p>
          Sie haben das Recht, Auskunft über die von uns verarbeiteten personenbezogenen Daten zu erhalten.
        </p>

        <h3 className="text-lg font-semibold mt-4 mb-2">8.2 Recht auf Berichtigung (Art. 16 DSGVO)</h3>
        <p>
          Sie haben das Recht, die Berichtigung unrichtiger Daten zu verlangen.
        </p>

        <h3 className="text-lg font-semibold mt-4 mb-2">8.3 Recht auf Löschung (Art. 17 DSGVO)</h3>
        <p>
          Sie haben das Recht auf Löschung Ihrer Daten, sofern keine gesetzlichen Aufbewahrungspflichten
          entgegenstehen.
        </p>

        <h3 className="text-lg font-semibold mt-4 mb-2">8.4 Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO)</h3>
        <p>
          Sie haben das Recht, die Einschränkung der Verarbeitung Ihrer Daten zu verlangen.
        </p>

        <h3 className="text-lg font-semibold mt-4 mb-2">8.5 Recht auf Datenübertragbarkeit (Art. 20 DSGVO)</h3>
        <p>
          Sie haben das Recht, Ihre Daten in einem strukturierten, gängigen und maschinenlesbaren Format
          zu erhalten.
        </p>

        <h3 className="text-lg font-semibold mt-4 mb-2">8.6 Recht auf Widerspruch (Art. 21 DSGVO)</h3>
        <p>
          Sie haben das Recht, der Verarbeitung Ihrer Daten aus Gründen, die sich aus Ihrer besonderen
          Situation ergeben, zu widersprechen.
        </p>

        <h3 className="text-lg font-semibold mt-4 mb-2">8.7 Recht auf Widerruf der Einwilligung</h3>
        <p>
          Sie können eine erteilte Einwilligung jederzeit mit Wirkung für die Zukunft widerrufen.
        </p>

        <h3 className="text-lg font-semibold mt-4 mb-2">8.8 Recht auf Beschwerde</h3>
        <p>
          Sie haben das Recht, sich bei einer Aufsichtsbehörde zu beschweren. Die zuständige
          Aufsichtsbehörde in Berlin ist:
        </p>
        <p>
          Berliner Beauftragte für Datenschutz und Informationsfreiheit<br />
          Friedrichstraße 219<br />
          10969 Berlin<br />
          Telefon: 030 13889-0<br />
          E-Mail: mailbox@datenschutz-berlin.de
        </p>
      </LegalSection>

      <LegalSection id="cookies" title="9. Cookies und Tracking-Technologien">
        <p>
          Unsere Website verwendet Cookies, um die Funktionalität zu gewährleisten und Ihr Nutzererlebnis
          zu verbessern.
        </p>

        <h3 className="text-lg font-semibold mt-4 mb-2">9.1 Essenzielle Cookies</h3>
        <p>
          Diese Cookies sind für die Funktion der Website erforderlich und können nicht deaktiviert werden:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Sitzungs-Cookies für die Buchungsfunktion</li>
          <li>Spracheinstellungen</li>
          <li>Sicherheits-Cookies</li>
        </ul>

        <h3 className="text-lg font-semibold mt-4 mb-2">9.2 Funktionale Cookies</h3>
        <p>
          Diese Cookies ermöglichen erweiterte Funktionen:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Speicherung von Präferenzen</li>
          <li>Verbesserung der Benutzererfahrung</li>
        </ul>

        <h3 className="text-lg font-semibold mt-4 mb-2">9.3 Cookie-Verwaltung</h3>
        <p>
          Sie können Ihre Cookie-Einstellungen in Ihrem Browser verwalten. Beachten Sie, dass die
          Deaktivierung von Cookies die Funktionalität der Website beeinträchtigen kann.
        </p>
        <p>
          Weitere Informationen finden Sie in unserer <a href="/cookies" className="text-blue-600 hover:underline">Cookie-Richtlinie</a>.
        </p>
      </LegalSection>

      <LegalSection id="drittanbieter" title="10. Drittanbieter-Dienste">
        <h3 className="text-lg font-semibold mt-4 mb-2">10.1 Stripe (Zahlungsabwicklung)</h3>
        <p>
          Wir nutzen Stripe für sichere Zahlungsabwicklung. Stripe verarbeitet Zahlungsdaten nach
          höchsten Sicherheitsstandards (PCI-DSS Level 1).
        </p>

        <h3 className="text-lg font-semibold mt-4 mb-2">10.2 Lodgify (Buchungssystem)</h3>
        <p>
          Unser Buchungsverwaltungssystem Lodgify speichert Buchungsdaten auf Servern innerhalb der EU
          und ist DSGVO-konform.
        </p>

        <h3 className="text-lg font-semibold mt-4 mb-2">10.3 Google Maps (optional)</h3>
        <p>
          Falls Google Maps auf unserer Website eingebunden ist, werden bei Nutzung Daten an Google
          übermittelt. Die Nutzung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO.
        </p>
      </LegalSection>

      <LegalSection id="sicherheit" title="11. Datensicherheit">
        <p>
          Wir setzen technische und organisatorische Sicherheitsmaßnahmen ein, um Ihre Daten gegen
          zufällige oder vorsätzliche Manipulationen, Verlust, Zerstörung oder den Zugriff
          unberechtigter Personen zu schützen.
        </p>

        <h3 className="text-lg font-semibold mt-4 mb-2">Unsere Sicherheitsmaßnahmen umfassen:</h3>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>SSL/TLS-Verschlüsselung:</strong> Alle Datenübertragungen sind verschlüsselt</li>
          <li><strong>Sichere Zahlungsabwicklung:</strong> Zahlungsdaten werden ausschließlich über PCI-DSS zertifizierte Systeme verarbeitet</li>
          <li><strong>Zugriffskontrolle:</strong> Nur autorisierte Mitarbeiter haben Zugriff auf personenbezogene Daten</li>
          <li><strong>Regelmäßige Updates:</strong> Unsere Systeme werden regelmäßig aktualisiert</li>
          <li><strong>Backups:</strong> Regelmäßige Datensicherungen auf sicheren Servern</li>
          <li><strong>Schulung:</strong> Unsere Mitarbeiter werden regelmäßig im Datenschutz geschult</li>
        </ul>
      </LegalSection>

      <LegalSection id="kontakt" title="12. Kontakt für Datenschutzfragen">
        <p>
          Bei Fragen zum Datenschutz oder zur Ausübung Ihrer Rechte kontaktieren Sie uns bitte:
        </p>
        <p>
          <strong>Loftly Apartment GmbH</strong><br />
          Datenschutz<br />
          Lübecker Straße 49<br />
          10559 Berlin<br />
          Deutschland
        </p>
        <p>
          <strong>E-Mail:</strong> info@loftlyapartment.de<br />
          <strong>Telefon:</strong> +49 163 3595589
        </p>
        <p className="mt-4">
          Wir werden Ihre Anfrage umgehend bearbeiten und uns innerhalb von 30 Tagen bei Ihnen melden.
        </p>
      </LegalSection>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-neutral-700">
          <strong>Hinweis:</strong> Diese Datenschutzerklärung wurde mit größter Sorgfalt erstellt.
          Wir behalten uns vor, diese Datenschutzerklärung anzupassen, um den aktuellen rechtlichen
          Anforderungen zu entsprechen oder Änderungen unserer Dienstleistungen umzusetzen.
          Die aktuelle Version ist auf unserer Website verfügbar.
        </p>
      </div>
    </LegalPage>
  );
}
