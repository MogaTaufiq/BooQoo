'use client'

import LandingHeader from './LandingHeader'
import Hero from './Hero'
import Features from './Features'
import SocialProof from './SocialProof'
import HowItWorks from './HowItWorks'
import Pricing from './Pricing'
import FAQ from './FAQ'
import CTASection from './CTASection'
import Footer from './Footer'

export default function LandingPage() {
  return (
    <>
      <LandingHeader />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <SocialProof />
        <Pricing />
        <FAQ />
        <CTASection />
      </main>
      <Footer />
    </>
  )
}
