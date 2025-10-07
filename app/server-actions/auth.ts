"use server"

import { cookies } from "next/headers"

const COOKIE_NAME = "tt_auth"

export async function login(password: string) {
  const expected = process.env.DASHBOARD_PASSWORD || "viraj" // set DASHBOARD_PASSWORD in Vars for production
  if (!password || password !== expected) {
    return { ok: false, message: "Incorrect password" }
  }
  const c = await cookies()
  c.set(COOKIE_NAME, "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  })
  return { ok: true }
}

export async function logout() {
  const c = await cookies()
  c.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 0,
  })
  return { ok: true }
}

export async function isAuthed() {
  const c = await cookies()
  return c.get(COOKIE_NAME)?.value === "1"
}
