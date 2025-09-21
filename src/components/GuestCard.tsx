"use client"

import { useState } from "react"
import { User, Mail, Phone, Users, Trash2, Edit, Camera, ChevronDown, ChevronUp } from "lucide-react"
import { trpc } from "../utils/trpc"

interface Guest {
  id: string
  firstName: string
  lastName: string
  email?: string | null
  phone?: string | null
  rsvpStatus: "PENDING" | "ACCEPTED" | "DECLINED" | "MAYBE"
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
  photoAssignments?: Array<{
    id: string
    photo: {
      id: string
      fileName: string
      originalName: string
      filePath: string
      isHidden: boolean
    }
  }>
}

interface GuestCardProps {
  guest: Guest
  onEdit: () => void
  onDelete: () => void
}

export function GuestCard({ guest, onEdit, onDelete }: GuestCardProps) {
  const [showPhotos, setShowPhotos] = useState(false)

  const { data: guestPhotos, isLoading } = trpc.guests.getPhotos.useQuery(
    guest.id,
    { enabled: showPhotos }
  )

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
  const hasPhotos = guest.photoAssignments && guest.photoAssignments.length > 0
  const photoCount = guest.photoAssignments?.length || 0

  return (
    <div className={`guest-card bg-white rounded-lg shadow-md p-6 border-2 transition-colors ${
      hasPhotos ? 'border-gray-200' : 'border-red-300'
    }`}>
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
        {guest.notes && <div className="text-gray-500 italic">Note: {guest.notes}</div>}
      </div>

      {/* Photo Section */}
      <div className="mt-4 border-t border-gray-200 pt-4">
        {hasPhotos ? (
          <button
            onClick={() => setShowPhotos(!showPhotos)}
            className="flex items-center justify-between w-full text-left text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <Camera className="w-4 h-4" />
              <span>{photoCount} photo{photoCount !== 1 ? 's' : ''}</span>
            </div>
            {showPhotos ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        ) : (
          <div className="flex items-center space-x-2 text-red-600 text-sm font-medium">
            <Camera className="w-4 h-4" />
            <span>No photos currently</span>
          </div>
        )}

        {/* Expandable Photo Grid */}
        {showPhotos && hasPhotos && (
          <div className="mt-3">
            {isLoading ? (
              <div className="text-gray-500 text-sm">Loading photos...</div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {guestPhotos?.map((assignment) => (
                  <div key={assignment.id} className="relative">
                    <img
                      src={assignment.photo.filePath}
                      alt={assignment.photo.originalName}
                      className="w-full h-20 object-cover rounded border"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    <div className="hidden w-full h-20 bg-gray-100 rounded border flex items-center justify-center">
                      <Camera className="w-6 h-6 text-gray-400" />
                    </div>
                    <div className="text-xs text-gray-500 mt-1 truncate">
                      {assignment.photo.originalName}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
