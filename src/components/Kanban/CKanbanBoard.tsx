'use client';

import { Box } from '../../lib/orbis-compat';
import { CButton, CIconButton, CStack, CTextField, CTypography } from '../Atoms';
import { Plus, Search, X } from '../Icons';
import { useOrbcafeI18n } from '../../i18n';

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
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <CKanbanCard card={card} bucket={bucket} dragging={isDragging} onClick={onCardClick} />
    </div>
  );
};

interface DroppableKanbanBucketProps {
  bucket: KanbanBucketModel;
  highlighted: boolean;
  bucketHeight?: number | string;
  emptyBucketLabel?: string;
  onBucketRename?: (title: string) => void;
  onCardClick?: (context: KanbanCardClickContext) => void;
}

const DroppableKanbanBucket = ({
  bucket,
  highlighted,
  bucketHeight,
  emptyBucketLabel,
  onBucketRename,
  onCardClick,
}: DroppableKanbanBucketProps) => {
  const { isOver, setNodeRef } = useDroppable({
    id: toBucketDndId(bucket.id),
  });

  return (
    <Box ref={setNodeRef} sx={{ minWidth: 0, minHeight: 0, height: bucketHeight }}>
      <CKanbanBucket
        bucket={bucket}
        cardCount={bucket.cards.length}
        highlighted={highlighted || isOver}
        emptyLabel={emptyBucketLabel}
        height={bucketHeight}
        onRename={onBucketRename}
      >
        <SortableContext items={bucket.cards.map((card) => toCardDndId(card.id))} strategy={verticalListSortingStrategy}>
          <CStack spacing={1}>
            {bucket.cards.map((card) => (
              <SortableKanbanCard key={card.id} card={card} bucket={bucket} onCardClick={onCardClick} />
            ))}
          </CStack>
        </SortableContext>
      </CKanbanBucket>
    </Box>
  );
};

const normalizeSearchValue = (value: unknown) => String(value ?? '').toLocaleLowerCase();

const cardMatchesSearch = (card: KanbanCardRecord, query: string) => {
  const searchableValues = [
    card.id,
    card.title,
    card.summary,
    card.kicker,
    card.priority,
    card.tone,
    card.progress,
    card.dueDate,
    card.assignee?.id,
    card.assignee?.name,
    ...(card.tags?.flatMap((tag) => [tag.id, tag.label]) ?? []),
    ...(card.metrics?.flatMap((metric) => [metric.label, metric.value]) ?? []),
  ];

  return searchableValues.some((value) => normalizeSearchValue(value).includes(query));
};

export const CKanbanBoard = ({
  model,
  onCardMove,
  onCardClick,
  cardFilter,
  onBucketAdd,
  onBucketRename,
  addBucketLabel,
  minBucketWidth = 320,
  bucketHeight,
  bucketMaxHeight,
  searchable = false,
  searchValue,
  defaultSearchValue = '',
  onSearchValueChange,
  searchPlaceholder,
  emptyBucketLabel,
  sx,
}: CKanbanBoardProps) => {
  const { t } = useOrbcafeI18n();
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [overBucketId, setOverBucketId] = useState<string | undefined>();
  const [internalSearchValue, setInternalSearchValue] = useState(defaultSearchValue);
  const effectiveSearchValue = searchValue ?? internalSearchValue;
  const normalizedQuery = effectiveSearchValue.trim().toLocaleLowerCase();
  const resolvedBucketHeight = bucketHeight ?? bucketMaxHeight ?? 560;

  const visibleModel = useMemo(() => {
    return {
      buckets: model.buckets.map((bucket) => {
        const filteredCards = cardFilter
          ? bucket.cards.filter((card) => cardFilter(card, bucket))
          : bucket.cards;
        if (!normalizedQuery) return { ...bucket, cards: filteredCards };

        const bucketMatches = [bucket.id, bucket.title, bucket.description].some((value) =>
          normalizeSearchValue(value).includes(normalizedQuery),
        );
        return {
          ...bucket,
          cards: bucketMatches ? filteredCards : filteredCards.filter((card) => cardMatchesSearch(card, normalizedQuery)),
        };
      }),
    };
  }, [cardFilter, model, normalizedQuery]);

  const visibleCardCount = useMemo(
    () => visibleModel.buckets.reduce((count, bucket) => count + bucket.cards.length, 0),
    [visibleModel],
  );

  const updateSearchValue = useCallback(
    (value: string) => {
      if (searchValue === undefined) setInternalSearchValue(value);
      onSearchValueChange?.(value);
    },
    [onSearchValueChange, searchValue],
  );

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
      <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0, height: '100%', overflow: 'hidden' }}>
        {(searchable || onBucketAdd) && (
          <Box
            role={searchable ? 'search' : undefined}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 1.5,
              mb: 1.25,
              minWidth: 0,
            }}
          >
            {searchable && (
              <Box sx={{ width: '100%', maxWidth: 360, flex: '1 1 240px' }}>
                <CTextField
                  dense
                  value={effectiveSearchValue}
                  onChange={(event) => updateSearchValue(event.target.value)}
                  placeholder={searchPlaceholder ?? t('kanban.search.placeholder')}
                  autoComplete="off"
                  sx={{
                    '& .orb-inp': {
                      paddingLeft: '38px',
                      paddingRight: effectiveSearchValue ? '42px' : '12px',
                    },
                    '& .orb-inp-adornment-end': {
                      pointerEvents: 'auto',
                    },
                  }}
                  startAdornment={<Search size={16} aria-hidden="true" />}
                  endAdornment={effectiveSearchValue ? (
                    <CIconButton
                      size="small"
                      tooltip={t('kanban.search.clear')}
                      aria-label={t('kanban.search.clear')}
                      onClick={() => updateSearchValue('')}
                      sx={{ width: 26, height: 26 }}
                    >
                      <X size={15} />
                    </CIconButton>
                  ) : undefined}
                />
              </Box>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}>
              {normalizedQuery && (
                <CTypography
                  component="div"
                  aria-live="polite"
                  sx={{ flexShrink: 0, fontSize: 12, fontWeight: 500, color: 'text.secondary' }}
                >
                  {visibleCardCount > 0
                    ? t('kanban.search.results', { count: visibleCardCount })
                    : t('kanban.search.noMatch')}
                </CTypography>
              )}
              {onBucketAdd && (
                <CButton
                  size="small"
                  variant="secondary"
                  startIcon={<Plus size={15} />}
                  onClick={onBucketAdd}
                >
                  {addBucketLabel ?? t('kanban.bucket.add')}
                </CButton>
              )}
            </Box>
          </Box>
        )}

        <Box
          sx={[
            {
              display: 'grid',
              gridAutoFlow: 'column',
              gridAutoColumns: `minmax(${minBucketWidth}px, ${Math.max(minBucketWidth, 360)}px)`,
              gap: 1.5,
              gridAutoRows: resolvedBucketHeight === '100%' ? 'minmax(0, 1fr)' : undefined,
              alignItems: 'stretch',
              justifyContent: 'start',
              flex: '1 1 0',
              height: '100%',
              minHeight: 0,
              overflowX: 'auto',
              overflowY: 'hidden',
              overscrollBehavior: 'contain',
              scrollbarGutter: 'stable both-edges',
              pb: 0.5,
            },
            ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
          ]}
        >
          {visibleModel.buckets.map((bucket) => (
            <DroppableKanbanBucket
              key={bucket.id}
              bucket={bucket}
              highlighted={bucket.id === overBucketId}
              bucketHeight={resolvedBucketHeight}
              emptyBucketLabel={normalizedQuery ? t('kanban.search.noMatch') : emptyBucketLabel}
              onBucketRename={onBucketRename ? (title) => onBucketRename(bucket.id, title) : undefined}
              onCardClick={onCardClick}
            />
          ))}
        </Box>
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
