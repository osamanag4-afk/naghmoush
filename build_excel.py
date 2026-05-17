"""
حاسبة تأسيس المطعم - Excel Generator
"""
import openpyxl
from openpyxl.styles import PatternFill, Font, Alignment, Border, Side, GradientFill
from openpyxl.formatting.rule import CellIsRule, FormulaRule
from openpyxl.utils import get_column_letter
from openpyxl.chart import PieChart, BarChart, Reference
from openpyxl.chart.series import DataPoint
from openpyxl.worksheet.datavalidation import DataValidation
import os

# ═══════════════════════════════════════════════════════
# COLORS & STYLES
# ═══════════════════════════════════════════════════════
C = {
    'orange':        'F97316',
    'orange_light':  'FFF7ED',
    'orange_mid':    'FED7AA',
    'orange_dark':   'C2410C',
    'green':         '16A34A',
    'green_light':   'F0FDF4',
    'green_mid':     'BBF7D0',
    'red':           'DC2626',
    'red_light':     'FEF2F2',
    'red_mid':       'FECACA',
    'amber':         'D97706',
    'amber_light':   'FFFBEB',
    'amber_mid':     'FDE68A',
    'dark':          '1E293B',
    'mid':           '475569',
    'muted':         '94A3B8',
    'light':         'F8FAFC',
    'border':        'E2E8F0',
    'blue':          '2563EB',
    'blue_light':    'EFF6FF',
    'purple':        '7C3AED',
    'purple_light':  'F5F3FF',
    'white':         'FFFFFF',
    'input_bg':      'FEFCE8',  # yellow tint for input cells
    'input_border':  'FDE047',
}

def fill(color): return PatternFill("solid", fgColor=color)
def thin_border(color=None):
    c = color or C['border']
    s = Side(style='thin', color=c)
    return Border(left=s, right=s, top=s, bottom=s)
def thick_bottom(color=None):
    c = color or C['border']
    s = Side(style='thin', color=c)
    t = Side(style='medium', color=color or C['dark'])
    return Border(left=s, right=s, top=s, bottom=t)

def cell(ws, row, col, value='', bold=False, size=11, fg=None, bg=None,
         align='right', num_fmt=None, italic=False, wrap=False, border=True):
    c = ws.cell(row=row, column=col, value=value)
    c.font = Font(name='Cairo', bold=bold, size=size,
                  color=fg or C['dark'], italic=italic)
    c.alignment = Alignment(horizontal=align, vertical='center',
                             wrap_text=wrap, readingOrder=2)
    if bg: c.fill = fill(bg)
    if num_fmt: c.number_format = num_fmt
    if border: c.border = thin_border()
    return c

def header_cell(ws, row, col, value, size=12, bg=None, fg=None):
    return cell(ws, row, col, value, bold=True, size=size,
                bg=bg or C['dark'], fg=fg or C['white'])

def section_header(ws, row, col_start, col_end, title, icon='', bg=None):
    bg = bg or C['orange']
    ws.merge_cells(start_row=row, start_column=col_start,
                   end_row=row, end_column=col_end)
    c = ws.cell(row=row, column=col_start, value=f'{icon}  {title}')
    c.font = Font(name='Cairo', bold=True, size=13, color=C['white'])
    c.alignment = Alignment(horizontal='right', vertical='center', readingOrder=2)
    c.fill = fill(bg)
    c.border = thin_border()
    return c

def input_cell(ws, row, col, value=0, num_fmt=None):
    c = ws.cell(row=row, column=col, value=value)
    c.font = Font(name='Cairo', bold=True, size=12, color=C['dark'])
    c.alignment = Alignment(horizontal='right', vertical='center', readingOrder=2)
    c.fill = fill(C['input_bg'])
    c.border = Border(
        left=Side(style='thin', color=C['input_border']),
        right=Side(style='thin', color=C['input_border']),
        top=Side(style='thin', color=C['input_border']),
        bottom=Side(style='medium', color=C['amber']),
    )
    if num_fmt: c.number_format = num_fmt
    return c

def formula_cell(ws, row, col, formula, bg=None, fg=None, num_fmt=None, bold=False, size=11, italic=False):
    c = ws.cell(row=row, column=col, value=formula)
    c.font = Font(name='Cairo', bold=bold, size=size, color=fg or C['dark'], italic=italic)
    c.alignment = Alignment(horizontal='right', vertical='center', readingOrder=2)
    if bg: c.fill = fill(bg)
    c.border = thin_border()
    if num_fmt: c.number_format = num_fmt
    return c

def merge(ws, r1, c1, r2, c2, value='', bold=False, size=11,
          fg=None, bg=None, align='right'):
    ws.merge_cells(start_row=r1, start_column=c1, end_row=r2, end_column=c2)
    c = ws.cell(row=r1, column=c1, value=value)
    c.font = Font(name='Cairo', bold=bold, size=size, color=fg or C['dark'])
    c.alignment = Alignment(horizontal=align, vertical='center',
                             wrap_text=True, readingOrder=2)
    if bg: c.fill = fill(bg)
    c.border = thin_border()
    return c

def set_col_widths(ws, widths):
    for col, w in widths.items():
        ws.column_dimensions[get_column_letter(col)].width = w

def set_row_height(ws, row, height):
    ws.row_dimensions[row].height = height

SAR_FMT   = '#,##0.00" ر.س"'
SAR_FMT2  = '#,##0" ر.س"'
PCT_FMT   = '0.0%'
NUM_FMT   = '#,##0.00'

# ═══════════════════════════════════════════════════════
# WORKBOOK
# ═══════════════════════════════════════════════════════
wb = openpyxl.Workbook()
wb.remove(wb.active)

# ───────────────────────────────────────────────────────
# SHEET 1: الإعدادات
# ───────────────────────────────────────────────────────
ws_s = wb.create_sheet('الإعدادات')
ws_s.sheet_view.rightToLeft = True
ws_s.sheet_properties.tabColor = 'F97316'
set_col_widths(ws_s, {1:4, 2:32, 3:24, 4:36})

# Title
ws_s.merge_cells('B1:D1')
c = ws_s.cell(1, 2, '⚙️  إعدادات الحاسبة')
c.font = Font(name='Cairo', bold=True, size=16, color=C['white'])
c.alignment = Alignment(horizontal='right', vertical='center', readingOrder=2)
c.fill = fill(C['dark'])
c.border = thin_border()
set_row_height(ws_s, 1, 40)

ws_s.merge_cells('B2:D2')
c = ws_s.cell(2, 2, 'أدخل القيم في الخلايا الصفراء — كل الصيغ في باقي الأوراق تتحدث تلقائياً')
c.font = Font(name='Cairo', size=10, color=C['mid'], italic=True)
c.alignment = Alignment(horizontal='right', vertical='center', readingOrder=2)
c.fill = fill(C['light'])
c.border = thin_border()
set_row_height(ws_s, 2, 24)

# Headers
for r, icon, label, hint in [
    (4,  '🎯', 'هامش الربح المستهدف (%)',     'نسبة الربح المطلوبة — يؤثر على أسعار كل المنتجات'),
    (5,  '♻️', 'نسبة الهدر (%)',               'نسبة الفاقد من المواد الخام (5-10% طبيعي)'),
    (6,  '📦', 'الوحدات المتوقعة شهرياً',      'إجمالي كل الطلبات المتوقعة في الشهر'),
]:
    cell(ws_s, r, 2, f'{icon}  {label}', bold=True, bg=C['light'], fg=C['dark'])
    cell(ws_s, r, 4, hint, size=9, fg=C['muted'], italic=True, bg=C['white'])
    set_row_height(ws_s, r, 28)

# Input cells
input_cell(ws_s, 4, 3, 0.30, PCT_FMT)
input_cell(ws_s, 5, 3, 0.05, PCT_FMT)
input_cell(ws_s, 6, 3, 500,  '#,##0')

# Note
ws_s.merge_cells('B8:D8')
c = ws_s.cell(8, 2, '💡  الخلايا الصفراء هي خلايا الإدخال — باقي الخلايا تُحسب تلقائياً')
c.font = Font(name='Cairo', size=10, color=C['amber'], bold=True)
c.alignment = Alignment(horizontal='right', vertical='center', readingOrder=2)
c.fill = fill(C['amber_light'])
c.border = thin_border()
set_row_height(ws_s, 8, 26)


# ───────────────────────────────────────────────────────
# SHEET 2: تأسيسية
# ───────────────────────────────────────────────────────
def make_cost_sheet(wb, sheet_name, tab_color, icon, title, subtitle,
                    default_rows, col_label='المبلغ (ر.س)', monthly=False):
    ws = wb.create_sheet(sheet_name)
    ws.sheet_view.rightToLeft = True
    ws.sheet_properties.tabColor = tab_color
    set_col_widths(ws, {1:4, 2:38, 3:22, 4:30})

    # Title bar
    ws.merge_cells('B1:D1')
    c = ws.cell(1, 2, f'{icon}  {title}')
    c.font = Font(name='Cairo', bold=True, size=15, color=C['white'])
    c.alignment = Alignment(horizontal='right', vertical='center', readingOrder=2)
    c.fill = fill(C['dark'])
    c.border = thin_border()
    set_row_height(ws, 1, 38)

    ws.merge_cells('B2:D2')
    c = ws.cell(2, 2, subtitle)
    c.font = Font(name='Cairo', size=10, color=C['mid'], italic=True)
    c.alignment = Alignment(horizontal='right', vertical='center', readingOrder=2)
    c.fill = fill(C['light'])
    c.border = thin_border()
    set_row_height(ws, 2, 22)

    # Table headers
    header_cell(ws, 4, 2, 'البند / الوصف', bg=C['dark'])
    header_cell(ws, 4, 3, col_label, bg=C['dark'])
    if monthly:
        header_cell(ws, 4, 4, 'ملاحظات', bg=C['dark'])
    set_row_height(ws, 4, 28)

    # Data rows
    ROWS = 20
    for i, (name, amount) in enumerate(default_rows):
        r = 5 + i
        cell(ws, r, 2, name, bg=C['white'] if i % 2 == 0 else C['light'])
        input_cell(ws, r, 3, amount, SAR_FMT)
        if monthly:
            cell(ws, r, 4, '', bg=C['white'] if i % 2 == 0 else C['light'])
        set_row_height(ws, r, 26)

    # Empty rows
    for i in range(len(default_rows), ROWS):
        r = 5 + i
        cell(ws, r, 2, '', bg=C['white'] if i % 2 == 0 else C['light'])
        input_cell(ws, r, 3, 0, SAR_FMT)
        if monthly:
            cell(ws, r, 4, '', bg=C['white'] if i % 2 == 0 else C['light'])
        set_row_height(ws, r, 24)

    # Total row
    total_row = 5 + ROWS
    ws.merge_cells(start_row=total_row, start_column=2,
                   end_row=total_row, end_column=2 if not monthly else 2)
    total_label = 'المجموع الشهري' if monthly else 'الإجمالي'
    c = ws.cell(total_row, 2, total_label)
    c.font = Font(name='Cairo', bold=True, size=12, color=C['white'])
    c.alignment = Alignment(horizontal='right', vertical='center', readingOrder=2)
    c.fill = fill(C['orange'])
    c.border = thin_border()

    total_range = f'C5:C{total_row - 1}'
    fc = formula_cell(ws, total_row, 3,
                      f'=SUM({total_range})',
                      bg=C['orange_mid'], num_fmt=SAR_FMT, bold=True)
    fc.font = Font(name='Cairo', bold=True, size=12, color=C['orange_dark'])
    if monthly:
        cell(ws, total_row, 4, '', bg=C['orange_mid'])
    set_row_height(ws, total_row, 30)

    return ws, total_row

ws_ta, ta_total = make_cost_sheet(
    wb, 'تأسيسية', 'F97316', '🏗️',
    'المصاريف التأسيسية', 'تكاليف تُدفع مرة واحدة عند التأسيس (لا تتكرر)',
    [
        ('تجهيز وتصميم المطبخ', 0),
        ('الأثاث والديكور', 0),
        ('الأجهزة والمعدات', 0),
        ('رسوم الترخيص والسجل التجاري', 0),
        ('تجهيز نظام نقاط البيع (POS)', 0),
        ('مخزون أولي للمواد الخام', 0),
        ('صيانة وتجهيز المبنى', 0),
    ]
)

ws_op, op_total = make_cost_sheet(
    wb, 'تشغيلية', '3B82F6', '⚙️',
    'المصاريف التشغيلية', 'تكاليف شهرية متكررة تتعلق بتشغيل المطعم',
    [
        ('الكهرباء والمياه', 0),
        ('الصيانة الدورية', 0),
        ('الاشتراكات والبرمجيات', 0),
        ('تجديد المواد الاستهلاكية', 0),
        ('نفقات متنوعة', 0),
    ],
    monthly=True
)

ws_fx, fx_total = make_cost_sheet(
    wb, 'ثابتة', 'EC4899', '📌',
    'المصاريف الثابتة', 'لا تتغير بتغير المبيعات: إيجار، رواتب، أقساط',
    [
        ('الإيجار الشهري', 0),
        ('رواتب الموظفين', 0),
        ('رواتب الإدارة', 0),
        ('التأمينات الاجتماعية', 0),
        ('قسط قرض أو تمويل', 0),
        ('رسوم ثابتة أخرى', 0),
    ],
    monthly=True
)

ws_mk, mk_total = make_cost_sheet(
    wb, 'دعاية', '8B5CF6', '📣',
    'مصاريف الدعاية والإعلان', 'إعلانات، محتوى، سوشيال ميديا، عروض',
    [
        ('إدارة وسائل التواصل الاجتماعي', 0),
        ('إعلانات مدفوعة (Meta / Google)', 0),
        ('تصوير وإنتاج محتوى', 0),
        ('عروض وخصومات ترويجية', 0),
    ],
    monthly=True
)


# ───────────────────────────────────────────────────────
# SHEET: أخرى
# ───────────────────────────────────────────────────────
ws_ot = wb.create_sheet('أخرى')
ws_ot.sheet_view.rightToLeft = True
ws_ot.sheet_properties.tabColor = '6B7280'
set_col_widths(ws_ot, {1:4, 2:36, 3:22, 4:16, 5:28})

ws_ot.merge_cells('B1:E1')
c = ws_ot.cell(1, 2, '📂  مصاريف أخرى')
c.font = Font(name='Cairo', bold=True, size=15, color=C['white'])
c.alignment = Alignment(horizontal='right', vertical='center', readingOrder=2)
c.fill = fill(C['dark'])
c.border = thin_border()
set_row_height(ws_ot, 1, 38)

ws_ot.merge_cells('B2:E2')
c = ws_ot.cell(2, 2, 'أي بنود إضافية — اكتب "نعم" في عمود شهري؟ لتُحتسب ضمن المصاريف الشهرية')
c.font = Font(name='Cairo', size=10, color=C['mid'], italic=True)
c.alignment = Alignment(horizontal='right', vertical='center', readingOrder=2)
c.fill = fill(C['light'])
c.border = thin_border()

for col, label in [(2,'البند'), (3,'المبلغ (ر.س)'), (4,'شهري؟'), (5,'ملاحظات')]:
    header_cell(ws_ot, 4, col, label)
set_row_height(ws_ot, 4, 28)

OT_ROWS = 15
for i in range(OT_ROWS):
    r = 5 + i
    bg = C['white'] if i % 2 == 0 else C['light']
    cell(ws_ot, r, 2, '', bg=bg)
    input_cell(ws_ot, r, 3, 0, SAR_FMT)
    cell(ws_ot, r, 4, 'لا', bg=bg)
    cell(ws_ot, r, 5, '', bg=bg)
    set_row_height(ws_ot, r, 24)

ot_total_r = 5 + OT_ROWS
cell(ws_ot, ot_total_r, 2, 'إجمالي الشهري', bold=True, bg=C['orange'], fg=C['white'])
formula_cell(ws_ot, ot_total_r, 3,
    f'=SUMIF(D5:D{ot_total_r-1},"نعم",C5:C{ot_total_r-1})',
    bg=C['orange_mid'], num_fmt=SAR_FMT, bold=True)
cell(ws_ot, ot_total_r, 4, '', bg=C['orange_mid'])
cell(ws_ot, ot_total_r, 5, '', bg=C['orange_mid'])

ot_onet_r = ot_total_r + 1
cell(ws_ot, ot_onet_r, 2, 'إجمالي لمرة واحدة', bold=True, bg=C['blue'], fg=C['white'])
formula_cell(ws_ot, ot_onet_r, 3,
    f'=SUMIF(D5:D{ot_total_r-1},"لا",C5:C{ot_total_r-1})',
    bg=C['blue_light'], num_fmt=SAR_FMT, bold=True)
cell(ws_ot, ot_onet_r, 4, '', bg=C['blue_light'])
cell(ws_ot, ot_onet_r, 5, '', bg=C['blue_light'])
set_row_height(ws_ot, ot_total_r, 28)
set_row_height(ws_ot, ot_onet_r, 28)


# ───────────────────────────────────────────────────────
# SHEET: متغيرة  (Variable Costs)
# ───────────────────────────────────────────────────────
ws_vr = wb.create_sheet('متغيرة')
ws_vr.sheet_view.rightToLeft = True
ws_vr.sheet_properties.tabColor = 'F59E0B'
set_col_widths(ws_vr, {1:4, 2:30, 3:20, 4:18, 5:14, 6:20, 7:18})

ws_vr.merge_cells('B1:G1')
c = ws_vr.cell(1, 2, '📈  التكاليف المتغيرة')
c.font = Font(name='Cairo', bold=True, size=15, color=C['white'])
c.alignment = Alignment(horizontal='right', vertical='center', readingOrder=2)
c.fill = fill(C['dark'])
c.border = thin_border()
set_row_height(ws_vr, 1, 38)

ws_vr.merge_cells('B2:G2')
c = ws_vr.cell(2, 2,
    'تكاليف تتغير مع حجم الطلبات — كل بند يؤثر مباشرة على الحد الأدنى لسعر البيع. '
    'نوع الحساب: "لكل طلب" أو "لكل X طلب" أو "% من الإيراد"')
c.font = Font(name='Cairo', size=9, color=C['mid'], italic=True)
c.alignment = Alignment(horizontal='right', vertical='center', wrap_text=True, readingOrder=2)
c.fill = fill(C['light'])
c.border = thin_border()
set_row_height(ws_vr, 2, 32)

# Column headers
for col, (label, hint) in enumerate([
    ('البند', ''), ('نوع الحساب', 'لكل طلب / لكل X طلب / % من الإيراد'),
    ('التكلفة / المبلغ', 'ر.س أو %'), ('لكل X طلب', 'عدد الطلبات للـ batch'),
    ('% من الإيراد', 'نسبة من سعر البيع'), ('التكلفة/وحدة', 'محسوبة تلقائياً'),
], start=2):
    header_cell(ws_vr, 4, col, label)
    if hint:
        ws_vr.cell(4, col).comment = None  # placeholder
set_row_height(ws_vr, 4, 28)

VR_DEFAULT = [
    ('تغليف وأكياس',            'لكل طلب',   0, 1,   0),
    ('أدوات أكل ومناديل',       'لكل طلب',   0, 1,   0),
    ('غاز الطبخ',               'لكل X طلب', 0, 10,  0),
    ('كهرباء متغيرة',           'لكل X طلب', 0, 50,  0),
    ('صيانة متغيرة',            'لكل X طلب', 0, 100, 0),
    ('عمولة منصة توصيل',        '% من الإيراد', 0, 1, 0),
]
VR_ROWS = 15

for i, row_data in enumerate(VR_DEFAULT):
    r = 5 + i
    name, stype, cost, batch, pct = row_data
    bg = C['white'] if i % 2 == 0 else C['light']
    cell(ws_vr, r, 2, name, bg=bg)
    input_cell(ws_vr, r, 3, stype)  # type selector
    input_cell(ws_vr, r, 4, cost, '#,##0.00')
    input_cell(ws_vr, r, 5, batch, '#,##0')
    input_cell(ws_vr, r, 6, pct, '0.0%')
    # Cost per unit formula
    f = (f'=IF(C{r}="لكل طلب",D{r},'
         f'IF(C{r}="لكل X طلب",IF(E{r}>0,D{r}/E{r},0),0))')
    formula_cell(ws_vr, r, 7, f, bg=C['blue_light'], num_fmt=SAR_FMT)
    set_row_height(ws_vr, r, 26)

for i in range(len(VR_DEFAULT), VR_ROWS):
    r = 5 + i
    bg = C['white'] if i % 2 == 0 else C['light']
    cell(ws_vr, r, 2, '', bg=bg)
    input_cell(ws_vr, r, 3, 'لكل طلب')
    input_cell(ws_vr, r, 4, 0, '#,##0.00')
    input_cell(ws_vr, r, 5, 1, '#,##0')
    input_cell(ws_vr, r, 6, 0, '0.0%')
    f = (f'=IF(C{r}="لكل طلب",D{r},'
         f'IF(C{r}="لكل X طلب",IF(E{r}>0,D{r}/E{r},0),0))')
    formula_cell(ws_vr, r, 7, f, bg=C['blue_light'], num_fmt=SAR_FMT)
    set_row_height(ws_vr, r, 24)

vr_total_r = 5 + VR_ROWS
cell(ws_vr, vr_total_r, 2, 'إجمالي التكلفة المتغيرة / طلب', bold=True, bg=C['orange'], fg=C['white'])
ws_vr.merge_cells(start_row=vr_total_r, start_column=2, end_row=vr_total_r, end_column=6)
formula_cell(ws_vr, vr_total_r, 7,
    f'=SUM(G5:G{vr_total_r-1})',
    bg=C['orange_mid'], num_fmt=SAR_FMT, bold=True)
set_row_height(ws_vr, vr_total_r, 28)

vr_rev_r = vr_total_r + 1
cell(ws_vr, vr_rev_r, 2, 'إجمالي نسبة % من الإيراد', bold=True, bg=C['purple'], fg=C['white'])
ws_vr.merge_cells(start_row=vr_rev_r, start_column=2, end_row=vr_rev_r, end_column=6)
formula_cell(ws_vr, vr_rev_r, 7,
    f'=SUMIF(C5:C{vr_total_r-1},"% من الإيراد",F5:F{vr_total_r-1})',
    bg=C['purple_light'], num_fmt='0.0%', bold=True)
set_row_height(ws_vr, vr_rev_r, 28)

# Add data validation for type dropdown
dv = DataValidation(type='list', formula1='"لكل طلب,لكل X طلب,% من الإيراد"', showDropDown=False)
ws_vr.add_data_validation(dv)
dv.add(f'C5:C{5+VR_ROWS-1}')


# ───────────────────────────────────────────────────────
# SHEET: لوحة التحكم (Dashboard / Summary)
# ───────────────────────────────────────────────────────
ws_db = wb.create_sheet('لوحة التحكم')
ws_db.sheet_view.rightToLeft = True
ws_db.sheet_properties.tabColor = '16A34A'
set_col_widths(ws_db, {1:4, 2:35, 3:22, 4:22, 5:22})

# Title
ws_db.merge_cells('B1:E1')
c = ws_db.cell(1, 2, '📊  لوحة التحكم — ملخص تكاليف المطعم')
c.font = Font(name='Cairo', bold=True, size=16, color=C['white'])
c.alignment = Alignment(horizontal='right', vertical='center', readingOrder=2)
c.fill = fill(C['dark'])
c.border = thin_border()
set_row_height(ws_db, 1, 42)

ws_db.merge_cells('B2:E2')
c = ws_db.cell(2, 2,
    '📌  هذه الورقة تُحسب تلقائياً من باقي الأوراق — '
    'غيّر هامش الربح في ورقة "الإعدادات" وسترى الأثر هنا وفي التسعير')
c.font = Font(name='Cairo', size=10, color=C['amber'], bold=True)
c.alignment = Alignment(horizontal='right', vertical='center', readingOrder=2)
c.fill = fill(C['amber_light'])
c.border = thin_border()
set_row_height(ws_db, 2, 26)

# Key settings display
section_header(ws_db, 4, 2, 5, 'الإعدادات المفعّلة', '⚙️', C['mid'])
set_row_height(ws_db, 4, 30)

for r, label, formula, fmt in [
    (5, 'هامش الربح المستهدف',    "='الإعدادات'!B4", PCT_FMT),
    (6, 'نسبة الهدر',              "='الإعدادات'!B5", PCT_FMT),
    (7, 'الوحدات المتوقعة/شهر',   "='الإعدادات'!B6", '#,##0'),
]:
    cell(ws_db, r, 2, label, fg=C['mid'], bg=C['light'])
    formula_cell(ws_db, r, 3, formula, num_fmt=fmt, bold=True, bg=C['green_light'])
    ws_db.merge_cells(start_row=r, start_column=4, end_row=r, end_column=5)
    cell(ws_db, r, 4, '', bg=C['light'])
    set_row_height(ws_db, r, 26)

# ── Cost Breakdown Section ──
section_header(ws_db, 9, 2, 5, 'تفصيل التكاليف', '💰', C['orange'])
set_row_height(ws_db, 9, 30)

DB_ROWS = [
    (10, '🏗️  إجمالي المصاريف التأسيسية',
     f"=SUM('تأسيسية'!C5:C{5+20-1})", C['orange_light']),
    (11, '📌  إجمالي المصاريف الثابتة/شهر',
     f"=SUM('ثابتة'!C5:C{5+20-1})", C['light']),
    (12, '⚙️  إجمالي المصاريف التشغيلية/شهر',
     f"=SUM('تشغيلية'!C5:C{5+20-1})", C['blue_light']),
    (13, '📣  إجمالي الدعاية والإعلان/شهر',
     f"=SUM('دعاية'!C5:C{5+20-1})", C['purple_light']),
    (14, f'📂  مصاريف أخرى شهرية',
     f"=SUMIF('أخرى'!D5:D{5+OT_ROWS-1},\"نعم\",'أخرى'!C5:C{5+OT_ROWS-1})", C['light']),
    (15, f'📂  مصاريف أخرى لمرة واحدة',
     f"=SUMIF('أخرى'!D5:D{5+OT_ROWS-1},\"لا\",'أخرى'!C5:C{5+OT_ROWS-1})", C['light']),
]

for r, label, formula, bg in DB_ROWS:
    cell(ws_db, r, 2, label, bg=bg)
    formula_cell(ws_db, r, 3, formula, bg=bg, num_fmt=SAR_FMT)
    ws_db.merge_cells(start_row=r, start_column=4, end_row=r, end_column=5)
    cell(ws_db, r, 4, '', bg=bg)
    set_row_height(ws_db, r, 26)

# Monthly total
cell(ws_db, 16, 2, '📅  إجمالي المصاريف الشهرية الكلية', bold=True, bg=C['orange_mid'], fg=C['orange_dark'])
formula_cell(ws_db, 16, 3, '=C11+C12+C13+C14', bg=C['orange_mid'], num_fmt=SAR_FMT, bold=True)
ws_db.merge_cells('D16:E16')
cell(ws_db, 16, 4, '', bg=C['orange_mid'])
set_row_height(ws_db, 16, 30)

# Variable costs per unit
cell(ws_db, 17, 2, '📈  التكاليف المتغيرة / طلب واحد', bold=True, bg=C['amber_light'])
formula_cell(ws_db, 17, 3, f"='متغيرة'!G{vr_total_r}", bg=C['amber_light'], num_fmt=SAR_FMT, bold=True)
ws_db.merge_cells('D17:E17')
cell(ws_db, 17, 4, '', bg=C['amber_light'])

cell(ws_db, 18, 2, '🛵  نسبة % من الإيراد (متغيرة)', bold=True, bg=C['purple_light'])
formula_cell(ws_db, 18, 3, f"='متغيرة'!G{vr_rev_r}", bg=C['purple_light'], num_fmt=PCT_FMT, bold=True)
ws_db.merge_cells('D18:E18')
cell(ws_db, 18, 4, '', bg=C['purple_light'])

cell(ws_db, 19, 2, '⚖️  توزيع المصاريف الثابتة / وحدة', bold=True, bg=C['blue_light'])
formula_cell(ws_db, 19, 3, '=IF(الإعدادات!B6>0,C16/الإعدادات!B6,0)', bg=C['blue_light'], num_fmt=SAR_FMT, bold=True)
ws_db.merge_cells('D19:E19')
cell(ws_db, 19, 4, '', bg=C['blue_light'])
set_row_height(ws_db, 19, 26)

# Capital section
section_header(ws_db, 21, 2, 5, 'رأس المال المطلوب', '💎', C['dark'])
set_row_height(ws_db, 21, 30)

for r, label, formula, bg in [
    (22, 'المصاريف التأسيسية', '=C10', C['orange_light']),
    (23, 'مصاريف أخرى لمرة واحدة', '=C15', C['light']),
    (24, 'احتياطي تشغيل (3 أشهر)', '=C16*3', C['blue_light']),
]:
    cell(ws_db, r, 2, label, bg=bg)
    formula_cell(ws_db, r, 3, formula, bg=bg, num_fmt=SAR_FMT)
    ws_db.merge_cells(start_row=r, start_column=4, end_row=r, end_column=5)
    cell(ws_db, r, 4, '', bg=bg)
    set_row_height(ws_db, r, 26)

# Grand total capital
ws_db.merge_cells('B25:B25')
cell(ws_db, 25, 2, '💰  رأس المال الكلي المقدر', bold=True, size=13, bg=C['green'], fg=C['white'])
fc = formula_cell(ws_db, 25, 3, '=C22+C23+C24', bg=C['green_mid'], num_fmt=SAR_FMT, bold=True, fg=C['green'])
fc.font = Font(name='Cairo', bold=True, size=14, color=C['green'])
ws_db.merge_cells('D25:E25')
cell(ws_db, 25, 4, '', bg=C['green_mid'])
set_row_height(ws_db, 25, 36)

# Pie chart
chart_data = [
    ('نوع التكلفة', 'المبلغ'),
    ('مصاريف ثابتة', '=C11'),
    ('مصاريف تشغيلية', '=C12'),
    ('دعاية وإعلان', '=C13'),
    ('مصاريف أخرى', '=C14'),
]
chart_start_row = 27
for i, (name, val) in enumerate(chart_data):
    ws_db.cell(chart_start_row + i, 7, name)
    ws_db.cell(chart_start_row + i, 8, val if isinstance(val, str) else val)

pie = PieChart()
pie.title = "توزيع المصاريف الشهرية"
pie.style = 10
labels = Reference(ws_db, min_col=7, min_row=chart_start_row+1, max_row=chart_start_row+4)
data   = Reference(ws_db, min_col=8, min_row=chart_start_row,   max_row=chart_start_row+4)
pie.add_data(data, titles_from_data=True)
pie.set_categories(labels)
pie.dataLabels = None
ws_db.add_chart(pie, 'B27')

# ───────────────────────────────────────────────────────
# SHEET: تسعير المنتجات
# ───────────────────────────────────────────────────────
ws_pr = wb.create_sheet('تسعير المنتجات')
ws_pr.sheet_view.rightToLeft = True
ws_pr.sheet_properties.tabColor = '16A34A'
set_col_widths(ws_pr, {1:4, 2:30, 3:22, 4:14, 5:22, 6:32})

ws_pr.merge_cells('B1:F1')
c = ws_pr.cell(1, 2, '💰  تسعير المنتجات — الحد الأدنى للسعر يُحسب تلقائياً')
c.font = Font(name='Cairo', bold=True, size=15, color=C['white'])
c.alignment = Alignment(horizontal='right', vertical='center', readingOrder=2)
c.fill = fill(C['dark'])
c.border = thin_border()
set_row_height(ws_pr, 1, 40)

# Helper formulas row (hidden, used by product blocks)
# Row 2: key references
ws_pr.merge_cells('B2:F2')
c = ws_pr.cell(2, 2,
    '📌  الخلايا الصفراء للإدخال — الخلايا الزرقاء محسوبة تلقائياً — '
    'السعر الأخضر = صحيح | الأحمر = منخفض جداً')
c.font = Font(name='Cairo', size=10, color=C['mid'], italic=True)
c.alignment = Alignment(horizontal='right', vertical='center', readingOrder=2)
c.fill = fill(C['light'])
c.border = thin_border()
set_row_height(ws_pr, 2, 24)

INGREDIENTS_PER_PRODUCT = 8
PRODUCT_BLOCK_ROWS = 3 + INGREDIENTS_PER_PRODUCT + 12  # header + info + ingredients + calculations
# = 3 + 8 + 12 = 23 rows per product + 2 blank = 25

def make_product_block(ws, start_row, product_num):
    """Create a product pricing block starting at start_row"""
    r = start_row
    n = product_num

    # ── Product Header ──
    ws.merge_cells(start_row=r, start_column=2, end_row=r, end_column=6)
    c = ws.cell(r, 2, f'🍽️  المنتج {n}')
    c.font = Font(name='Cairo', bold=True, size=14, color=C['white'])
    c.alignment = Alignment(horizontal='right', vertical='center', readingOrder=2)
    c.fill = fill(C['orange'])
    c.border = thin_border()
    set_row_height(ws, r, 36)
    r += 1

    # Product name & units
    cell(ws, r, 2, 'اسم المنتج', bold=True, bg=C['light'])
    name_cell = input_cell(ws, r, 3, f'منتج {n}')
    cell(ws, r, 4, 'وحدات/شهر', bold=True, bg=C['light'])
    units_cell = input_cell(ws, r, 5, 100, '#,##0')
    cell(ws, r, 6, '', bg=C['white'])
    set_row_height(ws, r, 30)
    units_row = r
    r += 1

    # ── Ingredients Table ──
    ws.merge_cells(start_row=r, start_column=2, end_row=r, end_column=6)
    c = ws.cell(r, 2, '🧂  المكونات والمواد الخام')
    c.font = Font(name='Cairo', bold=True, size=11, color=C['white'])
    c.alignment = Alignment(horizontal='right', vertical='center', readingOrder=2)
    c.fill = fill(C['mid'])
    c.border = thin_border()
    set_row_height(ws, r, 26)
    r += 1

    # Ingredient header
    for col, lbl in [(2,'المكوّن'), (3,'سعر الوحدة (ر.س)'), (4,'الكمية'), (5,'التكلفة الإجمالية'), (6,'ملاحظات')]:
        header_cell(ws, r, col, lbl, bg=C['dark'])
    set_row_height(ws, r, 24)
    ing_header_row = r
    r += 1

    ing_start = r
    for i in range(INGREDIENTS_PER_PRODUCT):
        bg = C['white'] if i % 2 == 0 else C['light']
        cell(ws, r, 2, '', bg=bg)
        input_cell(ws, r, 3, 0, '#,##0.00')
        input_cell(ws, r, 4, 0, '0.000')
        formula_cell(ws, r, 5, f'=C{r}*D{r}', bg=C['blue_light'], num_fmt=SAR_FMT)
        cell(ws, r, 6, '', bg=bg)
        set_row_height(ws, r, 24)
        r += 1
    ing_end = r - 1

    # ── Cost Breakdown ──
    ws.merge_cells(start_row=r, start_column=2, end_row=r, end_column=6)
    c = ws.cell(r, 2, '📊  تفصيل التكلفة والسعر')
    c.font = Font(name='Cairo', bold=True, size=11, color=C['white'])
    c.alignment = Alignment(horizontal='right', vertical='center', readingOrder=2)
    c.fill = fill(C['mid'])
    c.border = thin_border()
    set_row_height(ws, r, 26)
    r += 1

    raw_r = r
    cell(ws, r, 2, 'تكلفة المواد الخام', bg=C['light'])
    formula_cell(ws, r, 3, f'=SUM(E{ing_start}:E{ing_end})', bg=C['blue_light'], num_fmt=SAR_FMT)
    ws.merge_cells(start_row=r, start_column=4, end_row=r, end_column=6)
    cell(ws, r, 4, 'مجموع تكلفة المكونات', fg=C['muted'], bg=C['light'], size=9, italic=True)
    set_row_height(ws, r, 24)
    r += 1

    adj_r = r
    cell(ws, r, 2, 'بعد الهدر', bg=C['light'])
    formula_cell(ws, r, 3, f'=C{raw_r}*(1+الإعدادات!$B$5)', bg=C['blue_light'], num_fmt=SAR_FMT)
    ws.merge_cells(start_row=r, start_column=4, end_row=r, end_column=6)
    formula_cell(ws, r, 4, f'="+ "&TEXT(الإعدادات!$B$5,"0.0%")&" هدر — زيادة: "&TEXT(C{adj_r}-C{raw_r},"#,##0.00")&" ر.س"',
                 bg=C['amber_light'], fg=C['amber'])
    set_row_height(ws, r, 24)
    r += 1

    ovh_r = r
    cell(ws, r, 2, 'توزيع المصاريف الثابتة', bg=C['light'])
    formula_cell(ws, r, 3, "='لوحة التحكم'!$C$19", bg=C['blue_light'], num_fmt=SAR_FMT)
    ws.merge_cells(start_row=r, start_column=4, end_row=r, end_column=6)
    formula_cell(ws, r, 4,
        f'="من إجمالي "&TEXT(لوحة_التحكم!$C$16,"#,##0.00 ر.س")&" ÷ "&TEXT(الإعدادات!$B$6,"#,##0")&" وحدة"',
        bg=C['light'], fg=C['muted'], size=9)
    set_row_height(ws, r, 24)
    r += 1

    var_r = r
    cell(ws, r, 2, 'التكاليف المتغيرة / طلب', bg=C['light'])
    formula_cell(ws, r, 3, "='لوحة التحكم'!$C$17", bg=C['blue_light'], num_fmt=SAR_FMT)
    ws.merge_cells(start_row=r, start_column=4, end_row=r, end_column=6)
    cell(ws, r, 4, 'تغليف + غاز + صيانة + ...', fg=C['muted'], bg=C['light'], size=9, italic=True)
    set_row_height(ws, r, 24)
    r += 1

    tot_r = r
    cell(ws, r, 2, 'إجمالي التكلفة / وحدة', bold=True, bg=C['orange_light'], fg=C['orange_dark'])
    formula_cell(ws, r, 3, f'=C{adj_r}+C{ovh_r}+C{var_r}', bg=C['orange_light'], num_fmt=SAR_FMT, bold=True, fg=C['orange_dark'])
    ws.merge_cells(start_row=r, start_column=4, end_row=r, end_column=6)
    cell(ws, r, 4, '', bg=C['orange_light'])
    set_row_height(ws, r, 28)
    r += 1

    # Min price formula: base / (1 - margin - revRate)
    min_r = r
    cell(ws, r, 2, f'الحد الأدنى للسعر (هامش {"{profitMargin}"})', bold=True, bg=C['green_light'], fg=C['green'])
    # Use dynamic label
    ws.cell(r, 2).value = None
    formula_cell(ws, r, 2,
        f'="الحد الأدنى للسعر (هامش "&TEXT(الإعدادات!$B$4,"0%")&")"',
        bg=C['green_light'], fg=C['green'], bold=True)
    formula_cell(ws, r, 3,
        f'=IF((1-الإعدادات!$B$4-لوحة_التحكم!$C$18)>0,'
        f'C{tot_r}/(1-الإعدادات!$B$4-لوحة_التحكم!$C$18),0)',
        bg=C['green_mid'], num_fmt=SAR_FMT, bold=True, fg=C['green'])
    ws.merge_cells(start_row=r, start_column=4, end_row=r, end_column=6)
    formula_cell(ws, r, 4,
        f'="تكلفة "&TEXT(C{tot_r},"#,##0.00")&" ر.س ÷ (1 - هامش - عمولة)"',
        bg=C['green_light'], fg=C['green'], size=9)
    set_row_height(ws, r, 30)
    r += 1

    # Entered price (input)
    entered_r = r
    cell(ws, r, 2, 'سعر البيع المقترح (أدخله)', bold=True, bg=C['input_bg'])
    entered_c = input_cell(ws, r, 3, 0, SAR_FMT)
    ws.merge_cells(start_row=r, start_column=4, end_row=r, end_column=6)
    cell(ws, r, 4, '← أدخل سعر البيع الذي تريد تحديده', fg=C['amber'], bold=True, bg=C['amber_light'])
    set_row_height(ws, r, 30)
    r += 1

    # Status
    status_r = r
    cell(ws, r, 2, 'حالة السعر', bold=True, bg=C['light'])
    formula_cell(ws, r, 3,
        f'=IF(C{entered_r}=0,"أدخل السعر أولاً",'
        f'IF(C{entered_r}>=C{min_r},"✅ السعر صحيح",'
        f'IF(C{entered_r}>=C{min_r}*0.9,"⚠️ السعر قريب - راجع",'
        f'"🚨 السعر منخفض جداً")))',
        bg=C['light'])
    ws.merge_cells(start_row=r, start_column=4, end_row=r, end_column=6)
    formula_cell(ws, r, 4,
        f'=IF(C{entered_r}>0,"الحد الأدنى: "&TEXT(C{min_r},"#,##0.00")&" ر.س","")',
        bg=C['light'], fg=C['muted'], size=9)
    set_row_height(ws, r, 28)
    r += 1

    # Actual margin
    margin_r = r
    cell(ws, r, 2, 'هامش الربح الفعلي %', bold=True, bg=C['light'])
    formula_cell(ws, r, 3,
        f'=IF(C{entered_r}>0,'
        f'(C{entered_r}-(C{tot_r}+لوحة_التحكم!$C$18*C{entered_r}))/C{entered_r},0)',
        bg=C['blue_light'], num_fmt=PCT_FMT, bold=True)
    ws.merge_cells(start_row=r, start_column=4, end_row=r, end_column=6)
    cell(ws, r, 4, '', bg=C['light'])
    set_row_height(ws, r, 24)
    r += 1

    # Break-even
    cell(ws, r, 2, 'نقطة التعادل (وحدة/شهر)', bold=True, bg=C['light'])
    formula_cell(ws, r, 3,
        f'=IF(AND(C{min_r}>0,(C{min_r}-(C{adj_r}+C{var_r}))>0),'
        f'CEILING(لوحة_التحكم!$C$16/(C{min_r}-(C{adj_r}+C{var_r})),1),0)',
        bg=C['blue_light'], num_fmt='#,##0" وحدة"', bold=True)
    ws.merge_cells(start_row=r, start_column=4, end_row=r, end_column=6)
    cell(ws, r, 4, '', bg=C['light'])
    set_row_height(ws, r, 24)
    r += 1

    # ── Conditional Formatting for status cell ──
    status_cell_ref = f'C{status_r}'
    green_fill  = PatternFill('solid', fgColor=C['green_mid'])
    yellow_fill = PatternFill('solid', fgColor=C['amber_mid'])
    red_fill    = PatternFill('solid', fgColor=C['red_mid'])

    ws.conditional_formatting.add(status_cell_ref,
        FormulaRule(formula=[f'C{status_r}="✅ السعر صحيح"'],
                    fill=green_fill,
                    font=Font(name='Cairo', bold=True, color=C['green'])))
    ws.conditional_formatting.add(status_cell_ref,
        FormulaRule(formula=[f'C{status_r}="⚠️ السعر قريب - راجع"'],
                    fill=yellow_fill,
                    font=Font(name='Cairo', bold=True, color=C['amber'])))
    ws.conditional_formatting.add(status_cell_ref,
        FormulaRule(formula=[f'LEFT(C{status_r},1)="🚨"'],
                    fill=red_fill,
                    font=Font(name='Cairo', bold=True, color=C['red'])))

    # Also color the entered price cell
    ws.conditional_formatting.add(f'C{entered_r}',
        FormulaRule(formula=[f'AND(C{entered_r}>0,C{entered_r}>=C{min_r})'],
                    fill=PatternFill('solid', fgColor=C['green_light']),
                    font=Font(name='Cairo', bold=True, color=C['green'])))
    ws.conditional_formatting.add(f'C{entered_r}',
        FormulaRule(formula=[f'AND(C{entered_r}>0,C{entered_r}<C{min_r})'],
                    fill=PatternFill('solid', fgColor=C['red_light']),
                    font=Font(name='Cairo', bold=True, color=C['red'])))

    # Blank separator rows
    for sep_r in range(r, r + 2):
        ws.merge_cells(start_row=sep_r, start_column=2, end_row=sep_r, end_column=6)
        cell(ws, sep_r, 2, '', bg=C['white'], border=False)
        set_row_height(ws, sep_r, 12)
    r += 2

    return r  # next available row


# Create 5 product blocks
current_row = 3
for p in range(1, 6):
    current_row = make_product_block(ws_pr, current_row, p)


# ───────────────────────────────────────────────────────
# SHEET ORDER & FREEZE PANES
# ───────────────────────────────────────────────────────
# Move dashboard to front
sheets_order = ['الإعدادات', 'لوحة التحكم', 'تأسيسية', 'تشغيلية',
                'ثابتة', 'متغيرة', 'دعاية', 'أخرى', 'تسعير المنتجات']
for i, name in enumerate(sheets_order):
    if name in [s.title for s in wb.worksheets]:
        idx = [s.title for s in wb.worksheets].index(name)
        wb.move_sheet(wb[name], offset=i - idx)

# Freeze first rows
for ws_name in sheets_order:
    if ws_name in [s.title for s in wb.worksheets]:
        wb[ws_name].freeze_panes = 'B5'

ws_pr.freeze_panes = 'B3'
ws_db.freeze_panes = 'B3'

# Active sheet = settings
wb.active = wb['الإعدادات']

# ───────────────────────────────────────────────────────
# SAVE
# ───────────────────────────────────────────────────────
output = '/home/user/naghmoush/حاسبة-تأسيس-المطعم.xlsx'
wb.save(output)
size = os.path.getsize(output)
print(f'✅ تم إنشاء: {output}')
print(f'📦 الحجم: {size / 1024:.1f} KB')
print(f'📋 الأوراق: {[s.title for s in wb.worksheets]}')
