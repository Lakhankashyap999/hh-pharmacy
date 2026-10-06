'use client'

import React, { useState } from 'react'

interface MedicinePackshotProps {
  name: string
  brand?: string | null
  genericName?: string | null
  unitType?: string
  unitsPerPack?: number
  drugSchedule?: string
  categoryName?: string
  categoryColor?: string | null
  imageUrl?: string | null
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

// Extract dosage strength from name (e.g. "650mg", "500mg", "40mg", "625mg", "100ml", "50g")
function extractStrength(name: string, genericName?: string | null): string {
  const text = `${name} ${genericName || ''}`
  const match = text.match(/(\d+(?:\.\d+)?\s*(?:mg|mcg|gm|g|ml|iu|%))/i)
  if (match) return match[1].toUpperCase()
  return ''
}

// Clean brand / display title
function cleanBrandName(name: string, brand?: string | null): string {
  if (brand && brand.trim()) return brand.trim()
  // Clean up "Dolo 650mg Tablet" -> "DOLO"
  const firstWord = name.split(/\s+/)[0]
  return firstWord || name
}

// Determine package type
function detectPackType(unitType?: string, name?: string): 'strip' | 'bottle' | 'tube' | 'sachet' | 'box' {
  const low = `${unitType || ''} ${name || ''}`.toLowerCase()
  if (low.includes('syrup') || low.includes('suspension') || low.includes('drops') || low.includes('liquid') || low.includes('bottle')) {
    return 'bottle'
  }
  if (low.includes('gel') || low.includes('cream') || low.includes('ointment') || low.includes('tube') || low.includes('spray')) {
    return 'tube'
  }
  if (low.includes('sachet') || low.includes('powder') || low.includes('salt') || low.includes('chyawanprash') || low.includes('jar')) {
    return 'sachet'
  }
  return 'strip'
}

export function MedicinePackshot({
  name,
  brand,
  genericName,
  unitType = 'strip',
  unitsPerPack = 10,
  drugSchedule = 'OTC',
  categoryName,
  categoryColor,
  imageUrl,
  size = 'md',
  className = '',
}: MedicinePackshotProps) {
  const [imgError, setImgError] = useState(false)

  // Disregard generic Unsplash stock photos of random pills
  const isGenericUnsplash =
    imageUrl &&
    (imageUrl.includes('unsplash.com') ||
      imageUrl.includes('placeholder') ||
      imageUrl.startsWith('/placeholder'))

  const hasValidCustomImage = Boolean(imageUrl && !isGenericUnsplash && !imgError)

  // Size styles
  const sizeMap = {
    xs: 'w-10 h-10 text-[8px]',
    sm: 'w-full h-full max-h-32 text-[10px]',
    md: 'w-full h-full min-h-28 text-xs',
    lg: 'w-full h-64 text-sm',
    xl: 'w-full h-80 sm:h-96 text-base',
  }

  const strength = extractStrength(name, genericName)
  const displayBrand = cleanBrandName(name, brand)
  const packType = detectPackType(unitType, name)
  const isRx = drugSchedule === 'H' || drugSchedule === 'H1' || drugSchedule === 'X'

  // If a genuine, custom uploaded photo is provided, render it with fallback to 3D packshot
  if (hasValidCustomImage) {
    return (
      <div className={`relative flex items-center justify-center overflow-hidden ${sizeMap[size]} ${className}`}>
        <img
          src={imageUrl!}
          alt={name}
          className="h-full w-full object-contain p-1"
          onError={() => setImgError(true)}
          loading="lazy"
        />
      </div>
    )
  }

  // --- 3D DIGITAL PHARMACEUTICAL PACKSHOT RENDERER ---

  // 1. BLISTER STRIP RENDERER (Tablets / Capsules)
  if (packType === 'strip') {
    return (
      <div
        className={`relative flex items-center justify-center p-2 select-none ${sizeMap[size]} ${className}`}
        title={`${name} (Digital Packshot)`}
      >
        {/* Blister Card Container */}
        <div className="relative w-full max-w-[220px] aspect-[1.35/1] rounded-xl sm:rounded-2xl p-2 sm:p-2.5 shadow-md border border-slate-300/80 bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300 flex flex-col justify-between overflow-hidden">
          {/* Metallic foil crosshatch pattern & highlight */}
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.3)_50%,transparent_75%)] bg-[length:12px_12px] opacity-40 pointer-events-none" />
          <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />

          {/* Schedule Red Warning Bar (if Rx) or Green Dot (if OTC) */}
          <div className="relative z-10 flex items-center justify-between gap-1 mb-1">
            {isRx ? (
              <div className="flex items-center gap-1 bg-red-600 text-white text-[7px] sm:text-[8px] font-black px-1.5 py-0.5 rounded-sm uppercase tracking-wider shadow-2xs">
                <span>Rx</span>
                <span className="hidden xs:inline">Schedule {drugSchedule}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 bg-emerald-600 text-white text-[7px] sm:text-[8px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                <span>● OTC</span>
              </div>
            )}

            {strength && (
              <span className="font-mono font-black text-[8px] sm:text-[10px] text-slate-800 bg-white/80 px-1 rounded border border-slate-300 shadow-3xs">
                {strength}
              </span>
            )}
          </div>

          {/* Central Tablet Wells / Blister Pockets (Embossed 3D Silver Bubbles) */}
          <div className="relative z-10 grid grid-cols-5 gap-1 sm:gap-1.5 my-auto px-1 py-1">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-full bg-gradient-to-br from-white via-slate-200 to-slate-400 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.9),inset_-1px_-1px_2px_rgba(0,0,0,0.25),0_1px_2px_rgba(0,0,0,0.15)] border border-slate-300/60 flex items-center justify-center"
              >
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white/60 shadow-3xs" />
              </div>
            ))}
          </div>

          {/* Bottom Foil Stamp: Brand & Salt Info */}
          <div className="relative z-10 pt-1 border-t border-slate-300/80 flex items-center justify-between gap-1">
            <div className="min-w-0">
              <p className="font-poppins font-black text-[9px] sm:text-[11px] text-slate-900 leading-none truncate tracking-tight">
                {displayBrand}
              </p>
              <p className="text-[7px] sm:text-[8px] text-slate-600 truncate font-medium mt-0.5 max-w-[130px]">
                {genericName || name}
              </p>
            </div>
            <span className="text-[7px] sm:text-[8px] font-bold text-slate-500 whitespace-nowrap bg-white/60 px-1 py-0.2 rounded border border-slate-300/60">
              {unitsPerPack} Tablets
            </span>
          </div>

          {/* Hologram security stamp in corner */}
          <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-gradient-to-tr from-teal-400 via-purple-300 to-amber-300 opacity-60 blur-[1px] pointer-events-none" />
        </div>
      </div>
    )
  }

  // 2. BOTTLE RENDERER (Syrups, Suspensions, Drops, Liquids)
  if (packType === 'bottle') {
    return (
      <div
        className={`relative flex items-center justify-center p-2 select-none ${sizeMap[size]} ${className}`}
        title={`${name} (Digital Packshot)`}
      >
        <div className="relative w-full max-w-[170px] aspect-[1.1/1] flex items-center justify-center">
          {/* Amber Pharma Glass Bottle Shape */}
          <div className="relative w-24 sm:w-28 h-24 sm:h-28 rounded-2xl bg-gradient-to-br from-amber-700 via-amber-800 to-amber-950 shadow-lg border border-amber-900/60 p-1 flex flex-col justify-between overflow-hidden">
            {/* Glass reflection gloss */}
            <div className="absolute inset-y-0 left-1 w-2 bg-gradient-to-r from-white/30 to-transparent rounded-l-xl pointer-events-none" />

            {/* White Measurement Cap */}
            <div className="w-10 h-3 mx-auto bg-gradient-to-b from-slate-100 to-slate-300 rounded-t-md shadow-inner border border-slate-400 -mt-1" />

            {/* Paper Label Wrapped Around Bottle */}
            <div className="bg-white rounded-lg p-1.5 shadow-sm border border-amber-900/30 my-auto mx-0.5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[7px] font-bold text-emerald-800 uppercase">Oral Liquid</span>
                {strength && (
                  <span className="text-[7px] font-mono font-bold bg-amber-100 text-amber-900 px-1 rounded">
                    {strength}
                  </span>
                )}
              </div>
              <p className="font-poppins font-black text-[9px] sm:text-[10px] text-gray-900 leading-tight truncate">
                {displayBrand}
              </p>
              <p className="text-[7px] text-gray-500 truncate leading-none">{genericName || name}</p>
              {isRx && (
                <div className="h-1 bg-red-600 rounded-xs w-full" title="Schedule H Drug Strip" />
              )}
            </div>

            {/* Liquid Level Base */}
            <div className="text-center pb-0.5">
              <span className="text-[7px] font-bold text-amber-200/80 font-mono">
                {strength.includes('ML') ? strength : '100 ML'}
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 3. TUBE RENDERER (Pain Gels, Ointments, Creams)
  if (packType === 'tube') {
    return (
      <div
        className={`relative flex items-center justify-center p-2 select-none ${sizeMap[size]} ${className}`}
        title={`${name} (Digital Packshot)`}
      >
        <div className="relative w-full max-w-[200px] aspect-[1.3/1] flex items-center justify-center">
          {/* Aluminum Pharma Tube Body */}
          <div className="relative w-36 sm:w-44 h-16 sm:h-18 rounded-xl bg-gradient-to-r from-slate-300 via-white to-slate-300 shadow-md border border-slate-300 p-2 flex items-center justify-between rotate-[-6deg] overflow-hidden">
            {/* Tube Crimp Seal on Left */}
            <div className="w-2.5 h-full bg-slate-400/80 rounded-l border-r border-slate-500 shadow-inner flex flex-col justify-around py-1">
              <div className="w-full h-0.5 bg-slate-600/50" />
              <div className="w-full h-0.5 bg-slate-600/50" />
              <div className="w-full h-0.5 bg-slate-600/50" />
            </div>

            {/* Printed Branding */}
            <div className="flex-1 px-2 space-y-0.5">
              <span className="text-[7px] font-bold uppercase text-teal-800 bg-teal-50 px-1 rounded">
                Gel / Ointment
              </span>
              <p className="font-poppins font-black text-[9px] sm:text-[11px] text-gray-900 leading-tight truncate">
                {displayBrand}
              </p>
              <p className="text-[7px] text-gray-500 truncate">{genericName || name}</p>
            </div>

            {/* Twist Screw Cap on Right */}
            <div className="w-4 h-9 bg-teal-600 rounded-r-md border border-teal-700 shadow-inner flex flex-col justify-between py-1">
              <div className="w-full h-0.5 bg-teal-400" />
              <div className="w-full h-0.5 bg-teal-400" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 4. SACHET / AYURVEDIC JAR / POWDER RENDERER
  return (
    <div
      className={`relative flex items-center justify-center p-2 select-none ${sizeMap[size]} ${className}`}
      title={`${name} (Digital Packshot)`}
    >
      <div className="relative w-full max-w-[190px] aspect-[1.25/1] rounded-2xl p-2.5 shadow-md border border-emerald-200 bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100 flex flex-col justify-between overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[7px] sm:text-[8px] font-bold text-emerald-800 bg-emerald-200/60 px-1.5 py-0.5 rounded-full">
            🌿 Authentic Ayush
          </span>
          <span className="text-[8px] font-bold text-teal-900 font-mono">{strength || '100% Herbal'}</span>
        </div>

        <div className="my-auto text-center py-1">
          <p className="font-poppins font-black text-[11px] sm:text-xs text-emerald-950 leading-tight">
            {displayBrand}
          </p>
          <p className="text-[8px] text-emerald-700 truncate mt-0.5">{genericName || name}</p>
        </div>

        <div className="pt-1 border-t border-emerald-200/70 flex items-center justify-between text-[7px] text-emerald-800 font-medium">
          <span>H&amp;H Quality Tested</span>
          <span>{unitsPerPack > 1 ? `${unitsPerPack} Units` : 'Standard Pack'}</span>
        </div>
      </div>
    </div>
  )
}
export default MedicinePackshot
