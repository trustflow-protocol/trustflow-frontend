import { useCallback, useEffect, useMemo, useState } from 'react'
import type { UserProfileResponse } from '../pages/api/profile'

type ProfileStatus = 'idle' | 'loading' | 'success' | 'error'

interface UseUserProfileResult {
  profile: UserProfileResponse | null
  status: ProfileStatus
  error: string | null
  refetch: () => Promise<void>
}

export function useUserProfile(walletAddress?: string): UseUserProfileResult {
  const [profile, setProfile] = useState<UserProfileResponse | null>(null)
  const [status, setStatus] = useState<ProfileStatus>('idle')
  const [error, setError] = useState<string | null>(null)

  const query = useMemo(() => {
    const value = walletAddress?.trim()
    if (!value) {
      return ''
    }
    return `?walletAddress=${encodeURIComponent(value)}`
  }, [walletAddress])

  const fetchProfile = useCallback(async () => {
    setStatus('loading')
    setError(null)

    try {
      const response = await fetch(`/api/profile${query}`)
      if (!response.ok) {
        throw new Error(`Failed to load profile: ${response.status}`)
      }

      const payload = (await response.json()) as UserProfileResponse
      setProfile(payload)
      setStatus('success')
    } catch {
      setProfile(null)
      setStatus('error')
      setError('Unable to load profile data. Please try again.')
    }
  }, [query])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  return {
    profile,
    status,
    error,
    refetch: fetchProfile,
  }
}