import { LazyMotion, domAnimation } from 'framer-motion'

import { nav } from './lib/copy'
import { AdminLink } from './components/AdminLink/AdminLink'
import { DemoCTA } from './components/DemoCTA/DemoCTA'
import { Differentiators } from './components/Differentiators/Differentiators'
import { Faq } from './components/Faq/Faq'
import { Footer } from './components/Footer/Footer'
import { Hero } from './components/Hero/Hero'
import { HowItWorks } from './components/HowItWorks/HowItWorks'
import { Nav } from './components/Nav/Nav'
import { Problem } from './components/Problem/Problem'
import { TechBase } from './components/TechBase/TechBase'

export function App() {
  return (
    <LazyMotion features={domAnimation} strict>
      <a className="skip-link" href="#conteudo">
        {nav.skipLink}
      </a>
      <Nav />
      <main id="conteudo">
        <Hero />
        <Problem />
        <HowItWorks />
        <Differentiators />
        <TechBase />
        <Faq />
        <DemoCTA />
      </main>
      <Footer />
      <AdminLink />
    </LazyMotion>
  )
}
