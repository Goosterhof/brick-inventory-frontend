export interface Part {
    id: number;
    partNum: string;
    name: string;
    category: string | null;
    imageUrl: string | null;
}

export interface Color {
    id: number;
    name: string;
    rgb: string;
    isTransparent: boolean;
}

export interface SetPart {
    id: number;
    quantity: number;
    isSpare: boolean;
    elementId: string | null;
    part: Part;
    color: Color;
}

export interface SetWithParts {
    id: number;
    setNum: string;
    name: string;
    year: number | null;
    theme: string | null;
    numParts: number;
    imageUrl: string | null;
    parts: SetPart[];
}

export interface StorageMapEntry {
    partId: number;
    colorId: number | null;
    storageOptionId: number;
    storageOptionName: string;
    quantity: number;
}

export interface FamilyPartEntry {
    partId: number;
    partNum: string;
    partName: string;
    partImageUrl: string | null;
    colorId: number | null;
    colorName: string | null;
    colorRgb: string | null;
    storageOptionId: number;
    storageOptionName: string;
    quantity: number;
    familySetId: number | null;
}

export interface GroupedFamilyPart {
    partId: number;
    partNum: string;
    partName: string;
    partImageUrl: string | null;
    colorId: number | null;
    colorName: string | null;
    colorRgb: string | null;
    totalQuantity: number;
    isOrphan: boolean;
    locations: {storageOptionId: number; storageOptionName: string; quantity: number}[];
}

export interface CursorPaginatedParts {
    data: FamilyPartEntry[];
    next_cursor: string | null;
    prev_cursor: string | null;
    path: string;
    per_page: number;
}

export interface StorageOptionPart {
    id: number;
    storageOptionId: number;
    quantity: number;
    part: Part;
    color: Color | null;
}

export interface MasterShoppingListEntry {
    partId: number;
    partNum: string;
    partName: string;
    partImageUrl: string | null;
    colorId: number | null;
    colorName: string | null;
    colorRgb: string | null;
    brickLinkColorId: number | null;
    quantityNeeded: number;
    quantityStored: number;
    shortfall: number;
    neededByFamilySetIds: number[];
}

export interface MasterShoppingListResponse {
    entries: MasterShoppingListEntry[];
    unknownFamilySetIds: number[];
}
