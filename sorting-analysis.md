# QA Case Study: Hepsiburada "Varsayılan" Yorum Sıralama Algoritması Analizi

**Amaç**
Hepsiburada E-Ticaret platformunda, ürün detay ve tüm değerlendirmeler sayfalarında yer alan "Sırala" bileşenindeki "**Varsayılan**" (Default) seçeneğinin çalışma prensiplerinin, sıralama metriklerinin ve test edilebilirlik kriterlerinin analiz edilmesi.

## 1. Araştırma ve Analiz Metodolojisi
Analiz için, platformda yüksek etkileşime (çok yorum, çok oylama ve çoklu satıcı) sahip popüler teknoloji ürünlerinin (örn. Apple iPhone serisi, Samsung Galaxy S serisi) yorum sayfaları referans alınmıştır.
Aşağıdaki hipotez değişkenleri (kriterler) ele alınarak farklı ürünlerin yorum listelerindeki "Varsayılan", "En Yeni" ve "En Faydalı" sıralama seçenekleri karşılaştırmalı olarak incelenmiştir:
*   Yorumların aldığı "Evet" (Faydalı buldum) oy sayısı.
*   Yorumların içerdiği medya materyalleri (Fotoğraf / Video).
*   Kullanıcının "Satın Aldı" (Doğrulanmış Alıcı) rozetine sahip olup olmaması.
*   Yorum içeriklerinin uzunluğu ve detay (puanlamalar) seviyesi.
*   Yorum tarihinin güncelliği (Recency).

## 2. Gözlemler ve Analiz Bulguları

Yapılan gözlemlerde "Varsayılan" seçeneğin katı bir "En Faydalı" veya "En Yeni" metodu kullanmadığı; bunun yerine **Algoritmik / Ağırlıklandırılmış bir Kalite Skoru (Weighted Quality Score)** sistemi ile yapılandırıldığı tespit edilmiştir:

1.  **Etkileşim Hacmi (Faydalılık Puanı):** Sıralamanın birincil itici gücünün toplam "Evet" oyları olduğu görülmektedir. İlgi çekici olan nokta; algoritmanın net oydan (Evet - Hayır) çok, alınan toplam etkileşime (mutlak "Evet" sayısı) odaklanmasıdır. Çok "Hayır" oyu almış olsa da, yüksek "Evet" oyu alan kutuplaştırıcı yorumların üst sıralarda tutulduğu saptanmıştır.
2.  **Multimedya Çarpanı (Rich Content):** Faydalı oyları nispeten daha düşük olsa dahi (veya oylamanın eşit olduğu senaryolarda), içerisine **Fotoğraf veya Video eklenmiş** yorumların kesinkes sıralamada öne geçirildiği belirlenmiştir. Platform, görsel incelemeyi metin incelemeye göre daha "değerli" bir referans olarak saymaktadır.
3.  **Güvenilirlik ve Spam Önleme ("Satın Aldı" Rozeti):** "Varsayılan" sıralamanın ilk sıraları neredeyse tamamen platform üzerinden ilgili satıcıdan "Satın Aldı" onayına sahip kullanıcılardan oluşmaktadır. Rozetsiz organik yorumların üst sıralara çıkması engellenerek güvenilirlik maksimize edilmektedir.
4.  **İçerik Derinliği ve Nitelik:** Sadece "Güzel ürün" şeklinde kısa metne sahip olan yorumların, ürünün kargo, paketleme, performans detayları gibi özelliklerini barındıran uzun ve alt kırılım değerlendirmeleri yapan yorumların altında kaldığı görülmüştür.
5.  **Güncellik (Recency) Etkisi:** Sıralamanın ana faktörü zaman olmasa da, diğer (etkileşim, medya) kalite skorları aynı olan iki değerlendirme yan yana geldiğinde "daha güncel tarihli olan" değerlendirme üste çıkarılarak güncelliğin bir tie-breaker (eşitlik bozucu) olarak kullanıldığı saptanmıştır.

## 3. QA Yaklaşımı ve Sonuç Çıkarımı

**Algoritma Özeti:** 
"Varsayılan" sıralama mantığı; kullanıcıya sadece matematiksel olarak en çok "Evet" alan yorumu göstermek yerine; görsel kanıtı olan (Medya), en detaylı (Metin Kalitesi), kesin satın almış (Doğrulamalı) ve popüler (Etkileşimli) deneyimleri sunmayı hedefleyen **Hibrit bir Makine Öğrenimi / Puanlama Modelidir.** 

**Test Otomasyon Stratejisi & Test Case Önerileri:**
Bu tarz dinamik (ve zamanla güncellenen) makine öğrenimi mantığına sahip sıralama fonksiyonları için geleneksel "DOM üzerindeki element sırasını (1., 2., 3.) assertion et" yaklaşımı aşırı *flaky* (kırılgan) testlere sebep olacaktır. Kaliteden emin olmak için aşağıdaki yaklaşımlar tavsiye edilir:

1.  **UI Data Integrity Validation:** Listelenen sayfanın UI katmanında, ilk 10 yorum üzerinde döngü (loop) kurularak, bu yorumların en azından sistemin belirlediği base quality standartlarını taşıdığı valide edilmelidir:
    *   `Assertion`: İlk N yorum için "Satın Aldı" ibaresi görünür (`toBeVisible`) olmalı.
    *   `Assertion`: Liste boyunca "Evet" (Faydalı) oy sayıları genel bir düşüş trendinde (azalan sıra) olmalı, ancak tamamen kesin (`soft=true` ile) olmamalı (çünkü Medya ağırlığı sırayı değiştirebilir).
2.  **Tie-Breaker Validation (Dummy Data Tests):** Daha kararlı backend/API tabanlı testler için staging (test) ortamında spesifik yorum dataları yaratılmalı:
    *   Test Case: Aynı oya sahip (örn: 50 Evet) biri fotoğraflı diğeri fotoğrafsız iki yorum yaratıldığında, fotoğraflı olanın (veya daha yeni tarihli olanın) listede üstte (`index` kontrolü) döndüğünün API endpoint üzerinden (`/reviews?sort=default`) doğrulanması.
3.  **State Management & Performance:** Sıralama "En Yeni" (Newest) ve "En Faydalı" (Most Helpful) durumları ile "Varsayılan" (Default) arasında değiştirildiğinde:
    *   Listelenen öğelerin her bir değişiklikte farklı bir hash/dizi ile döndüğünün doğrulanması (Aynı liste kalmamalı).
    *   Filtre değişiminin N milisaniye altında tamamlandığının performans (`response block`) kontrolleri.
    
**Değerlendirme Sonucu:** Gözlemlenen "Varsayılan" fonksiyonu Hepsiburada'yı sektör standardı haline getiren "kullanıcı faydası odaklı" bir puanlama sunucusuna bağlanmıştır. QA bakış açısıyla, uygulamanın production stability'sini ölçmek için sıralamanın tam matematiksel doğrusundan ziyade ağırlık gruplarının (medya, satın aldı, vb.) render edilme ve listelenme doğruluğu test edilmelidir.
