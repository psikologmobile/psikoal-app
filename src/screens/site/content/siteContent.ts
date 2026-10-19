import type { SiteFaqItem } from '../components/SiteFaq'

/** Tanıtım "Merak ettiklerin" (b2_Site_Tanıtım). */
export const LANDING_FAQ: readonly SiteFaqItem[] = [
  {
    q: 'PsikoAl danışanlar için ücretli mi?',
    a: 'Hayır. İlan açmak, teklif almak ve testleri çözmek danışanlar için tamamen ücretsiz.',
  },
  {
    q: 'Uzmanlar nasıl doğrulanıyor?',
    a: 'Uzmanlar diploma, lisans ve sertifikalarını yükler; ekibimiz profili onaylamadan teklif gönderemezler.',
  },
  {
    q: 'Telefon numaramı kimler görür?',
    a: 'Yalnız ilanına teklif gönderen uzmanlar, ilan açarken verdiğin izinle görür. İlanın kapanınca yeni uzmanlar göremez.',
  },
  {
    q: 'Görüşme ücretini kime ödüyorum?',
    a: 'Seans ücretini anlaştığın uzmana doğrudan ödersin; PsikoAl seans ücretine aracılık etmez.',
  },
]

export const LANDING_STEPS = [
  {
    title: 'İlanını aç',
    text: 'İhtiyacını, bütçeni ve görüşme şeklini anlat. İstersen test sonucunu ekle.',
  },
  {
    title: 'Teklifleri karşılaştır',
    text: 'Uzmanlar ücret, yaklaşım ve notlarıyla sana gelir. Profillerini ve yorumlarını incele.',
  },
  {
    title: 'Anlaş',
    text: 'Uzmanla görüş, anlaştığında ilanını eşleşti olarak işaretle.',
  },
] as const

export const LANDING_TESTS = [
  { title: 'Kaygı ölçeği', meta: '7 soru · 3 dk' },
  { title: 'Uyku kalitesi', meta: '10 soru · 4 dk' },
  { title: 'Stres düzeyi', meta: '8 soru · 3 dk' },
  { title: 'Özgüven', meta: '12 soru · 5 dk' },
] as const

export const LANDING_TRUST = [
  {
    title: 'Lisans doğrulama',
    text: 'Her uzmanın diploması ve belgeleri ekibimizce incelenir.',
  },
  {
    title: 'İletişim yalnız izinle',
    text: 'Telefon ve e-postan yalnız ilanına teklif veren uzmanlara, senin onayınla açılır.',
  },
  {
    title: 'Gerçek yorumlar',
    text: 'Değerlendirmeleri yalnız eşleşmesi tamamlanan danışanlar yazabilir.',
  },
] as const

export const LANDING_TOPICS = [
  { name: 'Kaygı', sub: 'Endişe, panik, sınav stresi' },
  { name: 'İlişkiler', sub: 'Çift, aile, ayrılık' },
  { name: 'Depresyon', sub: 'Mutsuzluk, isteksizlik' },
  { name: 'Stres', sub: 'İş, tükenmişlik' },
  { name: 'Uyku', sub: 'Uykusuzluk, düzen' },
  { name: 'Yas', sub: 'Kayıp ve ayrılık' },
  { name: 'Özgüven', sub: 'Kendilik, sınırlar' },
  { name: 'Travma', sub: 'Zor deneyimler' },
] as const

/** Uzmanlar için "Başlarken" (b2_Site_Uzmanlar_için). */
export const EXPERT_STEPS = [
  { title: '1 · Profilini oluştur', text: 'Ünvan, alanlar, biyografi ve belgelerini ekle.' },
  {
    title: '2 · Onayı bekle',
    text: 'Ekibimiz belgelerini inceler; onaya kadar ilanları görebilirsin.',
  },
  {
    title: '3 · Hoş geldin hakkı',
    text: 'Onaylanınca ücretsiz teklif hakkı tanımlanır; ilk tekliflerin için bakiye gerekmez.',
  },
] as const

export const EXPERT_FAQ: readonly SiteFaqItem[] = [
  {
    q: 'Bakiye nasıl yüklenir?',
    a: 'Web sitemizdeki Bakiye yükle sayfasından kartla yükleyebilirsin.',
  },
  {
    q: 'Danışanın iletişim bilgilerini ne zaman görürüm?',
    a: 'Teklif gönderdiğin an danışanın adı, telefonu ve e-postası açılır.',
  },
  {
    q: 'Danışan beni seçmezse?',
    a: 'Teklif ücreti iade edilmez; danışan başka uzmanla eşleşirse bildirim alırsın.',
  },
]

/**
 * Teklif ücretinin GENEL ilkesi (müşteri kararı: belirli bir ilan için "X saat sonra
 * düşer" sözü / geri sayım YOK). Çubuk boyları yalnız eğilimi gösterir, tutar değildir.
 */
export const FEE_PRINCIPLE_BARS = [
  { height: 'h-full', tone: 'bg-primary' },
  { height: 'h-[85%]', tone: 'bg-primary' },
  { height: 'h-[70%]', tone: 'bg-accent-line' },
  { height: 'h-[55%]', tone: 'bg-accent-line' },
  { height: 'h-[42%]', tone: 'bg-accent' },
  { height: 'h-[32%]', tone: 'bg-accent' },
] as const

/** Destek sayfası SSS (b2_Site_Destek). */
export const SUPPORT_FAQ: Record<'client' | 'expert', readonly SiteFaqItem[]> = {
  client: [
    { q: 'İlan açmak ücretli mi?', a: 'Hayır, danışanlar için tamamen ücretsiz.' },
    { q: 'Aynı anda kaç ilan açabilirim?', a: 'En çok 3 açık ilanın olabilir.' },
    {
      q: 'İletişim bilgilerimi kimler görür?',
      a: 'Yalnız ilanına teklif veren uzmanlar, verdiğin izinle.',
    },
    {
      q: 'Eşleştiğimi nasıl bildiririm?',
      a: 'İlan detayında anlaştığın uzmanı seçip "Eşleş" demen yeterli.',
    },
    { q: 'Hesabımı nasıl silerim?', a: 'Ayarlar > Veri ve gizlilik > Hesabımı sil.' },
  ],
  expert: [
    {
      q: 'Teklif ücreti nasıl belirlenir?',
      a: 'İlan yeniyken ve az teklif varken yüksektir; zamanla ve teklif geldikçe düşer.',
    },
    { q: 'Bakiye nasıl yüklenir?', a: 'Web sitemizdeki Bakiye yükle sayfasından kartla.' },
    { q: 'Ücret iade edilir mi?', a: 'Harcanan teklif ücreti iade edilmez.' },
    { q: 'Profil onayı ne kadar sürer?', a: 'Belgelerin eksiksizse genelde 1–2 iş günü.' },
    { q: 'Danışan beni seçmezse?', a: 'Danışan başka uzmanla eşleşirse bildirim alırsın.' },
  ],
}
