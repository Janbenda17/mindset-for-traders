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

    // Get all mentoring groups
    const { data: allGroups, error: groupsError } = await supabase
      .from("mentoring_groups")
      .select("*")

    if (groupsError) throw groupsError

    // Check if user is a mentor
    const { data: mentorGroup } = await supabase
      .from("mentoring_groups")
      .select("*")
      .eq("mentor_id", user.user.id)
      .single()

    // Get groups user is member of
    const { data: memberGroups } = await supabase
      .from("mentoring_group_members")
      .select("group_id")
      .eq("user_id", user.user.id)

    const memberGroupIds = memberGroups?.map((m) => m.group_id) || []
    const userGroups = allGroups?.filter((g) => memberGroupIds.includes(g.id)) || []

    // Get member count for each group
    const groupsWithCounts = await Promise.all(
      userGroups.map(async (group) => {
        const { count } = await supabase
          .from("mentoring_group_members")
          .select("*", { count: "exact", head: true })
          .eq("group_id", group.id)

        return {
          ...group,
          members_count: count || 0,
        }
      })
    )

    return NextResponse.json({
      groups: groupsWithCounts,
      mentorGroup: mentorGroup ? { ...mentorGroup, members_count: 0 } : null,
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

    const { group_name, access_code, description } = await request.json()

    // Create mentoring group
    const { data: group, error: createError } = await supabase
      .from("mentoring_groups")
      .insert({
        name: group_name,
        access_code,
        description,
        mentor_id: user.user.id,
        mentor_name: user.user.user_metadata?.name || "Mentor",
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
