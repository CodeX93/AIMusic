"use client"

import { Slider } from "@/components/ui/slider"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"
import { User, Bell, Shield, Palette, Volume2, Save, Loader2 } from "lucide-react"

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState({
    name: "Wade Warren",
    email: "wade.warren@example.com",
    avatar:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/placeholder-ob7miW3mUreePYfXdVwkpFWHthzoR5.svg?height=80&width=80&query=person+profile+avatar",
  })

  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      remixComplete: true,
      generationComplete: true,
      newFeatures: true,
      marketing: false,
    },
    privacy: {
      shareActivity: true,
      publicProfile: false,
      allowDataCollection: true,
    },
    appearance: {
      theme: "dark",
      accentColor: "cyan",
      fontSize: "medium",
    },
    audio: {
      outputQuality: "high",
      autoPlay: true,
      defaultVolume: 80,
    },
    language: "en",
  })

  const handleSettingChange = (category, setting, value) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value,
      },
    }))
  }

  const handleSaveSettings = async () => {
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="mt-2 text-zinc-400">Manage your account settings and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-8">
          <TabsTrigger value="profile">
            <User className="mr-2 h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="privacy">
            <Shield className="mr-2 h-4 w-4" />
            Privacy
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Palette className="mr-2 h-4 w-4" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="audio">
            <Volume2 className="mr-2 h-4 w-4" />
            Audio
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-0">
          <div className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <img
                  src={user.avatar || "/placeholder.svg"}
                  alt="Profile"
                  className="h-24 w-24 rounded-full object-cover"
                />
                <Button
                  size="sm"
                  className="absolute bottom-0 right-0 rounded-full bg-cyan-500 hover:bg-cyan-600 h-8 w-8 p-0"
                >
                  <span className="sr-only">Change avatar</span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                    <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
                    <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
                  </svg>
                </Button>
              </div>
              <div>
                <h2 className="text-xl font-semibold">{user.name}</h2>
                <p className="text-zinc-400">{user.email}</p>
                <p className="mt-2 text-sm text-cyan-400">Free Plan</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-zinc-300">
                  Full Name
                </label>
                <Input
                  id="name"
                  value={user.name}
                  onChange={(e) => setUser({ ...user, name: e.target.value })}
                  className="mt-1 bg-zinc-800/50 border-zinc-700"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-zinc-300">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  value={user.email}
                  onChange={(e) => setUser({ ...user, email: e.target.value })}
                  className="mt-1 bg-zinc-800/50 border-zinc-700"
                />
              </div>
            </div>

            <div>
              <label htmlFor="language" className="block text-sm font-medium text-zinc-300">
                Language
              </label>
              <Select
                value={settings.language}
                onValueChange={(value) => setSettings({ ...settings, language: value })}
              >
                <SelectTrigger className="mt-1 w-full bg-zinc-800/50 border-zinc-700">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-700">
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                  <SelectItem value="ja">Japanese</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Button
                variant="destructive"
                className="bg-red-900/30 hover:bg-red-900/50 text-red-400 border border-red-900/50"
              >
                Delete Account
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="mt-0">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">Notification Channels</h3>
              <p className="text-sm text-zinc-400">Choose how you want to receive notifications</p>
              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Email Notifications</h4>
                    <p className="text-sm text-zinc-500">Receive notifications via email</p>
                  </div>
                  <Switch
                    checked={settings.notifications.email}
                    onCheckedChange={(checked) => handleSettingChange("notifications", "email", checked)}
                    className="data-[state=checked]:bg-cyan-500"
                  />
                </div>
                <Separator className="bg-zinc-800" />
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Push Notifications</h4>
                    <p className="text-sm text-zinc-500">Receive notifications in your browser</p>
                  </div>
                  <Switch
                    checked={settings.notifications.push}
                    onCheckedChange={(checked) => handleSettingChange("notifications", "push", checked)}
                    className="data-[state=checked]:bg-cyan-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium">Notification Types</h3>
              <p className="text-sm text-zinc-400">Select which notifications you want to receive</p>
              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Remix Complete</h4>
                    <p className="text-sm text-zinc-500">When your remix is processed and ready</p>
                  </div>
                  <Switch
                    checked={settings.notifications.remixComplete}
                    onCheckedChange={(checked) => handleSettingChange("notifications", "remixComplete", checked)}
                    className="data-[state=checked]:bg-cyan-500"
                  />
                </div>
                <Separator className="bg-zinc-800" />
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Generation Complete</h4>
                    <p className="text-sm text-zinc-500">When your text-to-audio generation is ready</p>
                  </div>
                  <Switch
                    checked={settings.notifications.generationComplete}
                    onCheckedChange={(checked) => handleSettingChange("notifications", "generationComplete", checked)}
                    className="data-[state=checked]:bg-cyan-500"
                  />
                </div>
                <Separator className="bg-zinc-800" />
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">New Features</h4>
                    <p className="text-sm text-zinc-500">Updates about new features and improvements</p>
                  </div>
                  <Switch
                    checked={settings.notifications.newFeatures}
                    onCheckedChange={(checked) => handleSettingChange("notifications", "newFeatures", checked)}
                    className="data-[state=checked]:bg-cyan-500"
                  />
                </div>
                <Separator className="bg-zinc-800" />
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Marketing</h4>
                    <p className="text-sm text-zinc-500">Promotional offers and newsletters</p>
                  </div>
                  <Switch
                    checked={settings.notifications.marketing}
                    onCheckedChange={(checked) => handleSettingChange("notifications", "marketing", checked)}
                    className="data-[state=checked]:bg-cyan-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="privacy" className="mt-0">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">Privacy Settings</h3>
              <p className="text-sm text-zinc-400">Control your privacy and data sharing preferences</p>
              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Share Activity</h4>
                    <p className="text-sm text-zinc-500">Allow others to see your remixes and activity</p>
                  </div>
                  <Switch
                    checked={settings.privacy.shareActivity}
                    onCheckedChange={(checked) => handleSettingChange("privacy", "shareActivity", checked)}
                    className="data-[state=checked]:bg-cyan-500"
                  />
                </div>
                <Separator className="bg-zinc-800" />
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Public Profile</h4>
                    <p className="text-sm text-zinc-500">Make your profile visible to other users</p>
                  </div>
                  <Switch
                    checked={settings.privacy.publicProfile}
                    onCheckedChange={(checked) => handleSettingChange("privacy", "publicProfile", checked)}
                    className="data-[state=checked]:bg-cyan-500"
                  />
                </div>
                <Separator className="bg-zinc-800" />
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Data Collection</h4>
                    <p className="text-sm text-zinc-500">Allow anonymous usage data to improve our services</p>
                  </div>
                  <Switch
                    checked={settings.privacy.allowDataCollection}
                    onCheckedChange={(checked) => handleSettingChange("privacy", "allowDataCollection", checked)}
                    className="data-[state=checked]:bg-cyan-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium">Data Management</h3>
              <p className="text-sm text-zinc-400">Manage your personal data</p>
              <div className="mt-4 space-y-4">
                <Button variant="outline" className="border-zinc-700">
                  Download My Data
                </Button>
                <div className="block">
                  <Button
                    variant="destructive"
                    className="bg-red-900/30 hover:bg-red-900/50 text-red-400 border border-red-900/50"
                  >
                    Delete All My Data
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="appearance" className="mt-0">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">Theme</h3>
              <p className="text-sm text-zinc-400">Select your preferred theme</p>
              <div className="mt-4 grid grid-cols-3 gap-4">
                <div
                  className={`cursor-pointer rounded-lg border p-4 ${
                    settings.appearance.theme === "dark"
                      ? "border-cyan-500 bg-cyan-500/10"
                      : "border-zinc-700 bg-zinc-800/50"
                  }`}
                  onClick={() => handleSettingChange("appearance", "theme", "dark")}
                >
                  <div className="h-20 rounded bg-zinc-900"></div>
                  <p className="mt-2 text-center text-sm">Dark</p>
                </div>
                <div
                  className={`cursor-pointer rounded-lg border p-4 ${
                    settings.appearance.theme === "light"
                      ? "border-cyan-500 bg-cyan-500/10"
                      : "border-zinc-700 bg-zinc-800/50"
                  }`}
                  onClick={() => handleSettingChange("appearance", "theme", "light")}
                >
                  <div className="h-20 rounded bg-zinc-200"></div>
                  <p className="mt-2 text-center text-sm">Light</p>
                </div>
                <div
                  className={`cursor-pointer rounded-lg border p-4 ${
                    settings.appearance.theme === "system"
                      ? "border-cyan-500 bg-cyan-500/10"
                      : "border-zinc-700 bg-zinc-800/50"
                  }`}
                  onClick={() => handleSettingChange("appearance", "theme", "system")}
                >
                  <div className="h-20 rounded bg-gradient-to-r from-zinc-900 to-zinc-200"></div>
                  <p className="mt-2 text-center text-sm">System</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium">Accent Color</h3>
              <p className="text-sm text-zinc-400">Choose your preferred accent color</p>
              <div className="mt-4 grid grid-cols-5 gap-4">
                {["cyan", "purple", "blue", "green", "amber"].map((color) => (
                  <div
                    key={color}
                    className={`cursor-pointer rounded-lg border p-4 ${
                      settings.appearance.accentColor === color
                        ? "border-cyan-500 bg-cyan-500/10"
                        : "border-zinc-700 bg-zinc-800/50"
                    }`}
                    onClick={() => handleSettingChange("appearance", "accentColor", color)}
                  >
                    <div
                      className={`h-10 rounded-full bg-${color}-500`}
                      style={{ backgroundColor: `var(--${color}-500, #00c0c0)` }}
                    ></div>
                    <p className="mt-2 text-center text-sm capitalize">{color}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium">Font Size</h3>
              <p className="text-sm text-zinc-400">Adjust the text size</p>
              <div className="mt-4">
                <Select
                  value={settings.appearance.fontSize}
                  onValueChange={(value) => handleSettingChange("appearance", "fontSize", value)}
                >
                  <SelectTrigger className="w-full bg-zinc-800/50 border-zinc-700">
                    <SelectValue placeholder="Select font size" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-700">
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="audio" className="mt-0">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">Audio Quality</h3>
              <p className="text-sm text-zinc-400">Set your preferred audio output quality</p>
              <div className="mt-4">
                <Select
                  value={settings.audio.outputQuality}
                  onValueChange={(value) => handleSettingChange("audio", "outputQuality", value)}
                >
                  <SelectTrigger className="w-full bg-zinc-800/50 border-zinc-700">
                    <SelectValue placeholder="Select audio quality" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-700">
                    <SelectItem value="low">Low (128kbps)</SelectItem>
                    <SelectItem value="medium">Medium (256kbps)</SelectItem>
                    <SelectItem value="high">High (320kbps)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium">Playback Settings</h3>
              <p className="text-sm text-zinc-400">Configure how audio plays in the app</p>
              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Auto-Play</h4>
                    <p className="text-sm text-zinc-500">Automatically play audio when generated</p>
                  </div>
                  <Switch
                    checked={settings.audio.autoPlay}
                    onCheckedChange={(checked) => handleSettingChange("audio", "autoPlay", checked)}
                    className="data-[state=checked]:bg-cyan-500"
                  />
                </div>
                <Separator className="bg-zinc-800" />
                <div>
                  <h4 className="font-medium mb-2">Default Volume</h4>
                  <div className="flex items-center gap-4">
                    <Volume2 className="h-5 w-5 text-zinc-500" />
                    <Slider
                      value={[settings.audio.defaultVolume]}
                      min={0}
                      max={100}
                      step={1}
                      onValueChange={(value) => handleSettingChange("audio", "defaultVolume", value[0])}
                      className="flex-1 [&>span]:bg-cyan-500"
                    />
                    <span className="w-8 text-right">{settings.audio.defaultVolume}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-8 flex justify-end">
        <Button onClick={handleSaveSettings} className="bg-cyan-500 hover:bg-cyan-600 text-black" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
