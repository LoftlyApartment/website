import type { Metadata } from 'next';
import { LegalPage, LegalSection } from '@/components/legal/LegalPage';

export const metadata: Metadata = {
  title: 'Widerrufsbelehrung',
  description: 'Widerrufsbelehrung für Verträge mit der Loftly Apartment GmbH gemäß BGB',
};

const tableOfContents = [
  { id: 'widerrufsrecht', title: '1. Widerrufsrecht' },
  { id: 'ausübung', title: '2. Ausübung des Widerrufsrechts' },
  { id: 'folgen', title: '3. Folgen des Widerrufs' },
  { id: 'ausschluss', title: '4. Ausschluss und Erlöschen des Widerrufsrechts' },
  { id: 'muster', title: '5. Muster-Widerrufsformular' },
];

export default function CancellationPage() {
  return (
    <LegalPage
      title="Widerrufsbelehrung"
      lastUpdated="30. Oktober 2025"
      tableOfContents={tableOfContents}
    >
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-neutral-700">
          <strong>Wichtiger Hinweis:</strong> Diese Widerrufsbelehrung gilt für Verbraucher im Sinne
          des § 13 BGB bei Abschluss von Fernabsatzverträgen (Buchungen über unsere Website).
        </p>
      </div>

      <LegalSection id="widerrufsrecht" title="1. Widerrufsrecht">
        <h3 className="text-lg font-semibold mt-4 mb-2">Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen.</h3>

        <p>
          Die Widerrufsfrist beträgt <strong>vierzehn Tage</strong> ab dem Tag des Vertragsabschlusses
          (Erhalt der Buchungsbestätigung).
        </p>

        <p>
          Um Ihr Widerrufsrecht auszuüben, müssen Sie uns:
        </p>
        <p>
          <strong>Loftly Apartment GmbH</strong><br />
          Lübecker Straße 49<br />
          10559 Berlin<br />
          Deutschland<br />
          E-Mail: info@loftlyapartment.de<br />
          Telefon: +49 163 3595589
        </p>
        <p>
          mittels einer eindeutigen Erklärung (z.B. ein mit der Post versandter Brief oder E-Mail)
          über Ihren Entschluss, diesen Vertrag zu widerrufen, informieren.
        </p>
        <p>
          Sie können dafür das beigefügte Muster-Widerrufsformular verwenden, das jedoch nicht
          vorgeschrieben ist.
        </p>

        <h3 className="text-lg font-semibold mt-6 mb-2">Widerrufsfrist</h3>
        <p>
          Zur Wahrung der Widerrufsfrist reicht es aus, dass Sie die Mitteilung über die Ausübung
          des Widerrufsrechts vor Ablauf der Widerrufsfrist absenden.
        </p>
      </LegalSection>

      <LegalSection id="ausübung" title="2. Ausübung des Widerrufsrechts">
        <h3 className="text-lg font-semibold mt-4 mb-2">2.1 Form des Widerrufs</h3>
        <p>
          Der Widerruf kann erfolgen durch:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>E-Mail:</strong> info@loftlyapartment.de (bevorzugt)</li>
          <li><strong>Brief:</strong> Loftly Apartment GmbH, Lübecker Straße 49, 10559 Berlin</li>
          <li><strong>Verwendung des Muster-Widerrufsformulars</strong> (siehe unten)</li>
        </ul>

        <h3 className="text-lg font-semibold mt-4 mb-2">2.2 Erforderliche Angaben</h3>
        <p>
          Ihr Widerruf sollte folgende Informationen enthalten:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Name und Anschrift des Widerrufenden</li>
          <li>Buchungsnummer</li>
          <li>Datum der Buchung</li>
          <li>Eindeutige Erklärung über den Widerruf</li>
          <li>Datum und Unterschrift (bei Brief)</li>
        </ul>

        <h3 className="text-lg font-semibold mt-4 mb-2">2.3 Bestätigung des Widerrufs</h3>
        <p>
          Wenn Sie diesen Vertrag widerrufen, werden wir Ihnen unverzüglich (spätestens binnen
          vierzehn Tagen) eine Bestätigung über den Eingang des Widerrufs per E-Mail übermitteln.
        </p>
      </LegalSection>

      <LegalSection id="folgen" title="3. Folgen des Widerrufs">
        <h3 className="text-lg font-semibold mt-4 mb-2">3.1 Rückzahlung</h3>
        <p>
          Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von Ihnen
          erhalten haben, unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag zurückzuzahlen,
          an dem die Mitteilung über Ihren Widerruf dieses Vertrags bei uns eingegangen ist.
        </p>

        <h3 className="text-lg font-semibold mt-4 mb-2">3.2 Zahlungsweg</h3>
        <p>
          Für diese Rückzahlung verwenden wir dasselbe Zahlungsmittel, das Sie bei der ursprünglichen
          Transaktion eingesetzt haben, es sei denn, mit Ihnen wurde ausdrücklich etwas anderes
          vereinbart.
        </p>
        <p>
          In keinem Fall werden Ihnen wegen dieser Rückzahlung Entgelte berechnet.
        </p>

        <h3 className="text-lg font-semibold mt-4 mb-2">3.3 Rückerstattungsbetrag</h3>
        <p>
          Bei fristgerechtem Widerruf erhalten Sie zurück:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Den vollständigen Übernachtungspreis</li>
          <li>Die Reinigungsgebühr</li>
          <li>Die Kaution wird vollständig freigegeben</li>
          <li>Ggf. gezahlte Haustiergebühren</li>
        </ul>

        <h3 className="text-lg font-semibold mt-4 mb-2">3.4 Bearbeitungszeit</h3>
        <p>
          Die Rückerstattung erfolgt in der Regel innerhalb von 5-10 Werktagen nach Eingang Ihres
          Widerrufs. Die tatsächliche Gutschrift auf Ihrem Konto kann je nach Bank einige Tage
          in Anspruch nehmen.
        </p>
      </LegalSection>

      <LegalSection id="ausschluss" title="4. Ausschluss und Erlöschen des Widerrufsrechts">
        <p>
          Das Widerrufsrecht besteht nicht bzw. erlischt in folgenden Fällen:
        </p>

        <h3 className="text-lg font-semibold mt-4 mb-2">4.1 Erbrachte Dienstleistungen</h3>
        <p>
          Das Widerrufsrecht erlischt bei einem Vertrag über die Erbringung von Dienstleistungen,
          wenn der Unternehmer die Dienstleistung vollständig erbracht hat und mit der Ausführung
          der Dienstleistung erst begonnen hat, nachdem der Verbraucher dazu seine ausdrückliche
          Zustimmung gegeben hat und gleichzeitig seine Kenntnis davon bestätigt hat, dass er sein
          Widerrufsrecht bei vollständiger Vertragserfüllung durch den Unternehmer verliert.
        </p>

        <h3 className="text-lg font-semibold mt-4 mb-2">4.2 Beherbergungsverträge</h3>
        <p>
          Das Widerrufsrecht besteht nicht bei Verträgen:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>zur Erbringung von Dienstleistungen in den Bereichen Beherbergung zu anderen Zwecken
              als zu Wohnzwecken, wenn der Unternehmer sich bei Vertragsschluss verpflichtet, die
              Dienstleistungen zu einem bestimmten Zeitpunkt oder innerhalb eines genau angegebenen
              Zeitraums zu erbringen (§ 312g Abs. 2 Nr. 9 BGB)</li>
        </ul>

        <h3 className="text-lg font-semibold mt-4 mb-2">4.3 Praktische Bedeutung</h3>
        <p className="font-semibold">
          Wichtig: Für Buchungen mit einem Anreisedatum innerhalb von 14 Tagen nach Buchung besteht
          kein Widerrufsrecht, da die Leistung zu einem bestimmten Zeitpunkt erbracht werden soll.
        </p>
        <p>
          In diesen Fällen gelten stattdessen unsere
          <a href="/terms" className="text-blue-600 hover:underline ml-1">Stornierungsbedingungen</a>.
        </p>

        <h3 className="text-lg font-semibold mt-4 mb-2">4.4 Unterschied: Widerruf vs. Stornierung</h3>
        <div className="bg-neutral-100 p-4 rounded-lg">
          <p className="font-semibold mb-2">Widerrufsrecht (14 Tage):</p>
          <ul className="list-disc pl-6 space-y-1 mb-4">
            <li>Gilt nur, wenn Check-in mehr als 14 Tage nach Buchung liegt</li>
            <li>Kostenlose Stornierung innerhalb von 14 Tagen nach Buchung</li>
            <li>Gesetzliches Recht für Verbraucher</li>
          </ul>

          <p className="font-semibold mb-2">Stornierungsbedingungen:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Gelten für alle Buchungen</li>
            <li>Bis 14 Tage vor Check-in: kostenlos</li>
            <li>7-14 Tage vor Check-in: 50% Gebühr</li>
            <li>Weniger als 7 Tage: keine Rückerstattung</li>
          </ul>
        </div>
      </LegalSection>

      <LegalSection id="muster" title="5. Muster-Widerrufsformular">
        <div className="bg-neutral-50 border-2 border-neutral-300 p-6 rounded-lg">
          <p className="font-semibold mb-4 text-center">MUSTER-WIDERRUFSFORMULAR</p>
          <p className="text-sm mb-4 italic">
            (Wenn Sie den Vertrag widerrufen wollen, dann füllen Sie bitte dieses Formular aus
            und senden Sie es zurück.)
          </p>

          <div className="space-y-4">
            <p>An:</p>
            <p className="pl-4">
              <strong>Loftly Apartment GmbH</strong><br />
              Lübecker Straße 49<br />
              10559 Berlin<br />
              Deutschland<br />
              E-Mail: info@loftlyapartment.de
            </p>

            <p className="pt-4">
              Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag über
              die Erbringung der folgenden Dienstleistung:
            </p>

            <div className="pl-4 space-y-2">
              <p>Buchungsnummer: _______________________</p>
              <p>Gebuchtes Apartment: _______________________</p>
              <p>Check-in-Datum: _______________________</p>
              <p>Check-out-Datum: _______________________</p>
              <p>Buchungsdatum: _______________________</p>
            </div>

            <div className="pt-4 space-y-2">
              <p>Name des Verbrauchers: _______________________</p>
              <p>Anschrift des Verbrauchers: _______________________</p>
              <p>_______________________</p>
              <p>E-Mail: _______________________</p>
              <p>Telefon: _______________________</p>
            </div>

            <div className="pt-6 space-y-2">
              <p>Datum: _______________________</p>
              <p>Unterschrift (nur bei Mitteilung auf Papier): _______________________</p>
            </div>

            <p className="pt-6 text-sm italic">
              (*) Unzutreffendes streichen.
            </p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-neutral-700">
            <strong>Hinweis:</strong> Sie können dieses Formular ausdrucken und per Post senden
            oder die Informationen per E-Mail an info@loftlyapartment.de übermitteln.
          </p>
        </div>
      </LegalSection>

      <div className="mt-8 space-y-4">
        <div className="p-4 bg-neutral-100 rounded-lg">
          <h3 className="font-semibold text-neutral-900 mb-2">Fragen zum Widerrufsrecht?</h3>
          <p className="text-sm text-neutral-700">
            Bei Fragen zum Widerrufsrecht oder zur Stornierung Ihrer Buchung kontaktieren Sie uns:
          </p>
          <p className="text-sm text-neutral-700 mt-2">
            <strong>E-Mail:</strong> info@loftlyapartment.de<br />
            <strong>Telefon:</strong> +49 163 3595589<br />
            <strong>Erreichbarkeit:</strong> Mo-Fr 9:00-18:00 Uhr
          </p>
        </div>

        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-sm text-neutral-700">
            <strong>Rechtlicher Hinweis:</strong> Diese Widerrufsbelehrung wurde nach bestem Wissen
            und Gewissen erstellt und entspricht den gesetzlichen Anforderungen zum Zeitpunkt der
            Erstellung. Wir empfehlen, bei rechtlichen Fragen einen Anwalt zu konsultieren.
          </p>
        </div>
      </div>
    </LegalPage>
  );
}
