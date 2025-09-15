"use client"

import { useState } from "react"
import { UserPlus, Users } from "lucide-react"

interface Guest {
  id: string
  firstName: string
  lastName: string
  rsvpStatus: string
}

interface Table {
  id: string
  name: string
  capacity: number
  _count: {
    guests: number
  }
}

interface UnassignedGuestsProps {
  guests: Guest[]
  tables: Table[]
  onAssignGuest: (guestId: string, tableId: string) => void
  getGuestRelationships: (guestId: string) => any[]
}

export function UnassignedGuests({ guests, tables, onAssignGuest, getGuestRelationships }: UnassignedGuestsProps) {
  const [selectedGuest, setSelectedGuest] = useState<string | null>(null)

  const handleAssign = (tableId: string) => {
    if (selectedGuest) {
      onAssignGuest(selectedGuest, tableId)
      setSelectedGuest(null)
    }
  }

  const getAvailableTables = () => {
    return tables.filter((table) => table._count.guests < table.capacity)
  }

  const getSuggestedTables = (guestId: string) => {
    const relationships = getGuestRelationships(guestId)
    const tableScores = new Map<string, number>()

    // Score tables based on existing relationships
    relationships.forEach((rel) => {
      const otherGuestId = rel.guestFromId === guestId ? rel.guestToId : rel.guestFromId
      const otherGuestTable = tables.find((table) => table.guests?.some((g: any) => g.id === otherGuestId))

      if (otherGuestTable && otherGuestTable._count.guests < otherGuestTable.capacity) {
        const currentScore = tableScores.get(otherGuestTable.id) || 0
        tableScores.set(otherGuestTable.id, currentScore + rel.strength)
      }
    })

    return Array.from(tableScores.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([tableId]) => tables.find((t) => t.id === tableId))
      .filter(Boolean)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="bg-orange-100 p-2 rounded-full">
            <Users className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">Unassigned Guests</h3>
            <p className="text-sm text-gray-600">{guests.length} guests need table assignments</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {guests.map((guest) => {
            const suggestedTables = getSuggestedTables(guest.id)
            const availableTables = getAvailableTables()

            return (
              <div
                key={guest.id}
                className={`border rounded-lg p-4 transition-all ${
                  selectedGuest === guest.id ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-medium text-gray-900">
                      {guest.firstName} {guest.lastName}
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        guest.rsvpStatus === "ACCEPTED"
                          ? "bg-green-100 text-green-800"
                          : guest.rsvpStatus === "DECLINED"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {guest.rsvpStatus}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedGuest(selectedGuest === guest.id ? null : guest.id)}
                    className={`p-2 rounded-full transition-colors ${
                      selectedGuest === guest.id
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    <UserPlus className="w-4 h-4" />
                  </button>
                </div>

                {selectedGuest === guest.id && (
                  <div className="space-y-2">
                    {suggestedTables.length > 0 && (
                      <div>
                        <div className="text-xs font-medium text-green-700 mb-1">Suggested (has connections):</div>
                        {suggestedTables.map((table: any) => (
                          <button
                            key={table.id}
                            onClick={() => handleAssign(table.id)}
                            className="w-full text-left px-2 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200 transition-colors mb-1"
                          >
                            {table.name} ({table._count.guests}/{table.capacity})
                          </button>
                        ))}
                      </div>
                    )}

                    <div>
                      <div className="text-xs font-medium text-gray-700 mb-1">Available tables:</div>
                      {availableTables
                        .filter((table) => !suggestedTables.some((st: any) => st?.id === table.id))
                        .map((table) => (
                          <button
                            key={table.id}
                            onClick={() => handleAssign(table.id)}
                            className="w-full text-left px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors mb-1"
                          >
                            {table.name} ({table._count.guests}/{table.capacity})
                          </button>
                        ))}
                    </div>

                    {availableTables.length === 0 && (
                      <div className="text-xs text-red-600">No tables with available capacity</div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
