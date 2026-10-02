export type Season = 'spring' | 'summer' | 'autumn' | 'winter'

export type SeasonCare = {
  light: string
  lightHe: string
  water: string
  waterHe: string
  /** Relative thirst for the season: 1 = sparing, 3 = generous. */
  waterLevel: 1 | 2 | 3
  food: string
  foodHe: string
}

export type SeasonalCareMap = Record<Season, SeasonCare>

export const SEASONS: Season[] = ['spring', 'summer', 'autumn', 'winter']

/** Northern-hemisphere seasons, which is where every PlantX greenhouse grows. */
export function seasonFor(date: Date): Season {
  const month = date.getMonth()
  if (month >= 2 && month <= 4) return 'spring'
  if (month >= 5 && month <= 7) return 'summer'
  if (month >= 8 && month <= 10) return 'autumn'
  return 'winter'
}

const tropicalFoliage: SeasonalCareMap = {
  spring: {
    light: 'Bright, indirect light is ideal. Avoid direct sunlight.',
    lightHe: 'אור בהיר ועקיף הוא האידיאלי. להימנע משמש ישירה.',
    water: 'Keep the soil slightly moist. Water 1–2 times a week and mist regularly.',
    waterHe: 'לשמור על אדמה לחה מעט. להשקות 1–2 פעמים בשבוע ולרסס באופן קבוע.',
    waterLevel: 2,
    food: 'Start monthly feeding with green plant fertilizer.',
    foodHe: 'להתחיל דישון חודשי בדשן לצמחים ירוקים.',
  },
  summer: {
    light: 'Bright shade. Pull back from windows that get afternoon sun.',
    lightHe: 'צל בהיר. להרחיק מחלונות עם שמש של אחר הצהריים.',
    water: 'Water when the top 2 cm dry out, often twice a week. Mist on hot days.',
    waterHe: 'להשקות כשה-2 ס״מ העליונים מתייבשים, לרוב פעמיים בשבוע. לרסס בימים חמים.',
    waterLevel: 3,
    food: 'Feed every 2–3 weeks while it pushes new leaves.',
    foodHe: 'לדשן כל 2–3 שבועות בזמן שהוא מוציא עלים חדשים.',
  },
  autumn: {
    light: 'Move closer to the window as the days shorten.',
    lightHe: 'לקרב לחלון ככל שהימים מתקצרים.',
    water: 'Ease back to once a week and let the top layer dry between drinks.',
    waterHe: 'לרדת להשקיה פעם בשבוע ולתת לשכבה העליונה להתייבש בין השקיות.',
    waterLevel: 2,
    food: 'Taper to one light feed this season.',
    foodHe: 'לצמצם לדישון קל אחד בעונה.',
  },
  winter: {
    light: 'Give it the brightest spot you have, away from heaters.',
    lightHe: 'לתת את המקום הבהיר ביותר, הרחק ממפזרי חום.',
    water: 'Water sparingly, every 10–14 days. Cold wet roots rot.',
    waterHe: 'להשקות במשורה, כל 10–14 ימים. שורשים קרים ורטובים נרקבים.',
    waterLevel: 1,
    food: 'No feeding. Let it rest until spring.',
    foodHe: 'ללא דישון. לתת לו לנוח עד האביב.',
  },
}

const dry: SeasonalCareMap = {
  spring: {
    light: 'Bright light. A few hours of sun are welcome.',
    lightHe: 'אור בהיר. כמה שעות שמש מתקבלות בברכה.',
    water: 'Water once the pot is fully dry, about every 2–3 weeks.',
    waterHe: 'להשקות כשהעציץ יבש לגמרי, בערך כל 2–3 שבועות.',
    waterLevel: 1,
    food: 'One light feed as new leaves show.',
    foodHe: 'דישון קל אחד כשעלים חדשים מופיעים.',
  },
  summer: {
    light: 'Bright light, pulled back from harsh afternoon sun.',
    lightHe: 'אור בהיר, רחוק משמש אחר צהריים חזקה.',
    water: 'Every 2 weeks if the pot is dry through.',
    waterHe: 'כל שבועיים אם העציץ יבש לגמרי.',
    waterLevel: 2,
    food: 'Feed once this season.',
    foodHe: 'דישון אחד בעונה.',
  },
  autumn: {
    light: 'The brightest spot as days shorten.',
    lightHe: 'המקום הבהיר ביותר ככל שהימים מתקצרים.',
    water: 'Every 3 weeks. Do not leave it sitting in water.',
    waterHe: 'כל 3 שבועות. לא להשאיר אותו במים עומדים.',
    waterLevel: 1,
    food: 'No feeding.',
    foodHe: 'ללא דישון.',
  },
  winter: {
    light: 'Bright and cool, away from heaters.',
    lightHe: 'בהיר וקריר, הרחק ממפזרי חום.',
    water: 'Once a month at most. Cold wet soil rots the roots.',
    waterHe: 'לכל היותר פעם בחודש. אדמה קרה ורטובה מרקיבה את השורשים.',
    waterLevel: 1,
    food: 'No feeding until spring.',
    foodHe: 'ללא דישון עד האביב.',
  },
}

const humid: SeasonalCareMap = {
  spring: {
    light: 'Bright indirect light. No hot sun on the leaves.',
    lightHe: 'אור בהיר עקיף. בלי שמש חמה על העלים.',
    water: 'Water when the top of a chunky mix dries, about once a week.',
    waterHe: 'להשקות כשהחלק העליון של תערובת אוורירית מתייבש, בערך פעם בשבוע.',
    waterLevel: 2,
    food: 'Feed monthly with a balanced fertilizer at half strength.',
    foodHe: 'לדשן פעם בחודש בדשן מאוזן בחצי ריכוז.',
  },
  summer: {
    light: 'Bright shade. Humidity matters more than extra sun.',
    lightHe: 'צל בהיר. הלחות חשובה יותר משמש נוספת.',
    water: 'Keep the mix lightly moist, often twice a week.',
    waterHe: 'לשמור על תערובת לחה קלות, לרוב פעמיים בשבוע.',
    waterLevel: 3,
    food: 'Feed every 2–3 weeks while new leaves unfurl.',
    foodHe: 'לדשן כל 2–3 שבועות בזמן שעלים חדשים נפרשים.',
  },
  autumn: {
    light: 'Move closer to the window.',
    lightHe: 'לקרב לחלון.',
    water: 'Back to once a week as growth slows.',
    waterHe: 'חזרה לפעם בשבוע ככל שהצמיחה מאטה.',
    waterLevel: 2,
    food: 'One last light feed.',
    foodHe: 'דישון קל אחרון.',
  },
  winter: {
    light: 'The brightest indirect spot, away from cold glass.',
    lightHe: 'המקום העקיף הבהיר ביותר, הרחק מזכוכית קרה.',
    water: 'Every 10–14 days. Do not let it sit wet.',
    waterHe: 'כל 10–14 ימים. לא להשאיר אותו רטוב.',
    waterLevel: 1,
    food: 'No feeding. A dropped leaf can be normal rest.',
    foodHe: 'ללא דישון. עלה שנשר יכול להיות מנוחה רגילה.',
  },
}

const hoyaCare: SeasonalCareMap = {
  spring: {
    light: 'Bright light. Morning sun helps it set buds.',
    lightHe: 'אור בהיר. שמש בוקר עוזרת לו להוציא ניצנים.',
    water: 'Water when the mix is dry, then drain it well.',
    waterHe: 'להשקות כשהתערובת יבשה, ולנקז היטב.',
    waterLevel: 2,
    food: 'Feed monthly with a bloom fertilizer.',
    foodHe: 'לדשן פעם בחודש בדשן לפריחה.',
  },
  summer: {
    light: 'Bright light with some direct sun.',
    lightHe: 'אור בהיר עם מעט שמש ישירה.',
    water: 'About once a week in heat, only if the mix is dry.',
    waterHe: 'בערך פעם בשבוע בחום, רק אם התערובת יבשה.',
    waterLevel: 2,
    food: 'Feed every 3 weeks while it is flowering.',
    foodHe: 'לדשן כל 3 שבועות בזמן פריחה.',
  },
  autumn: {
    light: 'Keep it in the bright spot.',
    lightHe: 'להשאיר במקום הבהיר.',
    water: 'Every 10 days.',
    waterHe: 'כל 10 ימים.',
    waterLevel: 1,
    food: 'Stop feeding.',
    foodHe: 'להפסיק לדשן.',
  },
  winter: {
    light: 'Bright and cool. A slight chill can trigger a spring spike.',
    lightHe: 'בהיר וקריר. צינה קלה יכולה לעודד שיבולת באביב.',
    water: 'Every 2–3 weeks.',
    waterHe: 'כל 2–3 שבועות.',
    waterLevel: 1,
    food: 'No feeding.',
    foodHe: 'ללא דישון.',
  },
}

const orchidCare: SeasonalCareMap = {
  spring: {
    light: 'Bright indirect light. Leaves should stay grass-green, not dark.',
    lightHe: 'אור בהיר עקיף. העלים נשארים ירוק-דשא, לא כהים.',
    water: 'Soak the bark weekly, then let it drain until the roots look silver.',
    waterHe: 'להשרות את הקליפה פעם בשבוע, ולנקז עד שהשורשים נראים כסופים.',
    waterLevel: 2,
    food: 'A weak orchid feed every other watering.',
    foodHe: 'דשן סחלבים חלש כל השקיה שנייה.',
  },
  summer: {
    light: 'Bright shade. Hot sun burns the leaves.',
    lightHe: 'צל בהיר. שמש חמה שורפת את העלים.',
    water: 'Soak weekly, more often only if the bark dries in a few days.',
    waterHe: 'להשרות פעם בשבוע, ולעיתים קרובות יותר רק אם הקליפה מתייבשת תוך כמה ימים.',
    waterLevel: 2,
    food: 'Keep the weak feed.',
    foodHe: 'להמשיך בדשן החלש.',
  },
  autumn: {
    light: 'Bright indirect light. A small day-to-night drop helps a spike.',
    lightHe: 'אור בהיר עקיף. ירידה קטנה בין יום ללילה עוזרת לשיבולת.',
    water: 'Weekly soaks.',
    waterHe: 'השריה שבועית.',
    waterLevel: 2,
    food: 'Feed every other watering.',
    foodHe: 'לדשן כל השקיה שנייה.',
  },
  winter: {
    light: 'The brightest indirect window.',
    lightHe: 'החלון העקיף הבהיר ביותר.',
    water: 'Every 10–14 days. Never leave the crown wet overnight.',
    waterHe: 'כל 10–14 ימים. לא להשאיר את הכתר רטוב בלילה.',
    waterLevel: 1,
    food: 'Pause feeding while a spike is just starting.',
    foodHe: 'להפסיק דישון כששיבולת רק מתחילה.',
  },
}

const CARE: Record<string, SeasonalCareMap> = {
  'sp-pothos': tropicalFoliage,
  'sp-philodendron': tropicalFoliage,
  'sp-heartleaf': tropicalFoliage,
  'sp-satin': tropicalFoliage,
  'sp-syngonium': tropicalFoliage,
  'sp-rubber': tropicalFoliage,
  'sp-spider': tropicalFoliage,
  'sp-pilea': tropicalFoliage,
  'sp-adansonii': tropicalFoliage,
  'sp-snake': dry,
  'sp-zz': dry,
  'sp-peace': humid,
  'sp-gloriosum': humid,
  'sp-clarinervium': humid,
  'sp-frydek': humid,
  'sp-begonia': humid,
  'sp-hoya': hoyaCare,
  'sp-orchid': orchidCare,
  'sp-mix': tropicalFoliage,
  'sp-monstera': {
    ...tropicalFoliage,
    spring: {
      ...tropicalFoliage.spring,
      food: 'Start monthly feeding and add a moss pole for climbing.',
      foodHe: 'להתחיל דישון חודשי ולהוסיף עמוד טחב לטיפוס.',
    },
    summer: {
      ...tropicalFoliage.summer,
      light: 'Bright indirect light. Wipe the leaves so they catch more of it.',
      lightHe: 'אור בהיר ועקיף. לנגב את העלים כדי שיקלטו יותר אור.',
    },
  },
  'sp-fiddle': {
    spring: {
      light: 'Bright light with an hour of gentle morning sun.',
      lightHe: 'אור בהיר עם שעה של שמש בוקר עדינה.',
      water: 'Water thoroughly once the top 3 cm are dry, then let it drain.',
      waterHe: 'להשקות היטב כשה-3 ס״מ העליונים יבשים, ולתת לנקז.',
      waterLevel: 2,
      food: 'Feed monthly with a balanced liquid fertilizer.',
      foodHe: 'לדשן פעם בחודש בדשן נוזלי מאוזן.',
    },
    summer: {
      light: 'Bright filtered light. Do not move it; it sulks when relocated.',
      lightHe: 'אור בהיר ומסונן. לא להזיז; הוא נעלב כשמעבירים אותו.',
      water: 'About once a week. Brown spots mean too much, drooping means too little.',
      waterHe: 'בערך פעם בשבוע. כתמים חומים = יותר מדי, צניחה = מעט מדי.',
      waterLevel: 3,
      food: 'Feed every 2 weeks during active growth.',
      foodHe: 'לדשן כל שבועיים בזמן צמיחה פעילה.',
    },
    autumn: {
      light: 'Keep it in the brightest window and rotate a quarter turn weekly.',
      lightHe: 'להשאיר בחלון הבהיר ביותר ולסובב רבע סיבוב כל שבוע.',
      water: 'Every 10 days or so as growth slows.',
      waterHe: 'בערך כל 10 ימים ככל שהצמיחה מאטה.',
      waterLevel: 2,
      food: 'One last feed early in the season.',
      foodHe: 'דישון אחרון בתחילת העונה.',
    },
    winter: {
      light: 'Maximum light and no cold drafts from doors.',
      lightHe: 'מקסימום אור וללא רוח קרה מדלתות.',
      water: 'Sparingly, every 2 weeks.',
      waterHe: 'במשורה, כל שבועיים.',
      waterLevel: 1,
      food: 'No feeding.',
      foodHe: 'ללא דישון.',
    },
  },
  'sp-palm': {
    spring: {
      light: 'Medium to bright indirect light. Tolerates a darker corner.',
      lightHe: 'אור עקיף בינוני עד בהיר. מסתדר גם בפינה חשוכה יותר.',
      water: 'Keep evenly moist, never soggy. Weekly is usually right.',
      waterHe: 'לשמור על לחות אחידה, לא בוצית. פעם בשבוע בדרך כלל מתאים.',
      waterLevel: 2,
      food: 'Feed monthly with a palm fertilizer.',
      foodHe: 'לדשן פעם בחודש בדשן לדקלים.',
    },
    summer: {
      light: 'Indirect light only. Direct sun scorches the fronds.',
      lightHe: 'אור עקיף בלבד. שמש ישירה חורכת את הכפות.',
      water: 'Water weekly and mist the fronds to keep spider mites away.',
      waterHe: 'להשקות פעם בשבוע ולרסס את הכפות כדי להרחיק אקריות.',
      waterLevel: 3,
      food: 'Feed monthly.',
      foodHe: 'לדשן פעם בחודש.',
    },
    autumn: {
      light: 'Same spot is fine; it barely notices the shorter days.',
      lightHe: 'אותו מקום מתאים; הוא כמעט לא מרגיש את הימים הקצרים.',
      water: 'Every 10 days.',
      waterHe: 'כל 10 ימים.',
      waterLevel: 2,
      food: 'Stop feeding by mid-season.',
      foodHe: 'להפסיק לדשן באמצע העונה.',
    },
    winter: {
      light: 'Indirect light, away from radiators.',
      lightHe: 'אור עקיף, הרחק מרדיאטורים.',
      water: 'Every 2 weeks. Keep humidity up.',
      waterHe: 'כל שבועיים. לשמור על לחות גבוהה.',
      waterLevel: 1,
      food: 'No feeding.',
      foodHe: 'ללא דישון.',
    },
  },
  'sp-maple': {
    spring: {
      light: 'Outdoors in morning sun, sheltered from wind as leaves open.',
      lightHe: 'בחוץ בשמש בוקר, מוגן מרוח בזמן שהעלים נפתחים.',
      water: 'Check daily. Bonsai soil dries fast; water when the surface lightens.',
      waterHe: 'לבדוק כל יום. אדמת בונסאי מתייבשת מהר; להשקות כשפני השטח מתבהרים.',
      waterLevel: 2,
      food: 'Wait until leaves harden, then feed every 2 weeks.',
      foodHe: 'לחכות שהעלים יתקשו, ואז לדשן כל שבועיים.',
    },
    summer: {
      light: 'Morning sun only. Afternoon heat burns the leaf tips.',
      lightHe: 'שמש בוקר בלבד. חום אחר הצהריים שורף את קצות העלים.',
      water: 'Once or twice a day in heat waves.',
      waterHe: 'פעם או פעמיים ביום בגלי חום.',
      waterLevel: 3,
      food: 'Pause feeding in the hottest weeks.',
      foodHe: 'להפסיק דישון בשבועות החמים ביותר.',
    },
    autumn: {
      light: 'Full autumn sun brings out the red color.',
      lightHe: 'שמש סתיו מלאה מוציאה את הצבע האדום.',
      water: 'Every other day as it cools.',
      waterHe: 'יום כן יום לא ככל שמתקרר.',
      waterLevel: 2,
      food: 'A low-nitrogen feed to harden the wood.',
      foodHe: 'דישון דל חנקן כדי להקשיח את העץ.',
    },
    winter: {
      light: 'Dormant: a cold, bright, frost-free spot outside.',
      lightHe: 'תרדמה: מקום קר, בהיר וללא כפור בחוץ.',
      water: 'Keep the roots just damp, never frozen wet.',
      waterHe: 'לשמור על שורשים לחים מעט, לעולם לא רטובים וקפואים.',
      waterLevel: 1,
      food: 'No feeding during dormancy.',
      foodHe: 'ללא דישון בזמן התרדמה.',
    },
  },
  'sp-olive': {
    spring: {
      light: 'Full sun, at least 6 hours a day.',
      lightHe: 'שמש מלאה, לפחות 6 שעות ביום.',
      water: 'Deep watering once a week, letting the pot dry between.',
      waterHe: 'השקיה עמוקה פעם בשבוע, ולתת לעציץ להתייבש בין השקיות.',
      waterLevel: 2,
      food: 'Feed monthly with a citrus or olive fertilizer.',
      foodHe: 'לדשן פעם בחודש בדשן להדרים או לזיתים.',
    },
    summer: {
      light: 'Full sun. It loves the heat.',
      lightHe: 'שמש מלאה. הוא אוהב את החום.',
      water: 'Twice a week in containers during heat waves.',
      waterHe: 'פעמיים בשבוע בעציצים בזמן גלי חום.',
      waterLevel: 3,
      food: 'Feed every 3–4 weeks.',
      foodHe: 'לדשן כל 3–4 שבועות.',
    },
    autumn: {
      light: 'Full sun; prune lightly after the harvest.',
      lightHe: 'שמש מלאה; לגזום קלות אחרי הקטיף.',
      water: 'Every 10 days.',
      waterHe: 'כל 10 ימים.',
      waterLevel: 2,
      food: 'One final feed early in the season.',
      foodHe: 'דישון אחרון בתחילת העונה.',
    },
    winter: {
      light: 'Sunny and cool. A few cold nights help it flower.',
      lightHe: 'שמשי וקריר. כמה לילות קרים עוזרים לפריחה.',
      water: 'Only when the pot is dry, about every 2–3 weeks.',
      waterHe: 'רק כשהעציץ יבש, בערך כל 2–3 שבועות.',
      waterLevel: 1,
      food: 'No feeding.',
      foodHe: 'ללא דישון.',
    },
  },
}

export function seasonalCareFor(speciesId: string | undefined): SeasonalCareMap | undefined {
  return speciesId ? CARE[speciesId] : undefined
}
