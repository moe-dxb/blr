
"use client"

import * as React from "react"

export function useMediaQuery(query: string) {
  const subscribe = React.useCallback(
    (callback: () => void) => {
      const matchMedia = window.matchMedia(query)

      matchMedia.addEventListener("change", callback)
      return () => {
        matchMedia.removeEventListener("change", callback)
      }
    },
    [query]
  )

  const getSnapshot = () => {
    return window.matchMedia(query).matches
  }

  const getServerSnapshot = () => {
    return false
  }

  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
