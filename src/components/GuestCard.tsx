"use client"

import { User, Mail, Phone, Users, Trash2, Edit } from "lucide-react"

interface Guest {
  id: string
  firstName: string
  lastName: string
  email?: string | null
  phone?: string | null
  rsvpStatus: "PENDING" | "ACCEPTED" | "DECLINED" | "MAYBE"
  dietaryRestrictions?: string | null
  plusOne: boolean
  notes?: string | null
  table?: {
    id: string
    name: string
  } | null
  relationshipsFrom: Array<{
    id: string
    relationshipType: string
    guestTo: {
      id: string
      firstName: string
      lastName: string
    }
  }>
  relationshipsTo: Array<{
    id: string
    relationshipType: string
    guestFrom: {
      id: string
      firstName: string
      lastName: string
    }
  }>
}

interface GuestCardProps {
  guest: Guest
  onEdit: () => void
  onDelete: () => void
}

export function GuestCard({ guest, onEdit, onDelete }: GuestCardProps) {
  const getRsvpBadgeClass = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return "rsvp-badge rsvp-accepted"
      case "DECLINED":
        return "rsvp-badge rsvp-declined"
      case "MAYBE":
        return "rsvp-badge rsvp-maybe"
      default:
        return "rsvp-badge rsvp-pending"
    }
  }

  const totalRelationships = guest.relationshipsFrom.length + guest.relationshipsTo.length

  return (
    <div className="guest-card bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 p-2 rounded-full">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {guest.firstName} {guest.lastName}
            </h3>
            <div className={getRsvpBadgeClass(guest.rsvpStatus)}>{guest.rsvpStatus}</div>
          </div>
        </div>
        <div className="flex space-x-2">
          <button onClick={onEdit} className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
            <Edit className="w-4 h-4" />
          </button>
          <button onClick={onDelete} className="p-1 text-gray-400 hover:text-red-600 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-2 text-sm text-gray-600">
        {guest.email && (
          <div className="flex items-center space-x-2">
            <Mail className="w-4 h-4" />
            <span>{guest.email}</span>
          </div>
        )}
        {guest.phone && (
          <div className="flex items-center space-x-2">
            <Phone className="w-4 h-4" />
            <span>{guest.phone}</span>
          </div>
        )}
        {guest.table && (
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>Table: {guest.table.name}</span>
          </div>
        )}
        {totalRelationships > 0 && (
          <div className="text-blue-600">
            {totalRelationships} relationship{totalRelationships !== 1 ? "s" : ""}
          </div>
        )}
        {guest.plusOne && <div className="text-green-600 font-medium">Plus One</div>}
        {guest.dietaryRestrictions && <div className="text-orange-600">Dietary: {guest.dietaryRestrictions}</div>}
        {guest.notes && <div className="text-gray-500 italic">Note: {guest.notes}</div>}
      </div>
    </div>
  )
}
