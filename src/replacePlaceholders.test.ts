import { unindent } from "@casekit/unindent";

import { describe, expect, test } from "vitest";

import { replacePlaceholders } from "./replacePlaceholders";

describe("replacePlaceholders", () => {
    test("it replaces variables with null if they are not included in the parameters object", () => {
        const result = replacePlaceholders(
            unindent`
            SELECT
            	p.*,
            	u.id AS author_id,
            	u.name AS author_name,
            	count(l.id) as likes
            FROM
            	"post" p
            	JOIN "user" u ON p.author_id = u.id
            	LEFT JOIN "like" l ON p.id = l.post_id
            WHERE
            	p.title ILIKE :query
            	AND u.name = :username
            	AND p.topic in (:...topics)
            GROUP BY
            	p.id
            ORDER BY
            	count(1) DESC
            HAVING count(1) > :minimum
            LIMIT 10
            `,
            {},
        );
        expect(result).toEqual({
            normalized: unindent`
            SELECT
            	p.*,
            	u.id AS author_id,
            	u.name AS author_name,
            	count(l.id) as likes
            FROM
            	"post" p
            	JOIN "user" u ON p.author_id = u.id
            	LEFT JOIN "like" l ON p.id = l.post_id
            WHERE
            	p.title ILIKE $1
            	AND u.name = $2
            	AND p.topic in ($3)
            GROUP BY
            	p.id
            ORDER BY
            	count(1) DESC
            HAVING count(1) > $4
            LIMIT 10
            `,
            substitutions: ["query", "username", "topics", "minimum"],
            variables: [null, null, null, null],
        });
    });

    test("if more than one values is in an array variable, a parameter for each element is included in the returned query", () => {
        const result = replacePlaceholders(
            unindent`
            SELECT
            	p.*,
            	u.id AS author_id,
            	u.name AS author_name,
            	count(l.id) as likes
            FROM
            	"post" p
            	JOIN "user" u ON p.author_id = u.id
            	LEFT JOIN "like" l ON p.id = l.post_id
            WHERE
            	p.title ILIKE :query
            	AND u.name = :username
            	AND p.topic in (:...topics)
            GROUP BY
            	p.id
            ORDER BY
            	count(1) DESC
            HAVING count(1) > :minimum
            LIMIT 10
            `,
            { topics: ["cats", "dogs", "birds"] },
        );
        expect(result).toEqual({
            normalized: unindent`
            SELECT
            	p.*,
            	u.id AS author_id,
            	u.name AS author_name,
            	count(l.id) as likes
            FROM
            	"post" p
            	JOIN "user" u ON p.author_id = u.id
            	LEFT JOIN "like" l ON p.id = l.post_id
            WHERE
            	p.title ILIKE $1
            	AND u.name = $2
            	AND p.topic in ($3, $4, $5)
            GROUP BY
            	p.id
            ORDER BY
            	count(1) DESC
            HAVING count(1) > $6
            LIMIT 10
            `,
            substitutions: ["query", "username", "topics", "minimum"],
            variables: [null, null, "cats", "dogs", "birds", null],
        });
    });

    test("named variables can be used more than once in a query", () => {
        const result = replacePlaceholders(
            unindent`
            SELECT
            	p.*,
            	u.id AS author_id,
            	u.name AS author_name,
            	count(l.id) as likes
            FROM
            	"post" p
            	JOIN "user" u ON p.author_id = u.id
            	LEFT JOIN "like" l ON p.id = l.post_id
            WHERE
            	(p.title ILIKE :query OR p.body ILIKE :query)
            	AND u.name = :username
            	AND p.topic in (:...topics)
                OR u.favourite_topic IN (:...topics)
            GROUP BY
            	p.id
            ORDER BY
            	count(1) DESC
            HAVING count(1) > :minimum
            LIMIT 10
            `,
            { topics: ["cats", "dogs", "birds"] },
        );
        expect(result).toEqual({
            normalized: unindent`
            SELECT
            	p.*,
            	u.id AS author_id,
            	u.name AS author_name,
            	count(l.id) as likes
            FROM
            	"post" p
            	JOIN "user" u ON p.author_id = u.id
            	LEFT JOIN "like" l ON p.id = l.post_id
            WHERE
            	(p.title ILIKE $1 OR p.body ILIKE $1)
            	AND u.name = $2
            	AND p.topic in ($3, $4, $5)
                OR u.favourite_topic IN ($3, $4, $5)
            GROUP BY
            	p.id
            ORDER BY
            	count(1) DESC
            HAVING count(1) > $6
            LIMIT 10
            `,
            substitutions: ["query", "username", "topics", "minimum"],
            variables: [null, null, "cats", "dogs", "birds", null],
        });
    });
});
