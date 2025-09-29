// app/api/posts/[subreddit]/route.ts
import { NextResponse } from "next/server";

export async function GET(_: Request, { params }: { params: { subreddit: string } }) {
  const res = await fetch(`http://localhost:8000/api/posts/${params.subreddit}`);
  const data = await res.json();
  return NextResponse.json(data);
}
