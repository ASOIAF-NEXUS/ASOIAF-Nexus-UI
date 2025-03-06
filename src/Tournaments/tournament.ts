interface Tournament {
    id?: number;
    name: string;
    description: string;
    date: Date | null;
    players: string[];
    location: string;
}