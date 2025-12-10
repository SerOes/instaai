import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { encryptApiKey } from "@/lib/utils"

// Instagram Business Login API - OAuth Callback
// Using the NEW Instagram API (not Facebook Graph API for initial auth)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get("code")
    const state = searchParams.get("state") // This is the user ID we passed
    const error = searchParams.get("error")
    const errorDescription = searchParams.get("error_description")

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"

    if (error) {
      console.error("Instagram OAuth error:", error, errorDescription)
      return NextResponse.redirect(
        `${baseUrl}/dashboard/settings/instagram?error=${encodeURIComponent(errorDescription || error)}`
      )
    }

    if (!code || !state) {
      return NextResponse.redirect(
        `${baseUrl}/dashboard/settings/instagram?error=${encodeURIComponent("Fehlende Authentifizierungsdaten")}`
      )
    }

    const clientId = process.env.INSTAGRAM_CLIENT_ID
    const clientSecret = process.env.INSTAGRAM_CLIENT_SECRET
    const redirectUri = `${baseUrl}/api/auth/callback/instagram`

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(
        `${baseUrl}/dashboard/settings/instagram?error=${encodeURIComponent("Instagram API nicht konfiguriert")}`
      )
    }

    // Step 1: Exchange code for short-lived access token
    // Using Instagram API endpoint (not Facebook)
    const tokenFormData = new URLSearchParams()
    tokenFormData.append("client_id", clientId)
    tokenFormData.append("client_secret", clientSecret)
    tokenFormData.append("grant_type", "authorization_code")
    tokenFormData.append("redirect_uri", redirectUri)
    tokenFormData.append("code", code)

    const tokenRes = await fetch("https://api.instagram.com/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: tokenFormData.toString(),
    })

    const tokenData = await tokenRes.json()

    if (tokenData.error_type || tokenData.error_message) {
      console.error("Token exchange error:", tokenData)
      return NextResponse.redirect(
        `${baseUrl}/dashboard/settings/instagram?error=${encodeURIComponent(tokenData.error_message || "Token-Fehler")}`
      )
    }

    const shortLivedToken = tokenData.access_token
    const instagramUserId = tokenData.user_id

    if (!shortLivedToken || !instagramUserId) {
      console.error("Missing token or user_id:", tokenData)
      return NextResponse.redirect(
        `${baseUrl}/dashboard/settings/instagram?error=${encodeURIComponent("Ungültige Token-Antwort von Instagram")}`
      )
    }

    // Step 2: Exchange for long-lived token (60 days)
    const longLivedUrl = new URL("https://graph.instagram.com/access_token")
    longLivedUrl.searchParams.set("grant_type", "ig_exchange_token")
    longLivedUrl.searchParams.set("client_secret", clientSecret)
    longLivedUrl.searchParams.set("access_token", shortLivedToken)

    const longLivedRes = await fetch(longLivedUrl.toString())
    const longLivedData = await longLivedRes.json()

    const accessToken = longLivedData.access_token || shortLivedToken
    const expiresIn = longLivedData.expires_in // Usually 5184000 (60 days)

    // Step 3: Get Instagram user profile
    const profileUrl = new URL(`https://graph.instagram.com/v21.0/${instagramUserId}`)
    profileUrl.searchParams.set("fields", "id,username,account_type,profile_picture_url,followers_count,media_count,name")
    profileUrl.searchParams.set("access_token", accessToken)

    const profileRes = await fetch(profileUrl.toString())
    const profileData = await profileRes.json()

    if (profileData.error) {
      console.error("Profile fetch error:", profileData.error)
      return NextResponse.redirect(
        `${baseUrl}/dashboard/settings/instagram?error=${encodeURIComponent(profileData.error.message || "Profil-Fehler")}`
      )
    }

    // Verify user exists in our database
    const user = await prisma.user.findUnique({
      where: { id: state }
    })

    if (!user) {
      return NextResponse.redirect(
        `${baseUrl}/dashboard/settings/instagram?error=${encodeURIComponent("Benutzer nicht gefunden")}`
      )
    }

    // Check if account already exists
    const existing = await prisma.instagramAccount.findFirst({
      where: {
        userId: state,
        igBusinessId: profileData.id
      }
    })

    // Calculate token expiration date
    const tokenExpiresAt = expiresIn 
      ? new Date(Date.now() + expiresIn * 1000)
      : new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // Default 60 days

    if (existing) {
      // Update existing account
      await prisma.instagramAccount.update({
        where: { id: existing.id },
        data: {
          accessTokenEncrypted: encryptApiKey(accessToken),
          profilePicture: profileData.profile_picture_url || null,
          username: profileData.username,
          updatedAt: new Date(),
        }
      })

      return NextResponse.redirect(
        `${baseUrl}/dashboard/settings/instagram?success=${encodeURIComponent("Instagram-Account aktualisiert!")}`
      )
    } else {
      // Create new account
      await prisma.instagramAccount.create({
        data: {
          userId: state,
          username: profileData.username,
          igBusinessId: profileData.id,
          accessTokenEncrypted: encryptApiKey(accessToken),
          profilePicture: profileData.profile_picture_url || null,
          facebookPageId: null, // Not needed for Instagram Business Login
        }
      })

      return NextResponse.redirect(
        `${baseUrl}/dashboard/settings/instagram?success=${encodeURIComponent("Instagram-Account @" + profileData.username + " verbunden!")}`
      )
    }
  } catch (error) {
    console.error("Instagram callback error:", error)
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
    return NextResponse.redirect(
      `${baseUrl}/dashboard/settings/instagram?error=${encodeURIComponent("Fehler bei der Instagram-Verbindung: " + (error instanceof Error ? error.message : "Unbekannt"))}`
    )
  }
}
  }
}
