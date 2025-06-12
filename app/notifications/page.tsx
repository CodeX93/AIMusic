"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bell, Music, Wand2, Star, Settings, Trash2, CheckCircle } from "lucide-react"

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Remix Complete",
      message: "Your remix 'Neon Dreams' has been successfully processed and is ready to play.",
      date: "2024-03-14",
      time: "14:32",
      type: "remix",
      read: false,
    },
    {
      id: 2,
      title: "New Feature Available",
      message: "Try our new voice cloning feature in beta! Create vocals that sound like you.",
      date: "2024-03-13",
      time: "09:15",
      type: "system",
      read: false,
    },
    {
      id: 3,
      title: "Audio Generation Complete",
      message: "Your text-to-audio generation 'Ambient Soundscape' is ready to listen.",
      date: "2024-03-12",
      time: "16:45",
      type: "generation",
      read: true,
    },
    {
      id: 4,
      title: "Weekly Remix Challenge",
      message: "Join this week's remix challenge: Transform a classical piece into EDM!",
      date: "2024-03-10",
      time: "10:00",
      type: "system",
      read: true,
    },
  ])

  const markAsRead = (id) => {
    setNotifications(
      notifications.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map((notification) => ({ ...notification, read: true })))
  }

  const deleteNotification = (id) => {
    setNotifications(notifications.filter((notification) => notification.id !== id))
  }

  const clearAllNotifications = () => {
    setNotifications([])
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case "remix":
        return <Music className="h-5 w-5 text-cyan-400" />
      case "generation":
        return <Wand2 className="h-5 w-5 text-purple-400" />
      case "system":
        return <Bell className="h-5 w-5 text-amber-400" />
      default:
        return <Bell className="h-5 w-5 text-zinc-400" />
    }
  }

  const unreadCount = notifications.filter((notification) => !notification.read).length

  return (
    <div className="container py-8">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-3xl font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <span className="ml-3 rounded-full bg-cyan-500 px-2.5 py-0.5 text-xs font-medium text-black">
              {unreadCount} new
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="border-zinc-700" onClick={markAllAsRead}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Mark all as read
          </Button>
          <Button variant="outline" size="sm" className="border-zinc-700" onClick={clearAllNotifications}>
            <Trash2 className="mr-2 h-4 w-4" />
            Clear all
          </Button>
          <Button variant="outline" size="sm" className="border-zinc-700">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="remix">
            <Music className="mr-2 h-4 w-4" />
            Remixes
          </TabsTrigger>
          <TabsTrigger value="generation">
            <Wand2 className="mr-2 h-4 w-4" />
            Generations
          </TabsTrigger>
          <TabsTrigger value="system">
            <Star className="mr-2 h-4 w-4" />
            System
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-0">
          <div className="space-y-4">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start justify-between rounded-lg border p-4 ${
                    notification.read ? "border-zinc-800 bg-zinc-900/30" : "border-cyan-800 bg-cyan-900/10"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`mt-1 rounded-full p-2 ${notification.read ? "bg-zinc-800" : "bg-cyan-900/50"}`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div>
                      <h3 className="font-medium flex items-center">
                        {notification.title}
                        {!notification.read && <span className="ml-2 h-2 w-2 rounded-full bg-cyan-500"></span>}
                      </h3>
                      <p className="text-sm text-zinc-400">{notification.message}</p>
                      <div className="mt-1 text-xs text-zinc-500">
                        {notification.date} at {notification.time}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!notification.read && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-zinc-400 hover:text-cyan-400"
                        onClick={() => markAsRead(notification.id)}
                      >
                        Mark as read
                      </Button>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-zinc-400 hover:text-red-400"
                      onClick={() => deleteNotification(notification.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <Bell className="h-12 w-12 text-zinc-700 mb-4" />
                <h3 className="text-xl font-medium text-zinc-400">No notifications</h3>
                <p className="text-zinc-500 mt-2">You're all caught up!</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="remix" className="mt-0">
          <div className="space-y-4">
            {notifications.filter((n) => n.type === "remix").length > 0 ? (
              notifications
                .filter((n) => n.type === "remix")
                .map((notification) => (
                  <div
                    key={notification.id}
                    className={`flex items-start justify-between rounded-lg border p-4 ${
                      notification.read ? "border-zinc-800 bg-zinc-900/30" : "border-cyan-800 bg-cyan-900/10"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`mt-1 rounded-full p-2 ${notification.read ? "bg-zinc-800" : "bg-cyan-900/50"}`}>
                        <Music className="h-5 w-5 text-cyan-400" />
                      </div>
                      <div>
                        <h3 className="font-medium flex items-center">
                          {notification.title}
                          {!notification.read && <span className="ml-2 h-2 w-2 rounded-full bg-cyan-500"></span>}
                        </h3>
                        <p className="text-sm text-zinc-400">{notification.message}</p>
                        <div className="mt-1 text-xs text-zinc-500">
                          {notification.date} at {notification.time}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!notification.read && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-zinc-400 hover:text-cyan-400"
                          onClick={() => markAsRead(notification.id)}
                        >
                          Mark as read
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-zinc-400 hover:text-red-400"
                        onClick={() => deleteNotification(notification.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <Music className="h-12 w-12 text-zinc-700 mb-4" />
                <h3 className="text-xl font-medium text-zinc-400">No remix notifications</h3>
                <p className="text-zinc-500 mt-2">You'll see updates about your remixes here</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="generation" className="mt-0">
          <div className="space-y-4">
            {notifications.filter((n) => n.type === "generation").length > 0 ? (
              notifications
                .filter((n) => n.type === "generation")
                .map((notification) => (
                  <div
                    key={notification.id}
                    className={`flex items-start justify-between rounded-lg border p-4 ${
                      notification.read ? "border-zinc-800 bg-zinc-900/30" : "border-cyan-800 bg-cyan-900/10"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`mt-1 rounded-full p-2 ${notification.read ? "bg-zinc-800" : "bg-cyan-900/50"}`}>
                        <Wand2 className="h-5 w-5 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="font-medium flex items-center">
                          {notification.title}
                          {!notification.read && <span className="ml-2 h-2 w-2 rounded-full bg-cyan-500"></span>}
                        </h3>
                        <p className="text-sm text-zinc-400">{notification.message}</p>
                        <div className="mt-1 text-xs text-zinc-500">
                          {notification.date} at {notification.time}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!notification.read && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-zinc-400 hover:text-cyan-400"
                          onClick={() => markAsRead(notification.id)}
                        >
                          Mark as read
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-zinc-400 hover:text-red-400"
                        onClick={() => deleteNotification(notification.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <Wand2 className="h-12 w-12 text-zinc-700 mb-4" />
                <h3 className="text-xl font-medium text-zinc-400">No generation notifications</h3>
                <p className="text-zinc-500 mt-2">You'll see updates about your text-to-audio generations here</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="system" className="mt-0">
          <div className="space-y-4">
            {notifications.filter((n) => n.type === "system").length > 0 ? (
              notifications
                .filter((n) => n.type === "system")
                .map((notification) => (
                  <div
                    key={notification.id}
                    className={`flex items-start justify-between rounded-lg border p-4 ${
                      notification.read ? "border-zinc-800 bg-zinc-900/30" : "border-cyan-800 bg-cyan-900/10"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`mt-1 rounded-full p-2 ${notification.read ? "bg-zinc-800" : "bg-cyan-900/50"}`}>
                        <Bell className="h-5 w-5 text-amber-400" />
                      </div>
                      <div>
                        <h3 className="font-medium flex items-center">
                          {notification.title}
                          {!notification.read && <span className="ml-2 h-2 w-2 rounded-full bg-cyan-500"></span>}
                        </h3>
                        <p className="text-sm text-zinc-400">{notification.message}</p>
                        <div className="mt-1 text-xs text-zinc-500">
                          {notification.date} at {notification.time}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!notification.read && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-zinc-400 hover:text-cyan-400"
                          onClick={() => markAsRead(notification.id)}
                        >
                          Mark as read
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-zinc-400 hover:text-red-400"
                        onClick={() => deleteNotification(notification.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <Bell className="h-12 w-12 text-zinc-700 mb-4" />
                <h3 className="text-xl font-medium text-zinc-400">No system notifications</h3>
                <p className="text-zinc-500 mt-2">You'll see system announcements and updates here</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
