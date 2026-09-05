import { SxProps, Theme } from '../../lib/orbis-compat';
import type { ReactNode } from 'react';

export type KanbanCardPriority = 'critical' | 'high' | 'medium' | 'low';
export type KanbanCardTone = 'default' | 'success' | 'warning' | 'info' | 'error';

export interface KanbanCardAssignee {
  id?: string;
  name: string;
  avatarSrc?: string;
  initials?: string;
}

export interface KanbanCardTag {
  id: string;
  label: string;
  color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
}

export interface KanbanCardMetric {
  id: string;
  label: string;
  value: string | number;
}

export interface KanbanCardRecord {
  id: string;
  bucketId: string;
  title: string;
  summary?: string;
  kicker?: string;
  priority?: KanbanCardPriority;
  tone?: KanbanCardTone;
  progress?: number;
  dueDate?: string;
  assignee?: KanbanCardAssignee;
  tags?: KanbanCardTag[];
  metrics?: KanbanCardMetric[];
  detailHref?: string;
  footer?: ReactNode;
  position?: number;
}

export interface KanbanBucketDefinition {
  id: string;
  title: string;
  description?: string;
  accentColor?: string;
  icon?: ReactNode;
  limit?: number;
  emptyLabel?: string;
}

export interface KanbanBucketModel extends KanbanBucketDefinition {
  cards: KanbanCardRecord[];
}

export interface KanbanBoardModel {
  buckets: KanbanBucketModel[];
}

export interface KanbanCardLookup {
  card: KanbanCardRecord;
  bucket: KanbanBucketModel;
  bucketIndex: number;
  cardIndex: number;
}

export interface KanbanCardMoveInput {
  cardId: string;
  fromBucketId: string;
  toBucketId: string;
  targetIndex?: number;
}

export interface KanbanCardMoveEvent extends KanbanCardMoveInput {
  card: KanbanCardRecord;
  model: KanbanBoardModel;
}

export interface KanbanCardClickContext {
  card: KanbanCardRecord;
  bucket: KanbanBucketDefinition;
}

export interface CKanbanCardProps {
  card: KanbanCardRecord;
  bucket?: KanbanBucketDefinition;
  dragging?: boolean;
  overlay?: boolean;
  onClick?: (context: KanbanCardClickContext) => void;
  sx?: SxProps<Theme>;
}

export interface CKanbanBucketProps {
  bucket: KanbanBucketDefinition;
  cardCount: number;
  highlighted?: boolean;
  children?: ReactNode;
  emptyLabel?: string;
  height?: number | string;
  /** @deprecated Use `height` to define the bucket viewport. */
  maxHeight?: number | string;
  onRename?: (title: string) => void;
  renameLabel?: string;
  sx?: SxProps<Theme>;
}

export interface CKanbanBoardProps {
  model: KanbanBoardModel;
  onCardMove?: (event: KanbanCardMoveEvent) => void;
  onCardClick?: (context: KanbanCardClickContext) => void;
  cardFilter?: (card: KanbanCardRecord, bucket: KanbanBucketDefinition) => boolean;
  onBucketAdd?: () => void;
  onBucketRename?: (bucketId: string, title: string) => void;
  addBucketLabel?: string;
  minBucketWidth?: number;
  bucketHeight?: number | string;
  /** @deprecated Use `bucketHeight`; retained for backward compatibility. */
  bucketMaxHeight?: number | string;
  searchable?: boolean;
  searchValue?: string;
  defaultSearchValue?: string;
  onSearchValueChange?: (value: string) => void;
  searchPlaceholder?: string;
  emptyBucketLabel?: string;
  sx?: SxProps<Theme>;
}

export interface CreateKanbanBoardModelOptions {
  buckets: KanbanBucketDefinition[];
  cards: KanbanCardRecord[];
}

export interface UseKanbanBoardBindings {
  model: KanbanBoardModel;
  onCardMove: (event: KanbanCardMoveEvent) => void;
  onCardClick?: (context: KanbanCardClickContext) => void;
}
