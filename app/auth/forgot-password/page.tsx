"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Loader2, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import Image from "next/image"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [codeSent, setCodeSent] = useState(false)
  const [verificationCode, setVerificationCode] = useState("")
  const router = useRouter()

  const handleSendCode = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // In a real app, you would send a verification code here
      setCodeSent(true)
      toast({
        title: "Verification code sent",
        description: "Please check your email for the verification code",
      })
    } catch (error) {
      toast({
        title: "Failed to send code",
        description: error.message || "Please try again later",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyCode = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // In a real app, you would verify the code here
      toast({
        title: "Code verified",
        description: "You can now reset your password",
      })
      router.push("/auth/reset-password")
    } catch (error) {
      toast({
        title: "Invalid code",
        description: error.message || "Please check the code and try again",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-zinc-900 to-black">
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="mb-8">
            <Link href="/">
              <Image
                src="/images/dark-side-logo.png"
                alt="Composition Converter"
                width={120}
                height={72}
                className="mb-6"
              />
            </Link>

            <div className="flex items-center gap-2 mb-4">
              <Link href="/auth/login" className="text-cyan-400 hover:text-cyan-300">
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <h2 className="text-2xl font-bold text-white">Forgot Password</h2>
            </div>

            <div className="flex items-center justify-center mb-6">
              <div className="bg-cyan-500/20 rounded-full p-3">
                <Lock className="h-6 w-6 text-cyan-400" />
              </div>
            </div>

            <p className="text-sm text-zinc-400 text-center mb-6">
              {codeSent
                ? "Enter the verification code sent to your email"
                : "Enter your email address to receive verification code"}
            </p>
          </div>

          {!codeSent ? (
            <form className="space-y-6" onSubmit={handleSendCode}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-zinc-300">
                  Email address
                </label>
                <div className="mt-1">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-zinc-800/50 border-zinc-700 text-white"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <Button
                  type="submit"
                  className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending code...
                    </>
                  ) : (
                    "Send Code"
                  )}
                </Button>
              </div>
            </form>
          ) : (
            <form className="space-y-6" onSubmit={handleVerifyCode}>
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-zinc-300">
                  Verification Code
                </label>
                <div className="mt-1">
                  <Input
                    id="code"
                    name="code"
                    type="text"
                    required
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="bg-zinc-800/50 border-zinc-700 text-white"
                    placeholder="Enter verification code"
                  />
                </div>
              </div>

              <div>
                <Button
                  type="submit"
                  className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify Code"
                  )}
                </Button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  className="text-sm text-cyan-400 hover:text-cyan-300"
                  onClick={() => setCodeSent(false)}
                >
                  Use a different email
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-zinc-400">
              Remember your password?{" "}
              <Link href="/auth/login" className="font-medium text-cyan-400 hover:text-cyan-300">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
      <div className="hidden lg:block relative w-0 flex-1">
        <img
          className="absolute inset-0 h-full w-full object-cover"
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Forgot%20password-zDA4Zyxo9RCpbAri0XuFWGvbV81pZ8.png"
          alt="AI music generation"
        />
      </div>
    </div>
  )
}
