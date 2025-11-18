# Kodeoppgave | Askeladden Interns 2026

## Implementerte forbedringer

Jeg har implementert alle tre hovedoppgavene, samt flere ekstra forbedringere. Her er en oversikt over hva som er gjort:

### ✅ 1. Integrasjon med Statens vegvesens kjøretøy-API

**Implementert:**
- Opprettet `server/services/vegvesen.ts` som håndterer API-kall til Vegvesen
- Automatisk henting av bilinformasjon (merke, modell, årgang, farge) basert på registreringsnummer
- Robust feilhåndtering med egen `VegvesenAPIError` klasse
- Fallback-verdier ("UKJENT") hvis API-kall feiler, slik at brukeren fortsatt kan legge til bilen
- TypeScript-typer for API-respons (`types/types.ts`)

### ✅ 2. AI-genererte vedlikeholdsoppgaver med Vercel AI SDK

**Implementert:**
- Fullstendig redesign av `task_suggestions` funksjonaliteten
- Integrasjon med Vercel AI Gateway via `@ai-sdk/vercel`
- Bruker `generateObject` med Zod-schema for strukturert output
- AI-genererer relevante oppgaver basert på bilens merke, modell, årgang og registreringsnummer
- Hver oppgave inkluderer tittel, beskrivelse og tidsestimat (i minutter)
- Fallback-oppgaver hvis AI-kall feiler

### ✅ 3. Forbedret detaljeside for bil

**Alle oppgitte problemer løst:**

#### a) Validering og kontroll av oppgaver
- Implementert Zod-validering (`validators/validators.ts`) for oppgaveopprettelse
- Validering av:
  - Tittel: minimum 1 tegn, maksimum 100 tegn
  - Beskrivelse: minimum 1 tegn, maksimum 400 tegn
  - Tidsestimat: må være positivt heltall
- Forhindrer duplikate oppgaver (sjekker om oppgave med samme tittel allerede eksisterer)
- Visuell feilmelding per felt ved valideringsfeil

#### b) Funksjonelle statusknapper
- Umiddelbar visuell feedback med toast-notifikasjoner (Sonner)
- Disabled state når oppdatering pågår
- Status endres korrekt mellom "Venter", "Pågår" og "Fullført"

#### c) Bedre oversikt over oppgaver
- Oppgaver gruppert i tre seksjoner basert på status:
  - **Venter** (pending) - med antall oppgaver
  - **Pågår** (in_progress) - med animert indikator
  - **Fullført** (completed) - med visuell markering
- Hver seksjon viser antall oppgaver i parentes
- Tomme tilstander med informative meldinger
- `TaskCard` komponent for konsistent visning

#### d) Tidsestimater på oppgaver
- `estimatedTimeMinutes` felt lagt til i `tasks` tabell
- Tidsestimat kan legges til ved opprettelse av oppgaver
- Tidsestimat vises på hver oppgavekort
- AI-forslag inkluderer automatisk tidsestimat

### Ekstra forbedringer

#### Task Dashboard
- Opprettet `TaskDashboard` komponent som viser:
  - Totalt antall oppgaver
  - Total estimert tid (i minutter)
  - Gjennomsnittlig tid per oppgave
  - Visuell fremdriftsindikator (progress bar) som viser:
    - Grønn: fullførte oppgaver
    - Gul: fullførte + pågående oppgaver
    - Grå: resterende oppgaver

#### Forbedret brukeropplevelse
- Toast-notifikasjoner (Sonner) for alle brukerhandlinger:
  - Bil lagt til
  - Oppgave opprettet
  - Status oppdatert
  - Oppgave slettet
  - AI-forslag generert
- Ikoner fra Lucide React for bedre visuell kommunikasjon
- Responsive design med Tailwind CSS

#### Sortering på hovedside
- Implementert sortering av biler etter:
  - Dato lagt til (nyeste/eldste først)
  - Årstall (nyeste/eldste først)
  - Farge (alfabetisk)
  - Modell (alfabetisk)
- Visuell indikator for aktivt sorteringsfelt
- Toggle mellom stigende/synkende rekkefølge

#### Databaseforbedringer
- `estimatedTimeMinutes` lagt til i `tasks` tabell
- `timeUse` lagt til i `task_suggestions` tabell
- Foreign key constraints med `onDelete: "set null"` for suggestionId

### Miljøvariabler

For å kjøre applikasjonen trenger du følgende miljøvariabler i `.env.local`:

```sh
AI_GATEWAY_API_KEY=din_api_nøkkel_her
VEGVESEN_API_ROUTE=https://kjoretoyoppslag.atlas.vegvesen.no/ws/no/vegvesen/kjoretoy/kjoretoyoppslag/v1/kjennemerkeoppslag/kjoretoy
```
For å få AI prompts til å fungere måtte jeg pulle ned vercel env for å få VERCEL_OIDC_TOKEN. Den resetter hvert 12 time.

## Få prosjektet opp å kjøre

**Krav:**

- Node.js 18+
- npm

### 1. Installer pakker

```bash
npm install
```

### 2. Initialiser databasen

Kjør migrasjoner for å sette opp SQLite-databasen:

```bash
npm run db:push
```

### 3. Start utviklingsserver

```bash
npm run dev
```

Åpne [http://localhost:3000](http://localhost:3000) i nettleseren.

## Databasehåndtering

### Drizzle Studio

Se og administrer databasen med Drizzle Studio:

```bash
npm run db:studio
```

Åpner et GUI på [https://local.drizzle.studio](https://local.drizzle.studio) hvor du kan bla gjennom tabeller, redigere poster og inspisere skjema.

## Prosjektstruktur

- `app/` - Next.js app router sider og API-ruter
  - `page.tsx` - Hovedside med bilregister og sortering
  - `cars/[id]/page.tsx` - Detaljeside for bil med oppgaver
- `server/` - tRPC router og server-side tjenester
  - `routers/_app.ts` - tRPC router med alle endpoints
  - `services/vegvesen.ts` - Integrasjon med Vegvesen API
  - `services/ai.ts` - AI-generering av oppgaver med Vercel AI SDK
- `db/` - Databaseskjema og konfigurasjon
  - `schema.ts` - Drizzle ORM schema definisjoner
- `components/` - React-komponenter
  - `ui/TaskCard.tsx` - Gjenbrukbar komponent for oppgavevisning
  - `ui/TaskDashboard.tsx` - Dashboard med statistikk og fremdrift
  - `trpc-provider.tsx` - tRPC provider setup
- `utils/` - Hjelpefunksjoner og tRPC-oppsett på klientsiden
- `validators/` - Zod-valideringsschemas
  - `validators.ts` - Validering for registreringsnummer og oppgaver
- `types/` - TypeScript type definisjoner
  - `types.ts` - Interface for Vegvesen API respons
- `utils/errors.ts` - Custom error classes

## Teknologier

Applikasjonen er bygget på en moderne webstack som ligner det vi bruker i produksjon:

- **Next.js** 16 med App Router
- **TypeScript** for full typesikkerhet
- **tRPC** for typesikker kommunikasjon mellom frontend og backend
- **Drizzle ORM** for typesikker databasehåndtering
- **SQLite** med følgende tabeller:
  - `cars` - Informasjon om biler (registreringsnummer, merke, modell, årgang, farge)
  - `tasks` - Arbeidsoppgaver knyttet til biler (tittel, beskrivelse, status, estimert tid)
  - `task_suggestions` - AI-genererte forslag til vedlikeholdsoppgaver (inkluderer tidsestimat)
- **Tailwind CSS** for styling
- **Vercel AI SDK** (`ai`, `@ai-sdk/vercel`) for AI-genererte oppgaver
- **Zod** for runtime-validering og type-safe schemas
- **Sonner** for toast-notifikasjoner
- **Lucide React** for ikoner

