export const extractParameterTypes = (
    query: string,
): Record<string, string> => {
    const comments = query.split("\n").filter((l) => l.startsWith("--- "));
    return Object.fromEntries(
        comments.map((c) => {
            const match = c.match(/^--- (\S+):\s+(\S+.*)\s*/);
            if (match && match.length >= 3) {
                return [match[1], match[2]];
            } else {
                throw new Error("Unparseable type comment: " + c);
            }
        }),
    );
};
