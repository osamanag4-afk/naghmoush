import type { CategoryOption, ToneOption } from './types';

export const CATEGORIES: CategoryOption[] = [
  { value: 'auto',     label: 'تلقائي',  emoji: '🔮' },
  { value: 'code',     label: 'برمجة',   emoji: '💻' },
  { value: 'write',    label: 'كتابة',   emoji: '✍️' },
  { value: 'analyze',  label: 'تحليل',   emoji: '🔍' },
  { value: 'business', label: 'أعمال',   emoji: '📊' },
  { value: 'explain',  label: 'شرح',     emoji: '🎓' },
  { value: 'creative', label: 'إبداعي',  emoji: '🎨' },
  { value: 'research', label: 'بحث',     emoji: '📚' },
];

export const TONES: ToneOption[] = [
  { value: 'balanced', label: 'متوازن' },
  { value: 'detailed', label: 'تفصيلي' },
  { value: 'concise',  label: 'مختصر' },
  { value: 'steps',    label: 'خطوة بخطوة' },
  { value: 'expert',   label: 'للمتخصصين' },
  { value: 'simple',   label: 'للمبتدئين' },
];

export const TIPS = [
  {
    icon: '🎭',
    title: 'حدّد الدور',
    body: 'أخبر Claude بأنه خبير في مجال معين لتحسين جودة الإجابة بشكل كبير.',
  },
  {
    icon: '🎯',
    title: 'كن محدداً',
    body: 'كلما كان سؤالك دقيقاً كانت الإجابة أكثر فائدة وعملية.',
  },
  {
    icon: '📐',
    title: 'حدّد الشكل',
    body: 'اطلب قوائم أو جداول أو خطوات أو كود حسب ما تحتاج.',
  },
  {
    icon: '🔗',
    title: 'أضف السياق',
    body: 'أخبر Claude بمستواك وما جربته وما تحتاجه بالضبط.',
  },
] as const;
