import type { HDCenter } from '../human-design/gates';

type RelMeaning = {
  conditions: string;
  bothDefined: string;
  bothOpen: string;
};

type LocalizedContent = {
  CENTER: Record<HDCenter, string>;
  CENTER_THEME: Record<HDCenter, string>;
  CENTER_RELATIONSHIP: Record<HDCenter, RelMeaning>;
};

const TR: LocalizedContent = {
  CENTER: {
    Head: 'Baş (İlham)',
    Ajna: 'Anja (Zihin)',
    Throat: 'Boğaz (İfade)',
    G: 'G Merkezi (Kimlik & Sevgi)',
    Heart: 'Kalp / Ego (İrade)',
    SolarPlexus: 'Solar Plexus (Duygular)',
    Sacral: 'Sakral (Yaşam Gücü)',
    Spleen: 'Dalak (Sezgi & Sağlık)',
    Root: 'Kök (Baskı & İvme)',
  },
  CENTER_THEME: {
    Head: 'ilham, sorular ve zihinsel baskı',
    Ajna: 'kavramlaştırma, kesinlik ve düşünme biçimi',
    Throat: 'ifade, iletişim ve eyleme dökme',
    G: 'kimlik, yön, sevgi ve aidiyet',
    Heart: 'irade gücü, değer, söz tutma ve özgüven',
    SolarPlexus: 'duygusal dalgalar, arzu ve ruh hali',
    Sacral: 'yaşam enerjisi, üretkenlik, cinsellik ve istek',
    Spleen: 'sezgi, anlık farkındalık, sağlık ve güven hissi',
    Root: 'stres, ivme, baskı ve harekete geçme dürtüsü',
  },
  CENTER_RELATIONSHIP: {
    Head: {
      conditions: 'tanımlı tarafın ilham ve soruları, açık tarafı zihinsel olarak meşgul eder. Açık taraf onun sorularına kapılabilir; sınır koymayı öğrenirse büyük ilham alır.',
      bothDefined: 'ikiniz de kendi ilham kaynağınıza sahipsiniz. Zihinsel olarak birbirinizden bağımsızsınız; nadiren birbirinizin kafasını karıştırırsınız.',
      bothOpen: 'ikiniz de dışarıdan gelen sorulara açıksınız. Birlikte "acaba" sarmalına girebilir, sürekli yeni fikirler kovalayabilirsiniz — eğlenceli ama dağıtıcı.',
    },
    Ajna: {
      conditions: 'tanımlı tarafın sabit düşünme biçimi, açık tarafa kesinlik hissi verir. Açık taraf onun gibi düşünmeye başlayabilir; bu hem güven verir hem de kendi esnek zihnini unutturabilir.',
      bothDefined: 'ikinizin de sabit görüşleri var. Aynı fikirdeyseniz sarsılmaz bir ittifak, farklıysanız "ben haklıyım" çatışması olabilir.',
      bothOpen: 'ikiniz de zihinsel olarak esnek ve meraklısınız. Birlikte birçok bakış açısını deneyebilir ama bir karara varmakta zorlanabilirsiniz.',
    },
    Throat: {
      conditions: 'tanımlı taraf konuşma ve eyleme dökme ritmini belirler; açık taraf onun sesinden etkilenir, bazen söz hakkı bulmakta zorlanır. Bilinçli olunca güzel bir sözcü-dinleyici dengesi kurar.',
      bothDefined: 'ikinizin de güçlü bir ifade tarzı var. Sesli bir ikilisiniz; ama ikiniz de aynı anda konuşmak isterse söz sırası bir mesele olabilir.',
      bothOpen: 'ikiniz de ifade için dış ortama göre şekil alırsınız. Beraber sessiz kalabilir ya da doğru ortamda birlikte açılabilirsiniz.',
    },
    G: {
      conditions: 'tanımlı taraf yön ve kimlik duygusu yayar; açık taraf onun yanında "kim olduğunu" daha net hisseder ama kendi yönünü ona bağlayabilir. Sağlıklı olduğunda derin bir aidiyet doğar.',
      bothDefined: 'ikinizin de sabit bir kimlik ve yön duygusu var. Birbirinizi nereye gittiğiniz konusunda zorlamazsınız; iki bağımsız pusula yan yana yürür.',
      bothOpen: 'ikiniz de yönünüzü ve kimliğinizi ortama/çevreye göre bulursunuz. Birlikte doğru "yer"i ararsanız manyetik bir keşif; yanlış ortamda ikiniz de kaybolabilirsiniz.',
    },
    Heart: {
      conditions: 'tanımlı tarafın irade ve özgüveni, açık tarafa "yetiyor muyum?" baskısı bindirebilir. Açık taraf kendini kanıtlamaya çalışmamayı öğrenirse, tanımlı taraftan büyük cesaret alır.',
      bothDefined: 'ikinizin de güçlü iradesi ve değer duygusu var. Güç mücadelesine girmemek için söz verme ve rekabeti açıkça konuşmanız gerekir.',
      bothOpen: 'ikiniz de kendinizi kanıtlama baskısına açıksınız. Birbirinize "olduğun gibi yetersin" diyebilirseniz, bu açıklık bilgeliğe dönüşür.',
    },
    SolarPlexus: {
      conditions: 'tanımlı tarafın duygusal dalgası evin havasını belirler; açık taraf bu dalgayı emer ve büyütür. Açık taraf "bu duygu bana mı ait?" diye sormayı öğrenirse, ilişki çok daha sakin akar.',
      bothDefined: 'ikinizin de kendi duygusal dalgası var. İki dalga çakışınca yoğun, ayrı fazda olunca biri inerken diğeri çıkar — netlik için ikinizin de zamana ihtiyacı var.',
      bothOpen: 'ikiniz de duygusal olarak ortamdan etkilenirsiniz. Çatışmadan kaçma eğiliminiz ortak; gerginliği bastırmak yerine nazikçe adlandırmak ikinizi de özgürleştirir.',
    },
    Sacral: {
      conditions: 'tanımlı taraf (Generator) sürdürülebilir yaşam enerjisi yayar; açık taraf bu enerjiyi alır ama ne zaman duracağını bilemeyebilir. Açık taraf dinlenmeyi öğrenirse, birlikte çok üretirsiniz.',
      bothDefined: 'ikinizin de motoru güçlü. Aynı işe sarıldığınızda yorulmadan üretirsiniz; ama ikiniz de "evet" derken bedeninizi dinlemezseniz tükenebilirsiniz.',
      bothOpen: 'ikiniz de yaşam enerjisini dışarıdan alırsınız. Birlikte ne zaman duracağınızı bilmek kritik; dinlenmeyi ortak bir ritüel yapın.',
    },
    Spleen: {
      conditions: 'tanımlı tarafın sezgisi ve sağlık-güven duygusu, açık tarafa anlık bir güvenlik hissi verir. Açık taraf ona "iyi hissettiren" şeylere fazla tutunabilir; sağlıklı sınır şart.',
      bothDefined: 'ikinizin de güçlü, anlık sezgisi var. Tehlikeyi ve fırsatı aynı anda hissedersiniz; sezgisel olarak birbirinize güvenirsiniz.',
      bothOpen: 'ikiniz de korku ve güven konusunda dışa açıksınız. Birbirinizin "iyi hissettiren ama doğru olmayan" alışkanlıklarını fark etmek, ortak şifa olur.',
    },
    Root: {
      conditions: 'tanımlı tarafın ivme ve baskı enerjisi, açık tarafı harekete geçirir ama aceleye de sürükleyebilir. Açık taraf "bu acele gerçekten benim mi?" diye sorarsa, sağlıklı bir tempo bulunur.',
      bothDefined: 'ikinizin de kendi iç ritmi ve baskıyı yönetme biçimi var. Birbirinizi gereksiz aceleye zorlamazsınız; iki ayrı tempo yan yana akar.',
      bothOpen: 'ikiniz de dış baskıya açıksınız. "Bitirelim de rahatlayalım" tuzağına birlikte düşebilirsiniz; önceliklendirmeyi birlikte öğrenmek özgürleştirir.',
    },
  },
};

const EN: LocalizedContent = {
  CENTER: {
    Head: 'Head (Inspiration)',
    Ajna: 'Ajna (Mind)',
    Throat: 'Throat (Expression)',
    G: 'G Center (Identity & Love)',
    Heart: 'Heart / Ego (Willpower)',
    SolarPlexus: 'Solar Plexus (Emotions)',
    Sacral: 'Sacral (Life Force)',
    Spleen: 'Spleen (Intuition & Health)',
    Root: 'Root (Pressure & Drive)',
  },
  CENTER_THEME: {
    Head: 'inspiration, questions and mental pressure',
    Ajna: 'conceptualization, certainty and ways of thinking',
    Throat: 'expression, communication and putting things into action',
    G: 'identity, direction, love and belonging',
    Heart: 'willpower, value, keeping promises and self-worth',
    SolarPlexus: 'emotional waves, desire and moods',
    Sacral: 'life force, productivity, sexuality and desire',
    Spleen: 'intuition, in-the-moment awareness, health and a sense of safety',
    Root: 'stress, drive, pressure and the urge to act',
  },
  CENTER_RELATIONSHIP: {
    Head: {
      conditions: "the defined side's inspirations and questions mentally occupy the open one. The open side can get swept up in those questions; with healthy boundaries it draws deep inspiration.",
      bothDefined: 'you each have your own source of inspiration. You are mentally independent; you rarely confuse each other.',
      bothOpen: "you are both open to outside questions. Together you might spiral into 'what ifs,' constantly chasing new ideas — playful but scattering.",
    },
    Ajna: {
      conditions: "the defined side's fixed way of thinking gives the open one a sense of certainty. The open side may start thinking like them; this feels reassuring but can mute their own flexible mind.",
      bothDefined: 'you both hold fixed views. When aligned it is an unshakeable alliance; when different it can become an "I am right" standoff.',
      bothOpen: 'you are both mentally flexible and curious. Together you can try many perspectives but may struggle to land on a decision.',
    },
    Throat: {
      conditions: 'the defined side sets the rhythm of speaking and action; the open side is influenced by their voice and sometimes struggles to get a word in. With awareness a beautiful speaker-listener balance forms.',
      bothDefined: 'you both have a strong expressive style. You are a vocal duo; when both speak at once, taking turns becomes important.',
      bothOpen: 'you both shape your expression based on the environment. You can stay quiet together or open up together in the right setting.',
    },
    G: {
      conditions: "the defined side radiates direction and identity; the open one feels more 'themselves' around them but may tie their direction to them. When healthy it births a deep sense of belonging.",
      bothDefined: 'you both have a fixed sense of identity and direction. You do not pressure each other about where you are going; two independent compasses walk side by side.',
      bothOpen: 'you both find your direction and identity through environment. Searching for the right "place" together is a magnetic adventure; in the wrong place you can both get lost.',
    },
    Heart: {
      conditions: "the defined side's willpower and self-worth can put 'am I enough?' pressure on the open one. When the open side stops trying to prove themselves, they draw great courage from the defined one.",
      bothDefined: 'you both have strong willpower and a sense of worth. To avoid power struggles you need to keep promises and discuss competition openly.',
      bothOpen: 'you are both vulnerable to the pressure of proving yourselves. If you can tell each other "you are enough as you are," this openness turns into wisdom.',
    },
    SolarPlexus: {
      conditions: "the defined side's emotional wave sets the mood of the home; the open one absorbs and amplifies it. When the open side learns to ask 'does this feeling belong to me?', the relationship flows much more calmly.",
      bothDefined: 'you both have your own emotional wave. When the waves align it is intense; when out of phase one rises as the other falls — both of you need time for clarity.',
      bothOpen: 'you are both emotionally influenced by the environment. You share a tendency to avoid conflict; naming tension gently instead of suppressing it sets you both free.',
    },
    Sacral: {
      conditions: 'the defined side (Generator) radiates sustainable life energy; the open side draws on this energy but may not know when to stop. When the open side learns to rest, you produce a lot together.',
      bothDefined: 'you both have strong engines. Tackling the same work, you produce tirelessly; but if you say "yes" without listening to your body you can both burn out.',
      bothOpen: 'you both draw life energy from outside. Knowing together when to stop is critical; make rest a shared ritual.',
    },
    Spleen: {
      conditions: "the defined side's intuition and sense of safety give the open one a moment-to-moment feeling of security. The open side can cling to whatever 'feels good' from them; healthy boundaries are essential.",
      bothDefined: 'you both have strong, in-the-moment intuition. You sense danger and opportunity at the same time; you trust each other intuitively.',
      bothOpen: 'you are both open about fear and trust. Noticing each other\'s "feels good but isn\'t right" habits becomes shared healing.',
    },
    Root: {
      conditions: "the defined side's pressure and drive energy gets the open one moving — but can also sweep them into haste. If the open side asks 'is this rush really mine?', a healthy tempo emerges.",
      bothDefined: 'you both have your own inner rhythm and way of handling pressure. You do not pressure each other into unnecessary haste; two separate tempos flow side by side.',
      bothOpen: 'you are both open to outside pressure. Together you can fall into the "let\'s just finish and relax" trap; learning to prioritize together is freeing.',
    },
  },
};

export type Locale = 'tr' | 'en';

export function getCenterTr(locale: Locale): Record<HDCenter, string> {
  return (locale === 'en' ? EN : TR).CENTER;
}

export function getCenterTheme(locale: Locale): Record<HDCenter, string> {
  return (locale === 'en' ? EN : TR).CENTER_THEME;
}

export function getCenterRelationship(locale: Locale): Record<HDCenter, RelMeaning> {
  return (locale === 'en' ? EN : TR).CENTER_RELATIONSHIP;
}

// Geriye dönük uyum (compatibility view eski default'la sürer)
export const CENTER_TR = TR.CENTER;
export const CENTER_THEME = TR.CENTER_THEME;
export const CENTER_RELATIONSHIP = TR.CENTER_RELATIONSHIP;

export function channelTheme(centerA: HDCenter, centerB: HDCenter, locale: Locale = 'tr'): string {
  const c = getCenterTr(locale);
  return `${c[centerA]} ↔ ${c[centerB]}`;
}
