import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

// Instagram OAuth - Start the authorization flow
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

    // For Instagram Basic Display API
    // Scopes: user_profile, user_media
    const scopes = [
      "instagram_basic",
      "instagram_content_publish",
      "instagram_manage_comments",
      "instagram_manage_insights",
      "pages_show_list",
      "pages_read_engagement",
      "business_management"
    ].join(",")

    // Using Facebook OAuth for Instagram Business accounts
    // This requires a Facebook Page connected to an Instagram Business Account
    const authUrl = new URL("https://www.facebook.com/v18.0/dialog/oauth")
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
