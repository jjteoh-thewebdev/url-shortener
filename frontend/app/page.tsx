"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UrlShorternerResult } from "@/components/URLShortenerResult"
import { UrlShorternerForm } from "@/components/URLShorternerForm"
import { useState } from "react"


export type ShortUrlData = {
  id: number
  shortUrl: string
  longUrl: string
  visitorCount: number
  hasPassword: boolean
  expiredAt: Date
  createdAt: Date
}

export default function Home() {
  const [shortUrlData, setShortUrlData] = useState<ShortUrlData | null>(null)

  return (
    <main className="min-h-screen flex flex-col items-center justify-center">
      <div className="w-full max-w-3xl">
        <Card className="shadow-lg">
          <CardHeader className="border-b">
            <CardTitle className="text-2xl font-bold">URL Shortener</CardTitle>
          </CardHeader>

          <CardContent className="pt-6">
            {
              shortUrlData ? (<UrlShorternerResult data={shortUrlData} onCreateNew={() => setShortUrlData(null)}  />) 
              : (<UrlShorternerForm 
                  onSuccess={(data) => {
                    setShortUrlData(data)
                  }
                } />)
            }
          </CardContent>
        </Card>
      </div>

      <footer className="text-center text-md text-muted-foreground mt-6">
        <p>Built by <a className="underline text-blue-500" href="https://github.com/jjteoh-thewebdev">JJTeoh</a> with ❤️</p>
      </footer>
    </main>
  );
}
