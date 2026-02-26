"use client";

import { useEffect, useState, useId } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { getStoredAuth } from "@/helpers/local-storage";
import { canRead, canCreate } from "@/helpers/module-permissions";

export type InventoryTypeNode = {
  id: string;
  name: string;
  description: string;
  productCount: number;
  children: InventoryTypeNode[];
};

function generateId() {
  return `t-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const INITIAL_TYPES: InventoryTypeNode[] = [
  {
    id: "1",
    name: "Antibiotics",
    description: "Antimicrobial agents for bacterial infections",
    productCount: 280,
    children: [
      {
        id: "1-1",
        name: "Penicillins",
        description: "Beta-lactam antibiotics",
        productCount: 95,
        children: [
          { id: "1-1-1", name: "Amoxicillin", description: "", productCount: 42, children: [] },
          { id: "1-1-2", name: "Penicillin V", description: "", productCount: 28, children: [] },
        ],
      },
      {
        id: "1-2",
        name: "Cephalosporins",
        description: "Broad-spectrum antibiotics",
        productCount: 88,
        children: [
          { id: "1-2-1", name: "Cephalexin", description: "", productCount: 35, children: [] },
          { id: "1-2-2", name: "Cefuroxime", description: "", productCount: 22, children: [] },
        ],
      },
    ],
  },
  {
    id: "2",
    name: "Cardiovascular",
    description: "Medications for heart and blood pressure",
    productCount: 220,
    children: [
      {
        id: "2-1",
        name: "Beta-blockers",
        description: "",
        productCount: 78,
        children: [
          { id: "2-1-1", name: "Atenolol", description: "", productCount: 30, children: [] },
          { id: "2-1-2", name: "Metoprolol", description: "", productCount: 28, children: [] },
        ],
      },
    ],
  },
  {
    id: "3",
    name: "Analgesics",
    description: "Pain relief medications",
    productCount: 190,
    children: [],
  },
  {
    id: "4",
    name: "Other",
    description: "Miscellaneous pharmacy products",
    productCount: 288,
    children: [],
  },
];

function AddForm({
  level,
  onSubmit,
  onCancel,
  placeholderName,
}: {
  level: 1 | 2 | 3;
  onSubmit: (name: string, description: string) => void;
  onCancel: () => void;
  placeholderName?: string;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const nameId = useId();
  const descId = useId();
  const levelLabel = level === 1 ? "Type" : level === 2 ? "Sub-type" : "Sub-sub-type";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onSubmit(trimmed, description.trim());
    setName("");
    setDescription("");
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-slate-50/80 p-3 space-y-3">
      <div>
        <label htmlFor={nameId} className="block text-xs font-medium text-slate-600 mb-1">
          {levelLabel} name
        </label>
        <input
          id={nameId}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={placeholderName || `e.g. ${level === 1 ? "Antibiotics" : level === 2 ? "Penicillins" : "Amoxicillin"}`}
          className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          autoFocus
        />
      </div>
      <div>
        <label htmlFor={descId} className="block text-xs font-medium text-slate-600 mb-1">
          Description (optional)
        </label>
        <input
          id={descId}
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Short description"
          className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          className="px-3 py-1.5 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700"
        >
          Add {levelLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 text-sm font-medium rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function TypeLevel({
  node,
  level,
  onAddChild,
  onAddFormCancel,
  addFormParentId,
  canAdd,
}: {
  node: InventoryTypeNode;
  level: 1 | 2 | 3;
  onAddChild: (parentId: string, name: string, description: string) => void;
  onAddFormCancel: () => void;
  addFormParentId: string | null;
  canAdd: boolean;
}) {
  const [expanded, setExpanded] = useState(level === 1);
  const showAddForm = addFormParentId === node.id;
  const hasChildren = node.children.length > 0;
  const levelLabel = level === 1 ? "Type" : level === 2 ? "Sub-type" : "Sub-sub-type";
  const canAddChild = canAdd && level < 3;

  return (
    <div className={level === 1 ? "rounded-xl border border-slate-200 bg-white overflow-hidden" : ""}>
      <div
        className={
          level === 1
            ? "p-4 flex items-start justify-between gap-4"
            : level === 2
              ? "pl-6 pr-4 py-2 flex items-start justify-between gap-4 border-l-2 border-slate-100 ml-2"
              : "pl-10 pr-4 py-2 flex items-start justify-between gap-4 border-l-2 border-slate-100 ml-2"
        }
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {(hasChildren || canAddChild) && level < 3 && (
              <button
                type="button"
                onClick={() => setExpanded((e) => !e)}
                className="p-0.5 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                aria-expanded={expanded}
              >
                <svg
                  className={`w-4 h-4 transition-transform ${expanded ? "rotate-90" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
            <h2 className={`font-semibold text-slate-800 ${level === 1 ? "text-base" : "text-sm"}`}>{node.name}</h2>
          </div>
          {node.description && (
            <p className="text-sm text-slate-500 mt-0.5">{node.description}</p>
          )}
          <p className="text-xs text-slate-400 mt-1 tabular-nums">{node.productCount} products</p>
        </div>
        {canAddChild && (
          <button
            type="button"
            onClick={() => onAddChild(node.id, "", "")}
            className="shrink-0 text-xs font-medium text-blue-600 hover:text-blue-700 whitespace-nowrap"
          >
            {level === 1 ? "+ Add sub-type" : level === 2 ? "Add New Type" : ""}
          </button>
        )}
      </div>

      {showAddForm && (
        <div className={level === 1 ? "px-4 pb-4" : "pl-6 pr-4 pb-2"}>
          <AddForm
            level={(level + 1) as 2 | 3}
            onSubmit={(name, description) => {
              onAddChild(node.id, name, description);
              onAddFormCancel();
            }}
            onCancel={onAddFormCancel}
          />
        </div>
      )}

      {expanded && node.children.length > 0 && (
        <div className={level === 1 ? "border-t border-slate-100 bg-slate-50/30" : ""}>
          {node.children.map((child) => (
            <TypeLevel
              key={child.id}
              node={child}
              level={(level + 1) as 2 | 3}
              onAddChild={(parentId, name, description) => {
                // Pass through; actual add is handled in parent state
                onAddChild(parentId, name, description);
              }}
              onAddFormCancel={onAddFormCancel}
              addFormParentId={addFormParentId}
              canAdd={canAdd}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function addChildToTree(nodes: InventoryTypeNode[], parentId: string, name: string, description: string): InventoryTypeNode[] {
  return nodes.map((node) => {
    if (node.id === parentId) {
      const newChild: InventoryTypeNode = {
        id: generateId(),
        name,
        description,
        productCount: 0,
        children: [],
      };
      return { ...node, children: [...node.children, newChild] };
    }
    if (node.children.length > 0) {
      return { ...node, children: addChildToTree(node.children, parentId, name, description) };
    }
    return node;
  });
}

type ParentOption = { value: string; label: string; level: 1 | 2 };

/** Options for "Add under": top level, level-1 types, and level-2 sub-types (max 3 levels). */
function getEligibleParentOptions(nodes: InventoryTypeNode[]): ParentOption[] {
  const all: ParentOption[] = [{ value: "", label: "Top level (Type)", level: 1 }];
  for (const node of nodes) {
    all.push({ value: node.id, label: node.name, level: 1 });
    for (const child of node.children) {
      all.push({ value: child.id, label: `${node.name} › ${child.name}`, level: 2 });
      // Level 3 nodes are not valid parents (max 3 levels)
    }
  }
  return all;
}

export default function PharmacyInventoryTypesPage() {
  const router = useRouter();
  const [auth, setAuth] = useState<{ role: string } | null>(null);
  const [types, setTypes] = useState<InventoryTypeNode[]>(INITIAL_TYPES);
  const [addFormParentId, setAddFormParentId] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelParentId, setPanelParentId] = useState("");
  const [panelName, setPanelName] = useState("");
  const [panelDescription, setPanelDescription] = useState("");

  useEffect(() => {
    const a = getStoredAuth();
    if (!a) {
      router.replace("/login");
      return;
    }
    if (!canRead(a.role, "pharmacy")) {
      router.replace("/dashboard");
      return;
    }
    setAuth({ role: a.role });
  }, [router]);

  const handleAddChild = (parentId: string, name: string, description: string) => {
    if (!name.trim()) {
      setAddFormParentId(parentId);
      return;
    }
    setTypes((prev) => addChildToTree(prev, parentId, name, description));
    setAddFormParentId(null);
  };

  const parentOptions = getEligibleParentOptions(types);
  const selectedOption = parentOptions.find((o) => o.value === panelParentId);
  const levelLabel = !panelParentId
    ? "Type"
    : selectedOption?.level === 1
      ? "Sub-type"
      : "Sub-sub-type";

  const handlePanelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = panelName.trim();
    if (!name) return;
    if (panelParentId) {
      setTypes((prev) => addChildToTree(prev, panelParentId, name, panelDescription.trim()));
    } else {
      setTypes((prev) => [
        ...prev,
        { id: generateId(), name, description: panelDescription.trim(), productCount: 0, children: [] },
      ]);
    }
    setPanelName("");
    setPanelDescription("");
    setPanelOpen(false);
  };

  const allowCreate = auth && canCreate(auth.role, "pharmacy");

  if (!auth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-slate-500">Loading…</p>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-xl font-semibold text-slate-800">Inventory Types</h1>
            <p className="text-sm text-slate-500 mt-1">
              Three-level hierarchy: Type → Sub-type → Sub-sub-type.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {allowCreate && (
              <button
                type="button"
                onClick={() => setPanelOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add new
              </button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {types.map((t) => (
            <TypeLevel
              key={t.id}
              node={t}
              level={1}
              onAddChild={handleAddChild}
              onAddFormCancel={() => setAddFormParentId(null)}
              addFormParentId={addFormParentId}
              canAdd={!!allowCreate}
            />
          ))}
        </div>
      </div>

      {/* Floating side panel - Add drug type */}
      {allowCreate && panelOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40"
            aria-hidden
            onClick={() => setPanelOpen(false)}
          />
          <aside
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white shadow-xl z-50 flex flex-col"
            aria-label="Add drug type"
          >
            <div className="flex items-center justify-between shrink-0 border-b border-slate-200 px-4 py-3">
              <h2 className="text-base font-semibold text-slate-800">Add drug type</h2>
              <button
                type="button"
                onClick={() => setPanelOpen(false)}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                aria-label="Close panel"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <p className="text-xs text-slate-500 mb-4">
                Add a type, sub-type, or sub-sub-type (up to 3 levels). Choose the parent below.
              </p>
              <form onSubmit={handlePanelSubmit} className="space-y-4">
                <div>
                  <label htmlFor="panel-parent" className="block text-xs font-medium text-slate-600 mb-1">
                    Add under
                  </label>
                  <select
                    id="panel-parent"
                    value={panelParentId}
                    onChange={(e) => setPanelParentId(e.target.value)}
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    {parentOptions.map((opt) => (
                      <option key={opt.value || "root"} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="panel-name" className="block text-xs font-medium text-slate-600 mb-1">
                    {levelLabel} name
                  </label>
                  <input
                    id="panel-name"
                    type="text"
                    value={panelName}
                    onChange={(e) => setPanelName(e.target.value)}
                    placeholder={levelLabel === "Type" ? "e.g. Antibiotics" : levelLabel === "Sub-type" ? "e.g. Penicillins" : "e.g. Amoxicillin"}
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="panel-desc" className="block text-xs font-medium text-slate-600 mb-1">
                    Description (optional)
                  </label>
                  <input
                    id="panel-desc"
                    type="text"
                    value={panelDescription}
                    onChange={(e) => setPanelDescription(e.target.value)}
                    placeholder="Short description"
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full px-3 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700"
                >
                  Add {levelLabel}
                </button>
              </form>
            </div>
          </aside>
        </>
      )}
    </DashboardLayout>
  );
}
