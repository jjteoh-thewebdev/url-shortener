"use client"

import { useState } from "react"
import { Copy, Facebook, Linkedin, Mail, MessageCircle, Twitter } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

interface ShareDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  shortUrl: string
  
}

export function ShareDialog({ open, onOpenChange, shortUrl }: ShareDialogProps) {
  const [copied, setCopied] = useState(false)
  const shareUrl = shortUrl

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast("URL copied to clipboard", {
        description: "You can now paste it anywhere to share.",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast("Failed to copy",{
        description: "Please try again or copy the URL manually.",
        className: "bg-red-500"
      })
    }
  }

  const shareViaService = (service: string) => {
    let shareLink = ""
    const encodedUrl = encodeURIComponent(shareUrl)
    const encodedTitle = encodeURIComponent(`Check out this url`)

    switch (service) {
      case "x":
        shareLink = `https://x.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`
        break
      case "facebook":
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
        break
      case "linkedin":
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
        break
       default:
        shareLink = `mailto:?subject=${encodedTitle}&body=${encodedUrl}`
        break
    }

    if (shareLink) {
      window.open(shareLink, "_blank")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share your url</DialogTitle>
          <DialogDescription>Share your url with others via these platforms.</DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <Input value={shareUrl} readOnly className="font-medium" />
          </div>
          <Button
            type="submit"
            size="sm"
            className="px-3"
            onClick={copyToClipboard}
            variant={copied ? "outline" : "default"}
          >
            <span className="sr-only">Copy</span>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap justify-center gap-4 py-4">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full h-12 w-12"
            onClick={() => shareViaService("x")}
          >
            <Twitter className="h-5 w-5 text-[#1DA1F2]" />
            <span className="sr-only">Share on X</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full h-12 w-12"
            onClick={() => shareViaService("facebook")}
          >
            <Facebook className="h-5 w-5 text-[#1877F2]" />
            <span className="sr-only">Share on Facebook</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full h-12 w-12"
            onClick={() => shareViaService("linkedin")}
          >
            <Linkedin className="h-5 w-5 text-[#0A66C2]" />
            <span className="sr-only">Share on LinkedIn</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full h-12 w-12"
            onClick={() => shareViaService("email")}
          >
            <Mail className="h-5 w-5 text-muted-foreground" />
            <span className="sr-only">Share via Email</span>
          </Button>
        </div>
        <DialogFooter className="sm:justify-start">
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

