import { SearchField } from "./base";

import type { ParseSchema, ParseSearchSchema } from "../../typings";
import type { Search } from "../search";

export class VectorField<T extends ParseSchema<any>> extends SearchField<T> {
    public override eq(): Search<T, ParseSearchSchema<T["data"]>> {
        throw new Error("Method not implemented.");
    }

    public override equals(): Search<T, ParseSearchSchema<T["data"]>> {
        throw new Error("Method not implemented.");
    }

    public override equalsTo(): Search<T, ParseSearchSchema<T["data"]>> {
        throw new Error("Method not implemented.");
    }

    protected override construct(): string {
        throw new Error("Method not implemented.");
    }

}