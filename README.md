# CS Lexicon — Bilgisayar Mühendisliği Akademik İngilizce

Her açılışta bilgisayar mühendisliği makalelerinde, tezlerinde ve teknik dokümantasyonlarda sık geçen akademik bir İngilizce kelimeyi, örnek akademik cümle içinde vurgulanmış olarak ve hemen altında Türkçe karşılığı + cümle çevirisiyle gösteren uygulama.

**macOS**, **Windows** ve **Web (PWA)** uyumludur; kurulduktan sonra tamamen **çevrimdışı** çalışır.

---

## İndirme ve Kurulum (Mac & Windows)

### Yöntem 1: Masaüstü Uygulaması Olarak Kur (Önerilen)

Sağ taraftaki **Releases** bölümünden bilgisayarınıza uygun dosyayı indirin:

| İşletim Sistemi | İndirilecek Dosya |
| --- | --- |
| **macOS (M1 / M2 / M3 / M4 — Apple Silicon)** | `CS-Lexicon-*-mac-arm64.dmg` |
| **macOS (Intel)** | `CS-Lexicon-*-mac-x64.dmg` |
| **Windows (Kurulum Sihirbazı)** | `CS-Lexicon-Setup-*-win-x64.exe` |
| **Windows (Kurulumsuz / Taşınabilir)** | `CS-Lexicon-Portable-*-win-x64.exe` |

> **İlk Açılış Güvenlik Uyarısı Hakkında:**
> Uygulama açık kaynak ve imzasız olduğu için işletim sisteminiz ilk seferde uyarı gösterebilir:
> - **macOS:** Uygulamayı *Applications* klasörüne sürükledikten sonra sağ tıklayıp **Aç** deyin (veya *Sistem Ayarları → Gizlilik ve Güvenlik → Yine de Aç*).
> - **Windows:** SmartScreen penceresinde **Ek bilgi → Yine de çalıştır** seçeneğine tıklayın.

### Yöntem 2: Tarayıcıdan Tek Tıkla Yükle (PWA — Güvenlik Uyarısız)

GitHub Pages bağlantısını Chrome, Edge veya Safari ile açın:
- **Chrome / Edge (Mac & Windows):** Sağ üstteki **Yükle** düğmesine (veya adres çubuğundaki yükleme simgesine) tıklayın; uygulama Masaüstü / Dock'a eklenir ve çevrimdışı çalışır.
- **Safari (macOS):** *Dosya → Dock'a Ekle* seçeneğini kullanın.

---

## Özellikler

- **Her Açılışta Yeni Kelime:** Gördüğünüz kelimeleri hatırlar, aynı kelimeyi tekrar etmeden sıradaki yeni kelimeyi getirir ve öğrenilmemiş kelimelere öncelik verir.
- **60 Akademik CS Terimi:** Algoritmalar, Sistem & Mimari, Yapay Zeka & ML, Dağıtık Sistemler, Ağ & Sistemler, Yazılım Mühendisliği, Kuram, Güvenlik & Veri ve Akademik Yazım alanlarında.
- **Cümle İçi Vurgulama + Türkçe Çeviri:** Kelime akademik cümle içinde vurgulanır; altında kelimenin Türkçe karşılığı ve cümlenin Türkçe çevirisi yer alır.
- **Sesli Telaffuz:** Hem kelimeyi hem de örnek cümleyi İngilizce olarak seslendirir (`S`).
- **Kendini Test Et Modu:** İsteğe bağlı olarak Türkçe bölümü bulanıklaştırıp (`H`) kendinizi deneyebilirsiniz.
- **Kişisel Kelime Ekleme & İlerleme Takibi:** Kendi kelimelerinizi ekleyebilir, *Öğrendim* (`L`) ve *Kaydet* (`B`) ile takip edebilirsiniz.
- **Açık / Koyu Tema:** Sistem temasını otomatik algılar.

## Klavye Kısayolları

| Tuş | İşlev |
| --- | --- |
| `Space` / `→` | Yeni kelime |
| `←` | Önceki kelime |
| `S` | Kelimeyi seslendir |
| `H` | Türkçeyi gizle / göster |
| `L` | Öğrendim olarak işaretle |
| `B` | Kaydet (favoriler) |

---

## Geliştiriciler İçin

```bash
npm install
npm start          # Masaüstü uygulamasını yerel olarak çalıştırır
npm run build:mac  # macOS (.dmg) paketi üretir
npm run build:win  # Windows (.exe) paketleri üretir
```

### Yeni Sürüm Yayınlama (Otomatik Mac + Windows Derleme)

```bash
git tag v1.0.0
git push origin v1.0.0
```

Bu etiket gönderildiğinde GitHub Actions otomatik olarak macOS (`.dmg`) ve Windows (`.exe`) kurulum dosyalarını derleyip **Releases** sayfasında yayınlar.
