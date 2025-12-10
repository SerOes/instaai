import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { decryptApiKey } from "@/lib/utils"

// POST /api/instagram/accounts/[id]/refresh - Refresh account data from Instagram API
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
        igBusinessId: true,
        accessTokenEncrypted: true,
      }
    })

    if (!account) {
      return NextResponse.json({ error: "Account nicht gefunden" }, { status: 404 })
    }

    if (account.userId !== session.user.id) {
      return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 })
    }

    // Decrypt the access token
    const accessToken = decryptApiKey(account.accessTokenEncrypted)

    // Fetch updated data from Instagram Graph API
    const igRes = await fetch(
      `https://graph.facebook.com/v18.0/${account.igBusinessId}?fields=id,username,profile_picture_url,followers_count,media_count&access_token=${accessToken}`
    )

    if (!igRes.ok) {
      const errorData = await igRes.json()
      console.error("Instagram API error:", errorData)
      
      // Check if token is expired
      if (errorData.error?.code === 190) {
        return NextResponse.json({ 
          error: "Der Zugangstoken ist abgelaufen. Bitte verbinde deinen Account erneut.",
          tokenExpired: true
        }, { status: 401 })
      }

      return NextResponse.json({ error: "Fehler beim Abrufen der Daten von Instagram" }, { status: 500 })
    }

    const igData = await igRes.json()

    // Update the account in the database
    const updatedAccount = await prisma.instagramAccount.update({
      where: { id },
      data: {
        username: igData.username || account.username,
        profilePicture: igData.profile_picture_url,
        followersCount: igData.followers_count,
        mediaCount: igData.media_count,
        lastSynced: new Date(),
      },
      select: {
        id: true,
        username: true,
        profilePicture: true,
        igBusinessId: true,
        followersCount: true,
        mediaCount: true,
        lastSynced: true,
      }
    })

    return NextResponse.json({ 
      success: true,
      message: "Account-Daten wurden aktualisiert",
      account: updatedAccount
    })
  } catch (error) {
    console.error("Error refreshing Instagram account:", error)
    return NextResponse.json({ error: "Fehler beim Aktualisieren des Accounts" }, { status: 500 })
  }
}
