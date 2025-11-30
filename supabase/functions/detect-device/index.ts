// Supabase Edge Function: detect-device
// User-Agent 문자열을 파싱하여 기기 정보를 반환

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import DeviceDetector from 'node-device-detector'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// 모델 코드 → 사용자 친화적 이름 매핑
const MODEL_NAME_MAP: Record<string, string> = {
  // ============================================
  // Samsung Galaxy S Series
  // ============================================
  // Galaxy S25 Series (2025)
  'SM-S931B': 'Galaxy S25', 'SM-S931N': 'Galaxy S25', 'SM-S931U': 'Galaxy S25', 'SM-S931U1': 'Galaxy S25', 'SM-S931W': 'Galaxy S25', 'SM-S9310': 'Galaxy S25',
  'SM-S936B': 'Galaxy S25+', 'SM-S936N': 'Galaxy S25+', 'SM-S936U': 'Galaxy S25+', 'SM-S936U1': 'Galaxy S25+', 'SM-S936W': 'Galaxy S25+', 'SM-S9360': 'Galaxy S25+',
  'SM-S937B': 'Galaxy S25 Edge', 'SM-S937N': 'Galaxy S25 Edge', 'SM-S937U': 'Galaxy S25 Edge',
  'SM-S938B': 'Galaxy S25 Ultra', 'SM-S938N': 'Galaxy S25 Ultra', 'SM-S938U': 'Galaxy S25 Ultra', 'SM-S938U1': 'Galaxy S25 Ultra', 'SM-S938W': 'Galaxy S25 Ultra', 'SM-S9380': 'Galaxy S25 Ultra',

  // Galaxy S24 Series (2024)
  'SM-S921B': 'Galaxy S24', 'SM-S921N': 'Galaxy S24', 'SM-S921U': 'Galaxy S24', 'SM-S921U1': 'Galaxy S24', 'SM-S921W': 'Galaxy S24', 'SM-S9210': 'Galaxy S24', 'SM-S921Q': 'Galaxy S24',
  'SM-S926B': 'Galaxy S24+', 'SM-S926N': 'Galaxy S24+', 'SM-S926U': 'Galaxy S24+', 'SM-S926U1': 'Galaxy S24+', 'SM-S926W': 'Galaxy S24+', 'SM-S9260': 'Galaxy S24+',
  'SM-S928B': 'Galaxy S24 Ultra', 'SM-S928N': 'Galaxy S24 Ultra', 'SM-S928U': 'Galaxy S24 Ultra', 'SM-S928U1': 'Galaxy S24 Ultra', 'SM-S928W': 'Galaxy S24 Ultra', 'SM-S9280': 'Galaxy S24 Ultra', 'SM-S928Q': 'Galaxy S24 Ultra',
  'SM-S721B': 'Galaxy S24 FE', 'SM-S721N': 'Galaxy S24 FE', 'SM-S721U': 'Galaxy S24 FE', 'SM-S721U1': 'Galaxy S24 FE',

  // Galaxy S23 Series (2023)
  'SM-S911B': 'Galaxy S23', 'SM-S911N': 'Galaxy S23', 'SM-S911U': 'Galaxy S23', 'SM-S911U1': 'Galaxy S23', 'SM-S911W': 'Galaxy S23', 'SM-S9110': 'Galaxy S23',
  'SM-S916B': 'Galaxy S23+', 'SM-S916N': 'Galaxy S23+', 'SM-S916U': 'Galaxy S23+', 'SM-S916U1': 'Galaxy S23+', 'SM-S916W': 'Galaxy S23+', 'SM-S9160': 'Galaxy S23+',
  'SM-S918B': 'Galaxy S23 Ultra', 'SM-S918N': 'Galaxy S23 Ultra', 'SM-S918U': 'Galaxy S23 Ultra', 'SM-S918U1': 'Galaxy S23 Ultra', 'SM-S918W': 'Galaxy S23 Ultra', 'SM-S9180': 'Galaxy S23 Ultra',
  'SM-S711B': 'Galaxy S23 FE', 'SM-S711N': 'Galaxy S23 FE', 'SM-S711U': 'Galaxy S23 FE', 'SM-S711U1': 'Galaxy S23 FE',

  // Galaxy S22 Series (2022)
  'SM-S901B': 'Galaxy S22', 'SM-S901N': 'Galaxy S22', 'SM-S901U': 'Galaxy S22', 'SM-S901U1': 'Galaxy S22', 'SM-S901W': 'Galaxy S22', 'SM-S9010': 'Galaxy S22',
  'SM-S906B': 'Galaxy S22+', 'SM-S906N': 'Galaxy S22+', 'SM-S906U': 'Galaxy S22+', 'SM-S906U1': 'Galaxy S22+', 'SM-S906W': 'Galaxy S22+', 'SM-S9060': 'Galaxy S22+',
  'SM-S908B': 'Galaxy S22 Ultra', 'SM-S908N': 'Galaxy S22 Ultra', 'SM-S908U': 'Galaxy S22 Ultra', 'SM-S908U1': 'Galaxy S22 Ultra', 'SM-S908W': 'Galaxy S22 Ultra', 'SM-S9080': 'Galaxy S22 Ultra',

  // Galaxy S21 Series (2021)
  'SM-G991B': 'Galaxy S21 5G', 'SM-G991N': 'Galaxy S21 5G', 'SM-G991U': 'Galaxy S21 5G', 'SM-G991U1': 'Galaxy S21 5G', 'SM-G991W': 'Galaxy S21 5G', 'SM-G9910': 'Galaxy S21 5G',
  'SM-G996B': 'Galaxy S21+ 5G', 'SM-G996N': 'Galaxy S21+ 5G', 'SM-G996U': 'Galaxy S21+ 5G', 'SM-G996U1': 'Galaxy S21+ 5G', 'SM-G996W': 'Galaxy S21+ 5G', 'SM-G9960': 'Galaxy S21+ 5G',
  'SM-G998B': 'Galaxy S21 Ultra 5G', 'SM-G998N': 'Galaxy S21 Ultra 5G', 'SM-G998U': 'Galaxy S21 Ultra 5G', 'SM-G998U1': 'Galaxy S21 Ultra 5G', 'SM-G998W': 'Galaxy S21 Ultra 5G', 'SM-G9980': 'Galaxy S21 Ultra 5G',
  'SM-G990B': 'Galaxy S21 FE 5G', 'SM-G990N': 'Galaxy S21 FE 5G', 'SM-G990U': 'Galaxy S21 FE 5G', 'SM-G990U1': 'Galaxy S21 FE 5G',

  // Galaxy S20 Series (2020)
  'SM-G980F': 'Galaxy S20', 'SM-G980N': 'Galaxy S20', 'SM-G9800': 'Galaxy S20',
  'SM-G981B': 'Galaxy S20 5G', 'SM-G981N': 'Galaxy S20 5G', 'SM-G981U': 'Galaxy S20 5G', 'SM-G981U1': 'Galaxy S20 5G', 'SM-G981W': 'Galaxy S20 5G',
  'SM-G985F': 'Galaxy S20+', 'SM-G985N': 'Galaxy S20+', 'SM-G9850': 'Galaxy S20+',
  'SM-G986B': 'Galaxy S20+ 5G', 'SM-G986N': 'Galaxy S20+ 5G', 'SM-G986U': 'Galaxy S20+ 5G', 'SM-G986U1': 'Galaxy S20+ 5G', 'SM-G986W': 'Galaxy S20+ 5G',
  'SM-G988B': 'Galaxy S20 Ultra 5G', 'SM-G988N': 'Galaxy S20 Ultra 5G', 'SM-G988U': 'Galaxy S20 Ultra 5G', 'SM-G988U1': 'Galaxy S20 Ultra 5G', 'SM-G988W': 'Galaxy S20 Ultra 5G',
  'SM-G780F': 'Galaxy S20 FE', 'SM-G780G': 'Galaxy S20 FE', 'SM-G7810': 'Galaxy S20 FE',
  'SM-G781B': 'Galaxy S20 FE 5G', 'SM-G781N': 'Galaxy S20 FE 5G', 'SM-G781U': 'Galaxy S20 FE 5G', 'SM-G781U1': 'Galaxy S20 FE 5G',

  // ============================================
  // Samsung Galaxy Z Fold Series
  // ============================================
  'SM-F966B': 'Galaxy Z Fold7', 'SM-F966N': 'Galaxy Z Fold7', 'SM-F966U': 'Galaxy Z Fold7', 'SM-F966U1': 'Galaxy Z Fold7',
  'SM-F968B': 'Galaxy Z Fold Special Edition 2', 'SM-F968N': 'Galaxy Z Fold Special Edition 2',
  'SM-F956B': 'Galaxy Z Fold6', 'SM-F956N': 'Galaxy Z Fold6', 'SM-F956U': 'Galaxy Z Fold6', 'SM-F956U1': 'Galaxy Z Fold6', 'SM-F956W': 'Galaxy Z Fold6', 'SM-F9560': 'Galaxy Z Fold6',
  'SM-F958B': 'Galaxy Z Fold Special Edition', 'SM-F958N': 'Galaxy Z Fold Special Edition',
  'SM-F946B': 'Galaxy Z Fold5', 'SM-F946N': 'Galaxy Z Fold5', 'SM-F946U': 'Galaxy Z Fold5', 'SM-F946U1': 'Galaxy Z Fold5', 'SM-F946W': 'Galaxy Z Fold5', 'SM-F9460': 'Galaxy Z Fold5',
  'SM-F936B': 'Galaxy Z Fold4', 'SM-F936N': 'Galaxy Z Fold4', 'SM-F936U': 'Galaxy Z Fold4', 'SM-F936U1': 'Galaxy Z Fold4', 'SM-F936W': 'Galaxy Z Fold4', 'SM-F9360': 'Galaxy Z Fold4',
  'SM-F926B': 'Galaxy Z Fold3 5G', 'SM-F926N': 'Galaxy Z Fold3 5G', 'SM-F926U': 'Galaxy Z Fold3 5G', 'SM-F926U1': 'Galaxy Z Fold3 5G', 'SM-F926W': 'Galaxy Z Fold3 5G',
  'SM-F916B': 'Galaxy Z Fold2 5G', 'SM-F916N': 'Galaxy Z Fold2 5G', 'SM-F916U': 'Galaxy Z Fold2 5G', 'SM-F916U1': 'Galaxy Z Fold2 5G', 'SM-F916W': 'Galaxy Z Fold2 5G',
  'SM-F900F': 'Galaxy Fold', 'SM-F900N': 'Galaxy Fold', 'SM-F900U': 'Galaxy Fold', 'SM-F900U1': 'Galaxy Fold', 'SM-F900W': 'Galaxy Fold',

  // ============================================
  // Samsung Galaxy Z Flip Series
  // ============================================
  'SM-F766B': 'Galaxy Z Flip7', 'SM-F766N': 'Galaxy Z Flip7', 'SM-F766U': 'Galaxy Z Flip7',
  'SM-F761B': 'Galaxy Z Flip7 FE', 'SM-F761N': 'Galaxy Z Flip7 FE',
  'SM-F741B': 'Galaxy Z Flip6', 'SM-F741N': 'Galaxy Z Flip6', 'SM-F741U': 'Galaxy Z Flip6', 'SM-F741U1': 'Galaxy Z Flip6', 'SM-F741W': 'Galaxy Z Flip6', 'SM-F7410': 'Galaxy Z Flip6',
  'SM-F731B': 'Galaxy Z Flip5', 'SM-F731N': 'Galaxy Z Flip5', 'SM-F731U': 'Galaxy Z Flip5', 'SM-F731U1': 'Galaxy Z Flip5', 'SM-F731W': 'Galaxy Z Flip5', 'SM-F7310': 'Galaxy Z Flip5',
  'SM-F721B': 'Galaxy Z Flip4', 'SM-F721N': 'Galaxy Z Flip4', 'SM-F721U': 'Galaxy Z Flip4', 'SM-F721U1': 'Galaxy Z Flip4', 'SM-F721W': 'Galaxy Z Flip4', 'SM-F7210': 'Galaxy Z Flip4',
  'SM-F711B': 'Galaxy Z Flip3 5G', 'SM-F711N': 'Galaxy Z Flip3 5G', 'SM-F711U': 'Galaxy Z Flip3 5G', 'SM-F711U1': 'Galaxy Z Flip3 5G', 'SM-F711W': 'Galaxy Z Flip3 5G',
  'SM-F707B': 'Galaxy Z Flip 5G', 'SM-F707N': 'Galaxy Z Flip 5G', 'SM-F707U': 'Galaxy Z Flip 5G', 'SM-F707U1': 'Galaxy Z Flip 5G', 'SM-F707W': 'Galaxy Z Flip 5G',
  'SM-F700F': 'Galaxy Z Flip', 'SM-F700N': 'Galaxy Z Flip', 'SM-F700U': 'Galaxy Z Flip', 'SM-F700U1': 'Galaxy Z Flip', 'SM-F700W': 'Galaxy Z Flip',

  // ============================================
  // Samsung Galaxy Note Series
  // ============================================
  'SM-N986B': 'Galaxy Note20 Ultra 5G', 'SM-N986N': 'Galaxy Note20 Ultra 5G', 'SM-N986U': 'Galaxy Note20 Ultra 5G', 'SM-N986U1': 'Galaxy Note20 Ultra 5G', 'SM-N986W': 'Galaxy Note20 Ultra 5G',
  'SM-N985F': 'Galaxy Note20 Ultra', 'SM-N985N': 'Galaxy Note20 Ultra',
  'SM-N981B': 'Galaxy Note20 5G', 'SM-N981N': 'Galaxy Note20 5G', 'SM-N981U': 'Galaxy Note20 5G', 'SM-N981U1': 'Galaxy Note20 5G', 'SM-N981W': 'Galaxy Note20 5G',
  'SM-N980F': 'Galaxy Note20', 'SM-N980N': 'Galaxy Note20',
  'SM-N976B': 'Galaxy Note10+ 5G', 'SM-N976N': 'Galaxy Note10+ 5G', 'SM-N976U': 'Galaxy Note10+ 5G', 'SM-N976V': 'Galaxy Note10+ 5G',
  'SM-N975F': 'Galaxy Note10+', 'SM-N975N': 'Galaxy Note10+', 'SM-N975U': 'Galaxy Note10+', 'SM-N975U1': 'Galaxy Note10+', 'SM-N975W': 'Galaxy Note10+',
  'SM-N971N': 'Galaxy Note10 5G',
  'SM-N970F': 'Galaxy Note10', 'SM-N970N': 'Galaxy Note10', 'SM-N970U': 'Galaxy Note10', 'SM-N970U1': 'Galaxy Note10', 'SM-N970W': 'Galaxy Note10',

  // ============================================
  // Samsung Galaxy A Series (Selected)
  // ============================================
  'SM-A566B': 'Galaxy A56 5G', 'SM-A566E': 'Galaxy A56 5G', 'SM-A566N': 'Galaxy A56 5G',
  'SM-A556B': 'Galaxy A55 5G', 'SM-A556E': 'Galaxy A55 5G', 'SM-A556N': 'Galaxy A55 5G',
  'SM-A546B': 'Galaxy A54 5G', 'SM-A546E': 'Galaxy A54 5G', 'SM-A546N': 'Galaxy A54 5G', 'SM-A546U': 'Galaxy A54 5G', 'SM-A546V': 'Galaxy A54 5G',
  'SM-A536B': 'Galaxy A53 5G', 'SM-A536E': 'Galaxy A53 5G', 'SM-A536N': 'Galaxy A53 5G', 'SM-A536U': 'Galaxy A53 5G', 'SM-A536V': 'Galaxy A53 5G',
  'SM-A366B': 'Galaxy A36 5G', 'SM-A366E': 'Galaxy A36 5G', 'SM-A366N': 'Galaxy A36 5G',
  'SM-A356B': 'Galaxy A35 5G', 'SM-A356E': 'Galaxy A35 5G', 'SM-A356N': 'Galaxy A35 5G',
  'SM-A346B': 'Galaxy A34 5G', 'SM-A346E': 'Galaxy A34 5G', 'SM-A346N': 'Galaxy A34 5G',
  'SM-A336B': 'Galaxy A33 5G', 'SM-A336E': 'Galaxy A33 5G', 'SM-A336N': 'Galaxy A33 5G',
  'SM-A256B': 'Galaxy A25 5G', 'SM-A256E': 'Galaxy A25 5G', 'SM-A256N': 'Galaxy A25 5G',
  'SM-A156B': 'Galaxy A15 5G', 'SM-A156E': 'Galaxy A15 5G', 'SM-A156N': 'Galaxy A15 5G',
  'SM-A155F': 'Galaxy A15', 'SM-A155N': 'Galaxy A15',

  // ============================================
  // Apple iPhone
  // ============================================
  // iPhone 16 Series (2024)
  'A3084': 'iPhone 16 Pro Max', 'A3295': 'iPhone 16 Pro Max', 'A3297': 'iPhone 16 Pro Max', 'A3296': 'iPhone 16 Pro Max',
  'A3083': 'iPhone 16 Pro', 'A3292': 'iPhone 16 Pro', 'A3294': 'iPhone 16 Pro', 'A3293': 'iPhone 16 Pro',
  'A3082': 'iPhone 16 Plus', 'A3289': 'iPhone 16 Plus', 'A3291': 'iPhone 16 Plus', 'A3290': 'iPhone 16 Plus',
  'A3081': 'iPhone 16', 'A3286': 'iPhone 16', 'A3288': 'iPhone 16', 'A3287': 'iPhone 16',

  // iPhone 15 Series (2023)
  'A2849': 'iPhone 15 Pro Max', 'A3105': 'iPhone 15 Pro Max', 'A3108': 'iPhone 15 Pro Max', 'A3106': 'iPhone 15 Pro Max',
  'A2848': 'iPhone 15 Pro', 'A3101': 'iPhone 15 Pro', 'A3104': 'iPhone 15 Pro', 'A3102': 'iPhone 15 Pro',
  'A2847': 'iPhone 15 Plus', 'A3093': 'iPhone 15 Plus', 'A3096': 'iPhone 15 Plus', 'A3094': 'iPhone 15 Plus',
  'A2846': 'iPhone 15', 'A3089': 'iPhone 15', 'A3092': 'iPhone 15', 'A3090': 'iPhone 15',

  // iPhone 14 Series (2022)
  'A2651': 'iPhone 14 Pro Max', 'A2893': 'iPhone 14 Pro Max', 'A2896': 'iPhone 14 Pro Max', 'A2895': 'iPhone 14 Pro Max', 'A2894': 'iPhone 14 Pro Max',
  'A2650': 'iPhone 14 Pro', 'A2889': 'iPhone 14 Pro', 'A2892': 'iPhone 14 Pro', 'A2891': 'iPhone 14 Pro', 'A2890': 'iPhone 14 Pro',
  'A2632': 'iPhone 14 Plus', 'A2885': 'iPhone 14 Plus', 'A2888': 'iPhone 14 Plus', 'A2887': 'iPhone 14 Plus', 'A2886': 'iPhone 14 Plus',
  'A2649': 'iPhone 14', 'A2881': 'iPhone 14', 'A2884': 'iPhone 14', 'A2883': 'iPhone 14', 'A2882': 'iPhone 14',

  // iPhone 13 Series (2021)
  'A2484': 'iPhone 13 Pro Max', 'A2641': 'iPhone 13 Pro Max', 'A2644': 'iPhone 13 Pro Max', 'A2645': 'iPhone 13 Pro Max', 'A2643': 'iPhone 13 Pro Max',
  'A2483': 'iPhone 13 Pro', 'A2636': 'iPhone 13 Pro', 'A2639': 'iPhone 13 Pro', 'A2640': 'iPhone 13 Pro', 'A2638': 'iPhone 13 Pro',
  'A2482': 'iPhone 13', 'A2631': 'iPhone 13', 'A2634': 'iPhone 13', 'A2635': 'iPhone 13', 'A2633': 'iPhone 13',
  'A2481': 'iPhone 13 mini', 'A2626': 'iPhone 13 mini', 'A2629': 'iPhone 13 mini', 'A2630': 'iPhone 13 mini', 'A2628': 'iPhone 13 mini',

  // iPhone 12 Series (2020)
  'A2342': 'iPhone 12 Pro Max', 'A2410': 'iPhone 12 Pro Max', 'A2412': 'iPhone 12 Pro Max', 'A2411': 'iPhone 12 Pro Max',
  'A2341': 'iPhone 12 Pro', 'A2406': 'iPhone 12 Pro', 'A2408': 'iPhone 12 Pro', 'A2407': 'iPhone 12 Pro',
  'A2172': 'iPhone 12', 'A2402': 'iPhone 12', 'A2404': 'iPhone 12', 'A2403': 'iPhone 12',
  'A2176': 'iPhone 12 mini', 'A2398': 'iPhone 12 mini', 'A2400': 'iPhone 12 mini', 'A2399': 'iPhone 12 mini',

  // iPhone 11 Series (2019)
  'A2161': 'iPhone 11 Pro Max', 'A2220': 'iPhone 11 Pro Max', 'A2218': 'iPhone 11 Pro Max',
  'A2160': 'iPhone 11 Pro', 'A2217': 'iPhone 11 Pro', 'A2215': 'iPhone 11 Pro',
  'A2111': 'iPhone 11', 'A2223': 'iPhone 11', 'A2221': 'iPhone 11',

  // iPhone XS/XR/X Series
  'A1921': 'iPhone XS Max', 'A2101': 'iPhone XS Max', 'A2102': 'iPhone XS Max', 'A2103': 'iPhone XS Max', 'A2104': 'iPhone XS Max',
  'A1920': 'iPhone XS', 'A2097': 'iPhone XS', 'A2098': 'iPhone XS', 'A2099': 'iPhone XS', 'A2100': 'iPhone XS',
  'A1984': 'iPhone XR', 'A2105': 'iPhone XR', 'A2106': 'iPhone XR', 'A2107': 'iPhone XR', 'A2108': 'iPhone XR',
  'A1865': 'iPhone X', 'A1901': 'iPhone X', 'A1902': 'iPhone X',

  // iPhone 8/7/6 Series
  'A1864': 'iPhone 8 Plus', 'A1897': 'iPhone 8 Plus', 'A1898': 'iPhone 8 Plus',
  'A1863': 'iPhone 8', 'A1905': 'iPhone 8', 'A1906': 'iPhone 8',
  'A1661': 'iPhone 7 Plus', 'A1784': 'iPhone 7 Plus', 'A1785': 'iPhone 7 Plus',
  'A1660': 'iPhone 7', 'A1778': 'iPhone 7', 'A1779': 'iPhone 7',
  'A1634': 'iPhone 6s Plus', 'A1687': 'iPhone 6s Plus', 'A1699': 'iPhone 6s Plus',
  'A1633': 'iPhone 6s', 'A1688': 'iPhone 6s', 'A1700': 'iPhone 6s',
  'A1522': 'iPhone 6 Plus', 'A1524': 'iPhone 6 Plus', 'A1593': 'iPhone 6 Plus',
  'A1549': 'iPhone 6', 'A1586': 'iPhone 6', 'A1589': 'iPhone 6',

  // iPhone SE
  'A2595': 'iPhone SE (3rd gen)', 'A2782': 'iPhone SE (3rd gen)', 'A2783': 'iPhone SE (3rd gen)', 'A2784': 'iPhone SE (3rd gen)', 'A2785': 'iPhone SE (3rd gen)',
  'A2275': 'iPhone SE (2nd gen)', 'A2296': 'iPhone SE (2nd gen)', 'A2298': 'iPhone SE (2nd gen)',

  // ============================================
  // Google Pixel
  // ============================================
  // Pixel 9 Series (2024)
  'G2YBB': 'Pixel 9', 'GUR25': 'Pixel 9', 'G1B60': 'Pixel 9',
  'GR83Y': 'Pixel 9 Pro', 'GEC77': 'Pixel 9 Pro', 'GWVK6': 'Pixel 9 Pro',
  'GGX8B': 'Pixel 9 Pro XL', 'GZC4K': 'Pixel 9 Pro XL', 'GQ57S': 'Pixel 9 Pro XL',
  'GGH2X': 'Pixel 9 Pro Fold', 'GC15S': 'Pixel 9 Pro Fold',
  'GTF7P': 'Pixel 9a',

  // Pixel 8 Series (2023)
  'G9BQD': 'Pixel 8', 'GKWS6': 'Pixel 8', 'GPJ41': 'Pixel 8', 'GZPFO': 'Pixel 8',
  'G1MNW': 'Pixel 8 Pro', 'GC3VE': 'Pixel 8 Pro',
  'GKV4X': 'Pixel 8a', 'G6GPR': 'Pixel 8a', 'G8HHN': 'Pixel 8a', 'G576D': 'Pixel 8a',

  // Pixel 7 Series (2022)
  'GVU6C': 'Pixel 7', 'GQML3': 'Pixel 7', 'G03Z5': 'Pixel 7',
  'GP4BC': 'Pixel 7 Pro', 'GE2AE': 'Pixel 7 Pro', 'GFE4J': 'Pixel 7 Pro',
  'GWKK3': 'Pixel 7a', 'GHL1X': 'Pixel 7a', 'G0DZQ': 'Pixel 7a', 'G82U8': 'Pixel 7a',

  // Pixel 6 Series (2021)
  'GR1YH': 'Pixel 6', 'G9S9B': 'Pixel 6', 'GB7N6': 'Pixel 6',
  'GLU0G': 'Pixel 6 Pro', 'G8VOU': 'Pixel 6 Pro',
  'GX7AS': 'Pixel 6a', 'GB62Z': 'Pixel 6a', 'G1AZG': 'Pixel 6a',

  // Pixel Fold
  'G9FPL': 'Pixel Fold', 'G0B96': 'Pixel Fold',

  // Pixel 5/4/3 Series
  'GD1YQ': 'Pixel 5', 'GTT9Q': 'Pixel 5',
  'G020I': 'Pixel 4 XL', 'G020J': 'Pixel 4 XL', 'G020P': 'Pixel 4 XL',
  'G020M': 'Pixel 4', 'G020N': 'Pixel 4', 'G020Q': 'Pixel 4',
  'G020C': 'Pixel 3a XL', 'G020D': 'Pixel 3a XL', 'G020B': 'Pixel 3a XL',
  'G020E': 'Pixel 3a', 'G020F': 'Pixel 3a', 'G020G': 'Pixel 3a', 'G020H': 'Pixel 3a',
  'G013C': 'Pixel 3 XL', 'G013D': 'Pixel 3 XL',
  'G013A': 'Pixel 3', 'G013B': 'Pixel 3',

  // ============================================
  // OnePlus
  // ============================================
  // OnePlus 12/13 Series
  'CPH2573': 'OnePlus 13', 'PJD110': 'OnePlus 13',
  'CPH2511': 'OnePlus 12', 'CPH2513': 'OnePlus 12', 'PJD210': 'OnePlus 12',
  'CPH2449': 'OnePlus 11', 'CPH2451': 'OnePlus 11', 'PHB110': 'OnePlus 11',
  'NE2210': 'OnePlus 10 Pro', 'NE2211': 'OnePlus 10 Pro', 'NE2213': 'OnePlus 10 Pro', 'NE2215': 'OnePlus 10 Pro', 'NE2217': 'OnePlus 10 Pro',
  'CPH2411': 'OnePlus 10T', 'CPH2413': 'OnePlus 10T', 'PGP110': 'OnePlus 10T',

  // OnePlus 9 Series
  'LE2115': 'OnePlus 9', 'LE2117': 'OnePlus 9', 'LE2110': 'OnePlus 9', 'LE2111': 'OnePlus 9', 'LE2113': 'OnePlus 9',
  'LE2125': 'OnePlus 9 Pro', 'LE2127': 'OnePlus 9 Pro', 'LE2120': 'OnePlus 9 Pro', 'LE2121': 'OnePlus 9 Pro', 'LE2123': 'OnePlus 9 Pro',
  'LE2101': 'OnePlus 9R', 'LE2100': 'OnePlus 9R', 'LE2103': 'OnePlus 9R',
  'LE2201': 'OnePlus 9RT', 'LE2200': 'OnePlus 9RT',

  // OnePlus 8 Series
  'IN2010': 'OnePlus 8', 'IN2011': 'OnePlus 8', 'IN2013': 'OnePlus 8', 'IN2015': 'OnePlus 8', 'IN2017': 'OnePlus 8', 'IN2019': 'OnePlus 8',
  'IN2020': 'OnePlus 8 Pro', 'IN2021': 'OnePlus 8 Pro', 'IN2023': 'OnePlus 8 Pro', 'IN2025': 'OnePlus 8 Pro',
  'IN2025': 'OnePlus 8T', 'KB2000': 'OnePlus 8T', 'KB2001': 'OnePlus 8T', 'KB2003': 'OnePlus 8T', 'KB2005': 'OnePlus 8T', 'KB2007': 'OnePlus 8T',

  // OnePlus Nord Series
  'CPH2493': 'OnePlus Nord 4', 'IV2201': 'OnePlus Nord 4',
  'CPH2491': 'OnePlus Nord CE 4', 'CPH2515': 'OnePlus Nord CE 4 Lite',
  'IV2201': 'OnePlus Nord 3', 'CPH2491': 'OnePlus Nord 3', 'CPH2493': 'OnePlus Nord 3',
  'IV2203': 'OnePlus Nord CE 3', 'CPH2569': 'OnePlus Nord CE 3 Lite',
  'IV2201': 'OnePlus Nord 2T', 'CPH2399': 'OnePlus Nord 2T',
  'DN2101': 'OnePlus Nord 2', 'DN2103': 'OnePlus Nord 2',
  'AC2001': 'OnePlus Nord', 'AC2003': 'OnePlus Nord',

  // ============================================
  // Xiaomi
  // ============================================
  // Xiaomi 14 Series
  '2311DRK48G': 'Xiaomi 14', '2311DRK48C': 'Xiaomi 14', '2311DRK48I': 'Xiaomi 14',
  '24015RN24G': 'Xiaomi 14 Ultra', '24015RN24C': 'Xiaomi 14 Ultra',
  '23116PN5BC': 'Xiaomi 14 Pro', '2311DRK9C': 'Xiaomi 14 Pro',

  // Xiaomi 13 Series
  '2211133C': 'Xiaomi 13', '2211133G': 'Xiaomi 13',
  '2210132C': 'Xiaomi 13 Pro', '2210132G': 'Xiaomi 13 Pro',
  '2304FPN6DC': 'Xiaomi 13 Ultra', '2304FPN6DG': 'Xiaomi 13 Ultra',
  '2306EPN60G': 'Xiaomi 13T', '2306EPN60I': 'Xiaomi 13T',
  '23078PND5G': 'Xiaomi 13T Pro',

  // Xiaomi 12 Series
  '2201123C': 'Xiaomi 12', '2201123G': 'Xiaomi 12',
  '2201122C': 'Xiaomi 12 Pro', '2201122G': 'Xiaomi 12 Pro',
  '2203121C': 'Xiaomi 12S', '2203121G': 'Xiaomi 12S',
  '2206122SC': 'Xiaomi 12S Pro', '2206123SC': 'Xiaomi 12S Ultra',
  '22071212AG': 'Xiaomi 12T', '22071212AI': 'Xiaomi 12T',
  '22081212UG': 'Xiaomi 12T Pro', '22081212UI': 'Xiaomi 12T Pro',
  '2112123AC': 'Xiaomi 12X', '2112123AG': 'Xiaomi 12X',

  // Redmi Note Series
  '2312DRA50G': 'Redmi Note 14 Pro+ 5G', '24069RA21I': 'Redmi Note 14 Pro 5G',
  '23090RA98G': 'Redmi Note 13 Pro+ 5G', '23090RA98I': 'Redmi Note 13 Pro+ 5G',
  '2312FPCA4G': 'Redmi Note 13 Pro 5G', '2312FPCA4I': 'Redmi Note 13 Pro 5G',
  '23108RN04Y': 'Redmi Note 13 5G', '23106RN0DA': 'Redmi Note 13 5G',
  '22101316G': 'Redmi Note 12 Pro+ 5G', '22101316I': 'Redmi Note 12 Pro+ 5G',
  '22101316UG': 'Redmi Note 12 Pro 5G', '22101316UC': 'Redmi Note 12 Pro 5G',
  '22111317G': 'Redmi Note 12 5G', '22111317I': 'Redmi Note 12 5G',
  '21091116AG': 'Redmi Note 11 Pro+ 5G', '21091116AI': 'Redmi Note 11 Pro+ 5G',
  '2201116SG': 'Redmi Note 11 Pro 5G', '2201116SI': 'Redmi Note 11 Pro 5G',
  '21091116I': 'Redmi Note 11', '21091116G': 'Redmi Note 11',

  // Redmi Series
  '23106RN0DA': 'Redmi 13C', '23108RN04Y': 'Redmi 13C',
  '22120RN86G': 'Redmi 12 5G', '22120RN86I': 'Redmi 12 5G',
  '23053RN02A': 'Redmi 12', '23053RN02L': 'Redmi 12',
  '23030RAC7Y': 'Redmi 12C', '23030RAC7L': 'Redmi 12C',

  // POCO Series
  '23113RKC6G': 'POCO X6 Pro', '23113RKC6I': 'POCO X6 Pro',
  '23122PCD1G': 'POCO X6', '23122PCD1I': 'POCO X6',
  '22101320G': 'POCO X5 Pro 5G', '22101320I': 'POCO X5 Pro 5G',
  '22111317PG': 'POCO X5 5G', '22111317PI': 'POCO X5 5G',
  '23049PCD8G': 'POCO F5', '23049PCD8I': 'POCO F5',
  '21121210G': 'POCO F4 GT', '21121210C': 'POCO F4 GT',
  '22021211RG': 'POCO F4', '22021211RI': 'POCO F4',
  '2107113SG': 'POCO F3', '2107113SI': 'POCO F3',
  '23021RAAEG': 'POCO M5', '23021RAAEI': 'POCO M5',
  '2310FPCA4G': 'POCO C65', '2310FPCA4I': 'POCO C65',
  '2312BPC51H': 'POCO C61',

  // ============================================
  // Huawei
  // ============================================
  // Mate Series
  'ALN-AL00': 'Mate 60 Pro', 'ALN-AL80': 'Mate 60 Pro', 'ALN-LX9': 'Mate 60 Pro',
  'BRA-AL00': 'Mate 60 Pro+', 'BRA-LX9': 'Mate 60 Pro+',
  'MNA-AL00': 'Mate 60', 'MNA-LX9': 'Mate 60',
  'NOH-NX9': 'Mate 40 Pro', 'NOH-AN00': 'Mate 40 Pro', 'NOH-AN01': 'Mate 40 Pro',
  'NOP-AN00': 'Mate 40 Pro+',
  'OCE-AN10': 'Mate 40', 'OCE-AN00': 'Mate 40',
  'LIO-N29': 'Mate 30 Pro 5G', 'LIO-AN00': 'Mate 30 Pro 5G',
  'LIO-L29': 'Mate 30 Pro', 'LIO-AL00': 'Mate 30 Pro',
  'TAS-AN00': 'Mate 30 5G', 'TAS-AL00': 'Mate 30 5G',
  'TAS-L29': 'Mate 30', 'TAS-L09': 'Mate 30',

  // P Series
  'ABR-LX9': 'P60 Pro', 'ABR-AL00': 'P60 Pro',
  'LNA-LX9': 'P60', 'LNA-AL00': 'P60',
  'JAD-LX9': 'P50 Pro', 'JAD-AL50': 'P50 Pro', 'JAD-AL00': 'P50 Pro',
  'ABR-LX1': 'P50', 'ABR-AL00': 'P50',
  'ELS-NX9': 'P40 Pro+', 'ELS-AN10': 'P40 Pro+',
  'ELS-N39': 'P40 Pro', 'ELS-NX9': 'P40 Pro', 'ELS-AN00': 'P40 Pro', 'ELS-TN00': 'P40 Pro',
  'ANA-NX9': 'P40', 'ANA-AN00': 'P40', 'ANA-TN00': 'P40',
  'VOG-L29': 'P30 Pro', 'VOG-L09': 'P30 Pro', 'VOG-AL00': 'P30 Pro', 'VOG-AL10': 'P30 Pro',
  'ELE-L29': 'P30', 'ELE-L09': 'P30', 'ELE-AL00': 'P30', 'ELE-TL00': 'P30',

  // ============================================
  // LG (discontinued but still in use)
  // ============================================
  'LM-V600': 'V60 ThinQ 5G', 'LM-V600AM': 'V60 ThinQ 5G', 'LM-V600TM': 'V60 ThinQ 5G', 'LM-V600VM': 'V60 ThinQ 5G', 'LM-V600EA': 'V60 ThinQ 5G',
  'LM-V500N': 'V50 ThinQ 5G', 'LM-V500EM': 'V50 ThinQ 5G',
  'LM-V405': 'V40 ThinQ', 'LM-V405UA': 'V40 ThinQ', 'LM-V405EBW': 'V40 ThinQ',
  'LM-G900N': 'Velvet 5G', 'LM-G900EM': 'Velvet 5G', 'LM-G900TM': 'Velvet 5G',
  'LM-G850': 'G8 ThinQ', 'LM-G850UM': 'G8 ThinQ', 'LM-G850EMW': 'G8 ThinQ',
  'LM-G820N': 'G8 ThinQ', 'LM-G820UM': 'G8 ThinQ', 'LM-G820QM': 'G8 ThinQ',
  'LM-G710': 'G7 ThinQ', 'LM-G710EM': 'G7 ThinQ', 'LM-G710VM': 'G7 ThinQ', 'LM-G710TM': 'G7 ThinQ',
  'LM-Q730': 'Stylo 6', 'LM-Q730TM': 'Stylo 6', 'LM-Q730MM': 'Stylo 6',
  'LM-K500': 'K51', 'LM-K500UM': 'K51', 'LM-K500MM': 'K51',

  // ============================================
  // Sony Xperia
  // ============================================
  'XQ-DQ72': 'Xperia 1 VI', 'XQ-DQ62': 'Xperia 1 VI', 'XQ-DQ54': 'Xperia 1 VI',
  'XQ-CQ72': 'Xperia 1 V', 'XQ-CQ62': 'Xperia 1 V', 'XQ-CQ54': 'Xperia 1 V',
  'XQ-CT72': 'Xperia 5 V', 'XQ-CT62': 'Xperia 5 V', 'XQ-CT54': 'Xperia 5 V',
  'XQ-BC72': 'Xperia 1 IV', 'XQ-BC62': 'Xperia 1 IV', 'XQ-BC52': 'Xperia 1 IV',
  'XQ-BT52': 'Xperia 5 IV', 'XQ-BT62': 'Xperia 5 IV', 'XQ-BT72': 'Xperia 5 IV',
  'XQ-CC72': 'Xperia 10 V', 'XQ-CC62': 'Xperia 10 V', 'XQ-CC54': 'Xperia 10 V',
  'XQ-DC72': 'Xperia 10 VI', 'XQ-DC62': 'Xperia 10 VI', 'XQ-DC54': 'Xperia 10 VI',

  // ============================================
  // Motorola
  // ============================================
  'XT2347-1': 'Edge 50 Ultra', 'XT2347-2': 'Edge 50 Ultra',
  'XT2343-1': 'Edge 50 Pro', 'XT2343-2': 'Edge 50 Pro',
  'XT2341-1': 'Edge 50 Fusion', 'XT2341-2': 'Edge 50 Fusion',
  'XT2301-4': 'Edge 40 Pro', 'XT2301-5': 'Edge 40 Pro',
  'XT2303-1': 'Edge 40', 'XT2303-2': 'Edge 40',
  'XT2241-1': 'Edge 30 Ultra', 'XT2241-2': 'Edge 30 Ultra',
  'XT2243-1': 'Edge 30 Pro', 'XT2243-2': 'Edge 30 Pro',
  'XT2245-1': 'Edge 30 Fusion', 'XT2245-2': 'Edge 30 Fusion',
  'XT2201-1': 'Edge 30', 'XT2201-2': 'Edge 30',
  'XT2251-1': 'Razr 40 Ultra', 'XT2251-2': 'Razr 40 Ultra',
  'XT2253-1': 'Razr 40', 'XT2253-2': 'Razr 40',
  'XT2321-1': 'Razr 50 Ultra', 'XT2321-2': 'Razr 50 Ultra',
  'XT2323-1': 'Razr 50', 'XT2323-2': 'Razr 50',
  'XT2317-1': 'Moto G Stylus 5G (2024)', 'XT2317-2': 'Moto G Stylus 5G (2024)',
  'XT2339-1': 'Moto G Power 5G (2024)', 'XT2339-2': 'Moto G Power 5G (2024)',

  // ============================================
  // ASUS ROG Phone
  // ============================================
  'ASUS_AI2401': 'ROG Phone 8 Pro', 'ASUS_AI2401_A': 'ROG Phone 8 Pro',
  'ASUS_AI2401_B': 'ROG Phone 8', 'ASUS_AI2401_C': 'ROG Phone 8',
  'ASUS_AI2301': 'ROG Phone 7 Ultimate', 'ASUS_AI2301_A': 'ROG Phone 7 Ultimate',
  'ASUS_AI2301_B': 'ROG Phone 7', 'ASUS_AI2301_C': 'ROG Phone 7',
  'ASUS_AI2201': 'ROG Phone 6 Pro', 'ASUS_AI2201_A': 'ROG Phone 6 Pro',
  'ASUS_AI2201_B': 'ROG Phone 6', 'ASUS_AI2201_C': 'ROG Phone 6',
  'ASUS_AI2201_D': 'ROG Phone 6D', 'ASUS_AI2201_E': 'ROG Phone 6D Ultimate',

  // ASUS Zenfone
  'ASUS_AI2302': 'Zenfone 10', 'ASUS_AI2302_A': 'Zenfone 10', 'ASUS_AI2302_B': 'Zenfone 10',
  'ASUS_AI2202': 'Zenfone 9', 'ASUS_AI2202_A': 'Zenfone 9', 'ASUS_AI2202_B': 'Zenfone 9',
  'ASUS_I006D': 'Zenfone 8', 'ASUS_I006D_1': 'Zenfone 8',
  'ASUS_I007D': 'Zenfone 8 Flip',

  // ============================================
  // Oppo
  // ============================================
  'CPH2551': 'Find X7 Ultra', 'PHZ110': 'Find X7 Ultra',
  'CPH2519': 'Find X7', 'PHT110': 'Find X7',
  'CPH2471': 'Find X6 Pro', 'PFFM10': 'Find X6 Pro',
  'CPH2469': 'Find X6', 'PFFM20': 'Find X6',
  'CPH2413': 'Find X5 Pro', 'PFFM00': 'Find X5 Pro',
  'CPH2307': 'Find X5', 'PFGM00': 'Find X5',
  'CPH2247': 'Find X3 Pro', 'PEEM00': 'Find X3 Pro',
  'CPH2173': 'Find X3 Neo', 'CPH2207': 'Find X3 Lite',
  'CPH2575': 'Reno 12 Pro', 'CPH2577': 'Reno 12',
  'CPH2529': 'Reno 11 Pro', 'CPH2527': 'Reno 11',
  'CPH2491': 'Reno 10 Pro+', 'CPH2489': 'Reno 10 Pro', 'CPH2531': 'Reno 10',
  'CPH2357': 'Reno 8 Pro', 'CPH2359': 'Reno 8', 'CPH2363': 'Reno 8 Lite',
  'CPH2293': 'Reno 7 Pro', 'CPH2371': 'Reno 7', 'CPH2373': 'Reno 7 Lite',

  // ============================================
  // Vivo
  // ============================================
  'V2324': 'X100 Ultra', 'V2324A': 'X100 Ultra',
  'V2314': 'X100 Pro', 'V2314A': 'X100 Pro',
  'V2310': 'X100', 'V2310A': 'X100',
  'V2219': 'X90 Pro+', 'V2219A': 'X90 Pro+',
  'V2242': 'X90 Pro', 'V2242A': 'X90 Pro',
  'V2241': 'X90', 'V2241A': 'X90',
  'V2227': 'X Fold 3 Pro', 'V2229': 'X Fold 3',
  'V2178': 'X Fold 2', 'V2178A': 'X Fold 2',
  'V2229': 'X Flip', 'V2229A': 'X Flip',
  'V2303': 'V30 Pro', 'V2301': 'V30',
  'V2244': 'V29 Pro', 'V2250': 'V29',
  'V2217': 'V27 Pro', 'V2246': 'V27',

  // ============================================
  // Realme
  // ============================================
  'RMX3931': 'GT 6', 'RMX3932': 'GT 6',
  'RMX3851': 'GT 5 Pro', 'RMX3888': 'GT 5',
  'RMX3708': 'GT 3', 'RMX3709': 'GT 3',
  'RMX3830': 'GT Neo 6', 'RMX3831': 'GT Neo 6',
  'RMX3700': 'GT Neo 5', 'RMX3701': 'GT Neo 5',
  'RMX3560': 'GT Neo 3', 'RMX3561': 'GT Neo 3',
  'RMX3880': '13 Pro+', 'RMX3881': '13 Pro',
  'RMX3771': '12 Pro+', 'RMX3761': '12 Pro',
  'RMX3341': '11 Pro+', 'RMX3350': '11 Pro',

  // ============================================
  // Nothing
  // ============================================
  'A065': 'Phone (2a)', 'A064': 'Phone (2a)',
  'A142': 'Phone (2)', 'A143': 'Phone (2)',
  'A063': 'Phone (1)', 'A064': 'Phone (1)',

  // ============================================
  // Lenovo
  // ============================================
  'XT2351-1': 'Legion Phone Duel 3', 'XT2351-2': 'Legion Phone Duel 3',
  'L71091': 'Legion Phone Duel 2', 'L71092': 'Legion Phone Duel 2',
  'L79031': 'Legion Phone Duel', 'L79032': 'Legion Phone Duel',

  // ============================================
  // ZTE
  // ============================================
  'NX721J': 'Nubia Red Magic 9 Pro', 'NX729J': 'Nubia Red Magic 9 Pro+',
  'NX713J': 'Nubia Red Magic 8 Pro', 'NX709J': 'Nubia Red Magic 8 Pro+',
  'NX679J': 'Nubia Red Magic 7', 'NX709S': 'Nubia Red Magic 7 Pro',
  'NX669J': 'Nubia Red Magic 6', 'NX669S': 'Nubia Red Magic 6 Pro',
  'NX659J': 'Nubia Red Magic 5G', 'NX651J': 'Nubia Red Magic 5S',

  // ============================================
  // Honor (separated from Huawei)
  // ============================================
  'PGT-AN10': 'Magic6 Pro', 'PGT-AN20': 'Magic6 Pro',
  'BVL-AN10': 'Magic6', 'BVL-AN20': 'Magic6',
  'FLK-AN10': 'Magic V3', 'FLK-AN20': 'Magic V3',
  'VER-AN00': 'Magic V2', 'VER-AN10': 'Magic V2',
  'MOS-AN00': 'Magic V', 'MOS-AN10': 'Magic V',
  'ALI-NX1': 'Magic5 Pro', 'ALI-AN00': 'Magic5 Pro',
  'PGT-N19': 'Magic5', 'PGT-AN00': 'Magic5',
  'NTH-NX9': '90 GT', 'NTH-AN00': '90 GT',
  'REA-NX9': '90', 'REA-AN00': '90',
  'CRT-NX1': '80 Pro', 'CRT-AN00': '80 Pro',
  'CMA-AN00': '80 GT', 'CMA-NX9': '80 GT',
}

// 모델명 변환 함수
function getMarketingName(rawModel: string): string {
  if (!rawModel) return ''

  // 정확한 매칭
  const exactMatch = MODEL_NAME_MAP[rawModel]
  if (exactMatch) return exactMatch

  // 대소문자 무시 매칭
  const upperModel = rawModel.toUpperCase()
  for (const [key, value] of Object.entries(MODEL_NAME_MAP)) {
    if (key.toUpperCase() === upperModel) {
      return value
    }
  }

  // 부분 매칭 (접미사 제거)
  // 예: SM-S928N/DS → SM-S928N, SM-G998BZKDKOO → SM-G998B
  const cleanModel = rawModel.replace(/\/.*$/, '').replace(/[A-Z]{3,}$/, '')
  const partialMatch = MODEL_NAME_MAP[cleanModel]
  if (partialMatch) return partialMatch

  // Samsung 모델 패턴 분석 (SM-XXXX 또는 SM-SXXX 형식)
  const samsungMatch = rawModel.match(/^SM-[A-Z]?\d{3,4}[A-Z]?/i)
  if (samsungMatch) {
    const baseModel = samsungMatch[0].toUpperCase()
    const samsungPartialMatch = MODEL_NAME_MAP[baseModel]
    if (samsungPartialMatch) return samsungPartialMatch
  }

  return rawModel
}

interface DeviceInfo {
  device: {
    type: string
    brand: string
    model: string
  }
  os: {
    name: string
    version: string
    platform: string
  }
  browser: {
    name: string
    version: string
  }
  bot: {
    name: string
    category: string
  } | null
}

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // User-Agent 헤더에서 가져오거나 body에서 가져오기
    let userAgent = req.headers.get('user-agent') || ''

    // POST 요청인 경우 body에서 userAgent 추출
    if (req.method === 'POST') {
      const body = await req.json()
      if (body.userAgent) {
        userAgent = body.userAgent
      }
    }

    if (!userAgent) {
      return new Response(
        JSON.stringify({ error: 'User-Agent is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // DeviceDetector 초기화 및 파싱
    const detector = new DeviceDetector({
      clientIndexes: true,
      deviceIndexes: true,
      deviceAliasCode: true,
    })

    const result = detector.detect(userAgent)

    // 결과 정제
    const rawModel = result.device?.model || ''
    const marketingName = getMarketingName(rawModel)

    const deviceInfo: DeviceInfo = {
      device: {
        type: result.device?.type || 'desktop',
        brand: result.device?.brand || '',
        model: marketingName || rawModel,
      },
      os: {
        name: result.os?.name || 'Unknown',
        version: result.os?.version || '',
        platform: result.os?.platform || '',
      },
      browser: {
        name: result.client?.name || 'Unknown',
        version: result.client?.version || '',
      },
      bot: result.bot ? {
        name: result.bot.name || '',
        category: result.bot.category || '',
      } : null,
    }

    // device type 정규화
    const typeMap: Record<string, string> = {
      smartphone: 'Mobile',
      phablet: 'Mobile',
      tablet: 'Tablet',
      desktop: 'Desktop',
      tv: 'TV',
      console: 'Console',
      'portable media player': 'Mobile',
      'car browser': 'Car',
      camera: 'Camera',
      wearable: 'Wearable',
    }
    deviceInfo.device.type = typeMap[deviceInfo.device.type.toLowerCase()] || deviceInfo.device.type

    return new Response(
      JSON.stringify(deviceInfo),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Device detection error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to detect device', details: String(error) }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
