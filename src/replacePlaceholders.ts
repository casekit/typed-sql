export const replacePlaceholders = (
    query: string,
    parameters: Record<string, unknown>,
) => {
    const variables: unknown[] = [];
    let currIndex = 0;
    const substitutions: Record<string, string> = {};

    const normalized = query.replace(
        /(?<!:):(\.\.\.|)?(\w+)\b/gi,
        (_, spread, x) => {
            const vs =
                spread === "..."
                    ? parameters[x] ?? [null]
                    : [parameters[x] ?? null];

            if (!Array.isArray(vs)) {
                throw new Error(
                    "Parameter `" + x + "` should be an array, but isn't",
                );
            }

            if (!substitutions[x]) {
                substitutions[x] = vs.map(() => `$${++currIndex}`).join(", ");
                variables.push(...vs);
            }
            return substitutions[x];
        },
    );

    return {
        substitutions: Object.keys(substitutions),
        normalized,
        variables,
    };
};
