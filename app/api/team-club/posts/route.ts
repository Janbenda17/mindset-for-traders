import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    const { data, error } = await supabase
      .from("team_club_posts")
      .select("*")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error("[v0] Error fetching team club posts:", error)
      return NextResponse.json({ ok: false, error: { code: error.code, message: error.message } }, { status: 500 })
    }

    return NextResponse.json({ ok: true, data: data || [] })
  } catch (error: any) {
    console.error("[v0] Error in team club API:", error)
    return NextResponse.json({ ok: false, error: { code: "INTERNAL_ERROR", message: error.message } }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error("[v0] Unauthorized team club post attempt")
      return NextResponse.json({ ok: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } }, { status: 401 })
    }

    const body = await request.json()
    const { post } = body

    if (!post) {
      return NextResponse.json(
        { ok: false, error: { code: "MISSING_FIELDS", message: "Missing post data" } },
        { status: 400 },
      )
    }

    console.log("[v0] Creating team club post for authenticated user:", user.id)

    const { data, error } = await supabase
      .from("team_club_posts")
      .insert({
        user_id: user.id,
        author_name: post.authorName,
        author_nickname: post.authorNickname,
        title: post.title,
        content: post.content,
        post_type: post.postType,
        tags: post.tags || [],
        visibility: post.visibility || "public",
      })
      .select()
      .maybeSingle()

    if (error) {
      console.error("[v0] Error inserting team club post:", error)
      return NextResponse.json({ ok: false, error: { code: error.code, message: error.message } }, { status: 500 })
    }

    console.log("[v0] Team club post inserted successfully with RLS protection")
    return NextResponse.json({ ok: true, data })
  } catch (error: any) {
    console.error("[v0] Error in team club API:", error)
    return NextResponse.json({ ok: false, error: { code: "INTERNAL_ERROR", message: error.message } }, { status: 500 })
  }
}
