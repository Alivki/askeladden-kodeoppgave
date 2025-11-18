export class VegvesenAPIError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "VegvesenAPIError";
    }
}
