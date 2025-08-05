export async function GET(req: Request) {
	const url = new URL(req.url);
	const searchParams = url.searchParams;
	const response = await fetch(
		`${process.env.NEXT_PUBLIC_API_HOST}/api/ai?${searchParams.toString()}`,
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

export async function POST(req: Request) {
	const url = new URL(req.url);
	const searchParams = url.searchParams;
	const body = await req.json();
	const response = await fetch(
		`${process.env.NEXT_PUBLIC_API_HOST}/api/periodic-scan?${searchParams.toString()}`,
		{
			method: req.method,
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(body),
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

export async function DELETE(req: Request) {
	const url = new URL(req.url);
	const searchParams = url.searchParams;
	const response = await fetch(
		`${process.env.NEXT_PUBLIC_API_HOST}/api/cancel-periodic-scan?${searchParams.toString()}`,
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
