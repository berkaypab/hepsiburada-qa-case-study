import { APIRequestContext, APIResponse } from "@playwright/test";
import { BaseApiController } from "./BaseApiController";

export class SwaggerController extends BaseApiController {
	constructor(request: APIRequestContext) {
		super(request);
	}

	async generateClient(language: string, swaggerUrl: string): Promise<APIResponse> {
		return this.executeRequest("POST", `/api/gen/clients/${language}`, {
			data: { swaggerUrl },
		});
	}

	async downloadClient(code: string): Promise<APIResponse> {
		return this.executeRequest("GET", `/api/gen/download/${code}`);
	}
}
