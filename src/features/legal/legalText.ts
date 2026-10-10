import type { Locale } from '../../mock/types'

/**
 * The Privacy Policy and Terms of Use, written from what PlantX actually stores and sends. A draft for a
 * lawyer to review before public launch. Changing either in substance means bumping `LEGAL_VERSION`.
 * `{contact}` is replaced with the contact line on the page. AI providers are described, never named
 * (provider names stay off the browser).
 */
export type LegalSection = { heading: string; paragraphs?: string[]; list?: string[] }
export type LegalDoc = { title: string; intro: string; sections: LegalSection[] }
export type LegalDocId = 'privacy' | 'terms'

const privacyEn: LegalDoc = {
  title: 'Privacy Policy',
  intro:
    'PlantX is a community app for people who grow plants. This policy explains what we collect, why, who receives it, how long we keep it, and what you can do about it. It applies to the PlantX app and its landing page.',
  sections: [
    {
      heading: 'Who we are',
      paragraphs: [
        'PlantX is operated from Israel. For anything about your data, {contact}.',
      ],
    },
    {
      heading: 'What we collect',
      list: [
        'Your Google account name and email address, when you sign in with Google. We use them to create and recognize your account, and we never show them to other members.',
        'Your profile: the nickname and icon you choose. The nickname is your public name. Without one, other members see a generic name such as “Grower 4F2A”.',
        'Your greenhouse place: the area you pick from a list (not your exact location). Your plants show on maps at that area.',
        'Your plants: the photos you take, the details you enter or confirm, whether each plant is public or private, and its history.',
        'Camera: plant photos are taken live with your device’s camera inside PlantX. We keep only the photo you choose to use. We do not record video or sound, and the saved photo carries no location or device details.',
        'Your care activity: tasks, watering and photo dates, and the activity log.',
        'AI scans: the photos you send for identification, the result, and how many scans you used each day.',
        'Usage events: a short list of steps (for example “saved a plant” or “came back another day”) so we can see whether PlantX is useful. They contain no names, emails or photos.',
        'Technical data: your IP address and request details in server logs and short-lived abuse limits, and crash reports when something breaks.',
      ],
    },
    {
      heading: 'What we do not do',
      list: [
        'We do not sell your data or show ads.',
        'We do not use third-party analytics, advertising trackers or tracking cookies.',
        'We do not process payments. The market records interest only.',
      ],
    },
    {
      heading: 'Camera access',
      paragraphs: [
        'PlantX asks for camera access the first time you add a photo, first in the app and then through your browser’s own permission prompt. The camera is on only while the camera screen is open and turns off when you take the photo or close it. Nothing is sent until you choose Use photo.',
        'You can refuse or withdraw camera access at any time in your browser or phone settings. Without it you can still browse PlantX, but you cannot add photos, because photos from your gallery or files are not accepted.',
      ],
    },
    {
      heading: 'Cookies and storage on your device',
      paragraphs: [
        'We use one essential cookie, plantx_session, to keep you signed in. It is signed, HttpOnly and is not used for tracking. Your browser also keeps a few settings (language, view preferences) and, if you try PlantX as a guest, up to three plants on your device until you sign in.',
      ],
    },
    {
      heading: 'Who receives your data',
      list: [
        'Other members see your public name, icon, greenhouse level, your public plants and their public activity. Private plants and their activity are seen only by you and the administrator.',
        'Google, to sign you in.',
        'Third-party plant-identification AI services receive a photo when you ask PlantX to identify a plant. They receive the photo only, not your name or email.',
        'Our hosting and database providers (Vercel and Supabase), which store and serve PlantX on our behalf.',
        'A private team chat (Discord) receives a notice when someone signs up (name and email, so an administrator can approve the account), and public activity under your public name.',
        'Authorities, when the law requires it.',
      ],
      paragraphs: ['Some of these providers store data outside Israel. We use them only to run PlantX.'],
    },
    {
      heading: 'Why we use it',
      paragraphs: [
        'To provide your account and greenhouse, to identify plants when you ask, to keep PlantX safe (abuse limits, moderation, error reports), and to improve the product from the usage events. We rely on your consent when you sign up and on our legitimate interest in running a safe service.',
      ],
    },
    {
      heading: 'How long we keep it',
      paragraphs: [
        'We keep your data while your account exists. When you delete your account, we erase it right away: your account, plants, photos, activity, tasks, scans and usage events. Encrypted backups are kept for up to 30 days and then deleted. Server logs are kept for a short time for security.',
      ],
    },
    {
      heading: 'Your rights',
      list: [
        'See your data: your greenhouse, plants and activity are in the app. Ask us for anything else.',
        'Correct it: change your nickname, icon, place and plant details in the app, or ask us.',
        'Delete it: Account → Delete my account erases everything at once.',
        'Withdraw consent: delete your account, or ask us.',
        'Complain: to the Privacy Protection Authority in Israel, or to your local data protection authority in the EU.',
      ],
    },
    {
      heading: 'Children',
      paragraphs: ['PlantX is for people aged 16 and over. Do not sign up if you are younger.'],
    },
    {
      heading: 'Changes',
      paragraphs: [
        'When this policy changes in substance, we update the date at the top and ask you to agree again the next time you open PlantX.',
      ],
    },
  ],
}

const termsEn: LegalDoc = {
  title: 'Terms of Use',
  intro:
    'These terms are the agreement between you and PlantX when you use the app. By signing up you agree to them and to the Privacy Policy.',
  sections: [
    {
      heading: 'The service',
      paragraphs: [
        'PlantX lets you keep a digital greenhouse of your plants, get care reminders, identify plants with AI and share plants with the community. Some parts (such as the market and ranking) may be closed or change while PlantX is in beta.',
      ],
    },
    {
      heading: 'Your account',
      list: [
        'You must be 16 or older.',
        'You sign in with your Google account. New accounts wait for an administrator’s approval.',
        'Keep your Google account secure. You are responsible for what happens under your account.',
        'You can delete your account at any time from the account menu.',
      ],
    },
    {
      heading: 'Your content',
      paragraphs: [
        'You keep the rights to the photos and text you add. You allow PlantX to store them and to show them inside PlantX as your settings allow (public plants to members; private plants to you and the administrator). This permission ends when you delete the content or your account, apart from backups kept for up to 30 days.',
        'Plant photos must be taken live with your device’s camera inside PlantX, and must show the plant you are adding as it is now. Photos from your gallery, files, screenshots or the internet are not accepted. By adding a photo you allow PlantX to use your camera for that photo (see Camera access in the Privacy Policy).',
        'Do not photograph other people without their permission.',
      ],
    },
    {
      heading: 'Acceptable use',
      list: [
        'No illegal, offensive or misleading content, and no spam.',
        'No attempts to break, overload or scrape PlantX, or to get around limits such as daily AI scans or the camera-only photo rule (for example by photographing a screen or a printed picture).',
        'No impersonating others or using someone else’s account.',
      ],
      paragraphs: ['We may hide or remove content, or disable an account, that breaks these rules.'],
    },
    {
      heading: 'AI and care advice',
      paragraphs: [
        'Plant identification and care suggestions are made automatically and can be wrong. Check before you rely on them, especially about toxicity to people or pets. PlantX is not professional advice.',
      ],
    },
    {
      heading: 'Market and other members',
      paragraphs: [
        'PlantX does not sell plants or process payments. Any deal is between members, and PlantX is not a party to it. Be careful and meet safely.',
      ],
    },
    {
      heading: 'Availability and liability',
      paragraphs: [
        'PlantX is in beta and is provided as it is. It may change, pause or have errors, and data may be lost. To the extent the law allows, PlantX is not liable for indirect damage or for loss caused by using or not being able to use the service.',
      ],
    },
    {
      heading: 'Changes and ending',
      paragraphs: [
        'We may change these terms. When the change is substantial we ask you to agree again; if you do not agree, you can delete your account. We may end the service or an account with notice when possible.',
      ],
    },
    {
      heading: 'Law and contact',
      paragraphs: [
        'These terms are governed by the laws of the State of Israel, and the courts of Tel Aviv-Yafo have jurisdiction. Questions: {contact}.',
      ],
    },
  ],
}

const privacyHe: LegalDoc = {
  title: 'מדיניות פרטיות',
  intro:
    'PlantX היא אפליקציה קהילתית למגדלי צמחים. המדיניות מסבירה מה אנחנו אוספים, למה, מי מקבל את המידע, כמה זמן אנחנו שומרים אותו ומה אפשר לעשות לגביו. היא חלה על אפליקציית PlantX ועל דף הנחיתה.',
  sections: [
    { heading: 'מי אנחנו', paragraphs: ['PlantX מופעלת מישראל. בכל עניין שקשור למידע שלך, {contact}.'] },
    {
      heading: 'מה אנחנו אוספים',
      list: [
        'השם וכתובת האימייל בחשבון Google שלך, כשנכנסים עם Google. הם משמשים ליצירת החשבון ולזיהוי שלך, ולעולם לא מוצגים לחברים אחרים.',
        'הפרופיל: הכינוי והאייקון שבחרת. הכינוי הוא השם הציבורי שלך. בלי כינוי, חברים אחרים רואים שם כללי כמו “Grower 4F2A”.',
        'מקום החממה: האזור שבחרת מרשימה (לא מיקום מדויק). הצמחים שלך מופיעים במפות באזור הזה.',
        'הצמחים: התמונות שצילמת, הפרטים שמילאת או אישרת, האם כל צמח ציבורי או פרטי, וההיסטוריה שלו.',
        'מצלמה: את תמונות הצמחים מצלמים בזמן אמת במצלמת המכשיר בתוך PlantX. אנחנו שומרים רק את התמונה שבחרת להשתמש בה. אנחנו לא מקליטים וידאו או קול, ובתמונה השמורה אין מיקום או פרטי מכשיר.',
        'פעילות הטיפול: משימות, תאריכי השקיה וצילום, ויומן הפעילות.',
        'סריקות AI: התמונות ששלחת לזיהוי, התוצאה, וכמה סריקות השתמשת בכל יום.',
        'אירועי שימוש: רשימה קצרה של צעדים (למשל “שמר צמח” או “חזר ביום אחר”) כדי לראות אם PlantX מועילה. אין בהם שמות, אימיילים או תמונות.',
        'מידע טכני: כתובת IP ופרטי בקשות ביומני השרת ובמגבלות שימוש קצרות, ודיווחי קריסה כשמשהו נשבר.',
      ],
    },
    {
      heading: 'מה אנחנו לא עושים',
      list: [
        'לא מוכרים את המידע שלך ולא מציגים פרסומות.',
        'לא משתמשים באנליטיקה של צד שלישי, במעקב פרסומי או בעוגיות מעקב.',
        'לא מעבדים תשלומים. השוק רושם התעניינות בלבד.',
      ],
    },
    {
      heading: 'גישה למצלמה',
      paragraphs: [
        'PlantX מבקשת גישה למצלמה בפעם הראשונה שמוסיפים תמונה, קודם באפליקציה ואחר כך בבקשת ההרשאה של הדפדפן. המצלמה פועלת רק כשמסך המצלמה פתוח, ונכבית כשמצלמים או סוגרים אותו. שום דבר לא נשלח עד שבוחרים שימוש בתמונה.',
        'אפשר לסרב או לבטל את הגישה למצלמה בכל עת בהגדרות הדפדפן או הטלפון. בלי גישה אפשר עדיין לגלוש ב-PlantX, אבל אי אפשר להוסיף תמונות, כי תמונות מהגלריה או מקבצים אינן מתקבלות.',
      ],
    },
    {
      heading: 'עוגיות ואחסון במכשיר',
      paragraphs: [
        'אנחנו משתמשים בעוגייה חיונית אחת, plantx_session, כדי שתישארו מחוברים. היא חתומה, HttpOnly ולא משמשת למעקב. הדפדפן שומר גם כמה הגדרות (שפה, תצוגה), ואם מנסים את PlantX כאורחים, עד שלושה צמחים במכשיר עד ההתחברות.',
      ],
    },
    {
      heading: 'מי מקבל את המידע',
      list: [
        'חברים אחרים רואים את השם הציבורי, האייקון, רמת החממה, הצמחים הציבוריים והפעילות הציבורית שלהם. צמחים פרטיים והפעילות שלהם גלויים רק לך ולמנהל.',
        'Google, לצורך ההתחברות.',
        'שירותי AI חיצוניים לזיהוי צמחים מקבלים תמונה כשמבקשים מ-PlantX לזהות צמח. הם מקבלים את התמונה בלבד, לא שם או אימייל.',
        'ספקי האחסון ומסד הנתונים שלנו (Vercel ו-Supabase), שמאחסנים ומפעילים את PlantX עבורנו.',
        'צ׳אט צוות פרטי (Discord) מקבל הודעה כשמישהו נרשם (שם ואימייל, כדי שמנהל יאשר את החשבון), ופעילות ציבורית בשם הציבורי שלך.',
        'רשויות, כשהחוק מחייב.',
      ],
      paragraphs: ['חלק מהספקים שומרים מידע מחוץ לישראל. אנחנו משתמשים בהם רק כדי להפעיל את PlantX.'],
    },
    {
      heading: 'למה אנחנו משתמשים במידע',
      paragraphs: [
        'כדי לתת לך חשבון וחממה, לזהות צמחים כשמבקשים, לשמור על PlantX בטוחה (מגבלות שימוש, ניהול תוכן, דיווחי שגיאות) ולשפר את המוצר בעזרת אירועי השימוש. אנחנו מסתמכים על הסכמתך בהרשמה ועל האינטרס הלגיטימי שלנו בהפעלת שירות בטוח.',
      ],
    },
    {
      heading: 'כמה זמן אנחנו שומרים',
      paragraphs: [
        'כל עוד החשבון קיים. כשמוחקים את החשבון, אנחנו מוחקים מיד: החשבון, הצמחים, התמונות, הפעילות, המשימות, הסריקות ואירועי השימוש. גיבויים מוצפנים נשמרים עד 30 יום ואז נמחקים. יומני שרת נשמרים זמן קצר לצורכי אבטחה.',
      ],
    },
    {
      heading: 'הזכויות שלך',
      list: [
        'לעיין: החממה, הצמחים והפעילות נמצאים באפליקציה. כל דבר אחר אפשר לבקש מאיתנו.',
        'לתקן: לשנות כינוי, אייקון, מקום ופרטי צמחים באפליקציה, או לבקש מאיתנו.',
        'למחוק: חשבון → מחיקת החשבון שלי מוחקת הכול בבת אחת.',
        'לבטל הסכמה: למחוק את החשבון, או לפנות אלינו.',
        'להתלונן: לרשות להגנת הפרטיות בישראל, או לרשות הגנת המידע המקומית באיחוד האירופי.',
      ],
    },
    { heading: 'קטינים', paragraphs: ['PlantX מיועדת לבני 16 ומעלה. אין להירשם מתחת לגיל הזה.'] },
    {
      heading: 'שינויים',
      paragraphs: ['כשהמדיניות משתנה באופן מהותי, נעדכן את התאריך בראש הדף ונבקש את הסכמתך שוב בפעם הבאה שתפתחו את PlantX.'],
    },
  ],
}

const termsHe: LegalDoc = {
  title: 'תנאי שימוש',
  intro: 'התנאים האלה הם ההסכם בינך לבין PlantX בשימוש באפליקציה. בהרשמה את/ה מסכימ/ה להם ולמדיניות הפרטיות.',
  sections: [
    {
      heading: 'השירות',
      paragraphs: [
        'PlantX מאפשרת לנהל חממה דיגיטלית של הצמחים שלך, לקבל תזכורות טיפול, לזהות צמחים בעזרת AI ולשתף צמחים עם הקהילה. חלקים מסוימים (כמו השוק והדירוג) עשויים להיות סגורים או להשתנות בזמן הבטא.',
      ],
    },
    {
      heading: 'החשבון שלך',
      list: [
        'צריך להיות בני 16 ומעלה.',
        'ההתחברות היא עם חשבון Google. חשבונות חדשים ממתינים לאישור מנהל.',
        'שמרו על חשבון ה-Google שלכם. את/ה אחראי/ת למה שקורה בחשבון שלך.',
        'אפשר למחוק את החשבון בכל עת מתפריט החשבון.',
      ],
    },
    {
      heading: 'התוכן שלך',
      paragraphs: [
        'הזכויות בתמונות ובטקסט שהוספת נשארות שלך. את/ה מתיר/ה ל-PlantX לשמור אותם ולהציג אותם בתוך PlantX לפי ההגדרות שלך (צמחים ציבוריים לחברים; צמחים פרטיים לך ולמנהל). ההיתר מסתיים כשמוחקים את התוכן או את החשבון, מלבד גיבויים שנשמרים עד 30 יום.',
        'את תמונות הצמחים יש לצלם בזמן אמת במצלמת המכשיר בתוך PlantX, והן צריכות להראות את הצמח שמוסיפים כמו שהוא היום. תמונות מהגלריה, מקבצים, צילומי מסך או מהאינטרנט אינן מתקבלות. בהוספת תמונה את/ה מתיר/ה ל-PlantX להשתמש במצלמה לצורך התמונה הזו (ראו גישה למצלמה במדיניות הפרטיות).',
        'אל תצלמו אנשים אחרים בלי רשותם.',
      ],
    },
    {
      heading: 'שימוש מותר',
      list: [
        'בלי תוכן לא חוקי, פוגעני או מטעה, ובלי ספאם.',
        'בלי ניסיונות לשבור, להעמיס או לגרד את PlantX, או לעקוף מגבלות כמו סריקות AI יומיות או את הכלל של צילום במצלמה בלבד (למשל צילום של מסך או של תמונה מודפסת).',
        'בלי להתחזות לאחרים או להשתמש בחשבון של מישהו אחר.',
      ],
      paragraphs: ['אנחנו רשאים להסתיר או להסיר תוכן, או להשבית חשבון, שמפר את הכללים.'],
    },
    {
      heading: 'AI ועצות טיפול',
      paragraphs: [
        'זיהוי הצמחים והצעות הטיפול נעשים אוטומטית ועלולים לטעות. בדקו לפני שאתם מסתמכים עליהם, במיוחד בעניין רעילות לאנשים או לחיות מחמד. PlantX אינה ייעוץ מקצועי.',
      ],
    },
    {
      heading: 'השוק וחברים אחרים',
      paragraphs: ['PlantX לא מוכרת צמחים ולא מעבדת תשלומים. כל עסקה היא בין החברים, ו-PlantX אינה צד לה. היו זהירים ונפגשו בבטחה.'],
    },
    {
      heading: 'זמינות ואחריות',
      paragraphs: [
        'PlantX בבטא ומסופקת כמות שהיא. היא עשויה להשתנות, להיעצר או לכלול שגיאות, ומידע עלול לאבד. ככל שהחוק מתיר, PlantX אינה אחראית לנזק עקיף או להפסד שנגרם משימוש או מחוסר יכולת להשתמש בשירות.',
      ],
    },
    {
      heading: 'שינויים וסיום',
      paragraphs: [
        'אנחנו רשאים לשנות את התנאים. כשהשינוי מהותי נבקש את הסכמתך שוב; אם אינך מסכימ/ה, אפשר למחוק את החשבון. אנחנו רשאים לסיים את השירות או חשבון, עם הודעה מראש כשאפשר.',
      ],
    },
    {
      heading: 'דין ויצירת קשר',
      paragraphs: ['על התנאים חלים דיני מדינת ישראל, ולבתי המשפט בתל אביב-יפו סמכות השיפוט. שאלות: {contact}.'],
    },
  ],
}

export const LEGAL_DOCS: Record<LegalDocId, Record<Locale, LegalDoc>> = {
  privacy: { en: privacyEn, he: privacyHe },
  terms: { en: termsEn, he: termsHe },
}
