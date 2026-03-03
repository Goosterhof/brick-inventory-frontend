export type FamilySetStatus = "sealed" | "built" | "in_progress" | "incomplete";

export interface SetSummary {
    id: number;
    setNum: string;
    name: string;
    year: number | null;
    theme: string | null;
    numParts: number;
    imageUrl: string | null;
}

export interface FamilySet {
    id: number;
    setId: number;
    quantity: number;
    status: FamilySetStatus;
    purchaseDate: string | null;
    notes: string | null;
    set: SetSummary;
}

export interface CreateFamilySetPayload {
    setNum: string;
    quantity?: number;
    status?: FamilySetStatus;
    purchaseDate?: string | null;
    notes?: string | null;
}

export interface UpdateFamilySetPayload {
    quantity: number;
    status: FamilySetStatus;
    purchaseDate?: string | null;
    notes?: string | null;
}
