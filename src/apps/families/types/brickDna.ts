export interface BrickDnaTopColor {
    name: string;
    hex: string;
    count: number;
}

export interface BrickDnaTopPartType {
    name: string;
    category: string;
    count: number;
}

export interface BrickDnaRarePart {
    part: string;
    color: string;
    quantity: number;
}

export interface BrickDnaDiversityScore {
    shannonIndex: number;
}

export interface BrickDna {
    topColors: BrickDnaTopColor[];
    topPartTypes: BrickDnaTopPartType[];
    rarestParts: BrickDnaRarePart[];
    diversityScore: BrickDnaDiversityScore;
}
