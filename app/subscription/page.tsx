"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, Music, Wand2, Download, Clock, Zap, Star } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"

export default function SubscriptionPage() {
  const [billingCycle, setBillingCycle] = useState("monthly")

  const plans = [
    {
      name: "Free",
      price: {
        monthly: "$0",
        yearly: "$0",
      },
      description: "Basic access to AI music tools",
      features: [
        "5 remixes per month",
        "10 text-to-audio generations",
        "Standard quality audio",
        "Basic effects library",
      ],
      limitations: ["Limited to 1-minute audio", "No downloads", "Basic effects only"],
      buttonText: "Current Plan",
      isCurrentPlan: true,
    },
    {
      name: "Pro",
      price: {
        monthly: "$9.99",
        yearly: "$99.99",
      },
      description: "Enhanced tools for music creators",
      features: [
        "Unlimited remixes",
        "50 text-to-audio generations",
        "High-quality audio",
        "Full effects library",
        "Download in MP3 format",
        "Priority processing",
      ],
      limitations: [],
      buttonText: "Upgrade to Pro",
      isCurrentPlan: false,
      highlight: true,
    },
    {
      name: "Premium",
      price: {
        monthly: "$19.99",
        yearly: "$199.99",
      },
      description: "Professional music production suite",
      features: [
        "Unlimited remixes & generations",
        "Highest quality audio (HD)",
        "Advanced effects & mixing tools",
        "Download in WAV & FLAC formats",
        "Stem separation",
        "Voice cloning (beta)",
        "Commercial usage rights",
      ],
      limitations: [],
      buttonText: "Upgrade to Premium",
      isCurrentPlan: false,
    },
  ]

  const handleUpgrade = (planName) => {
    toast({
      title: "Subscription Change",
      description: `You selected the ${planName} plan. This would redirect to payment in a real app.`,
    })
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Subscription Plans</h1>
        <p className="mt-2 text-zinc-400">Choose the plan that fits your music creation needs</p>
      </div>

      <div className="mb-8 flex justify-center">
        <div className="inline-flex items-center rounded-full border border-zinc-700 p-1">
          <button
            className={`rounded-full px-4 py-2 text-sm ${
              billingCycle === "monthly" ? "bg-cyan-500 text-black" : "text-zinc-400"
            }`}
            onClick={() => setBillingCycle("monthly")}
          >
            Monthly
          </button>
          <button
            className={`rounded-full px-4 py-2 text-sm ${
              billingCycle === "yearly" ? "bg-cyan-500 text-black" : "text-zinc-400"
            }`}
            onClick={() => setBillingCycle("yearly")}
          >
            Yearly <span className="text-xs text-cyan-300">(Save 15%)</span>
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={`border ${
              plan.highlight
                ? "border-cyan-500 bg-cyan-500/5 shadow-lg shadow-cyan-500/10"
                : "border-zinc-800 bg-zinc-900/50"
            }`}
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{plan.name}</span>
                {plan.highlight && <Star className="h-5 w-5 text-cyan-400" />}
              </CardTitle>
              <div className="mt-2">
                <span className="text-3xl font-bold">{plan.price[billingCycle]}</span>
                <span className="text-sm text-zinc-400">{billingCycle === "monthly" ? "/month" : "/year"}</span>
              </div>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="mr-2 h-5 w-5 text-cyan-400 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
                {plan.limitations?.map((limitation, index) => (
                  <li key={`limit-${index}`} className="flex items-start text-zinc-500">
                    <span className="mr-2">•</span>
                    <span>{limitation}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className={
                  plan.isCurrentPlan
                    ? "w-full bg-zinc-700 hover:bg-zinc-600"
                    : plan.highlight
                      ? "w-full bg-cyan-500 hover:bg-cyan-600 text-black"
                      : "w-full bg-zinc-800 hover:bg-zinc-700"
                }
                onClick={() => handleUpgrade(plan.name)}
                disabled={plan.isCurrentPlan}
              >
                {plan.isCurrentPlan ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    {plan.buttonText}
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    {plan.buttonText}
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Plan Features Comparison</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="py-4 text-left">Feature</th>
                <th className="py-4 text-center">Free</th>
                <th className="py-4 text-center">Pro</th>
                <th className="py-4 text-center">Premium</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-zinc-800">
                <td className="py-4 flex items-center">
                  <Music className="mr-2 h-4 w-4 text-cyan-400" />
                  Remix Limit
                </td>
                <td className="py-4 text-center">5 / month</td>
                <td className="py-4 text-center">Unlimited</td>
                <td className="py-4 text-center">Unlimited</td>
              </tr>
              <tr className="border-b border-zinc-800">
                <td className="py-4 flex items-center">
                  <Wand2 className="mr-2 h-4 w-4 text-cyan-400" />
                  Text-to-Audio
                </td>
                <td className="py-4 text-center">10 / month</td>
                <td className="py-4 text-center">50 / month</td>
                <td className="py-4 text-center">Unlimited</td>
              </tr>
              <tr className="border-b border-zinc-800">
                <td className="py-4 flex items-center">
                  <Download className="mr-2 h-4 w-4 text-cyan-400" />
                  Downloads
                </td>
                <td className="py-4 text-center">No</td>
                <td className="py-4 text-center">MP3</td>
                <td className="py-4 text-center">MP3, WAV, FLAC</td>
              </tr>
              <tr className="border-b border-zinc-800">
                <td className="py-4 flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-cyan-400" />
                  Audio Duration
                </td>
                <td className="py-4 text-center">1 minute</td>
                <td className="py-4 text-center">5 minutes</td>
                <td className="py-4 text-center">Unlimited</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
