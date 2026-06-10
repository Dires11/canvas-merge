import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { Hero }         from "@/components/landing/hero"
import { ScrollStory }  from "@/components/landing/scroll-story"
import { FeatureCards } from "@/components/landing/feature-cards"
import { HowItWorks }   from "@/components/landing/how-it-works"
import { CtaSection }   from "@/components/landing/cta-section"

export default async function Home() {
  const { userId } = await auth()
  if (userId) redirect("/dashboard")

  return (
    <main className="[overflow-x:clip]">
      <Hero         isSignedIn={false} />
      <ScrollStory />
      <FeatureCards />
      <HowItWorks  />
      <CtaSection   isSignedIn={false} />
    </main>
  )
}
