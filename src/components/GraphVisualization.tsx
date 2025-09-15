"use client";

import { useRef, useState } from "react";
import { trpc } from "../utils/trpc";
import ForceGraph2D from "react-force-graph-2d";
import { ZoomIn, ZoomOut, RotateCcw, Filter } from "lucide-react";

interface GraphNode {
  id: string;
  name: string;
  rsvpStatus: string;
  tableId?: string | null;
  tableName?: string;
  group: number;
  val: number;
  x?: number;
  y?: number;
}

interface GraphLink {
  source: string;
  target: string;
  relationshipType: string;
  strength: number;
  color: string;
}

export function GraphVisualization() {
  const graphRef = useRef<any>();
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [showTableColors, setShowTableColors] = useState(true);
  const [showTableGroups, setShowTableGroups] = useState(true);

  const { data: guests } = trpc.guests.getAll.useQuery({
    includeDeclined: false,
  });
  const { data: relationships } = trpc.relationships.getAll.useQuery();
  const { data: tables } = trpc.tables.getAll.useQuery();

  const getRelationshipColor = (type: string) => {
    switch (type) {
      case "FAMILY":
      case "SIBLING":
      case "PARENT":
      case "CHILD":
      case "COUSIN":
        return "#3b82f6"; // blue
      case "SPOUSE":
      case "PARTNER":
        return "#ef4444"; // red
      case "FRIEND":
        return "#10b981"; // green
      case "COLLEAGUE":
        return "#6b7280"; // gray
      default:
        return "#8b5cf6"; // purple
    }
  };

  const getTableColor = (tableId?: string) => {
    if (!tableId || !tables) return "#94a3b8";
    const tableIndex = tables.findIndex((t) => t.id === tableId);
    const colors = [
      "#ef4444",
      "#3b82f6",
      "#10b981",
      "#f59e0b",
      "#8b5cf6",
      "#ec4899",
      "#06b6d4",
      "#84cc16",
    ];
    return colors[tableIndex % colors.length] || "#94a3b8";
  };

  const calculateTableBoundaries = (nodes: GraphNode[]) => {
    const tableGroups: { [tableId: string]: { nodes: GraphNode[], bounds: { minX: number, maxX: number, minY: number, maxY: number }, table: any } } = {};

    // Group nodes by table
    nodes.forEach(node => {
      if (node.tableId && node.x !== undefined && node.y !== undefined) {
        if (!tableGroups[node.tableId]) {
          const table = tables?.find(t => t.id === node.tableId);
          tableGroups[node.tableId] = {
            nodes: [],
            bounds: { minX: node.x, maxX: node.x, minY: node.y, maxY: node.y },
            table
          };
        }

        tableGroups[node.tableId].nodes.push(node);
        const bounds = tableGroups[node.tableId].bounds;
        bounds.minX = Math.min(bounds.minX, node.x);
        bounds.maxX = Math.max(bounds.maxX, node.x);
        bounds.minY = Math.min(bounds.minY, node.y);
        bounds.maxY = Math.max(bounds.maxY, node.y);
      }
    });

    // Add padding to boundaries
    Object.values(tableGroups).forEach(group => {
      const padding = 50;
      group.bounds.minX -= padding;
      group.bounds.maxX += padding;
      group.bounds.minY -= padding;
      group.bounds.maxY += padding;
    });

    return tableGroups;
  };

  const graphData = {
    nodes:
      guests
        ?.filter((guest) => {
          if (filterType === "all") return true;
          if (filterType === "family") {
            return relationships?.some(
              (rel) =>
                (rel.guestFromId === guest.id || rel.guestToId === guest.id) &&
                [
                  "FAMILY",
                  "SIBLING",
                  "PARENT",
                  "CHILD",
                  "COUSIN",
                  "SPOUSE",
                  "PARTNER",
                ].includes(rel.relationshipType)
            );
          }
          if (filterType === "friends") {
            return relationships?.some(
              (rel) =>
                (rel.guestFromId === guest.id || rel.guestToId === guest.id) &&
                rel.relationshipType === "FRIEND"
            );
          }
          return true;
        })
        .map((guest) => ({
          id: guest.id,
          name: `${guest.firstName} ${guest.lastName}`,
          rsvpStatus: guest.rsvpStatus,
          tableId: guest.tableId,
          tableName: tables?.find(t => t.id === guest.tableId)?.name,
          group: guest.tableId
            ? tables?.findIndex((t) => t.id === guest.tableId) || 0
            : 0,
          val:
            relationships?.filter(
              (rel) =>
                rel.guestFromId === guest.id || rel.guestToId === guest.id
            ).length || 1,
        })) || [],
    links:
      relationships
        ?.filter((rel) => {
          const sourceExists = guests?.some((g) => g.id === rel.guestFromId);
          const targetExists = guests?.some((g) => g.id === rel.guestToId);
          return sourceExists && targetExists;
        })
        .map((rel) => ({
          source: rel.guestFromId,
          target: rel.guestToId,
          relationshipType: rel.relationshipType,
          strength: rel.strength,
          color: getRelationshipColor(rel.relationshipType),
        })) || [],
  };

  const handleNodeClick = (node: GraphNode) => {
    setSelectedNode(node);
  };

  const handleZoomIn = () => {
    if (graphRef.current) {
      graphRef.current.zoom(graphRef.current.zoom() * 1.5);
    }
  };

  const handleZoomOut = () => {
    if (graphRef.current) {
      graphRef.current.zoom(graphRef.current.zoom() / 1.5);
    }
  };

  const handleReset = () => {
    if (graphRef.current) {
      graphRef.current.zoomToFit(400);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Guest Relationship Graph
          </h2>
          <p className="text-gray-600 mt-1">
            Visual representation of guest connections
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Connections</option>
              <option value="family">Family Only</option>
              <option value="friends">Friends Only</option>
            </select>
          </div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showTableColors}
              onChange={(e) => setShowTableColors(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600">Color by table</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showTableGroups}
              onChange={(e) => setShowTableGroups(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600">Show table groups</span>
          </label>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              <span className="font-medium">{graphData.nodes.length}</span>{" "}
              guests,{" "}
              <span className="font-medium">{graphData.links.length}</span>{" "}
              relationships
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleZoomIn}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleReset}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              title="Reset View"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="relative">
          <ForceGraph2D
            ref={graphRef}
            graphData={graphData}
            width={800}
            height={600}
            nodeLabel={(node: any) => `${node.name} (${node.rsvpStatus})`}
            nodeColor={(node: any) =>
              showTableColors ? getTableColor(node.tableId) : "#3b82f6"
            }
            nodeVal={(node: any) => Math.max(node.val * 2, 4)}
            linkColor={(link: any) => link.color}
            linkWidth={(link: any) => Math.max(link.strength, 1)}
            linkDirectionalParticles={2}
            linkDirectionalParticleWidth={2}
            onNodeClick={handleNodeClick}
            onRenderFramePost={(ctx: CanvasRenderingContext2D, globalScale: number) => {
              // Draw table groups if enabled
              if (showTableGroups && graphData.nodes.length > 0) {
                const tableGroups = calculateTableBoundaries(graphData.nodes);

                Object.entries(tableGroups).forEach(([tableId, group]) => {
                  if (group.nodes.length > 1) { // Only draw groups with multiple nodes
                    const { bounds, table } = group;

                    // Draw table boundary box
                    ctx.strokeStyle = getTableColor(tableId);
                    ctx.fillStyle = getTableColor(tableId) + '10'; // Very transparent fill
                    ctx.lineWidth = 2 / globalScale;
                    ctx.setLineDash([10 / globalScale, 5 / globalScale]);

                    const width = bounds.maxX - bounds.minX;
                    const height = bounds.maxY - bounds.minY;

                    // Fill the background
                    ctx.fillRect(bounds.minX, bounds.minY, width, height);

                    // Draw the border
                    ctx.strokeRect(bounds.minX, bounds.minY, width, height);

                    // Reset line dash
                    ctx.setLineDash([]);

                    // Draw table label
                    const fontSize = 14 / globalScale;
                    ctx.font = `bold ${fontSize}px Sans-Serif`;
                    ctx.fillStyle = getTableColor(tableId);
                    ctx.textAlign = "left";
                    ctx.textBaseline = "top";

                    const labelText = table?.name || `Table ${tableId.slice(0, 8)}`;
                    const labelPadding = 8 / globalScale;

                    // Draw label background
                    const labelWidth = ctx.measureText(labelText).width;
                    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
                    ctx.fillRect(
                      bounds.minX + labelPadding,
                      bounds.minY + labelPadding,
                      labelWidth + labelPadding * 2,
                      fontSize + labelPadding * 2
                    );

                    // Draw label text
                    ctx.fillStyle = getTableColor(tableId);
                    ctx.fillText(
                      labelText,
                      bounds.minX + labelPadding * 2,
                      bounds.minY + labelPadding * 2
                    );
                  }
                });
              }
            }}
            nodeCanvasObject={(
              node: any,
              ctx: CanvasRenderingContext2D,
              globalScale: number
            ) => {
              const label = node.name;
              const fontSize = 12 / globalScale;
              ctx.font = `${fontSize}px Sans-Serif`;
              const textWidth = ctx.measureText(label).width;
              const bckgDimensions = [textWidth, fontSize].map(
                (n) => n + fontSize * 0.2
              );

              ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
              ctx.fillRect(
                node.x - bckgDimensions[0] / 2,
                node.y - bckgDimensions[1] / 2,
                bckgDimensions[0],
                bckgDimensions[1]
              );

              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.fillStyle = "#333";
              ctx.fillText(label, node.x, node.y);
            }}
          />
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="font-medium text-gray-900 mb-3">Relationship Types</h3>
          <div className="space-y-2">
            {[
              { type: "FAMILY", label: "Family", color: "#3b82f6" },
              { type: "SPOUSE", label: "Spouse/Partner", color: "#ef4444" },
              { type: "FRIEND", label: "Friend", color: "#10b981" },
              { type: "COLLEAGUE", label: "Colleague", color: "#6b7280" },
              { type: "ACQUAINTANCE", label: "Acquaintance", color: "#8b5cf6" },
            ].map((item) => (
              <div key={item.type} className="flex items-center space-x-2">
                <div
                  className="w-4 h-1 rounded"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-600">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {showTableColors && tables && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="font-medium text-gray-900 mb-3">Table Colors</h3>
            <div className="space-y-2">
              {tables.slice(0, 8).map((table) => (
                <div key={table.id} className="flex items-center space-x-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: getTableColor(table.id) }}
                  />
                  <span className="text-sm text-gray-600">
                    {table.name} ({table._count.guests}/{table.capacity})
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Selected Node Info */}
      {selectedNode && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">
            Selected Guest: {selectedNode.name}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-blue-700 font-medium">RSVP Status:</span>
              <div className="text-blue-800">{selectedNode.rsvpStatus}</div>
            </div>
            <div>
              <span className="text-blue-700 font-medium">Table:</span>
              <div className="text-blue-800">
                {selectedNode.tableName || "Not assigned"}
              </div>
            </div>
            <div>
              <span className="text-blue-700 font-medium">Connections:</span>
              <div className="text-blue-800">
                {selectedNode.val} relationships
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
