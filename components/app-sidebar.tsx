"use client"

import type * as React from "react"
import { BookOpen, Bot, Settings2, SquareTerminal, TrendingUp, Brain, Target, BarChart3, Heart } from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar"

// This is sample data.
const data = {
  user: {
    name: "Trader",
    email: "trader@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Trader Mindset",
      logo: Brain,
      plan: "Premium",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: SquareTerminal,
      isActive: true,
    },
    {
      title: "Journal",
      url: "/journal",
      icon: BookOpen,
      items: [
        {
          title: "Nový záznam",
          url: "/journal/new",
        },
        {
          title: "Historie",
          url: "/journal",
        },
        {
          title: "Kalendář",
          url: "/journal/calendar",
        },
      ],
    },
    {
      title: "Analýzy",
      url: "/analytics",
      icon: BarChart3,
      items: [
        {
          title: "Přehled",
          url: "/analytics",
        },
        {
          title: "Pokročilé",
          url: "/analytics/advanced",
        },
        {
          title: "Trendy nálad",
          url: "/analytics/mood-trends",
        },
      ],
    },
    {
      title: "Trading Tracker",
      url: "/trading-tracker",
      icon: TrendingUp,
    },
    {
      title: "Team Club",
      url: "/team-club",
      icon: Heart,
      items: [
        {
          title: "Komunita",
          url: "/team-club",
        },
        {
          title: "Mentoring",
          url: "/team-club/mentoring",
        },
        {
          title: "Výzvy",
          url: "/team-club/challenges",
        },
      ],
    },
    {
      title: "MindTrader AI",
      url: "/mindtrader",
      icon: Bot,
      items: [
        {
          title: "Základní",
          url: "/mindtrader",
        },
        {
          title: "Pro verze",
          url: "/mindtrader-pro",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Cíle",
      url: "/goals",
      icon: Target,
    },
    {
      name: "Zdroje",
      url: "/resources",
      icon: BookOpen,
    },
    {
      name: "Nastavení",
      url: "/settings",
      icon: Settings2,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
