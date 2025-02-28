import rawSongData from "./data/song.json"
import {SongData} from "./songTypes.ts";


class DataLoader {
    _LOADED: SongData[] = [];

    load(): SongData[] {
        if (this._LOADED.length) return this._LOADED;
        // @ts-expect-error-???
        this._LOADED = rawSongData.data.map(it => DataLoader._mutateEntity(it));

        return this._LOADED;
    }

    static _mutateEntity(ent: SongData) {
        if (ent.__isMutated) return ent;

        ent._fullName = ent.subname ? `${ent.name.toTitleCase()} - ${ent.subname.toTitleCase()}` : ent.name.toTitleCase();

        if (ent.id.startsWith("1")) ent._prop = "units";
        else if (ent.id.startsWith("2")) ent._prop = "attachments";
        else if (ent.id.startsWith("3")) ent._prop = "ncus";
        else if (ent.id.startsWith("4")) ent._prop = "tactics";
        else if (ent.id.startsWith("5")) ent._prop = "specials";
        else ent._prop = "unknown";

        ent.__isMutated = true;

        return ent;
    }
}

export const dataLoader = new DataLoader();
