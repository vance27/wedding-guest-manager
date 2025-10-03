"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { trpc } from "../utils/trpc";
import { X } from "lucide-react";
import { $Enums } from "@prisma/client";

interface GuestFormProps {
  guestId?: string | null;
  onSave: () => void;
  onCancel: () => void;
}

export function GuestForm({ guestId, onSave, onCancel }: GuestFormProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    rsvpStatus: "PENDING" as $Enums.RsvpStatus,
    dietaryRestrictions: "",
    foodSelection: "" as $Enums.FoodSelection | "",
    plusOne: false,
    notes: "",
    tableId: "",
  });

  const { data: guest } = trpc.guests.getById.useQuery(guestId!, {
    enabled: !!guestId,
  });

  const { data: tables } = trpc.tables.getAll.useQuery();

  const createGuestMutation = trpc.guests.create.useMutation({
    onSuccess: onSave,
  });

  const updateGuestMutation = trpc.guests.update.useMutation({
    onSuccess: onSave,
  });

  useEffect(() => {
    if (guest) {
      setFormData({
        firstName: guest.firstName,
        lastName: guest.lastName,
        email: guest.email || "",
        phone: guest.phone || "",
        address: guest.address || "",
        rsvpStatus: guest.rsvpStatus,
        dietaryRestrictions: guest.dietaryRestrictions || "",
        foodSelection: guest.foodSelection || "",
        plusOne: guest.plusOne,
        notes: guest.notes || "",
        tableId: guest.tableId || "",
      });
    }
  }, [guest]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      ...formData,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      address: formData.address || undefined,
      dietaryRestrictions: formData.dietaryRestrictions || undefined,
      foodSelection: formData.foodSelection || undefined,
      notes: formData.notes || undefined,
      tableId: formData.tableId || undefined,
    };

    if (guestId) {
      await updateGuestMutation.mutateAsync({ id: guestId, ...data });
    } else {
      await createGuestMutation.mutateAsync(data);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">
            {guestId ? "Edit Guest" : "Add New Guest"}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                RSVP Status
              </label>
              <select
                value={formData.rsvpStatus}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    rsvpStatus: e.target.value as any,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="PENDING">Pending</option>
                <option value="ACCEPTED">Accepted</option>
                <option value="DECLINED">Declined</option>
                <option value="MAYBE">Maybe</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Table Assignment
              </label>
              <select
                value={formData.tableId}
                onChange={(e) =>
                  setFormData({ ...formData, tableId: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">No table assigned</option>
                {tables?.map((table) => (
                  <option key={table.id} value={table.id}>
                    {table.name} ({table._count.guests}/{table.capacity})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dietary Restrictions
              </label>
              <input
                type="text"
                value={formData.dietaryRestrictions}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dietaryRestrictions: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Vegetarian, Gluten-free, Allergies"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Food Selection
              </label>
              <select
                value={formData.foodSelection}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    foodSelection: e.target.value as $Enums.FoodSelection | "",
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">No selection</option>
                <option value="VEGAN">Vegan</option>
                <option value="STEAK">Steak</option>
                <option value="KIDS">Kids</option>
                <option value="SALMON">Salmon</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Any additional notes about this guest"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="plusOne"
              checked={formData.plusOne}
              onChange={(e) =>
                setFormData({ ...formData, plusOne: e.target.checked })
              }
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="plusOne" className="ml-2 text-sm text-gray-700">
              Plus One
            </label>
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
              disabled={
                createGuestMutation.isPending || updateGuestMutation.isPending
              }
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {createGuestMutation.isPending || updateGuestMutation.isPending
                ? "Saving..."
                : guestId
                ? "Update Guest"
                : "Add Guest"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
