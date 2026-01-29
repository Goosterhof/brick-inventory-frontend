export class MissingResponseDataError extends Error {
    constructor(message: string) {
        super(message);

        this.name = "MissingResponseDataError";
    }
}
