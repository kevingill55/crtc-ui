import { NextRequest, NextResponse } from "next/server";

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
    const response = await fetch(`http://127.0.0.1:5000${apiPath}`, {
      ...requestOptions,
      method: "GET",
    });

    if (response.status === 403) {
      throw new Error("Unauthorized request");
    }

    const res = await response.json();
    return NextResponse.json(res);
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      message: "There was a problem trying to update that user.",
    });
  }
}

export async function DELETE(request: NextRequest) {
  const apiPath = request.nextUrl.pathname;
  try {
    const response = await fetch(`http://127.0.0.1:5000${apiPath}`, {
      ...requestOptions,
      method: "DELETE",
    });

    if (response.status === 403) {
      throw new Error("Unauthorized request");
    }

    const res = await response.json();
    return NextResponse.json(res);
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      message: "There was a problem trying to update that user.",
    });
  }
}

export async function PUT(request: NextRequest) {
  const apiPath = request.nextUrl.pathname;
  const body = await request.json();
  try {
    const response = await fetch(`http://127.0.0.1:5000${apiPath}`, {
      ...requestOptions,
      method: "PUT",
      body: JSON.stringify(body),
    });

    if (response.status === 403) {
      throw new Error("Unauthorized request");
    }

    const res = await response.json();
    return NextResponse.json(res);
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      message: "There was a problem trying to update that user.",
    });
  }
}
