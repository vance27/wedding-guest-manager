"use client"

import { trpc } from "../utils/trpc"
import { Edit, Trash2, Users, UserMinus, AlertTriangle } from "lucide-react"

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
  description?: string | null
  guests: Guest[]
  _count: {
    guests: number
  }
}

interface TableCardProps {
  table: Table
  onEdit: () => void
  onUnassignGuest: (guestId: string) => void
  getGuestRelationships: (guestId: string) => any[]
}

export function TableCard({ table, onEdit, onUnassignGuest, getGuestRelationships }: TableCardProps) {
  const deleteTableMutation = trpc.tables.delete.useMutation()

  const handleDelete = async () => {
    if (table.guests.length > 0) {
      alert("Cannot delete a table with assigned guests. Please reassign them first.")
      return
    }
    if (window.confirm("Are you sure you want to delete this table?")) {
      await deleteTableMutation.mutateAsync(table.id)
      window.location.reload() // Simple refresh for demo
    }
  }

  const isOverCapacity = table.guests.length > table.capacity
  const capacityPercentage = (table.guests.length / table.capacity) * 100

  // Calculate relationship connections within this table
  const getTableConnections = () => {
    let connections = 0
    table.guests.forEach((guest) => {
      const relationships = getGuestRelationships(guest.id)
      relationships.forEach((rel) => {
        const otherGuestId = rel.guestFromId === guest.id ? rel.guestToId : rel.guestFromId
        if (table.guests.some((g) => g.id === otherGuestId)) {
          connections++
        }
      })
    })
    return Math.floor(connections / 2) // Divide by 2 to avoid double counting
  }

  const tableConnections = getTableConnections()

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-lg">{table.name}</h3>
            {table.description && <p className="text-gray-600 text-sm mt-1">{table.description}</p>}
          </div>
          <div className="flex space-x-2">
            <button onClick={onEdit} className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
              <Edit className="w-4 h-4" />
            </button>
            <button onClick={handleDelete} className="p-1 text-gray-400 hover:text-red-600 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4 text-gray-500" />
              <span className={`text-sm font-medium ${isOverCapacity ? "text-red-600" : "text-gray-700"}`}>
                {table.guests.length}/{table.capacity}
              </span>
            </div>
            {tableConnections > 0 && (
              <div className="text-sm text-blue-600 font-medium">{tableConnections} connections</div>
            )}
          </div>
          {isOverCapacity && (
            <div className="flex items-center space-x-1 text-red-600">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-xs font-medium">Over capacity</span>
            </div>
          )}
        </div>

        {/* Capacity bar */}
        <div className="mt-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                isOverCapacity ? "bg-red-500" : capacityPercentage > 80 ? "bg-yellow-500" : "bg-green-500"
              }`}
              style={{ width: `${Math.min(capacityPercentage, 100)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="p-4">
        {table.guests.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <Users className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <div className="text-sm">No guests assigned</div>
          </div>
        ) : (
          <div className="space-y-2">
            {table.guests.map((guest) => {
              const guestRelationships = getGuestRelationships(guest.id)
              const tableRelationships = guestRelationships.filter((rel) => {
                const otherGuestId = rel.guestFromId === guest.id ? rel.guestToId : rel.guestFromId
                return table.guests.some((g) => g.id === otherGuestId)
              })

              return (
                <div
                  key={guest.id}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 text-sm">
                      {guest.firstName} {guest.lastName}
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
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
                      {tableRelationships.length > 0 && (
                        <span className="text-xs text-blue-600">{tableRelationships.length} connections</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => onUnassignGuest(guest.id)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    title="Remove from table"
                  >
                    <UserMinus className="w-4 h-4" />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
