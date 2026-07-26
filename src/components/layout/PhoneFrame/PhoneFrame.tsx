import type { ReactNode } from 'react'
import './PhoneFrame.scss'

interface PhoneFrameProps {
  children: ReactNode
}

export function PhoneFrame({ children }: PhoneFrameProps) {
  return (
    <div className="phone-frame">
      <div className="phone-screen">
        {children}
      </div>
    </div>
  )
}
