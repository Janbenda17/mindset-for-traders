export function RecentJournals() {
  const journals = [
    {
      id: 1,
      date: "2023-04-18",
      mood: "Optimistic",
      title: "Stayed disciplined during market volatility",
      content:
        "Today I managed to stick to my trading plan despite high market volatility. I felt the urge to overtrade but remembered my morning affirmation about patience.",
    },
    {
      id: 2,
      date: "2023-04-17",
      mood: "Anxious",
      title: "Struggled with FOMO",
      content:
        "Missed a good entry and spent the day fighting FOMO. Need to work on accepting missed opportunities as part of trading.",
    },
    {
      id: 3,
      date: "2023-04-16",
      mood: "Neutral",
      title: "Followed my system perfectly",
      content:
        "Neither excited nor disappointed today. Simply executed my strategy as planned. This emotional neutrality led to good decisions.",
    },
  ]

  return (
    <div className="space-y-4">
      {journals.map((journal) => (
        <div key={journal.id} className="border rounded-lg p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-medium">{journal.title}</h3>
              <p className="text-sm text-muted-foreground">{journal.date}</p>
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-muted">{journal.mood}</span>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">{journal.content}</p>
        </div>
      ))}
    </div>
  )
}
