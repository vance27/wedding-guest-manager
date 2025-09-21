"use client";

import { useState } from "react";
import { trpc } from "../utils/trpc";
import { TableCard } from "./TableCard";
import { TableForm } from "./TableForm";
import { UnassignedGuests } from "./UnassignedGuests";
import { Plus, Users, AlertCircle, Download } from "lucide-react";

export function TableAssignment() {
  const [showTableForm, setShowTableForm] = useState(false);
  const [editingTable, setEditingTable] = useState<string | null>(null);

  const { data: tables, refetch: refetchTables } =
    trpc.tables.getAll.useQuery();
  const { data: guests, refetch: refetchGuests } = trpc.guests.getAll.useQuery({
    includeDeclined: false,
  });
  const { data: relationships } = trpc.relationships.getAll.useQuery();

  const assignGuestMutation = trpc.tables.assignGuest.useMutation({
    onSuccess: () => {
      refetchTables();
      refetchGuests();
    },
  });

  const unassignedGuests = guests?.filter((guest) => !guest.tableId) || [];
  const totalAssignedGuests =
    guests?.filter((guest) => guest.tableId).length || 0;
  const totalCapacity =
    tables?.reduce((sum, table) => sum + table.capacity, 0) || 0;

  const handleTableSaved = () => {
    setShowTableForm(false);
    setEditingTable(null);
    refetchTables();
  };

  const handleEditTable = (tableId: string) => {
    setEditingTable(tableId);
    setShowTableForm(true);
  };

  const handleAssignGuest = async (guestId: string, tableId: string) => {
    await assignGuestMutation.mutateAsync({ guestId, tableId });
  };

  const handleUnassignGuest = async (guestId: string) => {
    await assignGuestMutation.mutateAsync({ guestId, tableId: null });
  };

  const getGuestRelationships = (guestId: string) => {
    return (
      relationships?.filter(
        (rel) => rel.guestFromId === guestId || rel.guestToId === guestId
      ) || []
    );
  };

  const exportTableData = () => {
    if (!tables || !guests) return;

    // Create CSV data
    const csvData = [];

    // CSV Headers
    csvData.push([
      "Table Name",
      "Table Description",
      "Table Capacity",
      "Guests Assigned",
      "Guest First Name",
      "Guest Last Name",
      "Guest Email",
      "Guest Phone",
      "RSVP Status",
      "Dietary Restrictions",
      "Plus One",
      "Guest Notes"
    ]);

    // Add table data with guests
    tables.forEach(table => {
      const tableGuests = guests.filter(guest => guest.tableId === table.id);

      if (tableGuests.length === 0) {
        // Table with no guests
        csvData.push([
          table.name,
          table.description || "",
          table.capacity,
          0,
          "", "", "", "", "", "", "", ""
        ]);
      } else {
        // Table with guests
        tableGuests.forEach((guest, index) => {
          csvData.push([
            index === 0 ? table.name : "", // Only show table info on first guest row
            index === 0 ? (table.description || "") : "",
            index === 0 ? table.capacity : "",
            index === 0 ? tableGuests.length : "",
            guest.firstName,
            guest.lastName,
            guest.email || "",
            guest.phone || "",
            guest.rsvpStatus,
            guest.dietaryRestrictions || "",
            guest.plusOne ? "Yes" : "No",
            guest.notes || ""
          ]);
        });
      }
    });

    // Add unassigned guests section
    const unassigned = guests.filter(guest => !guest.tableId);
    if (unassigned.length > 0) {
      // Add separator row
      csvData.push(["", "", "", "", "", "", "", "", "", "", "", ""]);

      unassigned.forEach((guest, index) => {
        csvData.push([
          index === 0 ? "UNASSIGNED GUESTS" : "",
          index === 0 ? "Guests not yet assigned to a table" : "",
          index === 0 ? "N/A" : "",
          index === 0 ? unassigned.length : "",
          guest.firstName,
          guest.lastName,
          guest.email || "",
          guest.phone || "",
          guest.rsvpStatus,
          guest.dietaryRestrictions || "",
          guest.plusOne ? "Yes" : "No",
          guest.notes || ""
        ]);
      });
    }

    // Convert to CSV string
    const csvContent = csvData.map(row =>
      row.map(field => {
        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        const stringField = String(field);
        if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
          return '"' + stringField.replace(/"/g, '""') + '"';
        }
        return stringField;
      }).join(',')
    ).join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `table-assignments-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Table Assignment
          </h2>
          <p className="text-gray-600 mt-1">Organize your guests into tables</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={exportTableData}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setShowTableForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Table</span>
          </button>
        </div>
      </div>

      {/* Assignment Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {tables?.length || 0}
              </div>
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
              <div className="text-2xl font-bold text-gray-900">
                {totalAssignedGuests}
              </div>
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
              <div className="text-2xl font-bold text-gray-900">
                {unassignedGuests.length}
              </div>
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
              <div className="text-2xl font-bold text-gray-900">
                {totalCapacity}
              </div>
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
          <div className="text-gray-400 text-sm mt-2">
            Create your first table to start organizing guests
          </div>
        </div>
      )}

      {showTableForm && (
        <TableForm
          tableId={editingTable}
          onSave={handleTableSaved}
          onCancel={() => {
            setShowTableForm(false);
            setEditingTable(null);
          }}
        />
      )}
    </div>
  );
}
