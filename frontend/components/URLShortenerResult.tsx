import { ShortUrlData } from "@/app/page"
import { useState } from "react"
import { Button } from "./ui/button"
import { ArrowLeft, Check, Copy, ExternalLink, Share2 } from "lucide-react"
import { Badge } from "./ui/badge"
import { format } from "date-fns"
import { Input } from "./ui/input"
import { ShareDialog } from "./ui/share-dialog"


type UrlShortenerResultProps = {
    data: ShortUrlData
    onCreateNew: () => void
  }

  export function UrlShorternerResult({data, onCreateNew}: UrlShortenerResultProps) {
    const [copied, setCopied] = useState(false)
    const [shareDialogOpen, setShareDialogOpen] = useState(false)


    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(data.shortUrl)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error("Failed to copy: ", err)
        }
    }

    const shareUrl = async () => {
        setShareDialogOpen(true)


        // the following is native implementation
        // I use custom because the native dialog look horrible in windows pc
        // if (navigator.share) {
        //   try {
        //     await navigator.share({
        //         // title: "My Link",
        //       url: data.shortUrl ?? "https://linkedin.com",
        //     })
        //   } catch (err) {
        //     console.error("Error sharing: ", err)
        //   }
        // } else {
        //   copyToClipboard()
        // }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm" onClick={onCreateNew} className="flex items-center gap-1 px-2">
                <ArrowLeft className="h-4 w-4" />
                    Create New
                </Button>

                <div className="flex items-center gap-2">
                {data.hasPassword && (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                    Password Protected
                    </Badge>
                )}
                {data.expiredAt && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    Expires: {format(data.expiredAt, "PPP")}
                    </Badge>
                )}
                </div>
            </div>

            <div className="border rounded-lg p-4 bg-muted/20">
                <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">Your short URL</div>
                    <div className="flex items-center gap-2">
                        <Input value={data.shortUrl ?? "http://localhost:3000"} readOnly className="font-medium bg-background" />
                        <Button size="icon" variant="outline" onClick={copyToClipboard} className="shrink-0">
                            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Button
                    onClick={() => window.open(data.shortUrl, '_blank', 'noopener,noreferrer')}
                    className="w-full"
                    variant="outline"
                >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open Link
                </Button>
                <Button onClick={shareUrl} className="w-full">
                    <Share2 className="mr-2 h-4 w-4" />
                    Share Link
                </Button>
            </div>

            {/* Custom Share Dialog */}
            <ShareDialog 
                open={shareDialogOpen} 
                onOpenChange={setShareDialogOpen} 
                shortUrl={data.shortUrl ?? "http://localhost:3000"} />
        </div>
    )

  }