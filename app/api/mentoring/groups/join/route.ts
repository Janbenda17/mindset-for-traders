import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Handle error
            }
          },
        },
      }
    )

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { code } = await request.json()
    if (!code) {
      return NextResponse.json({ error: "Group code is required" }, { status: 400 })
    }

    // Find group by code
    const { data: group, error: groupError } = await supabase
      .from("mentoring_groups")
      .select("*")
      .eq("code", code.toUpperCase())
      .single()

    if (groupError || !group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 })
    }

    // Check if user is already in the group
    const { data: existingMember } = await supabase
      .from("mentoring_group_members")
      .select("id")
      .eq("group_id", group.id)
      .eq("user_id", user.id)
      .single()

    if (existingMember) {
      return NextResponse.json({ error: "Already a member of this group" }, { status: 400 })
    }

    // Check if group is full
    const { count: memberCount } = await supabase
      .from("mentoring_group_members")
      .select("id", { count: "exact" })
      .eq("group_id", group.id)

    if ((memberCount || 0) >= group.max_members) {
      return NextResponse.json({ error: "Group is full" }, { status: 400 })
    }

    // Add user to group
    const { error: insertError } = await supabase.from("mentoring_group_members").insert({
      group_id: group.id,
      user_id: user.id,
      role: "member",
    })

    if (insertError) {
      console.error("Error adding member to group:", insertError)
      return NextResponse.json({ error: "Failed to join group" }, { status: 500 })
    }

    return NextResponse.json({ success: true, group })
  } catch (error) {
    console.error("Error in join group endpoint:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
