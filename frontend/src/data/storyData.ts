export type StoryCharacterId =
  | 'agent'
  | 'kazhtab'
  | 'zahtab'
  | 'lawrence'
  | 'maria'
  | 'sigmund'
  | 'errol';

export interface StoryCharacter {
  id: StoryCharacterId;
  name: string;
  role: string;
  emoji: string;
  accentClass: string;
  badgeClass: string;
}

export interface StoryMessage {
  speaker: StoryCharacterId;
  text: string;
  mood?: string;
}

export interface StoryBeat {
  id: string;
  title: string;
  timeStamp: string;
  location: string;
  messages: StoryMessage[];
}

export const STORY_CHARACTERS: Record<StoryCharacterId, StoryCharacter> = {
  agent: {
    id: 'agent',
    name: 'همکار پشت بی‌سیم',
    role: 'مامور مخفی عملیات',
    emoji: '🎧',
    accentClass: 'border-cyan-500/50 bg-cyan-500/10',
    badgeClass: 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300',
  },
  kazhtab: {
    id: 'kazhtab',
    name: 'پروفسور کژتاب',
    role: 'برادر پروفسور زهتاب — بخش گلوکوکورتیکوئید',
    emoji: '🧠',
    accentClass: 'border-amber-500/50 bg-amber-500/10',
    badgeClass: 'bg-amber-500/20 text-amber-700 dark:text-amber-300',
  },
  zahtab: {
    id: 'zahtab',
    name: 'پروفسور زهتاب',
    role: 'برادر پروفسور کژتاب — بخش مینرالوکورتیکوئید',
    emoji: '🧂',
    accentClass: 'border-sky-500/50 bg-sky-500/10',
    badgeClass: 'bg-sky-500/20 text-sky-700 dark:text-sky-300',
  },
  lawrence: {
    id: 'lawrence',
    name: 'خانم لارنس',
    role: 'محقق آزمایشگاه حیوانات — اتاق ماه عسل',
    emoji: '🔬',
    accentClass: 'border-pink-500/50 bg-pink-500/10',
    badgeClass: 'bg-pink-500/20 text-pink-700 dark:text-pink-300',
  },
  maria: {
    id: 'maria',
    name: 'دکتر ماریا',
    role: 'همسر دکتر ارول — اتاق نی‌نی کوچولو',
    emoji: '🍼',
    accentClass: 'border-purple-500/50 bg-purple-500/10',
    badgeClass: 'bg-purple-500/20 text-purple-700 dark:text-purple-300',
  },
  sigmund: {
    id: 'sigmund',
    name: 'آقای زیگموند',
    role: 'دوست قدیمی و رقیب ارول — اتاق ریش و سیبیل',
    emoji: '🧔',
    accentClass: 'border-indigo-500/50 bg-indigo-500/10',
    badgeClass: 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300',
  },
  errol: {
    id: 'errol',
    name: 'دکتر اِرول',
    role: 'مغز متفکر کارخانه مولکول — پروژه اهریمن',
    emoji: '☠️',
    accentClass: 'border-rose-500/50 bg-rose-500/10',
    badgeClass: 'bg-rose-500/20 text-rose-700 dark:text-rose-300',
  },
};

export const STORY_BEATS: Record<string, StoryBeat> = {
  intro_call: {
    id: 'intro_call',
    title: 'تماس اضطراری ساعت ۹ شب',
    timeStamp: 'ساعت ۲۱:۰۰',
    location: 'ورودی کارخانه مولکول دکتر ارول',
    messages: [
      {
        speaker: 'agent',
        mood: 'تماس فوری',
        text: 'الو؟ صدامو داری؟ ساعت ۹ شبه و همین الان با تیم مامور مخفی تماس گرفته شده. دکتر ارول و تیمش دارن روی یه مولکول شوم تحقیق می‌کنن که اسمشو گذاشتن «اهریمن»!',
      },
      {
        speaker: 'agent',
        text: 'تا این لحظه هزاران حیوان آزمایشگاهی رو به کشتن دادن و چیزی نمونده که بخوان وارد مرحله انسانی بشن...',
      },
      {
        speaker: 'agent',
        mood: 'ماموریت تو',
        text: 'تو به‌عنوان متخصص شیمی دارویی باید وارد کارخونه بشی، سر از کار دکتر ارول دربیاری و فرمول مولکول اهریمن رو پیدا و خنثی کنی. نگران نباش، من هم پشت بی‌سیم همرات هستم!',
      },
      {
        speaker: 'agent',
        text: 'الان جلوی در ورودی کارخونه‌ای؛ برای باز شدن در باید قطعات مولکولی رو کنار هم بچینی تا یه اسکلت استروئید کامل بسازی و به‌عنوان کلید ورود ازش استفاده کنی.',
      },
    ],
  },
  entrance_unlocked: {
    id: 'entrance_unlocked',
    title: 'ایول! در کارخونه باز شد',
    timeStamp: 'ساعت ۲۱:۰۵',
    location: 'راهروی مرکزی کارخانه دکتر ارول',
    messages: [
      {
        speaker: 'agent',
        mood: 'موفقیت',
        text: 'ایول! در باز شد و وارد کارخونه شدی. روبه‌روت ۵ تا اتاق می‌بینی که هر کدوم به یه دسته از هورمون‌های استروئیدی اشاره داره.',
      },
      {
        speaker: 'agent',
        text: 'دکتر ارول و همکاراش روی مشتقات این هورمون‌ها کار می‌کنن. باید تک‌تک اتاق‌ها رو بگردی و سرنخ‌هایی که از ساختار اهریمن پیدا می‌کنی رو خوب به یاد داشته باشی.',
      },
      {
        speaker: 'agent',
        text: 'از هر اتاقی که دوست داری شروع کن: اتاق چنگال استرس، گوله نمک، ماه عسل، نی‌نی کوچولو یا ریش و سیبیل!',
      },
    ],
  },
  glucocorticoid: {
    id: 'glucocorticoid',
    title: 'اتاق چنگال استرس (گلوکوکورتیکوئیدها)',
    timeStamp: 'بخش ۱',
    location: 'اتاق پروفسور کژتاب',
    messages: [
      {
        speaker: 'agent',
        text: 'اینجا اتاق پروفسور کژتابه، برادر پروفسور زهتاب. قبلاً استاد برجسته شیمی دارویی بوده تا اینکه وسوسه شد روی مشتقات کورتیزول کار کنه برای «حذف استرس در تیمشون»...',
      },
      {
        speaker: 'agent',
        mood: 'هشدار',
        text: 'ولی یه مشتق سمی ساخت — همون نسخه‌های اولیه مولکول اهریمن — که باعث شد هیپوکامپ خودش آسیب ببینه و حافظه کوتاه‌مدتش رو از دست بده!',
      },
      {
        speaker: 'kazhtab',
        mood: 'یادداشت روی دیوار',
        text: '«هر چقدر قوی‌ترش کنی، به اهریمن نزدیک‌تر می‌شی...» — اول قفل لمسی در رو با چیدمان درست هیدروژن‌ها باز کن و بعد ایمیل دکتر ارول رو توی کامپیوترش چک کن!',
      },
    ],
  },
  mineralocorticoid: {
    id: 'mineralocorticoid',
    title: 'اتاق گوله نمک (مینرالوکورتیکوئیدها)',
    timeStamp: 'بخش ۲',
    location: 'اتاق پروفسور زهتاب',
    messages: [
      {
        speaker: 'agent',
        text: 'اینجا اتاق پروفسور زهتابه، برادر پروفسور کژتاب. اون برخلاف برادرش رفت سراغ مینرالوکورتیکوئیدها و تعادل آب و نمک.',
      },
      {
        speaker: 'kazhtab',
        mood: 'نامه روی میز',
        text: '«زهتاب جان، می‌دونم از من دلخوری. راست می‌گی، من اشتباه کردم رفتم سراغ گلوکو... ولی الان فرصت ندارم حرفامو بزنم؛ یه چیزی می‌خوام ازت: اثر مینرال ترکیبم رو کم کن!»',
      },
      {
        speaker: 'agent',
        text: 'مواظب باش، ممکنه هر لحظه تلفن اتاق زهتاب زنگ بخوره و سرنخ مهمی از مسیر تجویز اهریمن لو بره!',
      },
    ],
  },
  estrogen: {
    id: 'estrogen',
    title: 'اتاق ماه عسل (استروژن‌ها)',
    timeStamp: 'بخش ۳',
    location: 'آزمایشگاه حیوانات آقا و خانم لارنس',
    messages: [
      {
        speaker: 'agent',
        text: 'اینجا آزمایشگاه حیوانات آقا و خانم لارنسه. یه ساله دارن اینجا کار می‌کنن تا یه استروژن «فول‌شارژ» بسازن که در هر شرایطی بارداری رو تضمین کنه.',
      },
      {
        speaker: 'agent',
        mood: 'احتیاط!',
        text: 'احتمالاً خودشون داخل اتاق باشن؛ خیلی حواست باشه توی دامشون نیفتی! برای ورود باید ساختارهای مسیر متابولیسم استروژن رو جای درستشون بذاری.',
      },
    ],
  },
  progestin: {
    id: 'progestin',
    title: 'اتاق نی‌نی کوچولو (پروژسترون)',
    timeStamp: 'بخش ۴',
    location: 'اتاق دکتر ماریا (همسر ارول)',
    messages: [
      {
        speaker: 'agent',
        text: 'اینجا اتاق دکتر ماریا، همسر دکتر اروله. به‌تازگی بچه‌شون به دنیا اومده و ماریا مخفیانه دنبال راه فرار از دست پروژه اهریمن می‌گرده.',
      },
      {
        speaker: 'maria',
        mood: 'یادداشت مخفی',
        text: 'رمز در اتاق تاریخ تولد بچه‌مونه... اگر بتونی از روی ویژگی‌های ساختارها عددهاش رو پیدا کنی، می‌تونی به تخته تحقیقات من و شیشه یادداشتم برسی.',
      },
    ],
  },
  androgen: {
    id: 'androgen',
    title: 'اتاق ریش و سیبیل (آندروژن‌ها)',
    timeStamp: 'بخش ۵',
    location: 'اتاق آقای زیگموند',
    messages: [
      {
        speaker: 'agent',
        text: 'اینجا اتاق آقای زیگمونده؛ رفیق صمیمی و البته رقیب قدیمی ارول که مبتلا به سرطان پروستاته. ولی ارول به زیگموند خیانت کرده!',
      },
      {
        speaker: 'sigmund',
        mood: 'درخواست کمک',
        text: 'می‌دونم برای جاسوسی اومدی... ولی ارول دارویی بهم داده که PSA خونم هنوز بالاست! اگر کمکم کنی داروی درست رو پیدا کنم، آخرین نامه ارول و راز ۵-آلفا ردوکتاز اهریمن رو بهت می‌دم.',
      },
    ],
  },
  final: {
    id: 'final',
    title: 'اتاق مخفی دکتر اِرول',
    timeStamp: 'اوج عملیات',
    location: 'گاوصندوق اصلی پروژه اهریمن',
    messages: [
      {
        speaker: 'agent',
        mood: 'همه ۵ سرنخ جمع شد',
        text: 'دمت گرم! همه اتاق‌ها رو گشتی و فهمیدی اهریمن قراره یه گلوکوکورتیکوئید قوی با اتم F باشه، موضعی باشه، گروه سیانید داشته باشه، خاصیت پروژسترونی داشته باشه و کتو-انول مهار ۵-آلفا ردوکتاز هم توش باشه.',
      },
      {
        speaker: 'errol',
        mood: 'سیستم امنیتی اتاق مخفی',
        text: '«فقط کسی که روی تمام خانواده‌های استروئیدی مسلط باشه می‌تونه درِ اتاق مخفی من رو باز کنه و رمز گاوصندوق رو از جدول بیوسنتز دربیاره...»',
      },
      {
        speaker: 'agent',
        text: 'بزن بریم! در اتاق مخفی رو باز کن، رمز گاوصندوق رو بشکن، به ساختار واقعی اهریمن برس و پادزهرش رو بساز!',
      },
    ],
  },
};
