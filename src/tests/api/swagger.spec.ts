import { test, expect } from "@playwright/test";
import { SwaggerController } from "../../api/controllers/swagger-controller";
import { validateSchema } from "../../api/utils/schema-validator";
import swaggerSchema from "../../api/schemas/swagger-generate.schema.json" with { type: "json" };

test.describe("Swagger Generator API", () => {
    let swaggerController: SwaggerController;

    test.beforeEach(async ({ request }) => {
        swaggerController = new SwaggerController(request);
    });

    test("Should successfully generate and poll for client download", async () => {
        let downloadCode = "";

        await test.step("Generate JavaScript client for Petstore API", async () => {
            const response = await swaggerController.generateClient(
                "javascript",
                "http://petstore.swagger.io/v2/swagger.json",
            );

            expect(response.status()).toBe(200);
            const data = await response.json();

            // val schema
            validateSchema(data, swaggerSchema);

            expect(data).toHaveProperty("code");
            downloadCode = data.code;
        });

        await test.step("Poll for client readiness", async () => {
            expect(downloadCode).toBeTruthy();

            await expect
                .poll(
                    async () => {
                        const response = await swaggerController.downloadClient(downloadCode);
                        return response.status();
                    },
                    {
                        message: "API should return 200 when client is ready for download",
                        timeout: 20_000,
                        intervals: [2000, 5000],
                    },
                )
                .toBe(200);
        });
    });

    test("GET /gen/servers - Should return supported server languages", async () => {
        const response = await swaggerController.getServerOptions();
        expect(response.ok()).toBeTruthy();
        const data = await response.json();
        expect(Array.isArray(data)).toBe(true);
        expect(data).toContain("nodejs-server");
    });

    test("GET /gen/servers/{framework} - Should return server framework options", async () => {
        const response = await swaggerController.getServerFrameworkOptions("nodejs-server");
        expect(response.ok()).toBeTruthy();
        const data = await response.json();
        expect(data).toHaveProperty("sortParamsByRequiredFlag");
    });

    test("POST /gen/servers/{framework} & GET /gen/download - Should generate server and allow download", async () => {
        let downloadCode = "";

        await test.step("Generate nodejs-server for Petstore API", async () => {
            const response = await swaggerController.generateServer(
                "nodejs-server",
                "http://petstore.swagger.io/v2/swagger.json",
            );
            expect(response.ok()).toBeTruthy();
            const data = await response.json();
            expect(data).toHaveProperty("code");
            downloadCode = data.code;
        });

        await test.step("Poll for server readiness", async () => {
            expect(downloadCode).toBeTruthy();
            await expect
                .poll(
                    async () => {
                        const response = await swaggerController.downloadClient(downloadCode); // download endpoint is shared
                        return response.status();
                    },
                    {
                        message: "API should return 200 when server archive is ready for download",
                        timeout: 20_000,
                        intervals: [2000, 5000],
                    },
                )
                .toBe(200);
        });
    });

    test("GET /gen/clients - Should return supported client languages", async () => {
        const response = await swaggerController.getClientOptions();
        expect(response.ok()).toBeTruthy();
        const data = await response.json();
        expect(Array.isArray(data)).toBe(true);
        expect(data).toContain("typescript-node");
    });

    test("GET /gen/clients/{language} - Should return client language options", async () => {
        const response = await swaggerController.getClientLanguageOptions("typescript-node");
        expect(response.ok()).toBeTruthy();
        const data = await response.json();
        expect(data).toHaveProperty("sortParamsByRequiredFlag");
    });
});
