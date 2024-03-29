import fs from "fs";
import { globSync as glob } from "glob";
import { camelCase, last, upperFirst } from "lodash";

const directory = process.argv[2];
const files = glob(directory + "/**/*.sql");
console.log(files);

for (const file of files) {
    console.log("Query file", file);
    const query = fs.readFileSync(file, { encoding: "utf-8" });
    const comments = query.split("\n").filter((l) => l.startsWith("--- "));

    let i = 0;
    const paramIndexes: Record<string, number> = {};
    const normalized = query.replace(/(?<!:):(\w+)\b/gi, (_, x) => {
        if (paramIndexes[x]) {
            return "$" + [x];
        }
        return "$" + (paramIndexes[x] = ++i);
    });

    const paramTypes = Object.fromEntries(
        comments.map((c) => {
            const match = c.match(/^--- (\S+):\s+(\S+)/);
            if (match && match.length >= 3) {
                return [match[1], match[2]];
            } else {
                throw new Error("Unparseable type comment: " + c);
            }
        }),
    );

    const name = camelCase(last(file.split("/"))!.split(".")[0]);

    const output = `
        export type ${upperFirst(name)}Parameters = { ${Object.keys(
            paramIndexes,
        )
            .map((p) => `${p}: ${paramTypes[p] ?? "unknown"}`)
            .join(", ")} };
    `;

    console.log(output);
}
