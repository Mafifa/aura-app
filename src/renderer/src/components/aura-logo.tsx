import auraImage from "../assets/aura-image.png"

interface AuraLogoProps {

  className?: string
}

export default function AuraLogo ({ className = "w-6 h-6" }: AuraLogoProps) {
  return (
    <div className={`relative ${className}`}>
      <img
        src={auraImage}
        alt="Aura Logo"
        className="w-full h-full object-contain"
      />
    </div>
  )
}
