import { test, expect } from "@playwright/test";
import { SwaggerGeneratorApi } from "../../pages/api/swagger-generator-api";

test.describe("Swagger Generator API Tests", () => {
	let swaggerApi: SwaggerGeneratorApi;

	test.beforeEach(async ({ request }) => {
		swaggerApi = new SwaggerGeneratorApi(request);
	});

	test("Should generate a client and download it using the extracted code (Best Practice)", async () => {
		let downloadCode = "";

		await test.step("Step 1: Send the POST request to generate a JavaScript client", async () => {
			const response = await swaggerApi.generateClient("javascript", "http://petstore.swagger.io/v2/swagger.json");

			await expect(response).toBeOK();

			const responseData = await response.json();
			expect(responseData).toHaveProperty("code");
			downloadCode = responseData.code;
		});

		await test.step("Step 3: Poll the GET request until the client is fully generated and ready", async () => {
			expect(downloadCode).toBeTruthy(); // Ensure we have a valid code to proceed

			await expect
				.poll(
					async () => {
						const response = await swaggerApi.downloadClient(downloadCode);
						return response.status();
					},
					{
						message: "Client generation should complete and return HTTP 200",
						timeout: 10_000,
					},
				)
				.toBe(200);
		});
	});
});
