# Integrazione Stripe

Questo starter kit include un'integrazione Stripe pronta all'uso per due modalità di pagamento,
entrambe basate su **Stripe Checkout** (pagina di pagamento ospitata da Stripe — nessun form di
carta da costruire a mano):

- **Pagamenti singoli** (`mode: "payment"`) — es. acquisto una tantum di un pacchetto/servizio.
- **Abbonamenti** (`mode: "subscription"`) — fatturazione ricorrente mensile/annuale.

Lo stato di pagamenti e abbonamenti viene sincronizzato via **webhook**, non fidandosi mai del
solo redirect del browser dopo il checkout.

## 1. Crea un account Stripe e resta in modalità Test

Vai su https://dashboard.stripe.com/register. Lavora sempre in **Test mode** (toggle in alto a
destra nella dashboard) finché non sei pronto per andare in produzione.

## 2. Recupera la Secret Key

Dashboard → Developers → API keys → copia la **Secret key** (`sk_test_...`) in `.env`:

```
STRIPE_SECRET_KEY="sk_test_..."
```

## 3. Crea i prodotti e i prezzi di test

Dashboard → Product catalog → Add product. Crea:

- 2 prodotti "one-time" (es. "Pacchetto Base", "Pacchetto Pro") con un prezzo **one-time**.
- 2 prezzi **recurring** per un prodotto "abbonamento" (es. mensile e annuale).

Copia i **Price ID** (`price_...`, non il Product ID) in `.env`:

```
STRIPE_PRICE_ONE_TIME_BASIC="price_..."
STRIPE_PRICE_ONE_TIME_PRO="price_..."
STRIPE_PRICE_SUB_MONTHLY="price_..."
STRIPE_PRICE_SUB_YEARLY="price_..."
```

In alternativa, con la Stripe CLI:

```bash
stripe products create --name="Pacchetto Base"
stripe prices create --product=prod_xxx --unit-amount=1900 --currency=eur
```

## 4. Configura il webhook in locale

Installa la [Stripe CLI](https://docs.stripe.com/stripe-cli), poi:

```bash
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

La CLI stampa un valore `whsec_...`: mettilo in `.env` come `STRIPE_WEBHOOK_SECRET`. Questo
valore cambia ogni volta che riavvii `stripe listen` in locale — è normale.

## 5. Configura il webhook in produzione

Dashboard → Developers → Webhooks → Add endpoint:

- URL: `https://<tuo-dominio>/api/webhooks/stripe`
- Eventi da ascoltare:
  - `checkout.session.completed`
  - `payment_intent.payment_failed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`

Copia il **Signing secret** dell'endpoint creato in `STRIPE_WEBHOOK_SECRET` (variabile
d'ambiente di produzione).

## 6. Testa un pagamento

Usa una carta di test Stripe, es. `4242 4242 4242 4242`, qualsiasi data futura, qualsiasi CVC:
https://docs.stripe.com/testing#cards

## Struttura del codice

| File | Ruolo |
|---|---|
| `src/server/stripe/client.ts` | Istanza singleton dell'SDK Stripe |
| `src/server/stripe/catalog.ts` | Mappa `productKey`/`planKey` → Price ID (mai fidarsi di prezzi lato client) |
| `src/app/api/webhooks/stripe/route.ts` | Verifica firma + aggiorna DB (fonte di verità) |
| `src/server/api/routers/checkout.ts` | Router tRPC per creare Checkout Session e Billing Portal |
| `src/server/db/schema.ts` | Tabelle `stripeCustomer`, `payment`, `subscription` |

Dopo aver aggiunto/modificato le tabelle, applica lo schema al DB SQLite locale:

```bash
pnpm db:push
```

## Perché Checkout hosted e non Stripe Elements?

Per uno starter kit, Stripe Checkout è la via più rapida e sicura: Stripe ospita il form di
pagamento (PCI compliance a carico loro, supporto automatico a wallet come Apple/Google Pay,
3D Secure gestito automaticamente). Se in futuro serve un form di pagamento completamente
custom nel tuo dominio, valuta **Stripe Elements** — richiede più codice lato client e la
gestione manuale del `PaymentIntent`/`SetupIntent`.
