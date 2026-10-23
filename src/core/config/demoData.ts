/**
 * Demo invoice in the real KSeF FA(3) format.
 * It goes through the same parse + map pipeline as user files, so the demo can
 * never drift from what the viewer actually supports.
 */
export const DEMO_XML = `<?xml version="1.0" encoding="UTF-8"?>
<Faktura xmlns="http://crd.gov.pl/wzor/2025/06/25/13775/">
    <Naglowek>
        <KodFormularza kodSystemowy="FA (3)" wersjaSchemy="1-0E">FA</KodFormularza>
        <WariantFormularza>3</WariantFormularza>
        <DataWytworzeniaFa>2026-02-15T10:30:00Z</DataWytworzeniaFa>
        <SystemInfo>CzytajKSEF.pl</SystemInfo>
    </Naglowek>
    <Podmiot1>
        <DaneIdentyfikacyjne>
            <NIP>1234567890</NIP>
            <Nazwa>Software House Sp. z o.o.</Nazwa>
        </DaneIdentyfikacyjne>
        <Adres>
            <KodKraju>PL</KodKraju>
            <AdresL1>ul. Programistów 1 m. 2</AdresL1>
            <AdresL2>00-001 Warszawa</AdresL2>
        </Adres>
    </Podmiot1>
    <Podmiot2>
        <DaneIdentyfikacyjne>
            <NIP>9876543210</NIP>
            <Nazwa>Jan Kowalski Services</Nazwa>
        </DaneIdentyfikacyjne>
        <Adres>
            <KodKraju>PL</KodKraju>
            <AdresL1>ul. Klientów 5</AdresL1>
            <AdresL2>02-300 Wrocław</AdresL2>
        </Adres>
    </Podmiot2>
    <Fa>
        <KodWaluty>PLN</KodWaluty>
        <P_1>2026-02-15</P_1>
        <P_1M>Warszawa</P_1M>
        <P_2>FV/2026/02/001</P_2>
        <P_6>2026-02-14</P_6>
        <P_13_1>6000.00</P_13_1>
        <P_14_1>1380.00</P_14_1>
        <P_15>7380.00</P_15>
        <Adnotacje>
            <P_16>2</P_16>
            <P_17>2</P_17>
            <P_18>1</P_18>
            <P_18A>2</P_18A>
        </Adnotacje>
        <RodzajFaktury>VAT</RodzajFaktury>
        <FaWiersz>
            <NrWierszaFa>1</NrWierszaFa>
            <P_7>Usługi programistyczne</P_7>
            <P_8A>godz.</P_8A>
            <P_8B>25</P_8B>
            <P_9A>200.00</P_9A>
            <P_11>5000.00</P_11>
            <P_12>23</P_12>
        </FaWiersz>
        <FaWiersz>
            <NrWierszaFa>2</NrWierszaFa>
            <P_7>Konsultacje IT</P_7>
            <P_8A>godz.</P_8A>
            <P_8B>5</P_8B>
            <P_9A>200.00</P_9A>
            <P_11>1000.00</P_11>
            <P_12>23</P_12>
        </FaWiersz>
    </Fa>
</Faktura>`;
