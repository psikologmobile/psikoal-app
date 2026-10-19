# Web sitesi ve web uygulaması — Render yayını

Tanıtım sitesi (`/`, `/uzmanlar-icin`, `/blog`, `/destek`, hukuk metinleri, `/bakiye`, 404) ve
web uygulaması **tek Expo Router web derlemesi, tek alan adıdır**. Derleme statik HTML üretir
(`app.json` → `web.output: "static"`); her rota kendi `.html` dosyasıdır, arama motorları
içeriği JS çalışmadan görür.

| Ne | Nerede |
|---|---|
| Blueprint | `render.yaml` (servis `psikoal-web`, Render **Static Site**) |
| Derleme | `npm ci && npm run build:web` → `dist/` (`expo export --platform web` + `scripts/web-postexport.mjs`) |
| Site sayfaları | `src/app/(site)/*`, `src/screens/site/*` — yalnız web (mobilde uygulamaya yönlenir) |
| Kök HTML | `src/app/+html.tsx` (`lang="tr"`, meta, oturum bayrağı betiği, site animasyon CSS'i) |

## `/` adresi nasıl çalışır

- Statik `index.html` **tanıtım sayfasıdır** (oturumsuz ziyaretçi, SEO).
- Tarayıcıda kayıtlı oturum varsa (`localStorage['auth-storage']`), `+html.tsx`'teki küçük betik
  ilk boyamadan önce `<html data-session="in">` yazar ve tanıtım gizli kalır; hidrasyondan sonra
  `(tabs)` düzeni uygulama ana sayfasını çizer (`useWebLandingGate`). Oturum geçersiz çıkarsa
  bayrak kaldırılır, tanıtım görünür.
- Oturumsuz ziyaretçi uygulama adreslerine (`/offers` …) girerse girişe gider; girişten sonra
  `?returnTo=` ile geldiği site sayfasına döner (ör. `/login?returnTo=%2Fbakiye`).

## İlk kurulum (sahibi yapar)

1. **Render → New → Blueprint** → uygulama reposu (`native-atomic`), dal `master`.
   `render.yaml` `psikoal-web` statik sitesini oluşturur. (Blueprint istemezseniz: New → Static
   Site, Build Command `npm ci && npm run build:web`, Publish Directory `dist`; kuralları ve
   başlıkları `render.yaml`'dan Dashboard'a elle girin.)
2. `sync: false` değişkenlerini **Dashboard → Environment**'tan gir (geçici adres
   `https://psikoal-web.onrender.com` varsayıldı; Render'ın verdiği gerçek adresi kullan):

   | Anahtar | Değer |
   |---|---|
   | `EXPO_PUBLIC_SUPPORT_EMAIL` | Destek e-postası, ör. `destek@psikoal.com` |
   | `EXPO_PUBLIC_PRIVACY_URL` | `https://psikoal-web.onrender.com/gizlilik` |
   | `EXPO_PUBLIC_TERMS_URL` | `https://psikoal-web.onrender.com/kosullar` |
   | `EXPO_PUBLIC_KVKK_URL` | `https://psikoal-web.onrender.com/kvkk` |
   | `EXPO_PUBLIC_SITE_URL` | `https://psikoal-web.onrender.com` (kanonik adres / og:url) |
   | `EXPO_PUBLIC_APP_STORE_URL`, `EXPO_PUBLIC_PLAY_STORE_URL` | Mağaza sayfaları; yayından önce boş bırak ("Yakında") |

   `EXPO_PUBLIC_*` değerleri **derleme anında** pakete gömülür: değiştirince **Manual Deploy →
   Clear build cache & deploy** gerekir.
3. **API (`psikoal-api`) tarafı** — backend reposu `render.yaml` / `docs/DEPLOY.md`:

   | Anahtar | Değer |
   |---|---|
   | `Cors__AllowedOrigins` | `https://psikoal-web.onrender.com` (alan adı gelince virgülle ekle: `,https://psikoal.com,https://www.psikoal.com`). Boşsa tarayıcıdan API çağrısı düşer. |
   | `Site__PublicUrl` | `https://psikoal-web.onrender.com` (uzman davet linki `<site>/davet/<kod>`) |
   | `PayTR__OkUrl` | `https://psikoal-web.onrender.com/bakiye/basarili` |
   | `PayTR__FailUrl` | `https://psikoal-web.onrender.com/bakiye/hata` |

   PayTR mağaza anahtarları girilene kadar `/bakiye` "Ödeme altyapısı yakında açılacak" durumunu
   gösterir (API `PAYMENT_PROVIDER_UNAVAILABLE`).
4. Yayından sonra kontrol: `/`, `/uzmanlar-icin`, `/destek`, `/gizlilik`, `/blog`, `/bakiye`,
   bilinmeyen bir adres (404); tarayıcı konsolunda CORS hatası olmamalı.

## Alan adı alınınca

1. Render → `psikoal-web` → **Custom Domains** → `psikoal.com` ve `www.psikoal.com` ekle, DNS
   kayıtlarını alan adı panelinde tanımla (Render sertifikayı kendisi alır).
2. Web ortam değişkenlerini yeni adrese çevir (`EXPO_PUBLIC_SITE_URL`, üç hukuk adresi) ve
   önbelleği temizleyerek yeniden derle.
3. API: `Cors__AllowedOrigins`'e yeni kökenleri ekle; `Site__PublicUrl`, `PayTR__OkUrl`,
   `PayTR__FailUrl`'i yeni adrese çevir. PayTR Mağaza Paneli'ndeki adresleri de güncelle.
4. Mobil uygulamanın `.env`'indeki hukuk adreslerini yeni alan adına çevir (sonraki sürümde).

## Yönlendirme kuralları (render.yaml `routes`)

- Render statik sitelerde `/destek` → `destek.html` eşlemesini **kendiliğinden yapmaz**; her
  sabit rota için bir `rewrite` kuralı vardır. Render bir kuralı yalnız o yolda **dosya yoksa**
  uygular; kurallar sırayla, ilk eşleşen kazanır.
- Dinamik rotaların şablonları (`blog/[slug].html` …) `scripts/web-postexport.mjs` ile köşeli
  parantezsiz adlara (`blog/_slug_.html`) kopyalanır; kurallar bunlara yazar. İstemci adresten
  parametreyi okuyup sayfayı çizer.
- Son kural `/*` → `/404.html` (Render 200 döner; sayfa `noindex`).
- **Yeni rota eklenince** `render.yaml`'a kuralını ekle (yoksa adres doğrudan açılınca 404 olur;
  site içi gezinmede sorun yoktur).

## Güvenlik notları

- Web'de oturum token'ları tarayıcının `localStorage`'ındadır (`src/lib/storage.ts`;
  `expo-secure-store`'un web karşılığı yok). Başlıklar: `X-Frame-Options: SAMEORIGIN`,
  `frame-ancestors 'self'`, `nosniff`, HSTS. Tam bir CSP (script-src) react-native-web'in satır
  içi stilleri ve PayTR iframe'i ile birlikte ayrıca denenmeli.
- PayTR kart alanları PayTR'nin kendi iframe'idir (`/bakiye`); OkUrl yönlendirmesi ödemenin
  kanıtı sayılmaz — sonuç sayfası bakiyeyi birkaç kez okuyup doğrular.
