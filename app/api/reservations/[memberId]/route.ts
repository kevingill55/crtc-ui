import { NextResponse, NextRequest } from "next/server";

const myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");
myHeaders.append("X-Api-Auth", process.env.SHARED_API_KEY || "");

const requestOptions = {
  headers: myHeaders,
  redirect: "follow" as RequestRedirect,
};

export async function GET(request: NextRequest) {
  const apiPath = request.nextUrl.pathname;

  try {
    const response = await fetch(`${process.env.API_URL}${apiPath}`, {
      ...requestOptions,
      method: "GET",
    });

    if (response.status === 403) {
      throw new Error("Unauthorized request");
    }

    const res = await response.json();
    console.log("Kevin: res", res);
    return NextResponse.json(res);
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      message: "There was an issue getting your reservations",
    });
  }
}

export async function POST(request: NextRequest) {
  const apiPath = request.nextUrl.pathname;
  const body = await request.json();
  const { slot, court, name, date, players } = body;

  try {
    const response = await fetch(`${process.env.API_URL}${apiPath}`, {
      ...requestOptions,
      method: "POST",
      body: JSON.stringify({
        date,
        slot,
        name,
        court,
        players,
      }),
    });

    if (response.status === 403) {
      throw new Error("Unauthorized request");
    }

    const res = await response.json();
    return NextResponse.json(res);
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      message: "There was an issue creating the reservation",
    });
  }
}
