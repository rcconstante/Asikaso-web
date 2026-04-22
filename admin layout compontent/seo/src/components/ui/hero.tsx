import * as React from "react"
import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Mockup, MockupFrame } from "@/components/ui/mockup"
import { PlexusBackground } from "@/components/ui/plexus-background"

interface HeroProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title: React.ReactNode
  subtitle?: string
  eyebrow?: string
  ctaText?: string
  ctaLink?: string
  onCtaClick?: () => void
  mockupImage?: {
    src: string
    alt: string
    width?: number
    height?: number
  }
}

const Hero = React.forwardRef<HTMLDivElement, HeroProps>(
  ({ className, title, subtitle, eyebrow, ctaText, ctaLink, onCtaClick, mockupImage, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("relative flex flex-col items-center min-h-[90vh] overflow-hidden", className)}
        {...props}
      >
        {/* 3D Plexus Background */}
        <PlexusBackground className="z-0" />

        {/* Content overlay */}
        <div className="relative z-10 flex flex-col items-center w-full">
          {eyebrow && (
            <p
              className="uppercase tracking-[0.3em] leading-[133%] text-center text-sm mt-32 md:mt-48 mb-8 text-orange-500 font-semibold animate-appear opacity-0"
            >
              {eyebrow}
            </p>
          )}

          <h1
            className="text-4xl md:text-5xl lg:text-6xl leading-tight text-center px-4 lg:px-32 text-foreground animate-appear opacity-0 delay-100 font-bold drop-shadow-sm"
          >
            {title}
          </h1>

          {subtitle && (
            <p
              className="text-lg md:text-xl text-center font-light px-4 lg:px-32 mt-6 mb-12 leading-relaxed text-muted-foreground animate-appear opacity-0 delay-300 max-w-3xl"
            >
              {subtitle}
            </p>
          )}

          {ctaText && (onCtaClick || ctaLink) && (
            onCtaClick ? (
              <button onClick={onCtaClick}>
                <div
                  className="inline-flex items-center bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all hover:scale-105 px-6 py-3 animate-appear opacity-0 delay-500 shadow-lg hover:shadow-xl"
                >
                  <span className="text-base md:text-lg font-medium mr-3">{ctaText}</span>
                  <ArrowRight className="h-5 w-5" />
                </div>
              </button>
            ) : ctaLink ? (
              <Link to={ctaLink}>
                <div
                  className="inline-flex items-center bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all hover:scale-105 px-6 py-3 animate-appear opacity-0 delay-500 shadow-lg hover:shadow-xl"
                >
                  <span className="text-base md:text-lg font-medium mr-3">{ctaText}</span>
                  <ArrowRight className="h-5 w-5" />
                </div>
              </Link>
            ) : null
          )}

          {mockupImage && (
            <div className="mt-20 w-full px-4 md:px-8 lg:px-16 relative animate-appear opacity-0 delay-700 max-w-7xl">
              <MockupFrame size="large">
                <Mockup type="responsive">
                  <img
                    src={mockupImage.src}
                    alt={mockupImage.alt}
                    className="w-full h-auto rounded-md"
                    loading="eager"
                  />
                </Mockup>
              </MockupFrame>
              <div
                className="absolute bottom-0 left-0 right-0 w-full h-48 md:h-64 lg:h-80 pointer-events-none"
                style={{
                  background: "linear-gradient(to top, hsl(var(--background)) 0%, transparent 100%)",
                  zIndex: 10,
                }}
              />
            </div>
          )}
        </div>
      </div>
    )
  }
)
Hero.displayName = "Hero"

export { Hero }
