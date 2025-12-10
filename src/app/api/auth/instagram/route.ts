import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

// Instagram Business Login OAuth - Start the authorization flow
// Using the NEW Instagram Business Login API (not Facebook OAuth)
export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.redirect(new URL("/auth/login", process.env.NEXTAUTH_URL || "http://localhost:3000"))
    }

    const clientId = process.env.INSTAGRAM_CLIENT_ID
    const redirectUri = `${process.env.NEXTAUTH_URL}/api/auth/callback/instagram`

    if (!clientId) {
      return NextResponse.json(
        { error: "Instagram Client ID nicht konfiguriert" },
        { status: 500 }
      )
    }

    // Instagram Business Login API Scopes
    // See: https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/business-login
    const scopes = [
      "instagram_business_basic",
      "instagram_business_content_publish",
      "instagram_business_manage_comments",
      "instagram_business_manage_messages",
    ].join(",")

    // NEW: Using Instagram OAuth directly (not Facebook OAuth)
    // This is the correct endpoint for Instagram Business Login
    const authUrl = new URL("https://www.instagram.com/oauth/authorize")
    authUrl.searchParams.set("client_id", clientId)
    authUrl.searchParams.set("redirect_uri", redirectUri)
    authUrl.searchParams.set("scope", scopes)
    authUrl.searchParams.set("response_type", "code")
    authUrl.searchParams.set("state", session.user.id) // Pass user ID for callback

    return NextResponse.redirect(authUrl.toString())
  } catch (error) {
    console.error("Instagram OAuth error:", error)
    return NextResponse.json(
      { error: "Fehler beim Starten der Instagram-Authentifizierung" },
      { status: 500 }
    )
  }
}
