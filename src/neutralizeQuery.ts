export const neutralizeQuery = (query: string) => {
    return (
        "SELECT * FROM (" + query.replace(/;\s*$/m, "") + ") sub WHERE 1 = 2"
    );
};
