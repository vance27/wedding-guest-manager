"use client"

import { useState } from "react"
import { trpc } from "../utils/trpc"
import { TableCard } from "./TableCard"
import { TableForm } from "./TableForm"
import { UnassignedGuests } from "./UnassignedGuests"
import { Plus, Users, AlertCircle } from "lucide-react"

export function TableAssignment() {
  const [showTableForm, setShowTableForm] = useState(false)
  const [editingTable, setEditingTable] = useState<string | null>(null)

  const { data: tables, refetch: refetchTables } = trpc.tables.getAll.useQuery()
  const { data: guests, refetch: refetchGuests } = trpc.guests.getAll.useQuery({ includeDeclined: false })
  const { data: relationships } = trpc.relationships.getAll.useQuery()

  const assignGuestMutation = trpc.tables.assignGuest.useMutation({
    onSuccess: () => {
      refetchTables()
      refetchGuests()
    },
  })

  const unassignedGuests = guests?.filter((guest) => !guest.tableId) || []
  const totalAssignedGuests = guests?.filter((guest) => guest.tableId).length || 0
  const totalCapacity = tables?.reduce((sum, table) => sum + table.capacity, 0) || 0

  const handleTableSaved = () => {
    setShowTableForm(false)
    setEditingTable(null)
    refetchTables()
  }

  const handleEditTable = (tableId: string) => {
    setEditingTable(tableId)
    setShowTableForm(true)
  }

  const handleAssignGuest = async (guestId: string, tableId: string) => {
    await assignGuestMutation.mutateAsync({ guestId, tableId })
  }

  const handleUnassignGuest = async (guestId: string) => {
    await assignGuestMutation.mutateAsync({ guestId, tableId: undefined })
  }

  const getGuestRelationships = (guestId: string) => {
    return relationships?.filter((rel) => rel.guestFromId === guestId || rel.guestToId === guestId) || []
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Table Assignment</h2>
          <p className="text-gray-600 mt-1">Organize your guests into tables</p>
        </div>
        <button
          onClick={() => setShowTableForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Table</span>
        </button>
      </div>

      {/* Assignment Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{tables?.length || 0}</div>
              <div className="text-sm text-gray-600">Total Tables</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-2 rounded-full">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{totalAssignedGuests}</div>
              <div className="text-sm text-gray-600">Assigned Guests</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="bg-orange-100 p-2 rounded-full">
              <AlertCircle className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{unassignedGuests.length}</div>
              <div className="text-sm text-gray-600">Unassigned</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 p-2 rounded-full">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{totalCapacity}</div>
              <div className="text-sm text-gray-600">Total Capacity</div>
            </div>
          </div>
        </div>
      </div>

      {/* Unassigned Guests */}
      {unassignedGuests.length > 0 && (
        <UnassignedGuests
          guests={unassignedGuests}
          tables={tables || []}
          onAssignGuest={handleAssignGuest}
          getGuestRelationships={getGuestRelationships}
        />
      )}

      {/* Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {tables?.map((table) => (
          <TableCard
            key={table.id}
            table={table}
            onEdit={() => handleEditTable(table.id)}
            onUnassignGuest={handleUnassignGuest}
            getGuestRelationships={getGuestRelationships}
          />
        ))}
      </div>

      {tables?.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <div className="text-gray-500 text-lg">No tables created yet</div>
          <div className="text-gray-400 text-sm mt-2">Create your first table to start organizing guests</div>
        </div>
      )}

      {showTableForm && (
        <TableForm
          tableId={editingTable}
          onSave={handleTableSaved}
          onCancel={() => {
            setShowTableForm(false)
            setEditingTable(null)
          }}
        />
      )}
    </div>
  )
}
