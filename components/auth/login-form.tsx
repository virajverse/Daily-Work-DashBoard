"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { login } from "@/app/server-actions/auth"

export function LoginForm() {
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-balance">Taliyo Technologies</CardTitle>
        <CardDescription className="text-pretty">Enter the dashboard password</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            setError(null)
            startTransition(async () => {
              const res = await login(password)
              if (res?.ok) {
                router.replace("/")
              } else {
                setError(res?.message || "Invalid password")
              }
            })
          }}
          className="space-y-3"
        >
          <Input
            type="password"
            name="password"
            autoComplete="current-password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-label="Dashboard password"
            required
          />
          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Checking..." : "Login"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
