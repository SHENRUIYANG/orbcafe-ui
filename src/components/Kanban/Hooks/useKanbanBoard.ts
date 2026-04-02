'use client';

import { useCallback, useMemo, useState } from 'react';
import type {
  KanbanBoardModel,
  KanbanCardClickContext,
  KanbanCardMoveEvent,
  KanbanCardRecord,
  UseKanbanBoardBindings,
} from '../types';
import { createKanbanBoardModel, findKanbanCard, moveKanbanCard } from '../Utils/kanbanTools';
import type { CreateKanbanBoardModelOptions } from '../types';

export interface UseKanbanBoardOptions {
  initialModel?: KanbanBoardModel;
  initialBuckets?: CreateKanbanBoardModelOptions['buckets'];
  initialCards?: CreateKanbanBoardModelOptions['cards'];
  onCardMove?: (event: KanbanCardMoveEvent) => void;
  onCardClick?: (context: KanbanCardClickContext) => void;
}

export interface UseKanbanBoardActions {
  replaceModel: (nextModel: KanbanBoardModel | ((current: KanbanBoardModel) => KanbanBoardModel)) => void;
  moveCard: (cardId: string, toBucketId: string, targetIndex?: number) => KanbanCardMoveEvent | undefined;
  updateCard: (
    cardId: string,
    updater: Partial<KanbanCardRecord> | ((card: KanbanCardRecord) => KanbanCardRecord),
  ) => void;
  getCard: (cardId: string) => ReturnType<typeof findKanbanCard>;
}

export interface UseKanbanBoardResult {
  model: KanbanBoardModel;
  actions: UseKanbanBoardActions;
  boardProps: UseKanbanBoardBindings;
}

const resolveInitialModel = ({ initialModel, initialBuckets, initialCards }: UseKanbanBoardOptions): KanbanBoardModel => {
  if (initialModel) return initialModel;
  return createKanbanBoardModel({
    buckets: initialBuckets ?? [],
    cards: initialCards ?? [],
  });
};

export const useKanbanBoard = (options: UseKanbanBoardOptions): UseKanbanBoardResult => {
  const { onCardMove, onCardClick } = options;
  const [model, setModel] = useState<KanbanBoardModel>(() => resolveInitialModel(options));

  const replaceModel = useCallback((nextModel: KanbanBoardModel | ((current: KanbanBoardModel) => KanbanBoardModel)) => {
    setModel((current) => (typeof nextModel === 'function' ? nextModel(current) : nextModel));
  }, []);

  const getCard = useCallback((cardId: string) => findKanbanCard(model, cardId), [model]);

  const moveCard = useCallback(
    (cardId: string, toBucketId: string, targetIndex?: number) => {
      const currentLookup = findKanbanCard(model, cardId);
      if (!currentLookup) return undefined;

      const nextModel = moveKanbanCard(model, {
        cardId,
        fromBucketId: currentLookup.bucket.id,
        toBucketId,
        targetIndex,
      });
      const nextLookup = findKanbanCard(nextModel, cardId);
      if (!nextLookup) return undefined;
      if (nextLookup.bucket.id === currentLookup.bucket.id && nextLookup.cardIndex === currentLookup.cardIndex) {
        return undefined;
      }

      setModel(nextModel);

      const event: KanbanCardMoveEvent = {
        cardId,
        fromBucketId: currentLookup.bucket.id,
        toBucketId: nextLookup.bucket.id,
        targetIndex: nextLookup.cardIndex,
        card: nextLookup.card,
        model: nextModel,
      };

      onCardMove?.(event);
      return event;
    },
    [model, onCardMove],
  );

  const updateCard = useCallback(
    (
      cardId: string,
      updater: Partial<KanbanCardRecord> | ((card: KanbanCardRecord) => KanbanCardRecord),
    ) => {
      setModel((current) => ({
        buckets: current.buckets.map((bucket) => ({
          ...bucket,
          cards: bucket.cards.map((card) => {
            if (card.id !== cardId) return card;
            return typeof updater === 'function' ? updater(card) : { ...card, ...updater };
          }),
        })),
      }));
    },
    [],
  );

  const boardProps = useMemo<UseKanbanBoardBindings>(
    () => ({
      model,
      onCardMove: (event) => {
        moveCard(event.cardId, event.toBucketId, event.targetIndex);
      },
      onCardClick,
    }),
    [model, moveCard, onCardClick],
  );

  return {
    model,
    actions: {
      replaceModel,
      moveCard,
      updateCard,
      getCard,
    },
    boardProps,
  };
};
