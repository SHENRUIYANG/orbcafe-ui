'use client';

import { Box, Stack } from '@mui/material';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  closestCorners,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useCallback, useMemo, useState, type CSSProperties } from 'react';
import { CKanbanBucket } from './Components/CKanbanBucket';
import { CKanbanCard } from './Components/CKanbanCard';
import type { CKanbanBoardProps, KanbanBucketModel, KanbanCardClickContext, KanbanCardRecord } from './types';
import { findKanbanCard, moveKanbanCard } from './Utils/kanbanTools';

const CARD_PREFIX = 'kanban-card|';
const BUCKET_PREFIX = 'kanban-bucket|';

const toCardDndId = (cardId: string) => `${CARD_PREFIX}${cardId}`;
const toBucketDndId = (bucketId: string) => `${BUCKET_PREFIX}${bucketId}`;

const fromCardDndId = (value?: string) => (value?.startsWith(CARD_PREFIX) ? value.slice(CARD_PREFIX.length) : undefined);
const fromBucketDndId = (value?: string) => (value?.startsWith(BUCKET_PREFIX) ? value.slice(BUCKET_PREFIX.length) : undefined);

interface SortableKanbanCardProps {
  card: KanbanCardRecord;
  bucket: KanbanBucketModel;
  onCardClick?: (context: KanbanCardClickContext) => void;
}

const SortableKanbanCard = ({ card, bucket, onCardClick }: SortableKanbanCardProps) => {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: toCardDndId(card.id),
  });

  const style: CSSProperties = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
    zIndex: isDragging ? 2 : 1,
    touchAction: 'none',
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  return (
    <Box ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <CKanbanCard card={card} bucket={bucket} dragging={isDragging} onClick={onCardClick} />
    </Box>
  );
};

interface DroppableKanbanBucketProps {
  bucket: KanbanBucketModel;
  highlighted: boolean;
  bucketMaxHeight?: number | string;
  emptyBucketLabel?: string;
  onCardClick?: (context: KanbanCardClickContext) => void;
}

const DroppableKanbanBucket = ({
  bucket,
  highlighted,
  bucketMaxHeight,
  emptyBucketLabel,
  onCardClick,
}: DroppableKanbanBucketProps) => {
  const { isOver, setNodeRef } = useDroppable({
    id: toBucketDndId(bucket.id),
  });

  return (
    <Box ref={setNodeRef} sx={{ minWidth: 0 }}>
      <CKanbanBucket
        bucket={bucket}
        cardCount={bucket.cards.length}
        highlighted={highlighted || isOver}
        emptyLabel={emptyBucketLabel}
        maxHeight={bucketMaxHeight}
      >
        <SortableContext items={bucket.cards.map((card) => toCardDndId(card.id))} strategy={verticalListSortingStrategy}>
          <Stack spacing={1}>
            {bucket.cards.map((card) => (
              <SortableKanbanCard key={card.id} card={card} bucket={bucket} onCardClick={onCardClick} />
            ))}
          </Stack>
        </SortableContext>
      </CKanbanBucket>
    </Box>
  );
};

export const CKanbanBoard = ({
  model,
  onCardMove,
  onCardClick,
  minBucketWidth = 320,
  bucketMaxHeight,
  emptyBucketLabel,
  sx,
}: CKanbanBoardProps) => {
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [overBucketId, setOverBucketId] = useState<string | undefined>();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 8 } }),
  );

  const activeLookup = useMemo(
    () => (activeCardId ? findKanbanCard(model, activeCardId) : undefined),
    [activeCardId, model],
  );

  const resetDragState = useCallback(() => {
    setActiveCardId(null);
    setOverBucketId(undefined);
  }, []);

  const resolveBucketIdFromTarget = useCallback(
    (targetId?: string) => {
      if (!targetId) return undefined;

      const cardId = fromCardDndId(targetId);
      if (cardId) {
        return findKanbanCard(model, cardId)?.bucket.id;
      }

      return fromBucketDndId(targetId);
    },
    [model],
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveCardId(fromCardDndId(String(event.active.id)) ?? null);
  }, []);

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      setOverBucketId(resolveBucketIdFromTarget(event.over ? String(event.over.id) : undefined));
    },
    [resolveBucketIdFromTarget],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const draggedCardId = fromCardDndId(String(event.active.id));
      const overId = event.over ? String(event.over.id) : undefined;
      if (!draggedCardId || !overId) {
        resetDragState();
        return;
      }

      const sourceLookup = findKanbanCard(model, draggedCardId);
      if (!sourceLookup) {
        resetDragState();
        return;
      }

      let targetBucketId = sourceLookup.bucket.id;
      let targetIndex = sourceLookup.cardIndex;

      const overCardId = fromCardDndId(overId);
      if (overCardId) {
        const overLookup = findKanbanCard(model, overCardId);
        if (!overLookup) {
          resetDragState();
          return;
        }
        targetBucketId = overLookup.bucket.id;
        targetIndex = overLookup.cardIndex;
      } else {
        const nextBucketId = fromBucketDndId(overId);
        const targetBucket = model.buckets.find((bucket) => bucket.id === nextBucketId);
        if (!nextBucketId || !targetBucket) {
          resetDragState();
          return;
        }
        targetBucketId = nextBucketId;
        targetIndex = targetBucket.cards.length;
      }

      if (sourceLookup.bucket.id === targetBucketId && sourceLookup.cardIndex === targetIndex) {
        resetDragState();
        return;
      }

      const nextModel = moveKanbanCard(model, {
        cardId: draggedCardId,
        fromBucketId: sourceLookup.bucket.id,
        toBucketId: targetBucketId,
        targetIndex,
      });
      const nextLookup = findKanbanCard(nextModel, draggedCardId);
      if (
        nextLookup &&
        !(nextLookup.bucket.id === sourceLookup.bucket.id && nextLookup.cardIndex === sourceLookup.cardIndex)
      ) {
        onCardMove?.({
          cardId: draggedCardId,
          fromBucketId: sourceLookup.bucket.id,
          toBucketId: nextLookup.bucket.id,
          targetIndex: nextLookup.cardIndex,
          card: nextLookup.card,
          model: nextModel,
        });
      }

      resetDragState();
    },
    [model, onCardMove, resetDragState],
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={resetDragState}
    >
      <Box
        sx={[
          {
            display: 'grid',
            gridAutoFlow: 'column',
            gridAutoColumns: `minmax(${minBucketWidth}px, 1fr)`,
            gap: 2,
            alignItems: 'start',
            overflowX: 'auto',
            pb: 0.5,
          },
          ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
        ]}
      >
        {model.buckets.map((bucket) => (
          <DroppableKanbanBucket
            key={bucket.id}
            bucket={bucket}
            highlighted={bucket.id === overBucketId}
            bucketMaxHeight={bucketMaxHeight}
            emptyBucketLabel={emptyBucketLabel}
            onCardClick={onCardClick}
          />
        ))}
      </Box>

      <DragOverlay>
        {activeLookup ? (
          <Box sx={{ width: Math.max(minBucketWidth - 24, 260) }}>
            <CKanbanCard card={activeLookup.card} bucket={activeLookup.bucket} overlay />
          </Box>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
