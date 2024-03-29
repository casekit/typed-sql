--- query: string
--- username: string
--- minimum: number
SELECT
	p.*,
	u.id AS author_id,
	u.name AS author_name,
	count(l.id) as likes
FROM
	"post" p
	JOIN "user" u ON p.author_id = u.id
	LEFT JOIN "likes" l ON p.id = l.post_id
WHERE
	p.title ILIKE :query
	AND u.name = :username
GROUP BY
	p.id
ORDER BY
	count(1) DESC
HAVING count(1) > :minimum
LIMIT 10
