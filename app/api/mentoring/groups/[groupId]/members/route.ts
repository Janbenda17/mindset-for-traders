import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: { groupId: string } }
) {
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

    // Get group
    const { data: group, error: groupError } = await supabase
      .from("mentoring_groups")
      .select("*")
      .eq("id", params.groupId)
      .single()

    if (groupError) throw groupError

    // Check if user is mentor or member
    const isMentor = group.mentor_id === user.user.id
    const { data: membership } = await supabase
      .from("mentoring_group_members")
      .select("*")
      .eq("group_id", params.groupId)
      .eq("user_id", user.user.id)
      .single()

    if (!isMentor && !membership) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      )
    }

    // Get group members
    const { data: members, error: membersError } = await supabase
      .from("mentoring_group_members")
      .select("*")
      .eq("group_id", params.groupId)

    if (membersError) throw membersError

    // Get today's date
    const today = new Date().toISOString().split("T")[0]

    // Enrich members with user info and today's stats
    const membersWithStats = await Promise.all(
      (members || []).map(async (member) => {
        // Try to get user profile
        const { data: userProfile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", member.user_id)
          .single()

        // Get today's stats
        const { data: todayStats } = await supabase
          .from("mentoring_group_stats")
          .select("*")
          .eq("group_id", params.groupId)
          .eq("user_id", member.user_id)
          .eq("date", today)
          .single()

        return {
          ...member,
          user_name: userProfile?.full_name || "Uživatel",
          user_email: userProfile?.email,
          today_stats: todayStats || null,
        }
      })
    )

    return NextResponse.json({ group, members: membersWithStats })
  } catch (error) {
    console.error("[v0] Error fetching group members:", error)
    return NextResponse.json(
      { error: "Failed to fetch group members" },
      { status: 500 }
    )
  }
}
