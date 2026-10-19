import { SITE_ROUTES } from '../siteRoutes'

/**
 * Hukuk metinleri — TASLAK. Hukuki inceleme yapılmadı; şirket bilgileri köşeli
 * parantezli yer tutuculardır ([ŞİRKET UNVANI] vb.) ve UYDURULMAZ. Avukat onayından
 * sonra metinler buraya işlenir ve `LEGAL_LAST_UPDATED` güncellenir.
 */
export const LEGAL_DRAFT_NOTICE = 'Taslak — hukuki inceleme bekliyor'
export const LEGAL_LAST_UPDATED = '[TARİH]'

export type LegalSlug = 'privacy' | 'terms' | 'kvkk' | 'distanceSales' | 'preInformation'

export type LegalTable = { head: readonly string[]; rows: readonly (readonly string[])[] }

export type LegalSection = {
  id: string
  title: string
  paragraphs: readonly string[]
  table?: LegalTable
}

export type LegalDocument = {
  slug: LegalSlug
  path: string
  /** Yan menüdeki ve sayfadaki başlık. */
  title: string
  description: string
  sections: readonly LegalSection[]
}

const COMPANY = '[ŞİRKET UNVANI] ([MERSİS NO]), [ADRES]'
const CONTACT = 'İletişim: [KEP ADRESİ] · [E-POSTA] · [TELEFON]'

const DATA_TABLE: LegalTable = {
  head: ['Veri', 'Amaç', 'Saklama'],
  rows: [
    ['Ad, soyad', 'Hesap ve eşleşme', '[SÜRE]'],
    ['Telefon, e-posta', 'İletişim izni kapsamında', '[SÜRE]'],
    ['Test sonuçları', 'Açık rıza ile eşleşme', '[SÜRE]'],
    ['Ödeme kayıtları (uzman)', 'Bakiye yükleme, fatura ve yasal yükümlülük', '[SÜRE]'],
  ],
}

export const LEGAL_DOCUMENTS: readonly LegalDocument[] = [
  {
    slug: 'privacy',
    path: SITE_ROUTES.privacy,
    title: 'Gizlilik Politikası',
    description:
      'PsikoAl gizlilik politikası (taslak): hangi verileri, ne amaçla ve ne kadar süre işlediğimiz.',
    sections: [
      {
        id: 'b1',
        title: 'Taraflar ve tanımlar',
        paragraphs: [
          `Bu politika, PsikoAl platformunu işleten ${COMPANY} ("PsikoAl") ile platformu kullanan danışan ve uzmanlar arasındaki kişisel veri uygulamalarını açıklar.`,
          '"Danışan" destek arayan kullanıcıyı, "Uzman" platformda onaylı profili bulunan psikolog ya da psikoterapisti ifade eder.',
        ],
      },
      {
        id: 'b2',
        title: 'Kapsam',
        paragraphs: [
          'Politika; mobil uygulama, web sitesi ve web uygulaması üzerinden toplanan verileri kapsar.',
          '[Kapsam dışı hizmetler ve üçüncü taraf bağlantıları hukuki incelemeden sonra eklenecek.]',
        ],
      },
      {
        id: 'b3',
        title: 'İşlenen veriler',
        paragraphs: [
          'Aşağıdaki tablo işlenen başlıca veri gruplarını gösterir. Saklama süreleri hukuki inceleme sonrası kesinleşecek.',
        ],
        table: DATA_TABLE,
      },
      {
        id: 'b4',
        title: 'Haklarınız',
        paragraphs: [
          '6698 sayılı KVKK md. 11 kapsamındaki haklarınızı (bilgi talebi, düzeltme, silme, itiraz vb.) aşağıdaki iletişim kanallarından kullanabilirsiniz.',
          'Hesabınızı uygulamada Ayarlar > Veri ve gizlilik bölümünden silebilirsiniz.',
        ],
      },
      { id: 'b5', title: 'İletişim', paragraphs: [CONTACT] },
    ],
  },
  {
    slug: 'terms',
    path: SITE_ROUTES.terms,
    title: 'Kullanım Koşulları',
    description:
      'PsikoAl kullanım koşulları (taslak): platformun kuralları, tarafların hak ve yükümlülükleri.',
    sections: [
      {
        id: 'b1',
        title: 'Taraflar ve tanımlar',
        paragraphs: [
          `Bu koşullar ${COMPANY} ile platform kullanıcıları arasındadır. Platformu kullanarak koşulları kabul etmiş sayılırsınız.`,
        ],
      },
      {
        id: 'b2',
        title: 'Hizmetin niteliği',
        paragraphs: [
          'PsikoAl, danışanların ilan açtığı ve onaylı uzmanların bu ilanlara teklif gönderdiği bir buluşma platformudur. PsikoAl sağlık hizmeti sunmaz, seans ücretine aracılık etmez; görüşmenin içeriği ve ücreti danışan ile uzman arasındadır.',
          'Platform acil durumlar için uygun değildir. Acil bir durumda 112 Acil Çağrı Merkezi’ni arayın.',
        ],
      },
      {
        id: 'b3',
        title: 'Uzman yükümlülükleri ve teklif ücreti',
        paragraphs: [
          'Uzman, mesleki yeterliliğini gösteren belgeleri doğru yüklemekle yükümlüdür; profil onaylanmadan teklif gönderemez.',
          'Teklif göndermek ücretlidir; ücret teklif anında bakiyeden düşülür ve iade edilmez. Ücret ilanın yeniliğine ve aldığı teklif sayısına göre değişir; tutar teklif gönderilirken gösterilir ve onaylanır.',
        ],
      },
      {
        id: 'b4',
        title: 'Danışan yükümlülükleri',
        paragraphs: [
          'Danışan ilan bilgilerini doğru verir; aynı anda en çok 3 açık ilanı olabilir. İletişim bilgileri yalnız teklif veren uzmanlarla, verdiği izin kapsamında paylaşılır.',
        ],
      },
      { id: 'b5', title: 'İletişim', paragraphs: [CONTACT] },
    ],
  },
  {
    slug: 'kvkk',
    path: SITE_ROUTES.kvkk,
    title: 'KVKK Aydınlatma Metni',
    description:
      '6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında PsikoAl aydınlatma metni (taslak).',
    sections: [
      {
        id: 'b1',
        title: 'Veri sorumlusu',
        paragraphs: [`Veri sorumlusu: ${COMPANY}. VERBİS kayıt no: [VERBİS NO].`],
      },
      {
        id: 'b2',
        title: 'İşleme amaçları ve hukuki sebepler',
        paragraphs: [
          'Kişisel verileriniz; üyelik ve hesap yönetimi, ilan ve tekliflerin iletilmesi, eşleşme, ödeme ve faturalandırma, yasal yükümlülüklerin yerine getirilmesi amaçlarıyla KVKK md. 5 ve 6’daki hukuki sebeplere dayanarak işlenir.',
          'Sağlık verisi niteliği taşıyabilecek test sonuçları yalnız açık rızanızla işlenir.',
        ],
      },
      {
        id: 'b3',
        title: 'İşlenen veriler ve aktarım',
        paragraphs: [
          'Veriler; barındırma, e-posta, anlık bildirim ve ödeme hizmet sağlayıcılarına (PayTR) hizmetin gerektirdiği ölçüde aktarılabilir. [Yurt dışı aktarım bilgisi hukuki incelemeden sonra eklenecek.]',
        ],
        table: DATA_TABLE,
      },
      {
        id: 'b4',
        title: 'Haklarınız',
        paragraphs: [
          'KVKK md. 11 uyarınca verilerinizin işlenip işlenmediğini öğrenme, düzeltilmesini veya silinmesini isteme, itiraz etme ve zararın giderilmesini talep etme haklarına sahipsiniz.',
        ],
      },
      { id: 'b5', title: 'Başvuru ve iletişim', paragraphs: [CONTACT] },
    ],
  },
  {
    slug: 'distanceSales',
    path: SITE_ROUTES.distanceSales,
    title: 'Mesafeli Satış Sözleşmesi',
    description: 'PsikoAl uzman bakiye yükleme hizmeti için mesafeli satış sözleşmesi (taslak).',
    sections: [
      {
        id: 'b1',
        title: 'Taraflar',
        paragraphs: [
          `SATICI: ${COMPANY}. Vergi dairesi / no: [VERGİ DAİRESİ] / [VERGİ NO].`,
          'ALICI: Platformda kayıtlı, bakiye yükleyen uzman (ad, soyad, e-posta ve fatura bilgileri hesap kayıtlarından alınır).',
        ],
      },
      {
        id: 'b2',
        title: 'Konu',
        paragraphs: [
          'Sözleşmenin konusu, ALICI’nın platformda teklif ücreti ödemelerinde kullanmak üzere elektronik ortamda bakiye satın almasıdır. Bakiye yalnız platform içinde kullanılır, nakde çevrilemez ve devredilemez.',
        ],
      },
      {
        id: 'b3',
        title: 'Bedel ve ödeme',
        paragraphs: [
          'Bakiye bedeli ödeme sayfasında KDV dahil olarak gösterilir ve PayTR altyapısıyla kredi/banka kartından tahsil edilir. Ödeme onaylandığında bakiye hesaba yansır; fatura [FATURA DÜZENLEME SÜRESİ] içinde düzenlenir.',
        ],
      },
      {
        id: 'b4',
        title: 'Cayma hakkı',
        paragraphs: [
          'Bakiye, elektronik ortamda anında ifa edilen bir hizmettir. [Cayma hakkının istisnası (Mesafeli Sözleşmeler Yönetmeliği md. 15) ve kullanılmamış bakiyenin iadesi koşulları hukuki incelemeden sonra yazılacak.] Teklif gönderirken harcanan bakiye iade edilmez.',
        ],
      },
      {
        id: 'b5',
        title: 'Uyuşmazlık ve iletişim',
        paragraphs: [
          'Uyuşmazlıklarda Ticaret Bakanlığınca ilan edilen parasal sınırlar dahilinde Tüketici Hakem Heyetleri ve Tüketici Mahkemeleri yetkilidir. [Uzmanın tacir sıfatı değerlendirmesi hukuki incelemede netleşecek.]',
          CONTACT,
        ],
      },
    ],
  },
  {
    slug: 'preInformation',
    path: SITE_ROUTES.preInformation,
    title: 'Ön Bilgilendirme Formu',
    description: 'PsikoAl uzman bakiye yükleme hizmeti için ön bilgilendirme formu (taslak).',
    sections: [
      {
        id: 'b1',
        title: 'Satıcı bilgileri',
        paragraphs: [`${COMPANY}. ${CONTACT}`],
      },
      {
        id: 'b2',
        title: 'Hizmetin temel nitelikleri',
        paragraphs: [
          'Hizmet, platform içinde teklif ücreti ödemelerinde kullanılan TL bakiyesidir. Seçilen tutar ödeme sayfasında gösterilir; alt ve üst sınırlar sayfada belirtilir.',
        ],
      },
      {
        id: 'b3',
        title: 'Toplam bedel ve ödeme şekli',
        paragraphs: [
          'Ödenecek tutar KDV dahildir ve ödeme adımından önce özet olarak gösterilir. Ödeme yalnız kartla, PayTR güvenli ödeme sayfası üzerinden alınır; kart bilgileri PsikoAl tarafından saklanmaz.',
        ],
      },
      {
        id: 'b4',
        title: 'İfa ve cayma hakkı',
        paragraphs: [
          'Bakiye, ödeme onaylandıktan sonra birkaç saniye içinde hesaba yansır. [Cayma hakkı bilgisi hukuki incelemeden sonra yazılacak.]',
        ],
      },
      {
        id: 'b5',
        title: 'Şikâyet ve başvuru',
        paragraphs: [
          'Şikâyetlerinizi destek kanallarımıza iletebilirsiniz. Tüketici Hakem Heyeti ve Tüketici Mahkemelerine başvuru hakkınız saklıdır.',
          CONTACT,
        ],
      },
    ],
  },
]

export function getLegalDocument(slug: LegalSlug): LegalDocument {
  const doc = LEGAL_DOCUMENTS.find((d) => d.slug === slug)
  if (!doc) throw new Error(`Bilinmeyen hukuk metni: ${slug}`)
  return doc
}
