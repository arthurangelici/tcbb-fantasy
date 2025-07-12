"use client"

import { formatPointsCompact } from "@/lib/utils"

export default function TestPage() {
  const testValues = [150, 1000, 1500, 100000, 123456, 1000000, 9999999]
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Format Points Compact Test</h1>
      
      <div className="space-y-4">
        {testValues.map((value) => (
          <div key={value} className="flex items-center justify-between p-4 bg-white border rounded-lg">
            <span className="text-lg">Original: {value.toLocaleString()}</span>
            <span className="text-lg font-bold text-emerald-600">Formatted: {formatPointsCompact(value)}</span>
          </div>
        ))}
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Logic Test</h2>
        <div className="space-y-2 text-sm">
          <p>• Numbers below 1000: show as-is</p>
          <p>• Numbers 1000-999999: show with K suffix</p>
          <p>• Numbers 1000000+: show with M suffix</p>
          <p>• Remove trailing .0 for clean display</p>
        </div>
      </div>
    </div>
  )
}