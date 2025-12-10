import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { encryptApiKey } from "@/lib/utils"

interface FacebookPage {
  id: string
  name: string
  access_token: string
  instagram_business_account?: {
    id: string
  }
}

interface InstagramBusinessAccount {
  id: string
  username: string
  profile_picture_url?: string
  followers_count?: number
  media_count?: number
}

// Instagram OAuth Callback
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

    // Exchange code for access token
    const tokenResponse = await fetch("https://graph.facebook.com/v18.0/oauth/access_token", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })

    const tokenUrl = new URL("https://graph.facebook.com/v18.0/oauth/access_token")
    tokenUrl.searchParams.set("client_id", clientId)
    tokenUrl.searchParams.set("client_secret", clientSecret)
    tokenUrl.searchParams.set("redirect_uri", redirectUri)
    tokenUrl.searchParams.set("code", code)

    const tokenRes = await fetch(tokenUrl.toString())
    const tokenData = await tokenRes.json()

    if (tokenData.error) {
      console.error("Token exchange error:", tokenData.error)
      return NextResponse.redirect(
        `${baseUrl}/dashboard/settings/instagram?error=${encodeURIComponent(tokenData.error.message || "Token-Fehler")}`
      )
    }

    const shortLivedToken = tokenData.access_token

    // Exchange for long-lived token (60 days)
    const longLivedUrl = new URL("https://graph.facebook.com/v18.0/oauth/access_token")
    longLivedUrl.searchParams.set("grant_type", "fb_exchange_token")
    longLivedUrl.searchParams.set("client_id", clientId)
    longLivedUrl.searchParams.set("client_secret", clientSecret)
    longLivedUrl.searchParams.set("fb_exchange_token", shortLivedToken)

    const longLivedRes = await fetch(longLivedUrl.toString())
    const longLivedData = await longLivedRes.json()

    const accessToken = longLivedData.access_token || shortLivedToken

    // Get user's Facebook Pages
    const pagesRes = await fetch(
      `https://graph.facebook.com/v18.0/me/accounts?access_token=${accessToken}`
    )
    const pagesData = await pagesRes.json()

    if (!pagesData.data || pagesData.data.length === 0) {
      return NextResponse.redirect(
        `${baseUrl}/dashboard/settings/instagram?error=${encodeURIComponent("Keine Facebook-Seiten gefunden. Bitte verknüpfe eine Facebook-Seite mit deinem Instagram Business-Account.")}`
      )
    }

    // Find pages with Instagram Business accounts
    const connectedAccounts: Array<{
      pageId: string
      pageName: string
      pageToken: string
      instagram: InstagramBusinessAccount
    }> = []

    for (const page of pagesData.data as FacebookPage[]) {
      // Get Instagram Business Account for this page
      const igRes = await fetch(
        `https://graph.facebook.com/v18.0/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`
      )
      const igData = await igRes.json()

      if (igData.instagram_business_account?.id) {
        // Get Instagram account details
        const igDetailsRes = await fetch(
          `https://graph.facebook.com/v18.0/${igData.instagram_business_account.id}?fields=id,username,profile_picture_url,followers_count,media_count&access_token=${page.access_token}`
        )
        const igDetails: InstagramBusinessAccount = await igDetailsRes.json()

        if (igDetails.username) {
          connectedAccounts.push({
            pageId: page.id,
            pageName: page.name,
            pageToken: page.access_token,
            instagram: igDetails
          })
        }
      }
    }

    if (connectedAccounts.length === 0) {
      return NextResponse.redirect(
        `${baseUrl}/dashboard/settings/instagram?error=${encodeURIComponent("Keine Instagram Business-Accounts gefunden. Stelle sicher, dass dein Instagram-Account ein Business- oder Creator-Account ist und mit einer Facebook-Seite verbunden ist.")}`
      )
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: state }
    })

    if (!user) {
      return NextResponse.redirect(
        `${baseUrl}/dashboard/settings/instagram?error=${encodeURIComponent("Benutzer nicht gefunden")}`
      )
    }

    // Save all connected Instagram accounts
    let savedCount = 0
    for (const account of connectedAccounts) {
      // Check if already exists
      const existing = await prisma.instagramAccount.findFirst({
        where: {
          userId: state,
          igBusinessId: account.instagram.id
        }
      })

      if (existing) {
        // Update existing account
        await prisma.instagramAccount.update({
          where: { id: existing.id },
          data: {
            accessTokenEncrypted: encryptApiKey(account.pageToken),
            profilePicture: account.instagram.profile_picture_url,
            username: account.instagram.username,
          }
        })
      } else {
        // Create new account
        await prisma.instagramAccount.create({
          data: {
            userId: state,
            username: account.instagram.username,
            igBusinessId: account.instagram.id,
            accessTokenEncrypted: encryptApiKey(account.pageToken),
            profilePicture: account.instagram.profile_picture_url,
            facebookPageId: account.pageId,
          }
        })
        savedCount++
      }
    }

    // Redirect back to settings with success
    return NextResponse.redirect(
      `${baseUrl}/dashboard/settings/instagram?success=${encodeURIComponent(`${savedCount > 0 ? savedCount + " Instagram-Account(s) verbunden!" : "Instagram-Account aktualisiert!"}`)}`
    )
  } catch (error) {
    console.error("Instagram callback error:", error)
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
    return NextResponse.redirect(
      `${baseUrl}/dashboard/settings/instagram?error=${encodeURIComponent("Fehler bei der Instagram-Verbindung")}`
    )
  }
}
