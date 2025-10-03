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
  const [hideGuestsWithoutPhotos, setHideGuestsWithoutPhotos] = useState(false)
  const [hideGuestsWithPhotos, setHideGuestsWithPhotos] = useState(false)
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

  // Filter guests based on photo assignments
  const filteredGuests = guests?.filter(guest => {
    const hasPhotos = guest.photoAssignments && guest.photoAssignments.length > 0;

    // If hiding guests without photos, only show those with photos
    if (hideGuestsWithoutPhotos && !hasPhotos) {
      return false;
    }

    // If hiding guests with photos, only show those without photos
    if (hideGuestsWithPhotos && hasPhotos) {
      return false;
    }

    return true;
  }) || [];

  const tabs = [
    { id: "guests" as const, label: "Guests", count: filteredGuests?.length },
    { id: "relationships" as const, label: "Relationships" },
    { id: "graph" as const, label: "Graph View" },
    { id: "tables" as const, label: "Table Assignment" },
    { id: "photos" as const, label: "Photo Assignment" },
  ]

  return (
    <div className="space-y-6">
      <TabNavigation tabs={tabs} activeTab={activeTab} onTabChange={(tabId) => setActiveTab(tabId as Tab)} />

      {activeTab === "guests" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-6">
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
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={hideGuestsWithoutPhotos}
                  onChange={(e) => {
                    if (e.target.checked && hideGuestsWithPhotos) {
                      setHideGuestsWithPhotos(false);
                    }
                    setHideGuestsWithoutPhotos(e.target.checked);
                  }}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <span className="text-sm text-gray-600">Hide guests without photos</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={hideGuestsWithPhotos}
                  onChange={(e) => {
                    if (e.target.checked && hideGuestsWithoutPhotos) {
                      setHideGuestsWithoutPhotos(false);
                    }
                    setHideGuestsWithPhotos(e.target.checked);
                  }}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="text-sm text-gray-600">Hide guests with photos</span>
              </label>
            </div>
            <button
              onClick={() => setShowGuestForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Guest
            </button>
          </div>

          <GuestList guests={filteredGuests} onEditGuest={handleEditGuest} onRefetch={refetchGuests} />

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
