"use client"

import { useState } from "react"
import { trpc } from "../utils/trpc"
import { RelationshipForm } from "./RelationshipForm"
import { RelationshipList } from "./RelationshipList"
import { Plus } from "lucide-react"

export function RelationshipManager() {
  const [showForm, setShowForm] = useState(false)

  const { data: relationships, refetch } = trpc.relationships.getAll.useQuery()

  const handleRelationshipSaved = () => {
    setShowForm(false)
    refetch()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Guest Relationships</h2>
          <p className="text-gray-600 mt-1">Manage connections between your wedding guests</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Relationship</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-900">Relationship Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{relationships?.length || 0}</div>
              <div className="text-sm text-blue-800">Total Relationships</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {relationships?.filter((r) => r.relationshipType === "FAMILY").length || 0}
              </div>
              <div className="text-sm text-green-800">Family Connections</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {relationships?.filter((r) => r.relationshipType === "FRIEND").length || 0}
              </div>
              <div className="text-sm text-purple-800">Friend Connections</div>
            </div>
          </div>
        </div>
      </div>

      <RelationshipList relationships={relationships || []} onRefetch={refetch} />

      {showForm && <RelationshipForm onSave={handleRelationshipSaved} onCancel={() => setShowForm(false)} />}
    </div>
  )
}
