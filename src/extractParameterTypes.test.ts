import { unindent } from "@casekit/unindent";

import { describe, expect, test } from "vitest";

import { extractParameterTypes } from "./extractParameterTypes";

describe("extractParameterTypes", () => {
    test("it extracts parameter types from comment lines beginning with three dashes", () => {
        const result = extractParameterTypes(unindent`
        --- foo: string
        --- bar: number
        --- baz: boolean[]
        --- quux: Record<string, Zyzzy>
        `);
        expect(result).toEqual({
            bar: "number",
            baz: "boolean[]",
            foo: "string",
            quux: "Record<string, Zyzzy>",
        });
    });
});
