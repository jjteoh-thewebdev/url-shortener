"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ShortUrlData } from "@/app/page"
import React, { useState } from "react"
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "./ui/tooltip"
import { Popover, PopoverTrigger, PopoverContent } from "./ui/popover"

import { CalendarIcon, HelpCircle, Lock } from "lucide-react"
import { format } from "date-fns"
import { Calendar } from "./ui/calendar"
import { Switch } from "./ui/switch"
import { Alert, AlertDescription } from "./ui/alert"
import { Progress } from "./ui/progress"

type UrlShorternerFormProps = {
    onSuccess: (data: ShortUrlData) => void
}

export function UrlShorternerForm({onSuccess}: UrlShorternerFormProps) {
    const [longUrl, setLongUrl] = useState("")
    const [customShortUrl, setCustomShortUrl] = useState("")
    const [expiryDate, setExpiryDate] = useState<Date | undefined>(undefined)
    const [hasPassword, setHasPassword] = useState(false)
    const [password, setPassword] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState("")
    const [progress, setProgress] = useState(0)


    const handleFormSubmit = async(e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setProgress(60)


        // TODO: add zod to handle form validation

        setIsSubmitting(true)

        try {
            // TODO: call server, use server actions to mask
            const response: any = {}

            onSuccess({
                id: response.id,
                shortUrl: response.shortUrl,
                longUrl: response.longUrl,
                visitorCount: response.visitorCount,
                hasPassword: response.hasPassword,
                expiredAt: response.expiredAt,
                createdAt: response.createdAt
            })
        } catch(e: any) {
            // simple error handling, display at bottom of page
            setError(e.message || "Failed to create short url")
        } finally {
            setProgress(100)
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleFormSubmit} className="space-y-6">

            {!isSubmitting ? (
                <>
                 <div className="space-y-4">
                    {/* long url */}
                    <div className="space-y-2">
                        <Label htmlFor="longUrl">URL to Shorten</Label>
                        <Input
                            id="longUrl"
                            placeholder="https://example.com/very-long-url-that-needs-shortening"
                            value={longUrl}
                            onChange={(e) => setLongUrl(e.target.value)}
                            required
                        />
                    </div>

                    {/* custom url */}
                    <div className="space-y-2">
                        <div className="flex items-center">
                            <Label htmlFor="customShortUrl">Custom Short URL</Label>
                            <TooltipProvider>
                                <Tooltip>
                                <TooltipTrigger asChild>
                                    <HelpCircle className="ml-1.5 h-4 w-4 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="text-xs max-w-[200px]">
                                        Choose your own short url(must not exceed 100 characters)
                                    </p>
                                </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <div className="flex items-center">
                            <span className="text-sm text-muted-foreground mr-2">{process.env.NEXT_PUBLIC_URL ?? "https://localhost:3000"}/</span>
                            <Input
                            id="customShortUrl"
                            placeholder={"custom-name" }
                            value={customShortUrl}
                            onChange={(e) => setCustomShortUrl(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* expiry date */}
                    <div className="space-y-2">
                        <div className="flex items-center">
                            <Label>Expiry Date</Label>
                            <TooltipProvider>
                                <Tooltip>
                                <TooltipTrigger asChild>
                                    <HelpCircle className="ml-1.5 h-4 w-4 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="text-xs max-w-[200px]">
                                        Set a date to expired the short url
                                    </p>
                                </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <Popover>
                            <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className="w-full justify-start text-left font-normal"
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {expiryDate ? format(expiryDate, "PPP") : "Set expiry date"}
                            </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                mode="single"
                                selected={expiryDate}
                                onSelect={setExpiryDate}
                                initialFocus
                                disabled={(date) => date < new Date()}
                                />

                            {/* add a clear date button because the calendar widget double click to clear date function not intuitive */}
                            {expiryDate && (
                                <div className="p-3 border-t border-border">
                                    <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full text-sm text-muted-foreground"
                                    onClick={() => setExpiryDate(undefined)}
                                    >
                                    Clear date
                                    </Button>
                                </div>
                            )}
                            </PopoverContent>
                        </Popover>
                    </div>


                    {/* password protection */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <Label htmlFor="password-protection">Password Protection</Label>
                                <TooltipProvider>
                                    <Tooltip>
                                    <TooltipTrigger asChild>
                                        <HelpCircle className="ml-1.5 h-4 w-4 text-muted-foreground" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="text-xs max-w-[200px]">
                                            Only user with correct password will be redirected to the long url.
                                        </p>
                                    </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                            <Switch
                                id="password-protection"
                                className="cursor-pointer"
                                checked={hasPassword}
                                onCheckedChange={setHasPassword}
                            />
                        </div>

                        {hasPassword && (
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Input
                                    id="password"
                                    type="password"
                                    placeholder="Enter password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {error && (
                    <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {/* {isSubmitting ? "Creating..." : "Create Short URL"} */}
                    Create Short URL
                </Button>
                </>
            ): (
                <div className="w-full space-6">
                    <h3 className="text-center">Creating short url...</h3>
                    <Progress value={progress} className="w-[60%]" />
                </div>
            )
                
            }

           
        </form>
    )
}