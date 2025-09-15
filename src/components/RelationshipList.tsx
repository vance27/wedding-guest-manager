"use client"

import { trpc } from "../utils/trpc"
import { Trash2, Users, Heart, Briefcase, UserCheck } from "lucide-react"

interface Relationship {
  id: string
  relationshipType: string
  strength: number
  notes?: string | null
  guestFrom: {
    id: string
    firstName: string
    lastName: string
  }
  guestTo: {
    id: string
    firstName: string
    lastName: string
  }
}

interface RelationshipListProps {
  relationships: Relationship[]
  onRefetch: () => void
}

export function RelationshipList({ relationships, onRefetch }: RelationshipListProps) {
  const deleteRelationshipMutation = trpc.relationships.delete.useMutation({
    onSuccess: () => {
      onRefetch()
    },
  })

  const handleDelete = async (relationshipId: string) => {
    if (window.confirm("Are you sure you want to delete this relationship?")) {
      await deleteRelationshipMutation.mutateAsync(relationshipId)
    }
  }

  const getRelationshipIcon = (type: string) => {
    switch (type) {
      case "FAMILY":
      case "SIBLING":
      case "PARENT":
      case "CHILD":
      case "COUSIN":
        return <Users className="w-4 h-4 text-blue-600" />
      case "SPOUSE":
      case "PARTNER":
        return <Heart className="w-4 h-4 text-red-600" />
      case "COLLEAGUE":
        return <Briefcase className="w-4 h-4 text-gray-600" />
      default:
        return <UserCheck className="w-4 h-4 text-green-600" />
    }
  }

  const getStrengthColor = (strength: number) => {
    if (strength >= 4) return "text-green-600 bg-green-100"
    if (strength >= 3) return "text-blue-600 bg-blue-100"
    if (strength >= 2) return "text-yellow-600 bg-yellow-100"
    return "text-gray-600 bg-gray-100"
  }

  if (relationships.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <div className="text-gray-500 text-lg">No relationships found</div>
        <div className="text-gray-400 text-sm mt-2">Add relationships to help with table assignments</div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">All Relationships</h3>
      </div>
      <div className="divide-y divide-gray-200">
        {relationships.map((relationship) => (
          <div key={relationship.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">{getRelationshipIcon(relationship.relationshipType)}</div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">
                      {relationship.guestFrom.firstName} {relationship.guestFrom.lastName}
                    </span>
                    <span className="text-gray-500">→</span>
                    <span className="font-medium text-gray-900">
                      {relationship.guestTo.firstName} {relationship.guestTo.lastName}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 mt-1">
                    <span className="text-sm text-gray-600 capitalize">
                      {relationship.relationshipType.toLowerCase().replace("_", " ")}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStrengthColor(
                        relationship.strength,
                      )}`}
                    >
                      Strength: {relationship.strength}/5
                    </span>
                  </div>
                  {relationship.notes && <div className="text-sm text-gray-500 mt-1">{relationship.notes}</div>}
                </div>
              </div>
              <button
                onClick={() => handleDelete(relationship.id)}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                title="Delete relationship"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
