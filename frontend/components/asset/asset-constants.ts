import type { AssetBoardStage } from '../../types';

export const BALI_TEAM = ['Jordan', 'Ayu', 'Ary', 'Billy', 'Dimas', 'Gusti', 'Yoga', 'Andini', 'Georgie'];

export const STAGES: AssetBoardStage[] = [
  'showcase_build',
  'updates_needed',
  'awaiting_review',
  'live',
  'archived',
];

export const STAGE_LABELS: Record<AssetBoardStage, string> = {
  showcase_build:  'Showcase Build',
  updates_needed:  'Updates Needed',
  awaiting_review: 'Awaiting Review',
  live:            'Live',
  archived:        'Archived',
};

export const STAGE_COLUMN_STYLE: Record<AssetBoardStage, { header: string; dot: string }> = {
  showcase_build:  { header: 'bg-blue-50 border-blue-100',     dot: 'bg-blue-500'    },
  updates_needed:  { header: 'bg-amber-50 border-amber-100',   dot: 'bg-amber-500'   },
  awaiting_review: { header: 'bg-purple-50 border-purple-100', dot: 'bg-purple-500'  },
  live:            { header: 'bg-emerald-50 border-emerald-100', dot: 'bg-emerald-500' },
  archived:        { header: 'bg-slate-50 border-slate-200',   dot: 'bg-slate-400'   },
};
