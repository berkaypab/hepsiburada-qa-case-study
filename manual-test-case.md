# 1. Manuel Test Case Çalışması: "Yorum Yap" Fonksiyonu

**Modül:** Ürün Detay Sayfası (Product Detail Page - PDP)
**Özellik:** Yorum Yap (Değerlendirme Ekleme)
**Platform:** Web (Desktop & Mobile Browser)

Aşağıda Hepsiburada "Yorum Yap" özelliği için hazırlanmış, pozitif, negatif, sınır değer (boundary) ve güvenlik/validasyon senaryolarını içeren **Manuel Fonksiyonel Test Caseleri** listelenmiştir.

---

## A. Pozitif Senaryolar (Happy Path)

### TC-01: Başarılı Yorum ve Puanlama İşlemi (Sadece Metin ve Puan)
*   **Ön Koşul:** Kullanıcı sisteme giriş yapmış olmalı ve ürünü daha önce satın almış olmalıdır.
*   **Adımlar:**
    1. İlgili ürünün detay sayfasına gidilir.
    2. "Değerlendirmeler" sekmesine tıklanır (veya ürün başlığının altındaki değerlendirme sayısına tıklanarak yorum sayfasına geçilir).
    3. Turuncu renkli "Değerlendir" butonuna tıklanır.
    4. Yıldız derecelendirmesi (örn. 5 yıldız) seçilir.
    5. Yorum başlığı ve detaylı yorum metni kurallara uygun şekilde doldurulur.
    6. "Gönder" butonuna tıklanır.
*   **Beklenen Sonuç:** Yorumun başarıyla alındığına dair onay/teşekkür mesajı (toast veya pop-up) görüntülenmelidir. Yorum, onay sürecine girmelidir (Hemen yayınlanmıyorsa "Onay bekliyor" statüsüne alınmalıdır).

### TC-02: Multimedya (Fotoğraf/Video) İçeren Başarılı Yorum İşlemi
*   **Ön Koşul:** Kullanıcı giriş yapmış ve değerlendirme formunu açmış olmalıdır.
*   **Adımlar:**
    1. Formda yıldız derecesi seçilir ve metin girilir.
    2. "Fotoğraf/Video Ekle" butonuna tıklanır.
    3. Desteklenen bir formatta (.jpg, .png, .mp4) ve geçerli boyutta (örn. <10MB) bir medya dosyası seçilir.
    4. "Gönder" butonuna tıklanır.
*   **Beklenen Sonuç:** Medya dosyasının başarıyla yüklendiği progress bar ile görünmeli, form gönderildikten sonra işlemin başarılı olduğuna dair geri bildirim alınmalıdır.

### TC-03: Sadece Puanlama Yapılarak Değerlendirme Gönderimi (Eğer İzin Veriliyorsa)
*   **Ön Koşul:** Kullanıcı giriş yapmış ve değerlendirme formunu açmış olmalıdır.
*   **Adımlar:**
    1. Formda sadece yıldız puanı (örn. 4 yıldız) seçilir.
    2. Yorum metni alanı boş bırakılır.
    3. "Gönder" butonuna tıklanır.
*   **Beklenen Sonuç:** Eğer iş kuralı (business logic) sadece puanlamaya izin veriyorsa, işlem başarılı olmalı ve değerlendirme ortalamaya yansımak üzere kaydedilmelidir. İzin verilmiyorsa ilgili uyarı mesajı (TC-05) alınmalıdır.

---

## B. Negatif ve Validasyon Senaryoları

### TC-04: Giriş Yapmadan (Guest) Değerlendirme Yapma Girişimi
*   **Ön Koşul:** Kullanıcı sisteme **giriş yapmamış** (anonim) olmalıdır.
*   **Adımlar:**
    1. Ürün yorum sayfasına gidilir.
    2. "Değerlendir" butonuna tıklanır.
*   **Beklenen Sonuç:** Kullanıcı otomatik olarak `https://www.hepsiburada.com/uyelik/giris` sayfasına yönlendirilmelidir. Başarılı giriş sonrasında kaldığı sayfaya veya yorum formuna geri dönmesi beklenir.

### TC-05: Puanlama (Yıldız) Zorunluluğunun Kontrolü
*   **Ön Koşul:** Kullanıcı giriş yapmış ve değerlendirme formunu açmış olmalıdır.
*   **Adımlar:**
    1. Yıldız derecesi **seçilmeden** (0 yıldız) bırakılır.
    2. Geçerli bir yorum metni yazılır.
    3. "Gönder" butonuna tıklanır.
*   **Beklenen Sonuç:** Form gönderilememeli ve kullanıcıya "Lütfen bir yıldız puanı seçiniz" (veya benzeri) belirgin bir hata mesajı gösterilmelidir.

### TC-06: Zorunlu Yorum Metni Alanının Kontrolü (Minimum Karakter Sınırı)
*   **Ön Koşul:** Kullanıcı giriş yapmış ve değerlendirme formunu açmış olmalıdır.
*   **Adımlar:**
    1. Yıldız puanı seçilir.
    2. Yorum metnine belirlenen minimum karakterden (örn: 10 karakter) daha az karakter girilir (örn: "iyi").
    3. "Gönder" butonuna tıklanır.
*   **Beklenen Sonuç:** Form gönderilememeli, "Yorumunuz en az X karakter olmalıdır" şeklinde dinamik bir validasyon hatası görüntülenmelidir.

### TC-07: Maksimum Karakter Sınırının Kontrolü
*   **Ön Koşul:** Kullanıcı giriş formunu açmış olmalıdır.
*   **Adımlar:**
    1. Yıldız puanı seçilir.
    2. Yorum metni alanına izin verilen maksimum karakter (örn: 5000) aşılacak şekilde uzun bir metin (Lorem Ipsum vb.) kopyalanıp yapıştırılır.
*   **Beklenen Sonuç:** Input alanı maksimum karakter sınırından sonrasını kabul etmemeli (yazılamamalı/yapıştırılamamalı) veya gönderim sırasında "Maksimum karakter sınırını aştınız" uyarısı vermelidir.

### TC-08: Satın Alınmamış Ürün İçin "Değerlendir" Butonu Kontrolü
*   **Ön Koşul:** Kullanıcı profilinde **hiç satın alınmamış** bir ürünün yorum sayfasında olmalıdır.
*   **Adımlar:**
    1. Yorum sayfasındaki "Değerlendir" butonunun altındaki uyarı metni kontrol edilir.
    2. "Değerlendir" butonuna tıklanır (eğer tıklanabiliyorsa).
*   **Beklenen Sonuç:** Butonun altında "Değerlendirme yapabilmek için bu ürünü satın almış olmalısınız." uyarısı görünür olmalıdır. Eğer Hepsiburada politikası gereği hiç satın almayanların oylaması engelleniyorsa buton (inaktif) durumda olmalı veya tıklandığında işlemi engelleyen bir hata dönmelidir.

### TC-09: Desteklenmeyen veya Çok Büyük Medya Dosyası Yükleme
*   **Ön Koşul:** Kullanıcı değerlendirme formundaki medya yükleme arayüzünde olmalıdır.
*   **Adımlar:**
    1. Boyutu izin verilen limitin (örn: 10MB) çok üzerinde olan bir video dosyası VEYA .exe, .pdf gibi desteklenmeyen formatta bir dosya seçilir.
*   **Beklenen Sonuç:** Müşteri arayüzünde (Frontend) dosya seçimi anında "Sadece JPG, PNG veya MP4 formatları desteklenmektedir" veya "Dosya boyutu çok yüksek" şeklinde validasyon uyarısı verilmeli, yükleme işlemi bloklanmalıdır.

---

## C. Güvenlik, Edge (Uç) Durumlar ve UX Senaryoları

### TC-10: Küfür, Hakaret ve Engellenmiş Kelime (Profanity Filter) Kontrolü
*   **Ön Koşul:** Kullanıcı yorum formunda olmalıdır.
*   **Adımlar:**
    1. Yıldız puanı seçilir.
    2. Yorum metnine sistemin kara listesinde (blacklist) olan küfürlü veya standart dışı argo bir kelime yazılır.
    3. "Gönder" butonuna tıklanır.
*   **Beklenen Sonuç:** Yorum anında bloklanıp "Yorumunuzda uygunsuz ifadeler bulunmaktadır" uyarısı verilebilir veya sistem yorumu kabul edip Moderasyon/Admin paneline "Reddedildi / İncelenmeli" statüsüyle düşürmelidir. Yorum canlı ortamda **kesinlikle** yayınlanmamalıdır.

### TC-11: Çift Gönderim (Double Click/Submission) Engeli
*   **Ön Koşul:** Kullanıcı geçerli verilerle form doldurmuş olmalıdır.
*   **Adımlar:**
    1. Klavye enter tuşuna basılı tutulur veya "Gönder" butonuna hızla arka arkaya (double/triple click) basılır.
*   **Beklenen Sonuç:** İlk tıklamanın ardından "Gönder" butonu "Yükleniyor..." statüsüne geçip anında inaktif (disabled) olmalı, sistemde mükerrer (duplicate) yorum kayıtları oluşturulması engellenmelidir. Yalnızca 1 adet yorum veritabanına iletilmelidir.
