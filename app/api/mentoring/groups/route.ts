import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookieStore.set(name, value, options)
        },
        remove(name: string, options: any) {
          cookieStore.delete(name)
        },
      },
    }
  )

  try {
    const { data: user } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get groups where user is mentor
    const { data: mentorGroups } = await supabase
      .from("mentoring_groups")
      .select("*")
      .eq("mentor_id", user.user.id)

    // Get groups where user is member
    const { data: memberGroupIds } = await supabase
      .from("mentoring_group_members")
      .select("group_id")
      .eq("user_id", user.user.id)

    const memberIds = memberGroupIds?.map((m) => m.group_id) || []

    let memberGroups: any[] = []
    if (memberIds.length > 0) {
      const { data: groups } = await supabase
        .from("mentoring_groups")
        .select("*")
        .in("id", memberIds)
      memberGroups = groups || []
    }

    // Combine and deduplicate
    const allGroupIds = new Set([...(mentorGroups?.map((g) => g.id) || []), ...memberIds])
    const allGroupsMap = new Map()

    mentorGroups?.forEach((g) => allGroupsMap.set(g.id, g))
    memberGroups.forEach((g) => allGroupsMap.set(g.id, g))

    const userGroups = Array.from(allGroupsMap.values())

    return NextResponse.json({
      groups: userGroups,
    })
  } catch (error) {
    console.error("[v0] Error fetching mentoring groups:", error)
    return NextResponse.json(
      { error: "Failed to fetch mentoring groups" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookieStore.set(name, value, options)
        },
        remove(name: string, options: any) {
          cookieStore.delete(name)
        },
      },
    }
  )

  try {
    const { data: user } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, description, code, max_members } = await request.json()

    // Create mentoring group
    const { data: group, error: createError } = await supabase
      .from("mentoring_groups")
      .insert({
        name,
        description,
        code: code.toUpperCase(),
        mentor_id: user.user.id,
        max_members: max_members || 20,
      })
      .select()
      .single()

    if (createError) throw createError

    return NextResponse.json({ group })
  } catch (error) {
    console.error("[v0] Error creating mentoring group:", error)
    return NextResponse.json(
      { error: "Failed to create mentoring group" },
      { status: 500 }
    )
  }
}
