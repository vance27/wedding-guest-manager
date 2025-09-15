"use client"

import type React from "react"

import { useState } from "react"
import { trpc } from "../utils/trpc"
import { X } from "lucide-react"

interface RelationshipFormProps {
  onSave: () => void
  onCancel: () => void
}

const relationshipTypes = [
  { value: "FAMILY", label: "Family" },
  { value: "FRIEND", label: "Friend" },
  { value: "COLLEAGUE", label: "Colleague" },
  { value: "PARTNER", label: "Partner" },
  { value: "SPOUSE", label: "Spouse" },
  { value: "SIBLING", label: "Sibling" },
  { value: "PARENT", label: "Parent" },
  { value: "CHILD", label: "Child" },
  { value: "COUSIN", label: "Cousin" },
  { value: "ACQUAINTANCE", label: "Acquaintance" },
]

export function RelationshipForm({ onSave, onCancel }: RelationshipFormProps) {
  const [formData, setFormData] = useState({
    guestFromId: "",
    guestToId: "",
    relationshipType: "FRIEND" as const,
    strength: 3,
    notes: "",
  })

  const { data: guests } = trpc.guests.getAll.useQuery({ includeDeclined: false })

  const createRelationshipMutation = trpc.relationships.create.useMutation({
    onSuccess: onSave,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.guestFromId === formData.guestToId) {
      alert("Please select two different guests")
      return
    }

    const data = {
      ...formData,
      notes: formData.notes || undefined,
    }

    await createRelationshipMutation.mutateAsync(data)
  }

  const availableGuests = guests?.filter((guest) => guest.rsvpStatus !== "DECLINED") || []

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Add Relationship</h2>
          <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Guest *</label>
            <select
              required
              value={formData.guestFromId}
              onChange={(e) => setFormData({ ...formData, guestFromId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a guest</option>
              {availableGuests.map((guest) => (
                <option key={guest.id} value={guest.id}>
                  {guest.firstName} {guest.lastName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Second Guest *</label>
            <select
              required
              value={formData.guestToId}
              onChange={(e) => setFormData({ ...formData, guestToId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a guest</option>
              {availableGuests
                .filter((guest) => guest.id !== formData.guestFromId)
                .map((guest) => (
                  <option key={guest.id} value={guest.id}>
                    {guest.firstName} {guest.lastName}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Relationship Type *</label>
            <select
              value={formData.relationshipType}
              onChange={(e) => setFormData({ ...formData, relationshipType: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {relationshipTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Relationship Strength: {formData.strength}/5
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={formData.strength}
              onChange={(e) => setFormData({ ...formData, strength: Number.parseInt(e.target.value) })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Weak</span>
              <span>Strong</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Additional details about this relationship"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createRelationshipMutation.isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {createRelationshipMutation.isLoading ? "Adding..." : "Add Relationship"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
