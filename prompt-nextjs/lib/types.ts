export type Category =
  | 'auto'
  | 'code'
  | 'write'
  | 'analyze'
  | 'business'
  | 'explain'
  | 'creative'
  | 'research';

/** Category after 'auto' has been resolved via detectCategory */
export type ResolvedCategory = Exclude<Category, 'auto'>;

export type Tone =
  | 'balanced'
  | 'detailed'
  | 'concise'
  | 'steps'
  | 'expert'
  | 'simple';

export interface CategoryOption {
  value: Category;
  label: string;
  emoji: string;
}

export interface ToneOption {
  value: Tone;
  label: string;
}
