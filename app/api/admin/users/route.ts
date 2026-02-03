import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase environment variables")
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch all users from profiles table
    const { data: users, error } = await supabase
      .from("profiles")
      .select("id, email, full_name, role, avatar_url, created_at, updated_at, xp, level, win_rate, pnl")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching users:", error)
      return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
    }

    // Transform data
    const transformedUsers = users.map((user: any) => ({
      id: user.id,
      email: user.email || "",
      name: user.full_name || "Unknown",
      avatar: user.avatar_url || null,
      role: user.role || "user",
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      xp: user.xp || 0,
      level: user.level || 1,
      winRate: user.win_rate || 0,
      pnl: user.pnl || 0,
    }))

    console.log(`[v0] Fetched ${transformedUsers.length} users for admin panel`)
    return NextResponse.json({ users: transformedUsers }, { status: 200 })
  } catch (error) {
    console.error("[v0] Error in users endpoint:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
