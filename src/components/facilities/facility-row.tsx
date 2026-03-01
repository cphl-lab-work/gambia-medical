"use client";

interface Facility {
  id: string;
  code: string;
  name: string;
  description: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  facilityType: string | null;
  facilityAdminId: string | null;
  isActive: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface FacilityRowProps {
  facility: Facility;
  adminMap: Record<string, string>;
  isDeleted?: boolean;
  onEdit?: (facility: Facility) => void;
  onDelete?: (facilityId: string) => void;
}

export default function FacilityRow({
  facility,
  adminMap,
  isDeleted = false,
  onEdit,
  onDelete,
}: FacilityRowProps) {
  return (
    <tr className={isDeleted ? "opacity-60" : "hover:bg-slate-50"}>
      <td className="px-6 py-4 text-sm font-medium text-slate-800">
        {facility.code}
      </td>
      <td className="px-6 py-4 text-sm text-slate-700">
        {facility.name}
      </td>
      <td className="px-6 py-4 text-sm text-slate-700">
        {facility.facilityType || "-"}
      </td>
      <td className="px-6 py-4 text-sm text-slate-700">
        {facility.facilityAdminId ? adminMap[facility.facilityAdminId] || "Unknown" : "-"}
      </td>
      <td className="px-6 py-4 text-sm text-slate-700">
        {facility.address || "-"}
      </td>
      {!isDeleted && (
        <td className="px-6 py-4 text-sm space-x-2">
          {onEdit && (
            <button
              onClick={() => onEdit(facility)}
              className="text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(facility.id)}
              className="text-red-600 hover:text-red-700 font-medium"
            >
              Delete
            </button>
          )}
        </td>
      )}
      {isDeleted && (
        <td className="px-6 py-4 text-sm text-slate-700">
          {new Date(facility.deletedAt!).toLocaleDateString()}
        </td>
      )}
    </tr>
  );
}
