import { NextResponse } from "next/server"

// API key yang diberikan
const API_KEY = "sk_ef1c339bb362fd09aedad8f2cf572648733877d2d8cf6c85"
const API_URL = "https://api.elevenlabs.io/v1/text-to-speech"

export async function POST(request) {
  try {
    const { prompt, voice = "21m00Tcm4TlvDq8ikWAM", model = "eleven_monolingual_v1" } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    console.log(`[API] Text-to-speech requested: "${prompt}", voice: ${voice}, model: ${model}`)

    // Konfigurasi untuk ElevenLabs API
    const voiceSettings = {
      stability: 0.5,
      similarity_boost: 0.75,
    }

    // Membuat request ke ElevenLabs API
    const response = await fetch(`${API_URL}/${voice}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": API_KEY,
      },
      body: JSON.stringify({
        text: prompt,
        model_id: model,
        voice_settings: voiceSettings,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("ElevenLabs API error:", errorData)
      return NextResponse.json(
        { error: `ElevenLabs API error: ${response.status} ${response.statusText}` },
        { status: response.status },
      )
    }

    // Mendapatkan audio sebagai ArrayBuffer
    const audioBuffer = await response.arrayBuffer()

    // Mengkonversi ArrayBuffer ke Base64 untuk dikirim ke client
    const audioBase64 = Buffer.from(audioBuffer).toString("base64")

    return NextResponse.json({
      success: true,
      audioData: audioBase64,
      contentType: "audio/mpeg",
      voice: voice,
      model: model,
    })
  } catch (error) {
    console.error("Error in text-to-speech API:", error)
    return NextResponse.json({ error: error.message || "Failed to generate speech" }, { status: 500 })
  }
}
