import { trpc } from "../utils/trpc"
import { GuestCard } from "./GuestCard"

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
    isSelected?: boolean
    photo: {
      id: string
      fileName: string
      originalName: string
      filePath: string
      isHidden: boolean
    }
  }>
}

interface GuestListProps {
  guests: Guest[]
  onEditGuest: (guestId: string) => void
  onRefetch: () => void
}

export function GuestList({ guests, onEditGuest, onRefetch }: GuestListProps) {
  const deleteGuestMutation = trpc.guests.delete.useMutation({
    onSuccess: () => {
      onRefetch()
    },
  })

  const handleDeleteGuest = async (guestId: string) => {
    if (window.confirm("Are you sure you want to delete this guest?")) {
      await deleteGuestMutation.mutateAsync(guestId)
    }
  }

  if (guests.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg">No guests found</div>
        <div className="text-gray-400 text-sm mt-2">Add your first guest to get started</div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {guests.map((guest) => (
        <GuestCard
          key={guest.id}
          guest={guest}
          onEdit={() => onEditGuest(guest.id)}
          onDelete={() => handleDeleteGuest(guest.id)}
        />
      ))}
    </div>
  )
}
