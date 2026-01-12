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
  const { userId } = body;
  try {
    const response = await fetch("http://127.0.0.1:5000/api/user", {
      ...requestOptions,
      body: JSON.stringify({ id: userId }),
    });

    if (response.status === 403) {
      throw new Error("Unauthorized request");
    }
    const res = await response.json();
    return NextResponse.json(res);
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      message: "Uh-oh, there was a problem",
    });
  }
}
