import { Reporter, FullConfig, Suite, TestCase, TestResult, FullResult, TestStep } from "@playwright/test/reporter";
import * as fs from "fs";
import * as path from "path";

/**
 * Custom Playwright Reporter
 * 
 * Amaç:
 * 1. Konsoldaki test adımlarını daha temiz ve anlaşılır (hiyerarşik) bir şekilde loglamak.
 * 2. Çalışan testler bittikten sonra BAŞARISIZ olan tüm testleri toplayıp, dış sistemler 
 *    (Örn: Jira Bug Tracker) için kullanılabilecek saf bir JSON (failed-tests-jira-payload.json) üretmek.
 */
class CustomReporter implements Reporter {
    private failedTests: Array<{ title: string; duration: number; error?: string; location: string }> = [];

    onBegin(_config: FullConfig, suite: Suite) {
        console.log(`\n🚀 Test Koşusu Başlıyor: Toplam ${suite.allTests().length} test mevcut.\n`);
    }

    onTestBegin(test: TestCase) {
        console.log(`▶ BAŞLADI: [${test.parent.project()?.name}] > ${test.title}`);
    }

    onStepBegin(_test: TestCase, _result: TestResult, step: TestStep) {
        // Sadece ana 'test.step' çağrılarını logla (iç içe locator vs.'yi filtrele)
        if (step.category === "test.step") {
            console.log(`  ↳ Adım: ${step.title}`);
        }
    }

    onTestEnd(test: TestCase, result: TestResult) {
        if (result.status === "passed") {
            console.log(`✅ GEÇTİ: [${test.parent.project()?.name}] > ${test.title} (${result.duration}ms)\n`);
        } else if (result.status === "skipped") {
            console.log(`⏭️ ATLANDI: [${test.parent.project()?.name}] > ${test.title}\n`);
        } else if (result.status === "failed" || result.status === "timedOut") {
            console.log(`❌ BAŞARISIZ: [${test.parent.project()?.name}] > ${test.title} (${result.duration}ms)`);
            if (result.error?.message) {
                console.log(`   Hata: ${result.error.message.split("\n")[0]}\n`); // İlk satırı logla
            }

            // Başarısız testleri payload olarak topla
            this.failedTests.push({
                title: test.title,
                duration: result.duration,
                error: result.error?.stack || result.error?.message || "Unknown error occurred",
                location: `${test.location.file}:${test.location.line}`,
            });
        }
    }

    onEnd(result: FullResult) {
        console.log(`\n🏁 Test Koşusu Tamamlandı. Durum: ${result.status.toUpperCase()}`);

        if (this.failedTests.length > 0) {
            console.log(`\n⚠️ ${this.failedTests.length} başarısız test bulundu. Jira payloadu JSON olarak kaydediliyor...`);

            const reportsDir = path.join(process.cwd(), "reports");
            if (!fs.existsSync(reportsDir)) {
                fs.mkdirSync(reportsDir, { recursive: true });
            }

            const payloadPath = path.join(reportsDir, "failed-tests-jira-payload.json");
            fs.writeFileSync(payloadPath, JSON.stringify({ failedTests: this.failedTests }, null, 2), "utf-8");

            console.log(`💾 Payload başarıyla oluşturuldu: ${payloadPath}`);
        } else {
            console.log(`🎉 Harika! Hiç başarısız test yok.`);
        }
    }
}

export default CustomReporter;
