"use client"

import * as Sentry from "@sentry/nextjs"
import NextError from "next/error"
import { useEffect } from "react"

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string }
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html>
      <body>
        {/* This is the default Next.js error component, kept so styling
            doesn't regress - Sentry.captureException above is what reports
            the error, this component just renders the fallback UI. */}
        <NextError statusCode={0} />
      </body>
    </html>
  )
}
