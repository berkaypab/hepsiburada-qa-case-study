import { test, expect } from "@playwright/test";
import { SwaggerController } from "../../api/controllers/SwaggerController";
import { validateSchema } from "../../api/utils/schema-validator";
import swaggerSchema from "../../api/schemas/swagger-generate.schema.json" with { type: "json" };

test.describe("Study Case - Swagger Generator API", () => {
    let swaggerController: SwaggerController;

    test.beforeEach(async ({ request }) => {
        swaggerController = new SwaggerController(request);
    });

    test("Should successfully generate and poll for client download", async () => {
        let downloadCode = "";

        await test.step("Generate JavaScript client for Petstore API", async () => {
            const response = await swaggerController.generateClient(
                "javascript",
                "http://petstore.swagger.io/v2/swagger.json"
            );

            expect(response.status()).toBe(200);
            const data = await response.json();

            // Professional Schema Validation
            validateSchema(data, swaggerSchema);

            expect(data).toHaveProperty("code");
            downloadCode = data.code;
        });

        await test.step("Poll for client readiness", async () => {
            expect(downloadCode).toBeTruthy();

            await expect.poll(async () => {
                const response = await swaggerController.downloadClient(downloadCode);
                return response.status();
            }, {
                message: "API should return 200 when client is ready for download",
                timeout: 20_000,
                intervals: [2000, 5000]
            }).toBe(200);
        });
    });
});
