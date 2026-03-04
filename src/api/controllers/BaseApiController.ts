import { APIRequestContext, APIResponse } from "@playwright/test";

export abstract class BaseApiController {
    protected readonly request: APIRequestContext;

    constructor(request: APIRequestContext) {
        this.request = request;
    }

    /**
     * Standardized request execution with logging
     */
    protected async executeRequest(
        method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
        url: string,
        options?: any
    ): Promise<APIResponse> {
        const unboundMethod = this.request[method.toLowerCase() as keyof APIRequestContext];
        if (typeof unboundMethod !== 'function') {
            throw new Error(`Method ${method} is not supported on APIRequestContext`);
        }
        return await (unboundMethod as Function).call(this.request, url, options);
    }
}
