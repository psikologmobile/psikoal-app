# PsikoAl · Bileşen listesi

Token adları `tokens.css` / `theme.ts` ile aynıdır (`primary`, `accent-soft`, `danger-soft` …).
Her etkileşimli bileşen: basınca `scale(.96)` 150 ms, klavye odağında 2 px `focus` halkası, en az 44 px dokunma alanı.
Gölge ve gradyan yok; katmanlar `surface` + 1,5 px `border` ile ayrılır.

## 1. Temel

| Bileşen | Varyantlar | Durumlar | Ölçü / token | Kullanıldığı ekranlar |
|---|---|---|---|---|
| **Button** | `primary` (primary / on-primary) · `secondary` (accent / on-accent) · `outline` (border-strong / text) · `link` (link rengi, zeminsiz) · `danger` (danger-fill / on-danger) · `danger-outline` (danger çizgi + danger-soft zemin) | default · pressed · disabled (1,5 px **kesikli** border-strong, text-muted yazı, açıklayıcı etiket) · loading (spinner + "…yapılıyor") · focus | sm 44 · md 50 · lg 56 · xl 58 yükseklik; radius 14–18; yazı 15–17 / 800 | Hepsi |
| **IconButton** | outline daire · zeminsiz | default · pressed | 44×44, radius pill, border-strong | Geri, zil, kopyala, kapat |
| **TextField** | text · email · tel · number · url · password (göster/gizle) | default · focus (primary çizgi) · error (danger çizgi + alt mesaj) · disabled | h 50–56, radius 14–16, surface zemin, border-strong | Giriş, Kayıt, İlan oluştur, Teklif gönder, Ayarlar |
| **TextArea** | sayaçlı | aynı + karakter sayacı "96/300" | padding 12/14, radius 14 | İlan açıklaması, not, biyografi, yorum |
| **ReadonlyField** | kilitli | — | kesikli border, text-muted, kilit ikonu (2 kez sallanır) | Kişisel bilgiler · e-posta |
| **Select / CityPicker** | açılır liste + arama | kapalı · açık (liste aşağı doğru açılır, chevron 180°) · seçili | satır 46, hover accent-soft | Onboarding, İlan oluştur, Ayarlar |
| **Stepper** | − / + | min · max | 52×52 düğmeler, sayı display 34 | Uzman onboarding · deneyim yılı |
| **Checkbox** | — | off (border-strong) · on (primary dolgu + çizilen tik) · error (danger çizgi) | 28×28, radius 9 | Kayıt onayları, iletişim izni, sözleşmeler |
| **RadioCard** | büyük kart · liste | off · on (accent-soft zemin, accent-line çizgi, pop tik) | h 60–72, radius 18–20 | Rol seçimi, görüşme şekli, test seçimi, davet ilan seçimi |
| **SegmentedControl** | 2–3 seçenek | kayan seçili hap (300 ms) | h 40–46, radius 14 | Görüşme şekli, Aktif/Geçmiş, Görünüm, Mesleki/Belgeler, SSS sekmeleri |
| **Switch** | — | off / on (thumb 20 px kayar) | 46×26 | Web Fırsatlar · "Yalnız davetler" |
| **FilterChip** | tek seçim | off (border-strong) · on (accent / on-accent) | h 36–42, pill | İlanlarım, Fırsatlar, Tekliflerim, Bakiyem, Blog |
| **ChoiceChip** | çoklu seçim | off · on (primary dolgu + çizilen tik) | h 42–46, pill | Uzmanlık alanları |
| **StarRating** | 1–5 | boş · dolu (pop) · hover büyür | 48–52 kare, radius 14 | Eşleşme detayı · değerlendirme |
| **Avatar** | baş harf | — | 30 / 34 / 44 / 48 / 56 / 64 / 112; accent zemin | Hepsi |
| **AvatarStack** | -8 px üst üste | — | 30, 2 px bg halka | Keşfet · aktif ilan |
| **VerifiedBadge** | — | pop + çizilen tik | 16–32 px, primary daire | Uzman adları, profil |

## 2. Rozet ve durum

| Bileşen | Varyant → renk | Not |
|---|---|---|
| **StatusPill** | `live` primary + nabız noktası (Yayında, Bekleyen) · `soft` accent-soft (Onay bekliyor, Gönderildi) · `matched` accent (Eşleşti, Seçildi) · `neutral` kesikli/outline text-muted (Süresi doldu, Kapandı, Geri çekildi) · `danger` danger-soft + danger çizgi (Reddedildi) | 12 px / 700–800, pill, padding 5×10 |
| **CountBadge** | primary dolgu, 2 px bg halka | Zil, sekme; gecikmeli pop |
| **TagChip** | bg / surface | Kart içi meta (Online, ₺ aralığı, alan) |
| **InvitedBadge** | primary dolgu "Davet" | Fırsatlar, ilan detayı |
| **ClaimBadge** | primary çizgi "Anlaştık dedi" | İlan detayı · teklif kartı |

## 3. Kart ve bloklar

| Bileşen | İçerik | Durum / not |
|---|---|---|
| **ListingCard** (uzman) | danışan baş harfi + kısaltılmış ad, yaş, başlık, özet, etiketler, bütçe, teklif sayısı + **FeeFooter** | Davet rozeti; "Teklif verdin" → "Teklifini gör"; profil onaysız → "Kilitli" |
| **FeeFooter / FeeBlock** | o anki teklif ücreti (display 22–44), sonraki düşüş (aşağı ok `bob`), kalan süre çubuğu (`drain`) | accent-soft zemin; ücret her kartta okunur |
| **AdCard** (danışan ilanı) | durum, hatırlatma rozeti, başlık, özet, etiketler, alt satır | İlanlarım |
| **OfferCard** | uzman özeti, ücret, puan, görüşme, zaman, davet/anlaştık rozeti, not, eylemler | Sıralanabilir; hiçbiri gizlenmez |
| **MatchCard** | iki avatar üst üste, karşı taraf, ilan, etiketler, durum | Hover'da avatarlar birbirine yaklaşır |
| **TestCard / ResultCard** | ad, soru, süre, Ücretsiz rozeti / seviye + 3 parçalı seviye çubuğu | Testler, Keşfet |
| **BlogCard** | düz geometrik kapak (dalgalanan çubuklar), kategori, süre, başlık, beğeni | Blog, Keşfet, site |
| **StatTile** | etiket + display rakam | Fırsatlar şeridi, Tekliflerim, Bakiyem, Kategori |
| **HeroCard** | accent zemin, dönen dekor, başlık, birincil düğme | Keşfet, Bakiyem |
| **InfoBanner** | accent-soft zemin, ikon, metin | İletişim izni bilgisi, profil incelemede |
| **ReminderBanner** | accent-soft / primary çizgi, nabızlı ikon, iki eylem | "Bir uzman anlaştığını bildirdi" |
| **ErrorBanner** | danger-soft zemin, danger çizgi, on-danger-soft yazı, `shake` | Giriş/Kayıt hataları, bağlantı hatası, bakiye yetersiz, ret gerekçesi |
| **EmptyState** | yüzen illüstrasyon + başlık + açıklama + birincil eylem | Her liste |
| **Skeleton** | border rengi bloklar, opaklık nabzı, sıralı gecikme | Her liste ve ana sayfa |
| **ContactCard** | telefon/e-posta satırları (kopyala → tik), Ara (`tel:`), E-posta (`mailto:`) | Teklif sonrası, eşleşme |
| **SuccessHero** | halka dalgası + pop daire + çizilen tik, başlık, metin | Teklif gönderildi, ilan yayınlandı, şifre güncellendi, bildirildi, ödeme |

## 4. Gezinme ve kaplama

| Bileşen | Not |
|---|---|
| **TabBar** (mobil) | Role göre 4 sekme. Danışan: Keşfet · İlanlarım · Eşleşmeler · Ayarlar. Uzman: Fırsatlar · Tekliflerim · Eşleşmeler · Ayarlar. surface zemin, border çizgi, alttan 20 px, kenarlardan 12 px, radius 24, h 72. Aktif: 48×30 primary hap + 700 etiket |
| **Sidebar** (web) | 248 px; ≤1100 px 84 px ikon rayı; ≤640 px üst yatay menü. Aktif öğe accent-soft. Uzmanda altta bakiye kartı + "Bakiye yükle" |
| **ScreenHeader** | 44 px geri daire + başlık (display 26–34) + sağda durum/eylem |
| **SiteHeader / Footer** | Logo, bağlantılar, "Giriş yap", "Web'de kullan"; ≤860 px hamburger + açılır menü |
| **BottomSheet** | scrim fade 250 ms + panel aşağıdan 380 ms, üstte tutamak, radius 30 üst köşeler |
| **Dialog** (web) | scrim + ortada kart, scale .92→1 350 ms, max 440–480 px |
| **Toast** | alttan kayar, 2,6–3 sn kalır, text zemin / bg yazı + primary nokta |
| **ProgressSegments** | 3–7 parça, her biri soldan dolar | Karşılama, Kayıt, İlan oluştur, Onboarding, Şifre (nokta) |
| **StrengthMeter** | 4 parça sıralı dolum | Kayıt, Şifre |
| **BudgetCells** | 8 sütun, seçili aralık yükselir | İlan oluştur · bütçe |
| **ScoreRing** | SVG çember, çizilerek dolar | Test sonucu |
| **LevelBar** | 3 bölge + kayan işaretçi | Test sonucu |
| **Accordion (SSS)** | + ikonu 45° döner, primary'ye boyanır, içerik aşağı açılır | Site, Destek |
| **TransactionRow / Table** | tür ikonu (+ accent-soft / − surface), açıklama, tutar (artı primary-text), sonra | Bakiyem (mobil liste, web tablo) |
| **NotificationItem** | tür ikonu (yüksek öncelik primary dolgu), başlık, metin, zaman, okunmamış nabız; okunmamış satır accent-soft | Bildirimler |
| **SettingsRow** | ikon kutusu + etiket + ipucu + chevron (hover'da 4 px kayar) | Ayarlar |
| **PayTRFrame** | kesikli kutu içinde iframe alanı; kart alanı tasarlanmaz | /bakiye |
| **Confetti** | 14 parça, primary + accent-line, düşerek döner | Eşleşti, ilan yayınlandı |
