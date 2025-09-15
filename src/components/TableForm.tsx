"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { trpc } from "../utils/trpc"
import { X } from "lucide-react"

interface TableFormProps {
  tableId?: string | null
  onSave: () => void
  onCancel: () => void
}

export function TableForm({ tableId, onSave, onCancel }: TableFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    capacity: 8,
    description: "",
  })

  const { data: table } = trpc.tables.getAll.useQuery(undefined, {
    enabled: !!tableId,
    select: (tables) => tables.find((t) => t.id === tableId),
  })

  const createTableMutation = trpc.tables.create.useMutation({
    onSuccess: onSave,
  })

  const updateTableMutation = trpc.tables.update.useMutation({
    onSuccess: onSave,
  })

  useEffect(() => {
    if (table) {
      setFormData({
        name: table.name,
        capacity: table.capacity,
        description: table.description || "",
      })
    }
  }, [table])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const data = {
      ...formData,
      description: formData.description || undefined,
    }

    if (tableId) {
      await updateTableMutation.mutateAsync({ id: tableId, ...data })
    } else {
      await createTableMutation.mutateAsync(data)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">{tableId ? "Edit Table" : "Add New Table"}</h2>
          <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Table Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Head Table, Family Table A"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Capacity *</label>
            <input
              type="number"
              required
              min="1"
              max="20"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: Number.parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Optional description for this table"
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
              disabled={createTableMutation.isLoading || updateTableMutation.isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {createTableMutation.isLoading || updateTableMutation.isLoading
                ? "Saving..."
                : tableId
                  ? "Update Table"
                  : "Create Table"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
