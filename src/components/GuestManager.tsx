"use client"

import { useState } from "react"
import { trpc } from "../utils/trpc"
import { GuestList } from "./GuestList"
import { GuestForm } from "./GuestForm"
import { TabNavigation } from "./TabNavigation"
import { RelationshipManager } from "./RelationshipManager"
import { GraphVisualization } from "./GraphVisualization"
import { TableAssignment } from "./TableAssignment"
import { PhotoAssignment } from "./PhotoAssignment"

type Tab = "guests" | "relationships" | "graph" | "tables" | "photos"

export function GuestManager() {
  const [activeTab, setActiveTab] = useState<Tab>("guests")
  const [showDeclined, setShowDeclined] = useState(false)
  const [showGuestForm, setShowGuestForm] = useState(false)
  const [editingGuest, setEditingGuest] = useState<string | null>(null)

  const { data: guests, refetch: refetchGuests } = trpc.guests.getAll.useQuery({
    includeDeclined: showDeclined,
  })

  const handleGuestSaved = () => {
    setShowGuestForm(false)
    setEditingGuest(null)
    refetchGuests()
  }

  const handleEditGuest = (guestId: string) => {
    setEditingGuest(guestId)
    setShowGuestForm(true)
  }

  const tabs = [
    { id: "guests" as const, label: "Guests", count: guests?.length },
    { id: "relationships" as const, label: "Relationships" },
    { id: "graph" as const, label: "Graph View" },
    { id: "tables" as const, label: "Table Assignment" },
    { id: "photos" as const, label: "Photo Assignment" },
  ]

  return (
    <div className="space-y-6">
      <TabNavigation tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === "guests" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h2 className="text-2xl font-semibold text-gray-900">Guest List</h2>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showDeclined}
                  onChange={(e) => setShowDeclined(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">Show declined guests</span>
              </label>
            </div>
            <button
              onClick={() => setShowGuestForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Guest
            </button>
          </div>

          <GuestList guests={guests || []} onEditGuest={handleEditGuest} onRefetch={refetchGuests} />

          {showGuestForm && (
            <GuestForm
              guestId={editingGuest}
              onSave={handleGuestSaved}
              onCancel={() => {
                setShowGuestForm(false)
                setEditingGuest(null)
              }}
            />
          )}
        </div>
      )}

      {activeTab === "relationships" && <RelationshipManager />}

      {activeTab === "graph" && <GraphVisualization />}

      {activeTab === "tables" && <TableAssignment />}

      {activeTab === "photos" && <PhotoAssignment />}
    </div>
  )
}
