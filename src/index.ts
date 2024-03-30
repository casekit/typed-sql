import fs from "fs";
import { globSync as glob } from "glob";
import { camelCase, last, upperFirst } from "lodash";
import { Client } from "pg";
import prettier from "prettier";

import { extractParameterTypes } from "./extractParameterTypes";
import { neutralizeQuery } from "./neutralizeQuery";
import { replacePlaceholders } from "./replacePlaceholders";

export const format = async (source: string) => {
    return await prettier.format(source, {
        parser: "typescript",
        printWidth: 80,
        tabWidth: 4,
        trailingComma: "all",
        singleQuote: false,
        semi: true,
    });
};

(async () => {
    const directory = process.argv[2];
    const files = glob(directory + "/**/*.sql");
    console.log(files);
    for (const file of files) {
        console.log("Query file", file);
        const query = fs.readFileSync(file, { encoding: "utf-8" });
        const name = camelCase(last(file.split("/"))!.split(".")[0]);
        const outfile = file.replace(/\.sql$/, ".query.ts");

        const parameterTypes = extractParameterTypes(query);
        const { normalized, substitutions, variables } = replacePlaceholders(
            query,
            {},
        );

        const neutralized = neutralizeQuery(normalized);
        const client = new Client({
            database: "typed-sql",
            user: "typed-sql",
            password: "password",
        });
        try {
            await client.connect();
            const result = await client.query(neutralized, variables);
            // get data type ids from result.fields (will need to query postgres by the id)
            // convert this to a typescript type
            // include the generated result type in the output file below
        } catch (e) {
            console.log(e);
        } finally {
            client.end();
        }

        const output = `
        export type ${upperFirst(name)}Parameters = { ${substitutions
            .map((p) => `${p}: ${parameterTypes[p] ?? "unknown"}`)
            .join(", ")} };

        export type ${upperFirst(name)}ResultRow = { };

        export ${name} = (parameters: ${upperFirst(name)}Parameters): ${upperFirst(name)}ResultRow => {
            // ..........
        }
    `;

        fs.writeFileSync(outfile, await format(output), { encoding: "utf-8" });
        console.log("Written query function to", outfile);
    }
})();
