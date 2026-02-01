export interface TranslationServiceForError {
    getCapitalizedSingularTranslation: () => string;
}

export class EntryNotFoundError extends Error {
    constructor(domainName: string, id: number, translationService: TranslationServiceForError) {
        const name = translationService.getCapitalizedSingularTranslation();
        super(`${name} with id ${id} not found`);
        this.name = "EntryNotFoundError";
    }
}
