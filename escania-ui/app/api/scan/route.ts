export async function GET(req: Request) {
	const url = new URL(req.url);
	const searchParams = url.searchParams;

	const response = await fetch(
		`${process.env.NEXT_PUBLIC_API_HOST}/api/run-scan?${searchParams.toString()}`,
		{
			method: req.method,
			headers: {
				"Content-Type": "application/json",
			},
		},
	);

	const data = await response.json();
	return new Response(JSON.stringify(data), {
		status: response.status,
		headers: {
			"Content-Type": "application/json",
		},
	});
}
