import { useState } from "react";

/**
 * Drag-to-reorder for a flat list, with optimistic local ordering while the
 * persisted `order` mutations are in flight. `onReorder` gets the full new
 * id order every time a drop actually moves something; the caller diffs
 * that against each item's current `order` field and only mutates the ones
 * that changed.
 */
export function useDragReorder<T>(
  items: T[],
  getId: (item: T) => string,
  onReorder: (orderedIds: string[]) => Promise<unknown> | void,
) {
  const [order, setOrder] = useState<string[] | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const displayItems = order
    ? (order.map((id) => items.find((item) => getId(item) === id)).filter((item): item is T => item != null))
    : items;

  function onDropTarget(targetId: string) {
    if (!draggingId || draggingId === targetId) return;
    const ids = (order ?? items.map(getId)).slice();
    const from = ids.indexOf(draggingId);
    const to = ids.indexOf(targetId);
    if (from === -1 || to === -1) return;
    ids.splice(from, 1);
    ids.splice(to, 0, draggingId);
    setOrder(ids);
    // The hook owns clearing the optimistic order once the caller's
    // persist-and-refetch settles, so callers never need a handle back to
    // this hook's own return value inside their onReorder callback.
    Promise.resolve(onReorder(ids)).finally(() => setOrder(null));
  }

  return {
    displayItems,
    draggingId,
    startDrag: (id: string) => setDraggingId(id),
    endDrag: () => setDraggingId(null),
    onDropTarget,
  };
}

/** Evenly spaced order values so later inserts/reorders don't require renumbering everything. */
export function spacedOrders(count: number): number[] {
  return Array.from({ length: count }, (_, i) => (i + 1) * 100);
}
