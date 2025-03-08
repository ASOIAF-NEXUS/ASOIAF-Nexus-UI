import rawSongData from "./data/song.json"
import {BuilderRoles, SongData} from "./songTypes.ts";


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

        if (ent.statistics.commander) ent._roleBuilder = BuilderRoles.commander;
        else if (ent.statistics.enemy) ent._roleBuilder = BuilderRoles.enemy;
        else if (ent._prop === "units") ent._roleBuilder = BuilderRoles.unit;
        else if (ent._prop === "ncus") ent._roleBuilder = BuilderRoles.ncu;
        else if (ent._prop === "attachments") ent._roleBuilder = BuilderRoles.attachment;
        else ent._roleBuilder = BuilderRoles.none;

        ent.__isMutated = true;

        return ent;
    }
}

export const dataLoader = new DataLoader();
