import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { decryptApiKey, encryptApiKey } from "@/lib/utils"

// POST /api/instagram/accounts/[id]/refresh-token - Refresh the access token
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
    }

    const { id } = await params

    // Find the account and verify ownership
    const account = await prisma.instagramAccount.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        username: true,
        accessTokenEncrypted: true,
      }
    })

    if (!account) {
      return NextResponse.json({ error: "Account nicht gefunden" }, { status: 404 })
    }

    if (account.userId !== session.user.id) {
      return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 })
    }

    // Decrypt the current access token
    const currentToken = decryptApiKey(account.accessTokenEncrypted)

    // Try to refresh the long-lived token
    // Note: Long-lived tokens can be refreshed if they haven't expired
    // They last 60 days and can be refreshed when they have less than 60 days left
    const clientId = process.env.INSTAGRAM_CLIENT_ID
    const clientSecret = process.env.INSTAGRAM_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      return NextResponse.json({ 
        error: "Instagram API nicht konfiguriert" 
      }, { status: 500 })
    }

    // Exchange for a new long-lived token
    const refreshUrl = new URL("https://graph.facebook.com/v18.0/oauth/access_token")
    refreshUrl.searchParams.set("grant_type", "fb_exchange_token")
    refreshUrl.searchParams.set("client_id", clientId)
    refreshUrl.searchParams.set("client_secret", clientSecret)
    refreshUrl.searchParams.set("fb_exchange_token", currentToken)

    const refreshRes = await fetch(refreshUrl.toString())
    const refreshData = await refreshRes.json()

    if (refreshData.error) {
      console.error("Token refresh error:", refreshData.error)
      
      // If token refresh fails, user needs to reconnect
      return NextResponse.json({ 
        error: "Token konnte nicht aktualisiert werden. Bitte verbinde deinen Account erneut.",
        needsReconnect: true
      }, { status: 401 })
    }

    // Calculate expiration date (60 days from now for long-lived tokens)
    const expiresAt = new Date()
    expiresAt.setSeconds(expiresAt.getSeconds() + (refreshData.expires_in || 5184000)) // 60 days default

    // Update the token in the database
    await prisma.instagramAccount.update({
      where: { id },
      data: {
        accessTokenEncrypted: encryptApiKey(refreshData.access_token),
        tokenExpiresAt: expiresAt,
      }
    })

    return NextResponse.json({ 
      success: true,
      message: "Token wurde erfolgreich aktualisiert",
      expiresAt: expiresAt.toISOString()
    })
  } catch (error) {
    console.error("Error refreshing token:", error)
    return NextResponse.json({ error: "Fehler beim Aktualisieren des Tokens" }, { status: 500 })
  }
}
