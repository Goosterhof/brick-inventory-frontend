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

export interface StorageOptionPart {
    id: number;
    storageOptionId: number;
    quantity: number;
    part: Part;
    color: Color | null;
}
