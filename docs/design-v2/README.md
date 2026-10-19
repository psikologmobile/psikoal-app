# PsikoAl · Geliştirici teslimi

| Dosya | Ne için |
|---|---|
| `tokens.css` | Web (Next.js vb.): semantik CSS değişkenleri, açık/koyu tema (`[data-theme]` + `prefers-color-scheme`), tipografi, köşe, boşluk, hareket |
| `tailwind.preset.js` | Tailwind preset: renkler CSS değişkenlerine bağlı, fontlar, köşeler, keyframe + animation |
| `theme.ts` | React Native / Expo: `themes.light/dark`, fontlar (expo-google-fonts), ölçüler, Reanimated hareket değerleri |
| `components.md` | Bileşen listesi: varyant, durum, token, kullanıldığı ekranlar |
| `animations.md` | Animasyon kullanım listesi: tetik, süre, eğri, yer; RN karşılıkları |
| `screens.md` | Ekran envanteri: canvas dosyası ve tweak durumları |

## Hızlı kurulum

**Web:** `tokens.css` dosyasını global stile ekle, `tailwind.config.js` içinde `presets: [require('./tailwind.preset')]`. Koyu tema için `<html data-theme="dark">`.

**Expo:** `npx expo install @expo-google-fonts/bricolage-grotesque @expo-google-fonts/figtree react-native-reanimated`, sonra `useColorScheme()` ile `themes[scheme]`.

## Kurallar

- Gölge ve gradyan yok; ayrım 1,5 px çizgi ve zemin tonuyla yapılır.
- Renk oranı: ~%80 zinc, ~%20 sky. Ana eylem `primary` (sky-500), üstündeki yazı `on-primary` (sky-950).
- Kırmızı (`danger*`) yalnız hata ve geri alınamaz işlemler için. Hata kutularına `role="alert"` ekle.
- Dokunma alanı en az 44 px. Azaltılmış hareket açıksa tüm döngü ve girişleri kapat.
- `[KDV ORANI]`, `[TARİH]`, `[N]` gibi köşeli parantezli yerler ve hukuk metinleri yer tutucudur, gerçek içerikle değiştirilmeli.
