import { APIRequestContext, APIResponse } from "@playwright/test";

export abstract class BaseApiController {
	protected readonly request: APIRequestContext;

	constructor(request: APIRequestContext) {
		this.request = request;
	}

	protected async executeRequest(
		method: "get" | "post" | "put" | "delete" | "patch" | "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
		url: string,
		options?: Parameters<APIRequestContext["get"]>[1],
	): Promise<APIResponse> {
		const lowerMethod = method.toLowerCase() as "get" | "post" | "put" | "delete" | "patch";

		switch (lowerMethod) {
			case "get":
				return await this.request.get(url, options);
			case "post":
				return await this.request.post(url, options);
			case "put":
				return await this.request.put(url, options);
			case "delete":
				return await this.request.delete(url, options);
			case "patch":
				return await this.request.patch(url, options);
			default:
				throw new Error(`Method ${method} is not supported on APIRequestContext`);
		}
	}
}
