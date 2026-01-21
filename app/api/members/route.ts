import { NextRequest, NextResponse } from "next/server";

const myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");
myHeaders.append("X-Api-Auth", process.env.SHARED_API_KEY || "");

const requestOptions = {
  headers: myHeaders,
  redirect: "follow" as RequestRedirect,
};

const VALID_FILTER_STATUSES = ["WAITLIST", "ACTIVE"];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const statusParam = searchParams.get("status") || "";
  let searchParam = "";
  if (VALID_FILTER_STATUSES.includes(statusParam))
    searchParam = `?status=${statusParam}`;
  try {
    const response = await fetch(
      `http://127.0.0.1:5000/api/members${searchParam}`,
      {
        ...requestOptions,
        method: "GET",
      }
    );

    if (response.status === 403) {
      throw new Error("Unauthorized request");
    }

    const res = await response.json();
    return NextResponse.json(res);
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      message: "Uh-oh there was a problem",
    });
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const { email, firstName, lastName, phone, plan, address, rating, gender } =
    body;

  try {
    const response = await fetch(`http://127.0.0.1:5000/api/members`, {
      ...requestOptions,
      method: "POST",
      body: JSON.stringify({
        gender,
        rating,
        email,
        address,
        plan,
        first_name: firstName,
        last_name: lastName,
        phone_number: phone,
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
      message: "Uh-oh there was an issue adding you to the waitlist",
    });
  }
}
