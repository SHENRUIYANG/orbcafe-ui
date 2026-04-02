import type {
  CreateKanbanBoardModelOptions,
  KanbanBoardModel,
  KanbanCardLookup,
  KanbanCardMoveInput,
} from '../types';

const clampIndex = (value: number, max: number) => {
  if (Number.isNaN(value)) return 0;
  if (value < 0) return 0;
  if (value > max) return max;
  return value;
};

export const createKanbanBoardModel = ({ buckets, cards }: CreateKanbanBoardModelOptions): KanbanBoardModel => {
  const cardsByBucket = new Map<string, Array<{ card: typeof cards[number]; sourceIndex: number }>>();

  cards.forEach((card, sourceIndex) => {
    const nextList = cardsByBucket.get(card.bucketId) ?? [];
    nextList.push({ card, sourceIndex });
    cardsByBucket.set(card.bucketId, nextList);
  });

  return {
    buckets: buckets.map((bucket) => {
      const bucketCards = [...(cardsByBucket.get(bucket.id) ?? [])]
        .sort((left, right) => {
          if (left.card.position === undefined && right.card.position === undefined) {
            return left.sourceIndex - right.sourceIndex;
          }
          if (left.card.position === undefined) return 1;
          if (right.card.position === undefined) return -1;
          return left.card.position - right.card.position || left.sourceIndex - right.sourceIndex;
        })
        .map(({ card }, position) => ({ ...card, bucketId: bucket.id, position }));

      return {
        ...bucket,
        cards: bucketCards,
      };
    }),
  };
};

export const findKanbanCard = (model: KanbanBoardModel, cardId: string): KanbanCardLookup | undefined => {
  for (let bucketIndex = 0; bucketIndex < model.buckets.length; bucketIndex += 1) {
    const bucket = model.buckets[bucketIndex];
    const cardIndex = bucket.cards.findIndex((card) => card.id === cardId);
    if (cardIndex >= 0) {
      return {
        card: bucket.cards[cardIndex],
        bucket,
        bucketIndex,
        cardIndex,
      };
    }
  }

  return undefined;
};

export const moveKanbanCard = (model: KanbanBoardModel, move: KanbanCardMoveInput): KanbanBoardModel => {
  const sourceLookup = findKanbanCard(model, move.cardId);
  if (!sourceLookup) return model;

  const targetBucketIndex = model.buckets.findIndex((bucket) => bucket.id === move.toBucketId);
  if (targetBucketIndex < 0) return model;

  const nextBuckets = model.buckets.map((bucket) => ({
    ...bucket,
    cards: bucket.cards.map((card) => ({ ...card })),
  }));

  const sourceBucket = nextBuckets[sourceLookup.bucketIndex];
  const [movingCard] = sourceBucket.cards.splice(sourceLookup.cardIndex, 1);
  if (!movingCard) return model;

  const targetBucket = nextBuckets[targetBucketIndex];
  const targetIndex = clampIndex(move.targetIndex ?? targetBucket.cards.length, targetBucket.cards.length);

  targetBucket.cards.splice(targetIndex, 0, {
    ...movingCard,
    bucketId: move.toBucketId,
  });

  return {
    buckets: nextBuckets.map((bucket) => ({
      ...bucket,
      cards: bucket.cards.map((card, position) => ({
        ...card,
        bucketId: bucket.id,
        position,
      })),
    })),
  };
};
