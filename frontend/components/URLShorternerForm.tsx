"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ShortUrlData } from "@/app/page"
import React, { useState } from "react"
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "./ui/tooltip"
import { Popover, PopoverTrigger, PopoverContent } from "./ui/popover"
import { z } from "zod"
import { CalendarIcon, HelpCircle, Lock } from "lucide-react"
import { format } from "date-fns"
import { Calendar } from "./ui/calendar"
import { Switch } from "./ui/switch"
import { Alert, AlertDescription } from "./ui/alert"
import { Progress } from "./ui/progress"

// Define the validation schema
const urlShortenerSchema = z.object({
    longUrl: z.string()
        .min(1, "URL is required")
        .url("Please enter a valid URL"),
    customShortUrl: z.string()
        .max(100, "Custom URL must not exceed 100 characters")
        .regex(/^[a-zA-Z0-9-]+$/, "Custom URL can only contain letters, numbers, and hyphens")
        .optional(),
    expiryDate: z.date()
        .min(new Date(), "Expiry date must be in the future")
        .optional(),
    hasPassword: z.boolean(),
    password: z.string()
        .min(6, "Password must be at least 6 characters")
        .optional()
        .refine((val: string | undefined) => {
            if (!val) return true; // Allow empty if hasPassword is false
            return val.length >= 6;
        }, "Password must be at least 6 characters")
}).refine((data: { hasPassword: boolean; password?: string }) => {
    if (data.hasPassword) {
        return !!data.password;
    }
    return true;
}, {
    message: "Password is required when password protection is enabled",
    path: ["password"]
});

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
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

    const handleFormSubmit = async(e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setValidationErrors({})
        setProgress(60)

        try {
            // Validate form data
            const formData = {
                longUrl,
                customShortUrl: customShortUrl || undefined,
                expiryDate,
                hasPassword,
                password: hasPassword ? password : undefined
            };

            const validatedData = urlShortenerSchema.parse(formData);

            setIsSubmitting(true)

            // call server, use server actions to mask
            const apiResponse: any = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/urls/shorten`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    long_url: validatedData.longUrl,
                    custom_url: validatedData.customShortUrl,
                    expiry: validatedData.expiryDate,
                    password: validatedData.password
                })
            })

            if (!apiResponse.ok) {
                const errorData = await apiResponse.json()
                throw new Error(errorData.error || "Failed to create short url")
            }

            const responseBody = await apiResponse.json()
            const data = responseBody.data

            onSuccess({
                id: data.id,
                shortUrl: `${process.env.NEXT_PUBLIC_REDIRECT_URL}/${data.short_url}`,
                longUrl: data.long_url,
                visitorCount: data.visitor_count,
                hasPassword: data.has_password,
                expiredAt: data.expired_at,
                createdAt: data.created_at
            })
        } catch(e: any) {
            if (e instanceof z.ZodError) {
                // Handle validation errors
                const errors: Record<string, string> = {};
                e.errors.forEach((error: z.ZodIssue) => {
                    if (error.path) {
                        errors[error.path[0]] = error.message;
                    }
                });
                setValidationErrors(errors);
            } else {
                if (e.message === `Failed to fetch`) {
                    e.message = "Failed to connect to the server, please try again later"
                } 
                // Handle other errors
                setError(e.message || "Something went wrong, please try again later")
            }
        } finally {
            setProgress(100)
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleFormSubmit} className="space-y-6">
            {!isSubmitting ? (
                <>
                    {error && (
                        <Alert variant="destructive" className="text-red-800 border border-red-300 bg-red-50">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

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
                                className={validationErrors.longUrl ? "border-red-500" : ""}
                            />
                            {validationErrors.longUrl && (
                                <p className="text-sm text-red-500">{validationErrors.longUrl}</p>
                            )}
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
                                <span className="text-sm text-muted-foreground mr-2">{process.env.NEXT_PUBLIC_REDIRECT_URL ?? "https://localhost:3000"}/</span>
                                <Input
                                    id="customShortUrl"
                                    placeholder={"custom-name"}
                                    value={customShortUrl}
                                    onChange={(e) => setCustomShortUrl(e.target.value)}
                                    className={validationErrors.customShortUrl ? "border-red-500" : ""}
                                />
                            </div>
                            {validationErrors.customShortUrl && (
                                <p className="text-sm text-red-500">{validationErrors.customShortUrl}</p>
                            )}
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
                                        className={`w-full justify-start text-left font-normal ${validationErrors.expiryDate ? "border-red-500" : ""}`}
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
                            {validationErrors.expiryDate && (
                                <p className="text-sm text-red-500">{validationErrors.expiryDate}</p>
                            )}
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
                                            className={validationErrors.password ? "border-red-500" : ""}
                                        />
                                        <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    </div>
                                    {validationErrors.password && (
                                        <p className="text-sm text-red-500">{validationErrors.password}</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        Create Short URL
                    </Button>
                </>
            ) : (
                <div className="w-full space-6">
                        <h3 className="text-center mb-4">Creating short url...</h3>
                        <Progress value={progress} className="w-full" />
                </div>
            )}
        </form>
    )
}