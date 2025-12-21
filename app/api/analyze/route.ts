import { NextResponse } from "next/server";

const myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");
myHeaders.append("X-Api-Auth", process.env.SHARED_API_KEY || "");

const requestOptions = {
  method: "POST",
  headers: myHeaders,
  redirect: "follow" as RequestRedirect,
};

export async function POST(request: Request) {
  const body = await request.json();
  const { address } = body;
  try {
    const response = await fetch(
      "https://geospatialdatalinkage-production.up.railway.app/run",
      {
        ...requestOptions,
        body: JSON.stringify({ address }),
      }
    );

    if (response.status === 403) {
      throw new Error("Unauthorized request");
    }

    return NextResponse.json({ response: "" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      message: "Uh-oh, there was a problem",
    });
  }
}
