import { APIRequestContext, APIResponse } from "@playwright/test";
import { BaseApiController } from "./BaseApiController";

/**
 * Wraps all generator.swagger.io API endpoints.
 * Extends BaseApiController so every method goes through the shared `executeRequest` helper.
 */
export class SwaggerController extends BaseApiController {
	constructor(request: APIRequestContext) {
		super(request);
	}

	/** Returns the list of all supported server framework names. */
	async getServerOptions(): Promise<APIResponse> {
		return this.executeRequest("GET", "/api/gen/servers");
	}

	/**
	 * Returns configuration options for a specific server framework.
	 * @param framework - e.g. "nodejs-server", "spring"
	 */
	async getServerFrameworkOptions(framework: string): Promise<APIResponse> {
		return this.executeRequest("GET", `/api/gen/servers/${framework}`);
	}

	/**
	 * Triggers async server code generation via the Swagger generator.
	 * @param framework - Target server framework (e.g. "nodejs-server").
	 * @param swaggerUrl - Public URL of the Swagger/OpenAPI JSON spec.
	 * @returns A response containing a `code` field (used to poll download).
	 */
	async generateServer(framework: string, swaggerUrl: string): Promise<APIResponse> {
		return this.executeRequest("POST", `/api/gen/servers/${framework}`, {
			data: { swaggerUrl },
		});
	}

	/** Returns the list of all supported client language names. */
	async getClientOptions(): Promise<APIResponse> {
		return this.executeRequest("GET", "/api/gen/clients");
	}

	/**
	 * Returns configuration options for a specific client language.
	 * @param language - e.g. "typescript-node", "javascript"
	 */
	async getClientLanguageOptions(language: string): Promise<APIResponse> {
		return this.executeRequest("GET", `/api/gen/clients/${language}`);
	}

	/**
	 * Triggers async client library generation.
	 * @param language - Target client language (e.g. "typescript-node").
	 * @param swaggerUrl - Public URL of the Swagger/OpenAPI JSON spec.
	 * @returns A response containing a `code` field (used to poll download).
	 */
	async generateClient(language: string, swaggerUrl: string): Promise<APIResponse> {
		return this.executeRequest("POST", `/api/gen/clients/${language}`, {
			data: { swaggerUrl },
		});
	}

	/**
	 * Downloads the generated archive once it's ready.
	 * @param code - The generation code returned by `generateClient` / `generateServer`.
	 */
	async downloadClient(code: string): Promise<APIResponse> {
		return this.executeRequest("GET", `/api/gen/download/${code}`);
	}
}
