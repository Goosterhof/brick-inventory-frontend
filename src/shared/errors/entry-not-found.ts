export class EntryNotFoundError extends Error {
    constructor(domainName: string, id: number) {
        super(`${domainName} with id ${id} not found`);
        this.name = "EntryNotFoundError";
    }
}
