export default `--
-- This is an example query
--
SELECT
	foo, bar as baz
FROM
	mytable
WHERE
	foo LIKE '%neat%'
ORDER BY
	foo DESC
`;
