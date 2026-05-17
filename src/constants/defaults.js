const uid = () => crypto.randomUUID()

export const initialState = {
  profitMargin: 0.30,
  expectedMonthlyUnits: 500,

  startupCosts: [
    { id: uid(), name: 'تجهيز وتصميم المطبخ', amount: 0 },
    { id: uid(), name: 'الأثاث والديكور', amount: 0 },
    { id: uid(), name: 'الأجهزة والمعدات', amount: 0 },
    { id: uid(), name: 'رسوم الترخيص والسجل التجاري', amount: 0 },
    { id: uid(), name: 'تجهيز نظام نقاط البيع (POS)', amount: 0 },
    { id: uid(), name: 'مخزون أولي للمواد الخام', amount: 0 },
  ],

  operationalCosts: [
    { id: uid(), name: 'الكهرباء والمياه', amount: 0 },
    { id: uid(), name: 'الصيانة الدورية', amount: 0 },
    { id: uid(), name: 'الاشتراكات والبرمجيات', amount: 0 },
    { id: uid(), name: 'تجديد المواد الاستهلاكية', amount: 0 },
  ],

  marketingCosts: [
    { id: uid(), name: 'إدارة وسائل التواصل الاجتماعي', amount: 0 },
    { id: uid(), name: 'إعلانات مدفوعة (Meta / Google)', amount: 0 },
    { id: uid(), name: 'تصوير وإنتاج محتوى', amount: 0 },
    { id: uid(), name: 'عروض وخصومات ترويجية', amount: 0 },
  ],

  wastePercentage: 0.05,

  fixedCosts: [
    { id: uid(), name: 'الإيجار الشهري', amount: 0 },
    { id: uid(), name: 'رواتب الموظفين', amount: 0 },
    { id: uid(), name: 'رواتب الإدارة', amount: 0 },
    { id: uid(), name: 'التأمينات الاجتماعية', amount: 0 },
    { id: uid(), name: 'قسط قرض أو تمويل', amount: 0 },
  ],

  variableCosts: [
    { id: uid(), name: 'تغليف وأكياس', scaleType: 'perUnit', costPerUnit: 0, batchSize: 1, percentageOfRevenue: 0 },
    { id: uid(), name: 'أدوات أكل ومناديل', scaleType: 'perUnit', costPerUnit: 0, batchSize: 1, percentageOfRevenue: 0 },
    { id: uid(), name: 'غاز الطبخ', scaleType: 'perBatch', costPerUnit: 0, batchSize: 10, percentageOfRevenue: 0 },
    { id: uid(), name: 'كهرباء متغيرة (زيادة مع الطلب)', scaleType: 'perBatch', costPerUnit: 0, batchSize: 50, percentageOfRevenue: 0 },
    { id: uid(), name: 'صيانة متغيرة (زيادة مع الاستخدام)', scaleType: 'perBatch', costPerUnit: 0, batchSize: 100, percentageOfRevenue: 0 },
    { id: uid(), name: 'عمولة منصة توصيل (% من الإيراد)', scaleType: 'perRevenue', costPerUnit: 0, batchSize: 1, percentageOfRevenue: 0 },
  ],

  otherCosts: [],

  products: [
    {
      id: uid(),
      name: 'منتج جديد',
      enteredPrice: 0,
      expectedUnitsPerMonth: 100,
      ingredients: [
        { id: uid(), name: '', costPerUnit: 0, quantity: 0 },
      ],
    },
  ],

  activeTab: 'dashboard',
}
