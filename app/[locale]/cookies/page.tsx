import type { Metadata } from 'next';
import { LegalPage, LegalSection } from '@/components/legal/LegalPage';

export const metadata: Metadata = {
  title: 'Cookie-Richtlinie',
  description: 'Cookie-Richtlinie der Loftly Apartment GmbH - Informationen über die Verwendung von Cookies',
};

const tableOfContents = [
  { id: 'was-sind-cookies', title: '1. Was sind Cookies?' },
  { id: 'verwendung', title: '2. Wie verwenden wir Cookies?' },
  { id: 'cookie-arten', title: '3. Welche Cookies verwenden wir?' },
  { id: 'drittanbieter', title: '4. Drittanbieter-Cookies' },
  { id: 'verwaltung', title: '5. Verwaltung von Cookies' },
  { id: 'einwilligung', title: '6. Ihre Einwilligung' },
  { id: 'aktualisierung', title: '7. Aktualisierung dieser Richtlinie' },
];

export default function CookiesPage() {
  return (
    <LegalPage
      title="Cookie-Richtlinie"
      lastUpdated="30. Oktober 2025"
      tableOfContents={tableOfContents}
    >
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-neutral-700">
          Diese Cookie-Richtlinie erklärt, was Cookies sind, wie wir sie verwenden und wie Sie
          Ihre Cookie-Einstellungen verwalten können.
        </p>
      </div>

      <LegalSection id="was-sind-cookies" title="1. Was sind Cookies?">
        <p>
          Cookies sind kleine Textdateien, die auf Ihrem Computer oder Mobilgerät gespeichert werden,
          wenn Sie eine Website besuchen. Sie werden weit verbreitet eingesetzt, um Websites
          funktionsfähig zu machen oder effizienter arbeiten zu lassen, und um Informationen an
          die Betreiber der Website zu übermitteln.
        </p>

        <h3 className="text-lg font-semibold mt-4 mb-2">1.1 Zweck von Cookies</h3>
        <p>
          Cookies dienen verschiedenen Zwecken:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Ermöglichung grundlegender Website-Funktionen</li>
          <li>Speicherung Ihrer Präferenzen (z.B. Spracheinstellung)</li>
          <li>Verbesserung der Benutzerfreundlichkeit</li>
          <li>Analyse der Website-Nutzung</li>
          <li>Sicherstellung der Website-Sicherheit</li>
        </ul>

        <h3 className="text-lg font-semibold mt-4 mb-2">1.2 Arten von Cookies nach Speicherdauer</h3>
        <div className="space-y-4">
          <div>
            <p className="font-semibold">Session-Cookies (Sitzungscookies):</p>
            <p>
              Diese Cookies sind temporär und werden gelöscht, wenn Sie Ihren Browser schließen.
              Sie werden verwendet, um Ihre Aktivität während einer Browser-Sitzung zu verfolgen.
            </p>
          </div>
          <div>
            <p className="font-semibold">Persistente Cookies (dauerhafte Cookies):</p>
            <p>
              Diese Cookies bleiben auf Ihrem Gerät für einen festgelegten Zeitraum gespeichert,
              auch nachdem Sie den Browser geschlossen haben. Sie werden verwendet, um Ihre
              Präferenzen zu speichern.
            </p>
          </div>
        </div>
      </LegalSection>

      <LegalSection id="verwendung" title="2. Wie verwenden wir Cookies?">
        <p>
          Wir verwenden Cookies, um Ihnen die bestmögliche Erfahrung auf unserer Website zu bieten
          und unsere Dienstleistungen zu verbessern.
        </p>

        <h3 className="text-lg font-semibold mt-4 mb-2">2.1 Hauptzwecke</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Funktionalität:</strong> Gewährleistung, dass unsere Website ordnungsgemäß
            funktioniert und Sie auf alle Funktionen zugreifen können
          </li>
          <li>
            <strong>Sicherheit:</strong> Schutz Ihrer Daten und Verhinderung von Betrug
          </li>
          <li>
            <strong>Präferenzen:</strong> Speicherung Ihrer Einstellungen wie Sprache und
            Währung
          </li>
          <li>
            <strong>Buchungsprozess:</strong> Verwaltung Ihres Buchungsvorgangs über mehrere
            Seiten hinweg
          </li>
          <li>
            <strong>Analyse:</strong> Verständnis, wie Besucher unsere Website nutzen, um sie
            zu verbessern
          </li>
        </ul>

        <h3 className="text-lg font-semibold mt-4 mb-2">2.2 Rechtsgrundlage</h3>
        <p>
          Die Verwendung von Cookies basiert auf:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Technisch notwendige Cookies:</strong> Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse)</li>
          <li><strong>Nicht notwendige Cookies:</strong> Art. 6 Abs. 1 lit. a DSGVO (Einwilligung)</li>
        </ul>
      </LegalSection>

      <LegalSection id="cookie-arten" title="3. Welche Cookies verwenden wir?">
        <p>
          Wir kategorisieren Cookies in verschiedene Typen basierend auf ihrem Zweck:
        </p>

        <h3 className="text-lg font-semibold mt-4 mb-2">3.1 Unbedingt erforderliche Cookies</h3>
        <div className="bg-neutral-50 p-4 rounded-lg mb-4">
          <p className="font-semibold mb-2">Diese Cookies sind für den Betrieb unserer Website unerlässlich.</p>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Cookie-Name</th>
                <th className="text-left py-2">Zweck</th>
                <th className="text-left py-2">Dauer</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-2 font-mono text-xs">session_id</td>
                <td className="py-2">Verwaltung der Benutzersitzung</td>
                <td className="py-2">Session</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 font-mono text-xs">csrf_token</td>
                <td className="py-2">Sicherheit gegen Cross-Site-Request-Forgery</td>
                <td className="py-2">Session</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 font-mono text-xs">booking_state</td>
                <td className="py-2">Speicherung des Buchungsvorgangs</td>
                <td className="py-2">24 Stunden</td>
              </tr>
              <tr>
                <td className="py-2 font-mono text-xs">security_check</td>
                <td className="py-2">Sicherheitsvalidierung</td>
                <td className="py-2">Session</td>
              </tr>
            </tbody>
          </table>
          <p className="mt-2 text-xs italic">
            Diese Cookies können nicht deaktiviert werden, da die Website sonst nicht ordnungsgemäß
            funktioniert.
          </p>
        </div>

        <h3 className="text-lg font-semibold mt-4 mb-2">3.2 Funktionale Cookies</h3>
        <div className="bg-neutral-50 p-4 rounded-lg mb-4">
          <p className="font-semibold mb-2">Diese Cookies ermöglichen erweiterte Funktionen und Personalisierung.</p>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Cookie-Name</th>
                <th className="text-left py-2">Zweck</th>
                <th className="text-left py-2">Dauer</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-2 font-mono text-xs">locale_preference</td>
                <td className="py-2">Speicherung der Spracheinstellung</td>
                <td className="py-2">1 Jahr</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 font-mono text-xs">currency_preference</td>
                <td className="py-2">Speicherung der Währungseinstellung</td>
                <td className="py-2">1 Jahr</td>
              </tr>
              <tr>
                <td className="py-2 font-mono text-xs">user_preferences</td>
                <td className="py-2">Speicherung allgemeiner Benutzereinstellungen</td>
                <td className="py-2">6 Monate</td>
              </tr>
            </tbody>
          </table>
          <p className="mt-2 text-xs italic">
            Sie können diese Cookies deaktivieren, aber einige Funktionen der Website funktionieren
            möglicherweise nicht wie vorgesehen.
          </p>
        </div>

        <h3 className="text-lg font-semibold mt-4 mb-2">3.3 Analytische/Leistungs-Cookies (optional)</h3>
        <div className="bg-neutral-50 p-4 rounded-lg mb-4">
          <p className="font-semibold mb-2">
            Diese Cookies helfen uns zu verstehen, wie Besucher mit unserer Website interagieren.
          </p>
          <p className="text-sm mb-2">
            <strong>Hinweis:</strong> Diese Cookies werden nur mit Ihrer ausdrücklichen Einwilligung gesetzt.
          </p>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Cookie-Name</th>
                <th className="text-left py-2">Zweck</th>
                <th className="text-left py-2">Dauer</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-2 font-mono text-xs">_ga</td>
                <td className="py-2">Google Analytics - Nutzerunterscheidung</td>
                <td className="py-2">2 Jahre</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 font-mono text-xs">_gid</td>
                <td className="py-2">Google Analytics - Nutzerunterscheidung</td>
                <td className="py-2">24 Stunden</td>
              </tr>
              <tr>
                <td className="py-2 font-mono text-xs">analytics_consent</td>
                <td className="py-2">Speicherung der Analytics-Einwilligung</td>
                <td className="py-2">1 Jahr</td>
              </tr>
            </tbody>
          </table>
          <p className="mt-2 text-xs">
            Daten werden anonymisiert und nicht mit personenbezogenen Daten verknüpft.
          </p>
        </div>

        <h3 className="text-lg font-semibold mt-4 mb-2">3.4 Marketing-Cookies (optional)</h3>
        <div className="bg-neutral-50 p-4 rounded-lg mb-4">
          <p className="font-semibold mb-2">
            Diese Cookies werden verwendet, um relevante Werbung anzuzeigen.
          </p>
          <p className="text-sm mb-2">
            <strong>Status:</strong> Derzeit verwenden wir keine Marketing-Cookies. Diese Kategorie
            ist für zukünftige Verwendung vorgesehen.
          </p>
        </div>
      </LegalSection>

      <LegalSection id="drittanbieter" title="4. Drittanbieter-Cookies">
        <p>
          Einige Cookies werden von Drittanbieter-Diensten gesetzt, die auf unseren Seiten erscheinen.
          Wir haben keine Kontrolle über diese Cookies.
        </p>

        <h3 className="text-lg font-semibold mt-4 mb-2">4.1 Stripe (Zahlungsabwicklung)</h3>
        <div className="bg-neutral-50 p-4 rounded-lg mb-4">
          <p className="mb-2">
            <strong>Anbieter:</strong> Stripe, Inc.<br />
            <strong>Zweck:</strong> Sichere Zahlungsabwicklung und Betrugsprävention<br />
            <strong>Cookies:</strong> __stripe_mid, __stripe_sid<br />
            <strong>Datenschutz:</strong> <a href="https://stripe.com/de/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">stripe.com/de/privacy</a>
          </p>
          <p className="text-sm">
            Diese Cookies sind notwendig für die Zahlungsabwicklung und werden nur während des
            Bezahlvorgangs gesetzt.
          </p>
        </div>

        <h3 className="text-lg font-semibold mt-4 mb-2">4.2 Lodgify (Buchungssystem)</h3>
        <div className="bg-neutral-50 p-4 rounded-lg mb-4">
          <p className="mb-2">
            <strong>Anbieter:</strong> Lodgify<br />
            <strong>Zweck:</strong> Buchungsverwaltung und Verfügbarkeitsprüfung<br />
            <strong>Cookies:</strong> lodgify_session, booking_widget<br />
            <strong>Datenschutz:</strong> <a href="https://www.lodgify.com/privacy-policy/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">lodgify.com/privacy-policy</a>
          </p>
          <p className="text-sm">
            Diese Cookies sind notwendig für die Buchungsfunktion und werden nur während des
            Buchungsvorgangs gesetzt.
          </p>
        </div>

        <h3 className="text-lg font-semibold mt-4 mb-2">4.3 Google Maps (optional)</h3>
        <div className="bg-neutral-50 p-4 rounded-lg mb-4">
          <p className="mb-2">
            <strong>Anbieter:</strong> Google LLC<br />
            <strong>Zweck:</strong> Darstellung interaktiver Karten<br />
            <strong>Cookies:</strong> NID, CONSENT<br />
            <strong>Datenschutz:</strong> <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">policies.google.com/privacy</a>
          </p>
          <p className="text-sm">
            Google Maps wird nur geladen, wenn Sie aktiv mit der Karte interagieren.
          </p>
        </div>
      </LegalSection>

      <LegalSection id="verwaltung" title="5. Verwaltung von Cookies">
        <h3 className="text-lg font-semibold mt-4 mb-2">5.1 Cookie-Einstellungen auf unserer Website</h3>
        <p>
          Sie können Ihre Cookie-Einstellungen jederzeit über unser Cookie-Banner verwalten:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Klicken Sie auf "Cookie-Einstellungen" im Footer unserer Website</li>
          <li>Wählen Sie, welche Cookie-Kategorien Sie akzeptieren möchten</li>
          <li>Speichern Sie Ihre Einstellungen</li>
        </ul>

        <h3 className="text-lg font-semibold mt-4 mb-2">5.2 Browser-Einstellungen</h3>
        <p>
          Die meisten Webbrowser erlauben es Ihnen, Cookies über die Browser-Einstellungen zu
          verwalten. So können Sie:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Cookies blockieren</li>
          <li>Bestehende Cookies löschen</li>
          <li>Benachrichtigungen erhalten, wenn Cookies gesetzt werden</li>
        </ul>

        <h3 className="text-lg font-semibold mt-4 mb-2">5.3 Anleitung für gängige Browser</h3>
        <div className="space-y-4">
          <div className="bg-neutral-50 p-4 rounded-lg">
            <p className="font-semibold mb-2">Google Chrome:</p>
            <p className="text-sm">
              Einstellungen → Datenschutz und Sicherheit → Cookies und andere Website-Daten<br />
              <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                Detaillierte Anleitung
              </a>
            </p>
          </div>

          <div className="bg-neutral-50 p-4 rounded-lg">
            <p className="font-semibold mb-2">Mozilla Firefox:</p>
            <p className="text-sm">
              Einstellungen → Datenschutz & Sicherheit → Cookies und Website-Daten<br />
              <a href="https://support.mozilla.org/de/kb/cookies-erlauben-und-ablehnen" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                Detaillierte Anleitung
              </a>
            </p>
          </div>

          <div className="bg-neutral-50 p-4 rounded-lg">
            <p className="font-semibold mb-2">Safari:</p>
            <p className="text-sm">
              Einstellungen → Datenschutz → Cookies blockieren<br />
              <a href="https://support.apple.com/de-de/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                Detaillierte Anleitung
              </a>
            </p>
          </div>

          <div className="bg-neutral-50 p-4 rounded-lg">
            <p className="font-semibold mb-2">Microsoft Edge:</p>
            <p className="text-sm">
              Einstellungen → Cookies und Websiteberechtigungen → Cookies und Websitedaten<br />
              <a href="https://support.microsoft.com/de-de/microsoft-edge/cookies-in-microsoft-edge-l%C3%B6schen-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                Detaillierte Anleitung
              </a>
            </p>
          </div>
        </div>

        <h3 className="text-lg font-semibold mt-6 mb-2">5.4 Auswirkungen der Cookie-Deaktivierung</h3>
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <p className="font-semibold mb-2">Wichtiger Hinweis:</p>
          <p className="text-sm">
            Wenn Sie Cookies deaktivieren, können einige Funktionen unserer Website nicht mehr
            ordnungsgemäß funktionieren, insbesondere:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-sm mt-2">
            <li>Der Buchungsprozess funktioniert möglicherweise nicht</li>
            <li>Ihre Spracheinstellung wird nicht gespeichert</li>
            <li>Der Warenkorb wird nicht über Seiten hinweg beibehalten</li>
            <li>Die Website-Sicherheit kann beeinträchtigt werden</li>
          </ul>
        </div>
      </LegalSection>

      <LegalSection id="einwilligung" title="6. Ihre Einwilligung">
        <h3 className="text-lg font-semibold mt-4 mb-2">6.1 Cookie-Banner</h3>
        <p>
          Beim ersten Besuch unserer Website werden Sie über die Verwendung von Cookies informiert
          und um Ihre Einwilligung gebeten. Sie können wählen:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Alle akzeptieren:</strong> Alle Cookies werden aktiviert</li>
          <li><strong>Nur erforderliche:</strong> Nur technisch notwendige Cookies werden gesetzt</li>
          <li><strong>Einstellungen:</strong> Individuelle Cookie-Auswahl</li>
        </ul>

        <h3 className="text-lg font-semibold mt-4 mb-2">6.2 Widerruf der Einwilligung</h3>
        <p>
          Sie können Ihre Einwilligung jederzeit widerrufen:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Über die Cookie-Einstellungen im Footer</li>
          <li>Durch Löschen der Cookies in Ihrem Browser</li>
          <li>Durch Kontaktaufnahme mit uns per E-Mail</li>
        </ul>
        <p className="mt-2">
          Der Widerruf der Einwilligung berührt nicht die Rechtmäßigkeit der aufgrund der Einwilligung
          bis zum Widerruf erfolgten Verarbeitung.
        </p>

        <h3 className="text-lg font-semibold mt-4 mb-2">6.3 Speicherung der Einwilligung</h3>
        <p>
          Ihre Cookie-Einwilligung wird für <strong>12 Monate</strong> gespeichert. Nach Ablauf
          dieser Frist werden Sie erneut um Ihre Einwilligung gebeten.
        </p>
      </LegalSection>

      <LegalSection id="aktualisierung" title="7. Aktualisierung dieser Richtlinie">
        <p>
          Wir können diese Cookie-Richtlinie von Zeit zu Zeit aktualisieren, um Änderungen in
          unserer Praxis oder aus rechtlichen, betrieblichen oder regulatorischen Gründen zu
          berücksichtigen.
        </p>

        <h3 className="text-lg font-semibold mt-4 mb-2">7.1 Benachrichtigung über Änderungen</h3>
        <p>
          Bei wesentlichen Änderungen werden wir Sie durch ein aktualisiertes Cookie-Banner
          oder eine E-Mail (falls Sie uns Ihre E-Mail-Adresse zur Verfügung gestellt haben)
          informieren.
        </p>

        <h3 className="text-lg font-semibold mt-4 mb-2">7.2 Regelmäßige Überprüfung</h3>
        <p>
          Wir empfehlen Ihnen, diese Cookie-Richtlinie regelmäßig zu überprüfen, um über unsere
          Verwendung von Cookies informiert zu bleiben.
        </p>
      </LegalSection>

      <div className="mt-8 space-y-4">
        <div className="p-4 bg-neutral-100 rounded-lg">
          <h3 className="font-semibold text-neutral-900 mb-2">Fragen zu Cookies?</h3>
          <p className="text-sm text-neutral-700">
            Bei Fragen zu unserer Verwendung von Cookies kontaktieren Sie uns:
          </p>
          <p className="text-sm text-neutral-700 mt-2">
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

        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-neutral-700">
            <strong>Weitere Informationen:</strong> Ausführliche Informationen zum Datenschutz
            finden Sie in unserer
            <a href="/privacy" className="text-blue-600 hover:underline ml-1">Datenschutzerklärung</a>.
          </p>
        </div>
      </div>
    </LegalPage>
  );
}
