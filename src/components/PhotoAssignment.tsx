"use client";

import { useState } from "react";
import { trpc } from "../utils/trpc";
import { Camera, Users, X, Check, Eye, EyeOff, UserPlus, Search } from "lucide-react";

export function PhotoAssignment() {
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [selectedGuests, setSelectedGuests] = useState<string[]>([]);
  const [hideAssigned, setHideAssigned] = useState(false);
  const [guestSearchQuery, setGuestSearchQuery] = useState("");

  const { data: photos, refetch: refetchPhotos } = trpc.photos.getAll.useQuery({
    hideAssigned,
  });
  const { data: guests } = trpc.guests.getAll.useQuery({
    includeDeclined: false,
  });

  const assignGuestsMutation = trpc.photos.assignGuests.useMutation({
    onSuccess: () => {
      refetchPhotos();
      setSelectedPhotos([]);
      setSelectedGuests([]);
      setGuestSearchQuery("");
    },
  });

  const removeAssignmentMutation = trpc.photos.removeGuestAssignment.useMutation({
    onSuccess: () => {
      refetchPhotos();
    },
  });

  const handlePhotoSelect = (photoId: string) => {
    setSelectedPhotos(prev =>
      prev.includes(photoId)
        ? prev.filter(id => id !== photoId)
        : [...prev, photoId]
    );
  };

  const handleGuestSelect = (guestId: string) => {
    setSelectedGuests(prev =>
      prev.includes(guestId)
        ? prev.filter(id => id !== guestId)
        : [...prev, guestId]
    );
  };

  const handleAssignGuests = async () => {
    if (selectedGuests.length === 0 || selectedPhotos.length === 0) return;

    for (const photoId of selectedPhotos) {
      await assignGuestsMutation.mutateAsync({
        photoId,
        guestIds: selectedGuests,
      });
    }
  };

  const filteredGuests = guests?.filter(guest => {
    const fullName = `${guest.firstName} ${guest.lastName}`.toLowerCase();
    return fullName.includes(guestSearchQuery.toLowerCase());
  }) || [];

  const handleGuestFromSearch = (guestId: string) => {
    if (!selectedGuests.includes(guestId)) {
      setSelectedGuests(prev => [...prev, guestId]);
    }
    setGuestSearchQuery("");
  };

  const removeSelectedGuest = (guestId: string) => {
    setSelectedGuests(prev => prev.filter(id => id !== guestId));
  };

  const handleRemoveAssignment = async (photoId: string, guestId: string) => {
    await removeAssignmentMutation.mutateAsync({
      photoId,
      guestId,
    });
  };

  const handleSelectAll = () => {
    if (!photos) return;

    if (selectedPhotos.length === photos.length) {
      setSelectedPhotos([]);
    } else {
      setSelectedPhotos(photos.map(photo => photo.id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Photo Assignment
          </h2>
          <p className="text-gray-600 mt-1">Assign guests to photos</p>
        </div>
        <div className="flex items-center space-x-3">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={hideAssigned}
              onChange={(e) => setHideAssigned(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600 flex items-center space-x-1">
              {hideAssigned ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>Hide assigned photos</span>
            </span>
          </label>
        </div>
      </div>

      {/* Assignment Controls */}
      {selectedPhotos.length > 0 && (
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-blue-800 font-medium">
                {selectedPhotos.length} photo{selectedPhotos.length !== 1 ? 's' : ''} selected
              </span>
              <button
                onClick={() => {
                  setSelectedPhotos([]);
                  setSelectedGuests([]);
                  setGuestSearchQuery("");
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="text-sm font-medium text-gray-700">Search and select guests to assign:</div>

              {/* Search Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={guestSearchQuery}
                  onChange={(e) => setGuestSearchQuery(e.target.value)}
                  placeholder="Search guests by name..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Search Results Dropdown */}
              {guestSearchQuery && filteredGuests.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-md shadow-lg max-h-40 overflow-y-auto">
                  {filteredGuests.slice(0, 10).map((guest) => (
                    <button
                      key={guest.id}
                      onClick={() => handleGuestFromSearch(guest.id)}
                      disabled={selectedGuests.includes(guest.id)}
                      className={`w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center justify-between ${
                        selectedGuests.includes(guest.id)
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-gray-900'
                      }`}
                    >
                      <span>{guest.firstName} {guest.lastName}</span>
                      {selectedGuests.includes(guest.id) && (
                        <Check className="w-4 h-4 text-green-500" />
                      )}
                    </button>
                  ))}
                  {filteredGuests.length > 10 && (
                    <div className="px-3 py-2 text-sm text-gray-500 bg-gray-50">
                      {filteredGuests.length - 10} more results...
                    </div>
                  )}
                </div>
              )}

              {/* No results message */}
              {guestSearchQuery && filteredGuests.length === 0 && (
                <div className="text-sm text-gray-500 py-2">
                  No guests found matching "{guestSearchQuery}"
                </div>
              )}

              {/* Selected Guests */}
              {selectedGuests.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-700">Selected guests:</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedGuests.map((guestId) => {
                      const guest = guests?.find(g => g.id === guestId);
                      if (!guest) return null;
                      return (
                        <div
                          key={guestId}
                          className="flex items-center space-x-2 bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm"
                        >
                          <span>{guest.firstName} {guest.lastName}</span>
                          <button
                            onClick={() => removeSelectedGuest(guestId)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  <button
                    onClick={handleAssignGuests}
                    disabled={assignGuestsMutation.isPending}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>
                      {assignGuestsMutation.isPending ? 'Assigning...' : `Assign ${selectedGuests.length} Guest${selectedGuests.length !== 1 ? 's' : ''}`}
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Photo Grid Controls */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="text-sm text-gray-600">
            {photos?.length || 0} photo{photos?.length !== 1 ? 's' : ''}
          </div>
          {photos && photos.length > 0 && (
            <button
              onClick={handleSelectAll}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              {selectedPhotos.length === photos.length ? 'Deselect All' : 'Select All'}
            </button>
          )}
        </div>
      </div>

      {/* Photos Grid */}
      {photos && photos.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className={`relative bg-white rounded-lg shadow-sm border-2 transition-all cursor-pointer ${
                selectedPhotos.includes(photo.id)
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handlePhotoSelect(photo.id)}
            >
              {/* Photo */}
              <div className="aspect-square bg-gray-100 rounded-t-lg flex items-center justify-center">
                <img
                  src={photo.filePath}
                  alt={photo.description || photo.originalName}
                  className="w-full h-full object-cover rounded-t-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <div className="hidden flex-col items-center justify-center text-gray-400">
                  <Camera className="w-8 h-8 mb-2" />
                  <span className="text-xs text-center px-2">{photo.originalName}</span>
                </div>
              </div>

              {/* Selection indicator */}
              {selectedPhotos.includes(photo.id) && (
                <div className="absolute top-2 right-2 bg-blue-600 rounded-full p-1">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}

              {/* Photo info and assigned guests */}
              <div className="p-3">
                <div className="text-xs text-gray-500 mb-2 truncate">
                  {photo.originalName}
                </div>

                {/* Assigned guests */}
                {photo.guestAssignments.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center space-x-1 text-xs text-gray-600">
                      <Users className="w-3 h-3" />
                      <span>Assigned to:</span>
                    </div>
                    <div className="space-y-1">
                      {photo.guestAssignments.map((assignment) => (
                        <div
                          key={assignment.id}
                          className="flex items-center justify-between bg-gray-50 rounded px-2 py-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span className="text-xs text-gray-700">
                            {assignment.guest.firstName} {assignment.guest.lastName}
                          </span>
                          <button
                            onClick={() => handleRemoveAssignment(photo.id, assignment.guest.id)}
                            className="text-red-500 hover:text-red-700"
                            disabled={removeAssignmentMutation.isPending}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
          <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <div className="text-gray-500 text-lg">
            {hideAssigned ? 'No unassigned photos' : 'No photos found'}
          </div>
          <div className="text-gray-400 text-sm mt-2">
            {hideAssigned
              ? 'All photos have been assigned to guests'
              : 'Upload photos to start assigning guests'
            }
          </div>
        </div>
      )}
    </div>
  );
}