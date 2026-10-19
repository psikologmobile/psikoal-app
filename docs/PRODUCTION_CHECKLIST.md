# Production'a Geçiş Kontrol Listesi

> Store'a çıkmadan önce uygulamada kalan işler. Kodla kapatılan maddeler `[x]`,
> sahibinin (kimlik, içerik, hesap) kararı/girdisi gerekenler `[ ]`.
> Kaynak dal: `fix/APP-1-yayin-temizligi`.

## Mock ve geliştirici yüzeyi

- [x] `src/lib/api.ts` mock bloğu silindi; `axios-mock-adapter` pakete girmiyor (yalnız birim testlerinde devDependency).
- [x] Repo içi `mock-db/` klasörü silindi (hiçbir test/CI adımı import etmiyordu). Blog davranış referansı gerekirse: `git log -- mock-db` ile son sürümü bulup `git show <commit>:mock-db/handlers/blog.handlers.js`.
- [x] `EXPO_PUBLIC_APP_ENV` enum'unda `mock` yok; değişken verilmezse **`production`** kabul edilir (fail-safe).
- [x] Giriş ekranındaki "Test Girişi" paneli ve sabit kimlik bilgileri (`password123`, demo e-postaları) tamamen silindi.

## Ortam değişkenleri (`.env` / EAS)

Şema: `src/lib/env.ts` (Zod, açılışta doğrulanır; eksik/yanlışsa uygulama açılmaz).

- [ ] `EXPO_PUBLIC_API_URL` — gerçek API adresi (HTTPS).
- [ ] `EXPO_PUBLIC_APP_ENV=production`.
- [ ] `EXPO_PUBLIC_SUPPORT_EMAIL` — Ayarlar → "Destek, Talep ve Öneri" bu adrese e-posta açar.
- [ ] `EXPO_PUBLIC_PRIVACY_URL`, `EXPO_PUBLIC_TERMS_URL`, `EXPO_PUBLIC_KVKK_URL` — yayınlanmış yasal metinler (production'da **https zorunlu**). Kayıt ekranındaki onay kutuları ve Ayarlar → Veri ve Gizlilik bu sayfaları açar.
- [ ] `EXPO_PUBLIC_STORE_URL` (opsiyonel) — mağaza sayfası; uygulama içi değerlendirme penceresi açılamazsa kullanılır.
- [x] `EXPO_PUBLIC_APP_VERSION` kaldırıldı; Ayarlar'daki sürüm `expo-application` (native sürüm) / `app.json` `version`'dan okunur.

## Uygulama kimliği ve görseller (sahibi karar verecek)

- [ ] `app.json` → `android.package`, `ios.bundleIdentifier`, `owner`, `extra.eas.projectId`; `eas.json` (bu dalda bilinçli olarak dokunulmadı).
- [ ] Gerçek logo: şu an `src/core/components/atoms/BrandMark` "PsikoAl" metin işareti çiziyor; logo gelince yalnız bu dosya değişir.
- [ ] Uygulama ikonu, adaptive icon ve splash görselleri (`assets/`) — yer tutucu.
- [x] Instagram kaynaklı `logo-placeholder*.png` görselleri silindi.

## Güvenlik ve oturum

- [x] Access/refresh token `expo-secure-store`'da; eski AsyncStorage anahtarları ilk açılışta taşınıp siliniyor.
- [x] Android `allowBackup: false`; `READ/WRITE_EXTERNAL_STORAGE` ve `SYSTEM_ALERT_WINDOW` engelli (galeri seçici izin istemiyor, kamera/mikrofon izni kapalı).
- [x] Zorunlu oturum düşmesinde önbellek (`queryClient.clear()`) temizleniyor; çıkış/dondurma/silme öncesi push token backend'den siliniyor.
- [x] Kök `ErrorBoundary` (Türkçe hata ekranı + "Tekrar Dene").
- [x] Açılışta `GET /auth/me` ile kullanıcı tazeleniyor.

## KVKK ve hesap

- [x] Kayıtta iki ayrı zorunlu onay: Kullanım Koşulları + Gizlilik Politikası ve sağlık verisi açık rızası (`termsAccepted`, `healthDataConsent`).
- [x] Şifre sıfırlama: `psikoal://reset-password#access_token=...` → `(auth)/reset-password` → `POST /auth/reset-password`.
- [ ] Supabase `Auth:PasswordResetRedirectUrl` production'da `psikoal://reset-password` olmalı ve GoTrue "Redirect URLs" listesine eklenmeli (backend/panel ayarı).
- [x] Hesap dondurma / silme gerçek uçlara bağlı (`POST /auth/freeze`, `DELETE /auth/me`).

## Akışlar

- [x] Eski danışan ödeme modeli (cüzdan, paketler, checkout, Iyzico) tamamen söküldü; danışandan para alınmaz.
- [x] Uzman TL bakiyesi (Revize 2, `docs/design-v2/API-REVIZE-2.md`, backend `docs/PAYMENTS.md`): ana sayfada bakiye kartı (ücretsiz hak sayısıyla), Ayarlar → Bakiyem, `/wallet` hareketleri (sayfalı, tür süzgeçli), `/wallet/invoices` faturalar (imzalı PDF adresi). Teklif ekranında ücret `/offers/quote`'tan gelir ve `expectedFeeKurus` ile geri gönderilir; 409 `OFFER_FEE_CHANGED` yeni ücreti gösterir, 422 `INSUFFICIENT_BALANCE` gönderimi kilitler. Teklif ve uygulama öne gelişi cüzdan sorgularını tazeler. (Ekranlar geçici iskelet; tasarım işi ayrı.)
- [x] **Mağaza kuralı (App Store 3.1.1 / Play ödeme politikası):** MOBİL uygulamada yükleme düğmesi, bağlantı, adres veya fiyat listesi YOK; yalnız düz metin `INSUFFICIENT_BALANCE_MESSAGE` ("Bakiye yüklemek için web sitemizi ziyaret edin."). Web kenar çubuğundaki "Bakiye yükle" yalnız web'de çizilir ve `/bakiye` (PayTR) sayfasına gider.
- [ ] **Backend:** Revize 2 dalı (`/wallet/*`, `/offers/quote`, `/listings/{id}/match`, claims, `/me/referrer`) yayına alınmalı. Canlı sözleşme testindeki cüzdan denetimleri uç yoksa (çıplak 404) kendini atlar.
- [ ] Web `/bakiye` yükleme sayfası (PayTR iFrame; `useTopupOptionsQuery` + `usePayTrInitMutation` hazır) — ekran henüz yok.
- [x] Öneriler (`/suggestions`) ve kullanılmayan `client/[id]` ekranı söküldü.
- [x] "Yakında" uyarılarının tamamı gerçek akışa bağlandı (değerlendirme, bildirim ayarları, destek, yasal metinler, profil fotoğrafı).
- [x] Profil fotoğrafı yükleme (`POST /auth/me/avatar`, JPEG/PNG/WebP ≤ 5 MB).
- [x] Hatalar Türkçe; sessiz kalan mutation'lar için global uyarı; liste ekranlarında hata ≠ boş.
- [x] Danışan teklif veren uzmanın profilini inceleyebiliyor; tamamlanan eşleşmede uzmanı değerlendirebiliyor.
- [x] Eşleşme detayı rol bazlı, telefon/e-posta dokunulabilir.
- [ ] **Backend:** eşleşme yanıtında uzmanın iletişim bilgisi (`expert.email/phone`) yok — danışan tarafında "uzman sizinle iletişime geçecek" metni gösteriliyor. İstenirse `MatchExpertDto`'ya eklenmeli; uygulama şeması hazır.
- [ ] **Backend:** test oynatma yalnız `GET /assessment/active`; birden çok test için `GET /assessment/{id}` gerekir. O zamana kadar listede yalnız aktif test görünüyor.

## Bildirimler

- [x] İzin önceden verilmişse token açılışta sessizce kaydediliyor; izin "ilk teklif anında" isteniyor (CLAUDE.md kural 7).
- [x] Push dokunuşu `{ type, entityId }` ile ilgili ekrana yönleniyor (soğuk açılış dahil).
- [ ] **Backend:** uygulama içi `NotificationDto`'da `entityId` yok; liste satırları şimdilik türün sekmesine gidiyor. Eklenince şema hazır.
- [ ] EAS `projectId` tanımlanmadan Expo push token alınamaz (kimlik maddesine bağlı).

## Kod hijyeni (regresyon kontrolü)

- [x] Frontend'de iş mantığı hesaplaması yok (sayaçlar/filtreler/sıralama/maskeler backend'den).
- [x] `console.*` çağrısı yok.
- [x] Tüm veri ekranlarında pull-to-refresh.
- [x] `npx expo export` paketinde `password123`, `mock-db`, `axios-mock-adapter`, `logo-placeholder` geçmiyor.

_Son güncelleme: 14 Ekim 2026_
