import type { ResolvedCategory } from './types';

/**
 * Order matters: more specific patterns should come first.
 * Each pattern is tested against the full topic text (case-insensitive).
 */
const PATTERNS: [ResolvedCategory, RegExp][] = [
  ['code', /كود|برمجة|react|vue|angular|svelte|python|javascript|typescript|nodejs|node\.js|html|css|scss|api|rest|graphql|bug|باغ|موقع|تطبيق|\bapp\b|swift|kotlin|flutter|php|docker|kubernetes|git|database|قاعدة\s?بيانات|backend|frontend|fullstack|devops|server|cloud|aws|deployment/i],
  ['analyze', /حلل|تحليل|مقارنة|قارن|مميزات|عيوب|ايجابيات|سلبيات|\bpros\b|\bcons\b|swot|نقاط\s?قوة|نقاط\s?ضعف|أداء|benchmark/i],
  ['business', /خطة\s?عمل|خطة\s?أعمال|مشروع|استراتيجية|تسويق|مبيعات|ربح|خسارة|شركة|منتج|سوق|revenue|عملاء|نمو|استثمار|ريادة|startup|pitch|roi|kpi/i],
  ['write', /اكتب|كتابة|مقال|نص|محتوى|إعلان|caption|بوست|قصيدة|رسالة|سيناريو|تقرير|ملخص|وصف|سيو|seo|copywriting/i],
  ['research', /بحث|دراسة\s?علمية|ورقة\s?بحثية|احصاء|إحصاء|تاريخ|حقائق|literature\s?review|research/i],
  ['creative', /فكرة|أفكار|إبداع|ابتكر|تصميم|اسم\s?تجاري|براند|لوجو|creative|عصف\s?ذهني|brainstorm/i],
  ['explain', /اشرح|شرح|كيف\s?يعمل|كيف\s?أ|ما\s?هو|ما\s?هي|لماذا|مفهوم|تعلم|أساسيات|مقدمة|overview|explain|understand/i],
];

export function detectCategory(text: string): ResolvedCategory {
  for (const [category, pattern] of PATTERNS) {
    if (pattern.test(text)) return category;
  }
  return 'explain';
}
