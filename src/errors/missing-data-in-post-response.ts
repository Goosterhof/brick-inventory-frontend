export class MissingDataInPostResponseError extends Error {
    constructor(message: string) {
        super(message);

        this.name = 'MissingDataInPostResponseError';
    }
}
