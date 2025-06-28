"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import Image from "next/image"
import { Teko } from "next/font/google"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, Upload, User, TrendingUp, Wallet, X, Percent, Clock, Twitter, Copy, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { getWalletBalance } from "@/lib/solana_controller"
import html2canvas from "html2canvas"

const teko = Teko({
  subsets: ["latin"],
  weight: ["400", "700"],
})

const TWEET_TEXT = "i got my $tr on a moon token!";

const cardStyles: {
  [key: string]: {
    name: string
    profit: string
    winRate: string
    speed: string
    balance: string
  }
} = {
  "/card-1.png": {
    name: "absolute left-1/2 top-[60%] transform -translate-x-1/2 -translate-y-1/2 text-white font-bold text-5xl text-center [text-shadow:2px_2px_4px_rgba(0,0,0,0.5)]",
    profit:
      "absolute right-[20%] bottom-[25%] z-10 [text-shadow:2px_2px_4px_rgba(0,0,0,0.7)]",
    winRate:
      "absolute left-[20%] bottom-[25%] z-10 [text-shadow:2px_2px_4px_rgba(0,0,0,0.7)]",
    speed:
      "absolute left-[20%] bottom-[17%] z-10 [text-shadow:2px_2px_4px_rgba(0,0,0,0.6)]",
    balance:
      "absolute left-[20%] top-[20%] z-10 [text-shadow:2px_2px_4px_rgba(0,0,0,1)]",
  },
  "/card-2.png": {
    name: "absolute left-1/2 top-[60%] transform -translate-x-1/2 -translate-y-1/2 text-white font-bold text-5xl text-center [text-shadow:2px_2px_4px_rgba(0,0,0,0.5)]",
    profit:
      "absolute right-[24%] bottom-[26%] z-10 [text-shadow:2px_2px_4px_rgba(0,0,0,0.7)]",
    winRate:
      "absolute left-[24%] bottom-[26%] z-10 [text-shadow:2px_2px_4px_rgba(0,0,0,0.7)]",
    speed:
      "absolute left-[24%] bottom-[19%] z-10 [text-shadow:2px_2px_4px_rgba(0,0,0,0.6)]",
    balance:
      "absolute left-[24%] top-[28%] z-10 [text-shadow:2px_2px_4px_rgba(0,0,0,1)]",
  },
  "/card-3.png": {
    name: "absolute left-1/2 top-[60%] transform -translate-x-1/2 -translate-y-1/2 text-white font-bold text-5xl text-center [text-shadow:2px_2px_4px_rgba(0,0,0,0.5)]",
    profit:
      "absolute right-[20%] bottom-[25%] z-10 [text-shadow:2px_2px_4px_rgba(0,0,0,0.7)]",
    winRate:
      "absolute left-[20%] bottom-[25%] z-10 [text-shadow:2px_2px_4px_rgba(0,0,0,0.7)]",
    speed:
      "absolute left-[20%] bottom-[17%] z-10 [text-shadow:2px_2px_4px_rgba(0,0,0,0.6)]",
    balance:
      "absolute left-[20%] top-[24%] z-10 [text-shadow:2px_2px_4px_rgba(0,0,0,1)]",
  },
  "/card-4.png": {
    name: "absolute left-1/2 top-[60%] transform -translate-x-1/2 -translate-y-1/2 text-white font-bold text-5xl text-center [text-shadow:2px_2px_4px_rgba(0,0,0,0.5)]",
    profit:
      "absolute right-[20%] bottom-[25%] z-10 [text-shadow:2px_2px_4px_rgba(0,0,0,0.7)]",
    winRate:
      "absolute left-[20%] bottom-[25%] z-10 [text-shadow:2px_2px_4px_rgba(0,0,0,0.7)]",
    speed:
      "absolute left-[20%] bottom-[17%] z-10 [text-shadow:2px_2px_4px_rgba(0,0,0,0.6)]",
    balance:
      "absolute left-[20%] top-[28%] z-10 [text-shadow:2px_2px_4px_rgba(0,0,0,1)]",
  },
}

export default function LandingPage() {
  const [formData, setFormData] = useState({
    image: "",
    name: "",
    profit: "",
    solanaWallet: "",
    winRate: "",
    speed: "30",
  })
  const [balance, setBalance] = useState<string | null>(null)
  const [selectedCard, setSelectedCard] = useState("/card-1.png")
  const cardDesigns = ["/card-1.png", "/card-2.png", "/card-3.png", "/card-4.png"]
  const [isDownloading, setIsDownloading] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 })
  const [imageSize, setImageSize] = useState({ width: 200, height: 250 })
  const isDraggingRef = useRef(false)
  const isResizingRef = useRef(false)
  const dragStartRef = useRef({ x: 0, y: 0 })
  const resizeStartRef = useRef({ x: 0, y: 0, width: 0, height: 0 })
  const imageContainerRef = useRef<HTMLDivElement>(null)

  const cardRef = useRef<HTMLDivElement>(null)
  const downloadButtonRef = useRef<HTMLButtonElement>(null)
  const twitterButtonsContainerRef = useRef<HTMLDivElement>(null)

  const formatSpeed = (seconds: number) => {
    if (isNaN(seconds)) return ""
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    if (mins > 0 && secs > 0) {
      return `${mins}m ${secs}s`
    }
    if (mins > 0) {
      return `${mins}m`
    }
    return `${secs}s`
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImagePosition({ x: 0, y: 0 }) // Reset position on new image
      setImageSize({ width: 200, height: 250 }) // Reset size on new image
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setFormData((prev) => ({
            ...prev,
            image: event.target?.result as string,
          }))
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText("64YWoWKA3dyQuW3RSDNPDNKX9nMf8kTbvQtJDEZ8pump").then(() => {
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    })
  }

  const handleUpdateCardClick = async () => {
    const newWinRate = Math.floor(Math.random() * 100) + 1
    const newSpeed = Math.floor(Math.random() * (600 - 30 + 1)) + 30 // 30s to 10m
    setFormData((prev) => ({
      ...prev,
      winRate: String(newWinRate),
      speed: String(newSpeed),
    }))
    if (formData.solanaWallet) {
      const walletBalance = await getWalletBalance(formData.solanaWallet)
      if (walletBalance !== null) {
        setBalance(Math.floor(walletBalance).toString())
      } else {
        setBalance(null)
      }
    }
  }

  const handleImageRemove = () => {
    setFormData((prev) => ({ ...prev, image: "" }))
    setImagePosition({ x: 0, y: 0 })
    setImageSize({ width: 200, height: 250 })
    const input = document.getElementById("image") as HTMLInputElement
    if (input) {
      input.value = ""
    }
  }

  const onDragEnd = useCallback(() => {
    isDraggingRef.current = false
    document.body.style.cursor = "default"
    document.removeEventListener("mousemove", onDragMove)
    document.removeEventListener("touchmove", onDragMove)
    document.removeEventListener("mouseup", onDragEnd)
    document.removeEventListener("touchend", onDragEnd)
  }, [])

  const onDragMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDraggingRef.current) return
    e.preventDefault()
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY
    setImagePosition({
      x: clientX - dragStartRef.current.x,
      y: clientY - dragStartRef.current.y,
    })
  }, [])

  const onResizeEnd = useCallback(() => {
    isResizingRef.current = false
    document.body.style.cursor = "default"
    document.removeEventListener("mousemove", onResizeMove)
    document.removeEventListener("touchmove", onResizeMove)
    document.removeEventListener("mouseup", onResizeEnd)
    document.removeEventListener("touchend", onResizeEnd)
  }, [])

  const onResizeMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isResizingRef.current) return
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY
    const newWidth = resizeStartRef.current.width + (clientX - resizeStartRef.current.x)
    const newHeight = resizeStartRef.current.height + (clientY - resizeStartRef.current.y)
    if (newWidth > 50 && newHeight > 50) {
      setImageSize({ width: newWidth, height: newHeight })
    }
  }, [])

  const onResizeStart = useCallback(
    (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
      e.stopPropagation()
      e.preventDefault()
      isResizingRef.current = true
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY
      resizeStartRef.current = {
        x: clientX,
        y: clientY,
        width: imageSize.width,
        height: imageSize.height,
      }
      document.body.style.cursor = "se-resize"
      document.addEventListener("mousemove", onResizeMove)
      document.addEventListener("touchmove", onResizeMove)
      document.addEventListener("mouseup", onResizeEnd)
      document.addEventListener("touchend", onResizeEnd)
    },
    [imageSize.height, imageSize.width, onResizeEnd, onResizeMove],
  )

  const onDragStart = useCallback(
    (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
      e.preventDefault()
      isDraggingRef.current = true
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY
      dragStartRef.current = {
        x: clientX - imagePosition.x,
        y: clientY - imagePosition.y,
      }
      document.body.style.cursor = "grabbing"
      document.addEventListener("mousemove", onDragMove)
      document.addEventListener("touchmove", onDragMove)
      document.addEventListener("mouseup", onDragEnd)
      document.addEventListener("touchend", onDragEnd)
    },
    [imagePosition.x, imagePosition.y, onDragEnd, onDragMove],
  )

  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", onDragMove)
      document.removeEventListener("touchmove", onDragMove)
      document.removeEventListener("mouseup", onDragEnd)
      document.removeEventListener("touchend", onDragEnd)
      document.removeEventListener("mousemove", onResizeMove)
      document.removeEventListener("touchmove", onResizeMove)
      document.removeEventListener("mouseup", onResizeEnd)
      document.removeEventListener("touchend", onResizeEnd)
    }
  }, [onDragMove, onDragEnd, onResizeMove, onResizeEnd])

  useEffect(() => {
    const setWidth = () => {
      if (downloadButtonRef.current && twitterButtonsContainerRef.current) {
        twitterButtonsContainerRef.current.style.width = `${downloadButtonRef.current.offsetWidth}px`
      }
    }
    setWidth()
    window.addEventListener("resize", setWidth)
    return () => {
      window.removeEventListener("resize", setWidth)
    }
  }, [isDownloading])

  const downloadCard = async () => {
    if (!cardRef.current) return

    setIsDownloading(true)
    try {
      const canvas = await html2canvas(cardRef.current, {
        allowTaint: true,
        useCORS: true,
        backgroundColor: null, // Preserve transparency
        scale: 2, // Higher resolution
        ignoreElements: (element) => element.classList.contains("exclude-from-download"),
      })
      const link = document.createElement("a")
      link.download = `trench-card-${formData.name || "custom"}.png`
      link.href = canvas.toDataURL("image/png")
      link.click()
    } catch (error) {
      console.error("Error downloading card:", error)
    } finally {
      setIsDownloading(false)
    }
  }

  const handleShareToTwitter = () => {
    const tweetText = encodeURIComponent(TWEET_TEXT)
    const twitterUrl = `https://x.com/intent/post?text=${tweetText}`
    window.open(twitterUrl, "_blank")
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero Section with Background */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image src="/new-hero-background.png" alt="Purple burst background" fill className="object-cover object-top" priority />
        </div>

        {/* Trench Ratings Logo */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 w-96 h-24">
          <Image
            src="/trench-ratings-logo.png"
            alt="Trench Ratings"
            fill
            className="object-contain"
          />
        </div>

        {/* Player Card Template - Left Side */}
        <div className="absolute left-20 top-[50%] transform -translate-y-1/2 z-10 flex items-center gap-4">
          <div className="relative">
            <div className="relative" ref={cardRef}>
              <Image
                src={selectedCard}
                alt="Player Card Template"
                width={400}
                height={500}
                className="w-auto h-auto max-w-[90vw] max-h-[80vh]"
              />

              {formData.name && (
                <div className={cn(teko.className, cardStyles[selectedCard].name)}>
                  {formData.name}
                </div>
              )}

              {formData.profit && (
                <div className={cn(teko.className, cardStyles[selectedCard].profit, "flex items-baseline")}>
                  <span className="font-bold text-5xl text-white">{formData.profit}</span>
                  <span className="text-yellow-500 text-2xl ml-1 font-bold [text-shadow:1px_1px_2px_rgba(0,0,0,0.8)]">PR</span>
                </div>
              )}

              {formData.winRate && (
                <div className={cn(teko.className, cardStyles[selectedCard].winRate, "flex items-baseline")}>
                  <span className="text-yellow-500 text-2xl mr-1 font-bold [text-shadow:1px_1px_2px_rgba(0,0,0,0.8)]">WR</span>
                  <span className={cn("font-bold text-5xl", parseInt(formData.winRate) < 40 ? "text-red-500" : "text-green-500")}>
                    {formData.winRate}%
                  </span>
                </div>
              )}

              {formData.speed && (
                <div className={cn(teko.className, cardStyles[selectedCard].speed, "flex items-baseline")}>
                  <span className="text-yellow-500 text-2xl mr-1 font-bold [text-shadow:1px_1px_2px_rgba(0,0,0,0.8)]">SP</span>
                  <span className="font-bold text-5xl text-white">{formatSpeed(parseInt(formData.speed, 10))}</span>
                </div>
              )}

              {balance && (
                <div className={cn(teko.className, cardStyles[selectedCard].balance)}>
                  <span className="font-bold text-8xl text-yellow-500">{balance}</span>
                </div>
              )}

              {/* Dynamic content overlay on card */}
              {formData.image && (
                <div
                  className="absolute left-[25%] top-[25%] cursor-grab active:cursor-grabbing z-20"
                  style={{
                    width: `${imageSize.width}px`,
                    height: `${imageSize.height}px`,
                  }}
                  onMouseDown={onDragStart}
                  onTouchStart={onDragStart}
                >
                  <div className="absolute top-[0%] left-[0%] w-[32%] h-[32%] bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 exclude-from-download" />
                  <div
                    ref={imageContainerRef}
                    className="absolute h-full w-full"
                    style={{
                      transform: `translate(${imagePosition.x}px, ${imagePosition.y}px)`,
                    }}
                  >
                    <Image
                      src={formData.image}
                      alt="User"
                      layout="fill"
                      objectFit="cover"
                      className="pointer-events-none rounded-2xl"
                      draggable={false}
                    />
                  </div>
                  <div
                    className="absolute -bottom-[2%] -right-[2%] w-4 h-4 bg-white border-2 border-gray-500 rounded-full cursor-se-resize exclude-from-download"
                    onMouseDown={onResizeStart}
                    onTouchStart={onResizeStart}
                  />
                </div>
              )}
            </div>
            {/* Download Button - Below the card */}
            <div className="absolute bottom-[0%] left-1/2 -translate-x-1/2 translate-y-1/2 flex flex-col items-center gap-2">
              <Button
                ref={downloadButtonRef}
                onClick={downloadCard}
                className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-6 py-2 rounded-lg shadow-lg flex items-center gap-2"
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download size={20} />
                    Download Card
                  </>
                )}
              </Button>
              <div ref={twitterButtonsContainerRef} className="flex items-center justify-between gap-2">
                <Button
                  onClick={handleShareToTwitter}
                  className="bg-black hover:bg-gray-800 text-white font-bold px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 min-w-0"
                >
                  <Twitter size={20} className="text-blue-400 flex-shrink-0" />
                  <span className="truncate">Share with Twitter</span>
                </Button>
                <Button asChild size="icon" className="rounded-full bg-white shadow-lg hover:bg-gray-200 flex-shrink-0">
                  <a href="https://x.com/i/communities/1938739260435145036" target="_blank" rel="noopener noreferrer">
                    <Twitter size={20} className="text-blue-400" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {cardDesigns.map((card) => (
              <div
                key={card}
                onClick={() => setSelectedCard(card)}
                className={cn(
                  "relative h-24 w-20 cursor-pointer overflow-hidden rounded-md border-2 transition-all duration-300 ease-in-out hover:scale-110 hover:border-white",
                  selectedCard === card ? "border-white" : "border-transparent",
                )}
              >
                <Image src={card} alt="Card Preview" fill objectFit="cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Input Form - Right Side */}
        <div className="absolute right-32 top-1/2 transform -translate-y-1/2 z-10 flex flex-col gap-4">
          <Card className="w-[48rem] bg-[#232844]/90 backdrop-blur-sm shadow-xl border-0 text-white">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-purple-300">Customize Your Card</CardTitle>
              <p className="text-sm text-gray-400">Create your personalized profile</p>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="space-y-2">
                <Label htmlFor="image" className="flex items-center gap-2 text-purple-300 font-semibold">
                  <Upload size={16} />
                  Profile Image
                </Label>
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="image"
                    className="relative flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-500 rounded-lg cursor-pointer hover:border-gray-400 hover:bg-gray-800/50 overflow-hidden"
                  >
                    {formData.image ? (
                      <>
                        <Image src={formData.image} alt="Uploaded preview" fill className="object-cover" />
                        <Button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            handleImageRemove()
                          }}
                          className="absolute top-1 right-1 z-10 bg-red-600/80 hover:bg-red-600 text-white p-1 h-6 w-6 rounded-full flex items-center justify-center"
                          aria-label="Remove image"
                        >
                          <X size={14} />
                        </Button>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <Upload className="w-8 h-8 mb-2" />
                        <p className="text-sm">Choose File or Drop Here</p>
                      </div>
                    )}
                    <Input id="image" type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2 text-purple-300 font-semibold">
                  <User size={16} />
                  Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="bg-white border-0 text-gray-900 placeholder:text-gray-500 rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="profit" className="flex items-center gap-2 text-purple-300 font-semibold">
                  <TrendingUp size={16} />
                  Profit Rating
                </Label>
                <Input
                  id="profit"
                  type="number"
                  placeholder="Enter profit amount"
                  value={formData.profit}
                  onChange={(e) => handleInputChange("profit", e.target.value)}
                  className="bg-white border-0 text-gray-900 placeholder:text-gray-500 rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="wallet" className="flex items-center gap-2 text-purple-300 font-semibold">
                  <Wallet size={16} />
                  Solana Wallet
                </Label>
                <Input
                  id="wallet"
                  type="text"
                  placeholder="Enter Solana wallet address"
                  value={formData.solanaWallet}
                  onChange={(e) => handleInputChange("solanaWallet", e.target.value)}
                  className="bg-white border-0 text-gray-900 placeholder:text-gray-500 rounded-lg"
                />
              </div>

              <Button
                onClick={handleUpdateCardClick}
                className="w-full text-white font-bold py-3 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 h-11"
              >
                Update Card
              </Button>
            </CardContent>
          </Card>
          <Card className="w-[48rem] bg-[#232844]/90 backdrop-blur-sm shadow-xl border-0 text-white">
            <CardContent className="relative flex items-center justify-center p-6">
              <h2 className="text-3xl font-bold text-purple-300">CA: </h2>
              <p></p>
              <h2 className="text-3xl font-bold text-purple-300">COMING SOON</h2>
              <Button size="icon" variant="ghost" className="absolute top-2 right-2 text-gray-400 hover:text-white" onClick={handleCopy}>
                {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
