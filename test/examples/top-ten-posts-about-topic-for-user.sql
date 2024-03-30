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
	LEFT JOIN "like" l ON p.id = l.post_id
WHERE
	p.title ILIKE :query
	AND u.name = :username
	AND p.topic in (:...topics)
GROUP BY
	p.id, u.id, u.name
HAVING count(1) > :minimum
ORDER BY
	count(1) DESC
LIMIT 10
