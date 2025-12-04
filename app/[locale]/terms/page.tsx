import type { Metadata } from 'next';
import { LegalPage, LegalSection } from '@/components/legal/LegalPage';

export const metadata: Metadata = {
  title: 'AGB - Allgemeine Geschäftsbedingungen',
  description: 'Allgemeine Geschäftsbedingungen der Loftly Apartment GmbH für Apartmentvermietung',
};

const tableOfContents = [
  { id: 'geltungsbereich', title: '1. Geltungsbereich' },
  { id: 'buchung', title: '2. Buchung und Vertragsabschluss' },
  { id: 'preise', title: '3. Preise und Zahlung' },
  { id: 'checkin', title: '4. Check-in und Check-out' },
  { id: 'pflichten', title: '5. Pflichten des Gastes' },
  { id: 'kaution', title: '6. Kaution' },
  { id: 'stornierung', title: '7. Stornierungsbedingungen' },
  { id: 'haftung', title: '8. Haftung' },
  { id: 'datenschutz', title: '9. Datenschutz' },
  { id: 'streitbeilegung', title: '10. Streitbeilegung' },
];

export default function TermsPage() {
  return (
    <LegalPage
      title="Allgemeine Geschäftsbedingungen (AGB)"
      lastUpdated="30. Oktober 2025"
      tableOfContents={tableOfContents}
    >
      <LegalSection id="geltungsbereich" title="1. Geltungsbereich">
        <p>
          Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Buchungen und Aufenthalte in
          den von der Loftly Apartment GmbH (nachfolgend "Vermieter") verwalteten Apartments.
        </p>
        <p>
          <strong>Vermieter:</strong><br />
          Loftly Apartment GmbH<br />
          Lübecker Straße 49<br />
          10559 Berlin<br />
          Deutschland<br />
          Handelsregister: HRB 274913 B, Amtsgericht Charlottenburg
        </p>
        <p>
          Durch die Buchung akzeptieren Sie als Gast diese AGB in ihrer zum Zeitpunkt der Buchung
          gültigen Fassung.
        </p>
      </LegalSection>

      <LegalSection id="buchung" title="2. Buchung und Vertragsabschluss">
        <h3 className="text-lg font-semibold mt-4 mb-2">2.1 Vertragsabschluss</h3>
        <p>
          Der Mietvertrag kommt durch die Buchungsbestätigung des Vermieters zustande. Die Buchung
          stellt ein verbindliches Angebot des Gastes dar. Der Vermieter kann dieses Angebot durch
          Zusendung einer Buchungsbestätigung per E-Mail annehmen.
        </p>

        <h3 className="text-lg font-semibold mt-4 mb-2">2.2 Mindestalter</h3>
        <p>
          Buchungen können nur von Personen vorgenommen werden, die das 18. Lebensjahr vollendet haben.
          Der Hauptmieter muss während des gesamten Aufenthalts anwesend sein.
        </p>

        <h3 className="text-lg font-semibold mt-4 mb-2">2.3 Mindestaufenthalt</h3>
        <p>
          Es gilt ein Mindestaufenthalt von <strong>3 Nächten</strong>. Ausnahmen sind nach vorheriger
          Absprache möglich.
        </p>

        <h3 className="text-lg font-semibold mt-4 mb-2">2.4 Maximale Gästezahl</h3>
        <p>
          Die Anzahl der Gäste darf die in der Buchungsbestätigung angegebene maximale Personenzahl
          nicht überschreiten:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Kantstrasse Apartment: Maximal 5 Gäste</li>
          <li>Hindenburgdamm Apartment: Maximal 4 Gäste</li>
        </ul>
      </LegalSection>

      <LegalSection id="preise" title="3. Preise und Zahlung">
        <h3 className="text-lg font-semibold mt-4 mb-2">3.1 Preise</h3>
        <p>
          Alle angegebenen Preise sind Endpreise und beinhalten die gesetzliche Mehrwertsteuer
          von 19%. Die Preise verstehen sich in Euro (EUR).
        </p>
        <p>
          Der Gesamtpreis setzt sich zusammen aus:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Übernachtungspreis (pro Nacht)</li>
          <li>Einmalige Reinigungsgebühr: 60€</li>
          <li>Kautionsbetrag: 300€ (wird nicht abgebucht, nur autorisiert)</li>
          <li>Ggf. Haustier-Reinigungsgebühr: 20€ (nur Hindenburgdamm)</li>
        </ul>

        <h3 className="text-lg font-semibold mt-4 mb-2">3.2 Rabatte für längere Aufenthalte</h3>
        <ul className="list-disc pl-6 space-y-1">
          <li>Wochenaufenthalt (7+ Nächte): 10% Rabatt</li>
          <li>Monatsaufenthalt (28+ Nächte): 20% Rabatt</li>
        </ul>

        <h3 className="text-lg font-semibold mt-4 mb-2">3.3 Zahlungsmodalitäten</h3>
        <p>
          Die Zahlung erfolgt über unseren Zahlungsdienstleister Stripe. Folgende Zahlungsarten
          werden akzeptiert:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Kreditkarte (Visa, Mastercard, American Express)</li>
          <li>Debitkarte</li>
          <li>SEPA-Lastschrift</li>
        </ul>

        <h3 className="text-lg font-semibold mt-4 mb-2">3.4 Zahlungszeitpunkt</h3>
        <p>
          Der vollständige Mietpreis inklusive Reinigungsgebühr ist bei Buchung fällig und wird
          sofort eingezogen. Die Kaution wird nur autorisiert und nach dem Check-out freigegeben.
        </p>

        <h3 className="text-lg font-semibold mt-4 mb-2">3.5 Währung</h3>
        <p>
          Alle Preise und Zahlungen erfolgen in Euro (EUR).
        </p>
      </LegalSection>

      <LegalSection id="checkin" title="4. Check-in und Check-out">
        <h3 className="text-lg font-semibold mt-4 mb-2">4.1 Check-in-Zeiten</h3>
        <p>
          <strong>Check-in:</strong> 15:00 Uhr bis 23:00 Uhr<br />
          <strong>Check-out:</strong> bis 11:00 Uhr
        </p>
        <p>
          Früher Check-in oder später Check-out ist nach vorheriger Absprache und je nach Verfügbarkeit
          gegen Aufpreis möglich.
        </p>

        <h3 className="text-lg font-semibold mt-4 mb-2">4.2 Selbst-Check-in</h3>
        <p>
          Wir bieten kontaktlosen Selbst-Check-in über Smart Locks und Schlüsselboxen an. Sie erhalten
          24 Stunden vor Ihrer Ankunft detaillierte Zugangsinformationen per E-Mail, einschließlich:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Adresse und Wegbeschreibung</li>
          <li>Zugangscodes</li>
          <li>Anleitung für den Check-in</li>
          <li>WLAN-Zugangsdaten</li>
          <li>Notfallkontakt</li>
        </ul>

        <h3 className="text-lg font-semibold mt-4 mb-2">4.3 Verspätete Ankunft</h3>
        <p>
          Bei verspäteter Ankunft (nach 23:00 Uhr) informieren Sie uns bitte im Voraus. Der
          Selbst-Check-in ermöglicht flexible Ankunftszeiten rund um die Uhr.
        </p>

        <h3 className="text-lg font-semibold mt-4 mb-2">4.4 Check-out-Verfahren</h3>
        <p>
          Am Abreisetag muss das Apartment bis 11:00 Uhr geräumt sein. Bitte:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Lassen Sie die Schlüssel im Apartment</li>
          <li>Verschließen Sie alle Türen und Fenster</li>
          <li>Schalten Sie alle Lichter und Geräte aus</li>
          <li>Entsorgen Sie den Müll</li>
          <li>Hinterlassen Sie das Apartment in einem ordentlichen Zustand</li>
        </ul>
      </LegalSection>

      <LegalSection id="pflichten" title="5. Pflichten des Gastes">
        <h3 className="text-lg font-semibold mt-4 mb-2">5.1 Pflegliche Behandlung</h3>
        <p>
          Der Gast verpflichtet sich, das Apartment und dessen Einrichtung pfleglich zu behandeln
          und gemäß den Hausregeln zu nutzen.
        </p>

        <h3 className="text-lg font-semibold mt-4 mb-2">5.2 Maximale Belegung</h3>
        <p>
          Die maximale Anzahl der im Apartment übernachtenden Personen darf nicht überschritten werden.
          Übernachtungsbesuche sind nur mit vorheriger Genehmigung gestattet.
        </p>

        <h3 className="text-lg font-semibold mt-4 mb-2">5.3 Rauchverbot</h3>
        <p>
          <strong>Rauchen ist in allen Apartments streng verboten.</strong> Dies gilt auch für
          E-Zigaretten und Vaporizer. Rauchen ist ebenfalls auf Balkonen nicht gestattet.
        </p>
        <p>
          Bei Verstoß gegen das Rauchverbot wird eine Reinigungsgebühr von 300€ fällig.
        </p>

        <h3 className="text-lg font-semibold mt-4 mb-2">5.4 Veranstaltungen und Partys</h3>
        <p>
          Partys, Veranstaltungen und laute Zusammenkünfte sind nicht gestattet. Bei Verstoß kann
          der Vermieter den Mietvertrag fristlos kündigen.
        </p>

        <h3 className="text-lg font-semibold mt-4 mb-2">5.5 Ruhezeiten</h3>
        <p>
          Die gesetzlichen Ruhezeiten sind einzuhalten:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Nachtruhe: 22:00 Uhr bis 7:00 Uhr</li>
          <li>Mittagsruhe: 13:00 Uhr bis 15:00 Uhr</li>
          <li>Sonn- und Feiertage: ganztägige Ruhe</li>
        </ul>

        <h3 className="text-lg font-semibold mt-4 mb-2">5.6 Haustiere</h3>
        <p>
          <strong>Kantstrasse Apartment:</strong> Haustiere sind nicht erlaubt.<br />
          <strong>Hindenburgdamm Apartment:</strong> Haustiere sind mit vorheriger Anmeldung und
          gegen eine Reinigungsgebühr von 20€ erlaubt. Der Gast haftet für alle durch das Tier
          verursachten Schäden.
        </p>

        <h3 className="text-lg font-semibold mt-4 mb-2">5.7 Schlüsselverlust</h3>
        <p>
          Bei Verlust von Schlüsseln oder Zugangscodes ist der Vermieter unverzüglich zu informieren.
          Die Kosten für Schlüsselersatz oder Schlossaustausch trägt der Gast.
        </p>

        <h3 className="text-lg font-semibold mt-4 mb-2">5.8 Untervermietung</h3>
        <p>
          Eine Untervermietung oder entgeltliche Überlassung des Apartments an Dritte ist nicht gestattet.
        </p>
      </LegalSection>

      <LegalSection id="kaution" title="6. Kaution">
        <h3 className="text-lg font-semibold mt-4 mb-2">6.1 Kautionshöhe</h3>
        <p>
          Bei Buchung wird eine Kaution in Höhe von <strong>300€</strong> auf Ihrer Kreditkarte
          autorisiert (Pre-Authorization). Der Betrag wird nicht abgebucht.
        </p>

        <h3 className="text-lg font-semibold mt-4 mb-2">6.2 Zweck der Kaution</h3>
        <p>
          Die Kaution dient zur Deckung folgender möglicher Kosten:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Schäden an Einrichtung oder Gegenständen</li>
          <li>Verlust oder Beschädigung von Schlüsseln</li>
          <li>Verstoß gegen das Rauchverbot</li>
          <li>Außerordentlicher Reinigungsaufwand</li>
          <li>Verstöße gegen die Hausordnung</li>
        </ul>

        <h3 className="text-lg font-semibold mt-4 mb-2">6.3 Freigabe der Kaution</h3>
        <p>
          Die Autorisierung wird innerhalb von <strong>7 Tagen nach dem Check-out</strong> freigegeben,
          sofern keine Beanstandungen vorliegen. Die tatsächliche Freigabe auf Ihrem Konto kann je nach
          Bank 5-10 Werktage dauern.
        </p>

        <h3 className="text-lg font-semibold mt-4 mb-2">6.4 Einbehaltung der Kaution</h3>
        <p>
          Bei Schäden oder Verstößen behält sich der Vermieter das Recht vor, die Kaution ganz oder
          teilweise einzubehalten. Der Gast wird über Art und Höhe der Einbehaltung schriftlich informiert.
        </p>
      </LegalSection>

      <LegalSection id="stornierung" title="7. Stornierungsbedingungen">
        <h3 className="text-lg font-semibold mt-4 mb-2">7.1 Stornierung durch den Gast</h3>
        <p>
          Stornierungen müssen schriftlich per E-Mail an info@loftlyapartment.de erfolgen.
          Maßgeblich ist der Zeitpunkt des Eingangs der Stornierung beim Vermieter.
        </p>

        <h3 className="text-lg font-semibold mt-4 mb-2">7.2 Stornierungsfristen und Gebühren</h3>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Bis 14 Tage vor Check-in:</strong> Kostenlose Stornierung, volle Rückerstattung</li>
          <li><strong>7-14 Tage vor Check-in:</strong> 50% Rückerstattung des Mietpreises</li>
          <li><strong>Weniger als 7 Tage vor Check-in:</strong> Keine Rückerstattung</li>
        </ul>
        <p className="text-sm italic mt-2">
          Die Reinigungsgebühr wird bei Stornierung immer zurückerstattet. Die Kaution wird vollständig
          freigegeben.
        </p>

        <h3 className="text-lg font-semibold mt-4 mb-2">7.3 Höhere Gewalt</h3>
        <p>
          Bei außergewöhnlichen, unvorhersehbaren Ereignissen (höhere Gewalt), die den Aufenthalt
          unmöglich machen, kann eine kulante Lösung gefunden werden. Dies umfasst z.B.:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Schwere Erkrankung mit ärztlichem Attest</li>
          <li>Behördlich angeordnete Reisebeschränkungen</li>
          <li>Naturkatastrophen</li>
        </ul>

        <h3 className="text-lg font-semibold mt-4 mb-2">7.4 Vorzeitige Abreise</h3>
        <p>
          Bei vorzeitiger Abreise erfolgt keine Rückerstattung für nicht genutzte Nächte.
        </p>

        <h3 className="text-lg font-semibold mt-4 mb-2">7.5 Stornierung durch den Vermieter</h3>
        <p>
          Bei Stornierung durch den Vermieter (z.B. aufgrund von Wartungsarbeiten oder Schäden am Apartment)
          wird der gesamte gezahlte Betrag vollständig zurückerstattet. Weitergehende Ansprüche sind
          ausgeschlossen.
        </p>
      </LegalSection>

      <LegalSection id="haftung" title="8. Haftung">
        <h3 className="text-lg font-semibold mt-4 mb-2">8.1 Haftung des Gastes</h3>
        <p>
          Der Gast haftet für alle Schäden, die durch ihn, seine Besucher oder mitreisende Personen
          verursacht werden. Dies umfasst:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Beschädigungen an der Einrichtung</li>
          <li>Verlust oder Beschädigung von Inventar</li>
          <li>Schäden durch unsachgemäße Nutzung</li>
          <li>Schäden durch Nichteinhaltung der Hausregeln</li>
        </ul>

        <h3 className="text-lg font-semibold mt-4 mb-2">8.2 Haftung des Vermieters</h3>
        <p>
          Der Vermieter haftet nach den gesetzlichen Bestimmungen für Schäden aus der Verletzung
          des Lebens, des Körpers oder der Gesundheit sowie für Schäden aus der Verletzung wesentlicher
          Vertragspflichten (Kardinalpflichten).
        </p>
        <p>
          Für leicht fahrlässige Pflichtverletzungen haftet der Vermieter nur bei Verletzung
          wesentlicher Vertragspflichten und begrenzt auf den vertragstypischen, vorhersehbaren Schaden.
        </p>
        <p>
          Eine Haftung für den Verlust oder die Beschädigung mitgebrachter Gegenstände ist ausgeschlossen,
          es sei denn, der Schaden wurde vorsätzlich oder grob fahrlässig verursacht.
        </p>

        <h3 className="text-lg font-semibold mt-4 mb-2">8.3 Versicherungsschutz</h3>
        <p>
          Dem Gast wird empfohlen, eine Reise- und Haftpflichtversicherung abzuschließen. Der Vermieter
          haftet nicht für Diebstahl oder Verlust persönlicher Gegenstände.
        </p>

        <h3 className="text-lg font-semibold mt-4 mb-2">8.4 Mängel</h3>
        <p>
          Mängel oder Schäden am Apartment sind dem Vermieter unverzüglich zu melden. Der Vermieter
          wird sich bemühen, Mängel schnellstmöglich zu beheben. Bei erheblichen Mängeln, die den
          Aufenthalt wesentlich beeinträchtigen, kann eine Mietminderung in Betracht gezogen werden.
        </p>
      </LegalSection>

      <LegalSection id="datenschutz" title="9. Datenschutz">
        <p>
          Der Schutz Ihrer persönlichen Daten ist uns wichtig. Details zur Erhebung, Verarbeitung
          und Nutzung Ihrer personenbezogenen Daten finden Sie in unserer
          <a href="/privacy" className="text-blue-600 hover:underline ml-1">Datenschutzerklärung</a>.
        </p>
        <p>
          Mit der Buchung stimmen Sie der Verarbeitung Ihrer Daten gemäß der Datenschutzerklärung zu.
        </p>
      </LegalSection>

      <LegalSection id="streitbeilegung" title="10. Streitbeilegung">
        <h3 className="text-lg font-semibold mt-4 mb-2">10.1 Anwendbares Recht</h3>
        <p>
          Auf diese AGB und alle Verträge zwischen dem Vermieter und dem Gast findet das Recht der
          Bundesrepublik Deutschland Anwendung unter Ausschluss des UN-Kaufrechts.
        </p>

        <h3 className="text-lg font-semibold mt-4 mb-2">10.2 Gerichtsstand</h3>
        <p>
          Ausschließlicher Gerichtsstand für alle Streitigkeiten aus oder im Zusammenhang mit diesen
          AGB ist Berlin, sofern der Gast Kaufmann, eine juristische Person des öffentlichen Rechts
          oder ein öffentlich-rechtliches Sondervermögen ist.
        </p>

        <h3 className="text-lg font-semibold mt-4 mb-2">10.3 Online-Streitbeilegung</h3>
        <p>
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
        <p>
          Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
          Verbraucherschlichtungsstelle teilzunehmen.
        </p>

        <h3 className="text-lg font-semibold mt-4 mb-2">10.4 Salvatorische Klausel</h3>
        <p>
          Sollten einzelne Bestimmungen dieser AGB unwirksam sein oder werden, bleibt die Wirksamkeit
          der übrigen Bestimmungen hiervon unberührt. Die unwirksame Bestimmung wird durch eine wirksame
          ersetzt, die dem wirtschaftlichen Zweck der unwirksamen Bestimmung am nächsten kommt.
        </p>
      </LegalSection>

      <div className="mt-8 p-4 bg-neutral-100 rounded-lg">
        <h3 className="font-semibold text-neutral-900 mb-2">Kontakt bei Fragen zu den AGB</h3>
        <p className="text-sm text-neutral-700">
          <strong>Loftly Apartment GmbH</strong><br />
          Lübecker Straße 49<br />
          10559 Berlin<br />
          Deutschland
        </p>
        <p className="text-sm text-neutral-700 mt-2">
          <strong>E-Mail:</strong> info@loftlyapartment.de<br />
          <strong>Telefon:</strong> +49 163 3595589
        </p>
      </div>
    </LegalPage>
  );
}
