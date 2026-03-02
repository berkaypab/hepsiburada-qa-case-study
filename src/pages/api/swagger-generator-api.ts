import { APIRequestContext } from "@playwright/test";

export class SwaggerGeneratorApi {
	constructor(private request: APIRequestContext) {}

	async generateClient(language: string, swaggerUrl: string) {
		return this.request.post(`/api/gen/clients/${language}`, {
			data: { swaggerUrl },
		});
	}

	async downloadClient(code: string) {
		return this.request.get(`/api/gen/download/${code}`);
	}
}
