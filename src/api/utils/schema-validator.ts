import Ajv from "ajv";
import addFormats from "ajv-formats";

const ajv = new Ajv({
    allErrors: true,
    verbose: true,
    strict: false, // Allow dynamic schemas common in mock APIs
});

addFormats(ajv);

/**
 * Validates a JSON object against a provided schema.
 * Throws a professional error message if validation fails.
 */
export function validateSchema(data: unknown, schema: object) {
    const validate = ajv.compile(schema);
    const valid = validate(data);

    if (!valid) {
        const errors = JSON.stringify(validate.errors, null, 2);
        throw new Error(`Schema Validation Failed:\n${errors}`);
    }
}
