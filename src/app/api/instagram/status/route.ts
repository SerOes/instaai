import { NextResponse } from "next/server"

// GET /api/instagram/status - Check if Instagram OAuth is configured
export async function GET() {
  try {
    const clientId = process.env.INSTAGRAM_CLIENT_ID
    const clientSecret = process.env.INSTAGRAM_CLIENT_SECRET

    const configured = !!(clientId && clientSecret)

    return NextResponse.json({
      configured,
      message: configured 
        ? "Instagram-Verbindung ist bereit"
        : "Instagram-Verbindung ist noch nicht konfiguriert. Bitte setze INSTAGRAM_CLIENT_ID und INSTAGRAM_CLIENT_SECRET."
    })
  } catch (error) {
    console.error("Error checking Instagram status:", error)
    return NextResponse.json({
      configured: false,
      message: "Fehler beim Prüfen des Status"
    })
  }
}
