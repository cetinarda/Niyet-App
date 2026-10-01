// KENDİNİ SEVME YANSIMASI (1.4.3, Eki 2026). Kullanıcı: "kendini yargılama kodlarını
// güncelleyerek kendini sevmesini ve böylece etrafındaki güzellikleri görmesini sağlayacak
// kısa, benzersiz bir test; hatırlatmalar içersin; Ben'de bağlanma stilinin altına."
// Karar (kullanıcı onayı): adı TEST DEĞİL "yansıma", PUAN YOK, tanı iddiası yok (Apple 1.4.1).
// Sorular ÖZGÜN (Neff ölçeği kopyalanmadı); dayanak öz-şefkatin üç ayağı (nezaket, ortak
// insanlık, farkındalık) + "güzelliği görme". Sonuç: en güçlü alan + şefkat isteyen alan +
// o alan için "eski kod -> yeni kod" + taşınacak cümle. Veri YALNIZCA cihazda (`sakin_selflove`).
// Hatırlatma: sonraki 10 günde 3 akşam (2., 5., 9. gün) akşam bildirimi yerine kişinin yeni
// kodu gider (günlük sınırın İÇİNDE, App.jsx planlayıcı `selfLoveEveningLine`); 21 gün sonra
// yeniden bakma daveti kartta.
import { useState } from "react";

export const SELFLOVE_KEY = "sakin_selflove";
const P = (o, lang) => (o && (o[lang] || o.en || o.tr)) || "";

// k = alan, r = ters madde (yüksek cevap = o alan ZAYIF).
export const SL_ITEMS = [
  { k: "kind", r: true,  t: { tr:"Bir hata yaptığımda içimden kendime sert sözler söylerim.", en:"When I make a mistake, I say harsh things to myself inside.", de:"Wenn mir ein Fehler passiert, sage ich innerlich harte Dinge zu mir.", es:"Cuando cometo un error, me digo cosas duras por dentro.", pt:"Quando erro, digo-me coisas duras por dentro.", fr:"Quand je fais une erreur, je me dis intérieurement des choses dures.", ja:"失敗したとき、心の中で自分に厳しい言葉をかけてしまう。" } },
  { k: "kind", r: false, t: { tr:"Zorlandığımda kendime, sevdiğim bir dosta konuşur gibi konuşabilirim.", en:"When things are hard, I can talk to myself the way I'd talk to a dear friend.", de:"Wenn es schwer wird, kann ich mit mir reden wie mit einem lieben Freund.", es:"Cuando me cuesta, puedo hablarme como le hablaría a alguien querido.", pt:"Quando custa, consigo falar comigo como falaria a um amigo querido.", fr:"Quand c'est dur, je peux me parler comme à un ami cher.", ja:"つらいとき、大切な友人に話すように自分に話しかけられる。" } },
  { k: "bond", r: true,  t: { tr:"Zorlandığımda, bunu bir tek benim yaşadığımı hissederim.", en:"When I struggle, it feels like I'm the only one going through it.", de:"Wenn ich kämpfe, fühlt es sich an, als wäre ich der Einzige damit.", es:"Cuando lo paso mal, siento que soy la única persona que lo vive.", pt:"Quando estou em dificuldade, sinto que sou o único a passar por isso.", fr:"Quand je traverse une difficulté, j'ai l'impression d'être seul à la vivre.", ja:"苦しいとき、こんな思いをしているのは自分だけだと感じる。" } },
  { k: "bond", r: false, t: { tr:"Eksiklerimin, herkeste olan insanlık hâlinin bir parçası olduğunu bilirim.", en:"I know my flaws are part of being human, something everyone shares.", de:"Ich weiß, dass meine Schwächen zum Menschsein gehören, das alle teilen.", es:"Sé que mis fallos forman parte de ser humano, algo que todos compartimos.", pt:"Sei que as minhas falhas fazem parte de ser humano, algo que todos partilhamos.", fr:"Je sais que mes défauts font partie de la condition humaine, partagée par tous.", ja:"自分の欠点は、誰もが持つ人間らしさの一部だと知っている。" } },
  { k: "calm", r: true,  t: { tr:"Kötü hissettiğimde o duygu bütün günümü kaplar.", en:"When I feel bad, that feeling takes over my whole day.", de:"Wenn es mir schlecht geht, überschattet das Gefühl meinen ganzen Tag.", es:"Cuando me siento mal, ese sentimiento ocupa todo mi día.", pt:"Quando me sinto mal, esse sentimento toma conta do meu dia inteiro.", fr:"Quand je me sens mal, ce sentiment envahit toute ma journée.", ja:"気分が沈むと、その感情が一日中を覆ってしまう。" } },
  { k: "calm", r: false, t: { tr:"Zor bir duyguyu, onunla savaşmadan fark edebilirim.", en:"I can notice a difficult feeling without fighting it.", de:"Ich kann ein schweres Gefühl bemerken, ohne dagegen anzukämpfen.", es:"Puedo notar una emoción difícil sin pelearme con ella.", pt:"Consigo notar um sentimento difícil sem lutar contra ele.", fr:"Je peux remarquer une émotion difficile sans lutter contre elle.", ja:"つらい感情に、抗わずに気づくことができる。" } },
  { k: "see",  r: false, t: { tr:"Gün içinde küçük güzellikleri fark ederim: bir ışık, bir yüz, bir koku.", en:"During the day I notice small beautiful things: a light, a face, a scent.", de:"Im Laufe des Tages bemerke ich kleine schöne Dinge: ein Licht, ein Gesicht, einen Duft.", es:"Durante el día noto pequeñas bellezas: una luz, un rostro, un aroma.", pt:"Ao longo do dia reparo em pequenas belezas: uma luz, um rosto, um cheiro.", fr:"Dans la journée, je remarque de petites beautés : une lumière, un visage, un parfum.", ja:"一日のなかで小さな美しさに気づく：光、顔、香り。" } },
  { k: "see",  r: true,  t: { tr:"Kendimi sevebilmek için önce daha iyi biri olmam gerektiğini düşünürüm.", en:"I think I need to become better before I can love myself.", de:"Ich denke, ich muss erst besser werden, bevor ich mich lieben darf.", es:"Pienso que debo ser mejor antes de poder quererme.", pt:"Penso que tenho de ser melhor antes de me poder amar.", fr:"Je pense devoir devenir meilleur avant de pouvoir m'aimer.", ja:"自分を愛するには、まずもっと良い人にならなければと思う。" } },
];
export const SL_SCALE = [
  { tr:"Hiç", en:"Never", de:"Nie", es:"Nunca", pt:"Nunca", fr:"Jamais", ja:"まったく" },
  { tr:"Bazen", en:"Sometimes", de:"Manchmal", es:"A veces", pt:"Às vezes", fr:"Parfois", ja:"ときどき" },
  { tr:"Sık", en:"Often", de:"Oft", es:"A menudo", pt:"Muitas vezes", fr:"Souvent", ja:"よく" },
  { tr:"Neredeyse hep", en:"Almost always", de:"Fast immer", es:"Casi siempre", pt:"Quase sempre", fr:"Presque toujours", ja:"ほぼいつも" },
];
// Alan içerikleri: ad, güçlüyse söz, şefkat isteyense eski/yeni kod + taşınacak cümle.
export const SL_AREAS = {
  kind: {
    name: { tr:"Kendine nezaket", en:"Kindness to yourself", de:"Freundlichkeit zu dir", es:"Amabilidad contigo", pt:"Gentileza contigo", fr:"Bienveillance envers toi", ja:"自分へのやさしさ" },
    strong: { tr:"İç sesin çoğu zaman yanında. Bu, kolay kazanılmış bir şey değil.", en:"Your inner voice is mostly on your side. That is no small thing.", de:"Deine innere Stimme ist meist auf deiner Seite. Das ist nichts Kleines.", es:"Tu voz interior suele estar de tu lado. No es poca cosa.", pt:"A tua voz interior está quase sempre do teu lado. Não é coisa pouca.", fr:"Ta voix intérieure est le plus souvent de ton côté. Ce n'est pas rien.", ja:"あなたの内なる声は、たいてい味方でいてくれる。それは小さなことではありません。" },
    old: { tr:"Hata yaparsam bana sert davranılmalı.", en:"If I make a mistake, I deserve to be treated harshly.", de:"Wenn ich Fehler mache, verdiene ich Härte.", es:"Si me equivoco, merezco que me traten con dureza.", pt:"Se errar, mereço ser tratado com dureza.", fr:"Si je me trompe, je mérite d'être traité durement.", ja:"失敗したら、厳しくされて当然だ。" },
    neu: { tr:"Hata yaptığımda da kendime yumuşak bir ses borçluyum.", en:"Even when I make a mistake, I owe myself a gentle voice.", de:"Auch wenn ich Fehler mache, schulde ich mir eine sanfte Stimme.", es:"Incluso cuando me equivoco, me debo una voz amable.", pt:"Mesmo quando erro, devo a mim mesmo uma voz gentil.", fr:"Même quand je me trompe, je me dois une voix douce.", ja:"失敗したときこそ、自分にやさしい声を。" },
    carry: { tr:"Bugün kendine, bir dostuna konuşur gibi konuşabilirsin.", en:"Today you can speak to yourself the way you'd speak to a friend.", de:"Heute darfst du mit dir sprechen wie mit einem Freund.", es:"Hoy puedes hablarte como le hablarías a un amigo.", pt:"Hoje podes falar contigo como falarias a um amigo.", fr:"Aujourd'hui, tu peux te parler comme à un ami.", ja:"今日は、友人に話すように自分に話しかけていい。" },
  },
  bond: {
    name: { tr:"Yalnız olmadığını bilmek", en:"Knowing you're not alone", de:"Wissen, dass du nicht allein bist", es:"Saber que no estás solo", pt:"Saber que não estás sozinho", fr:"Savoir que tu n'es pas seul", ja:"ひとりではないと知ること" },
    strong: { tr:"Zorlukların seni insanlardan koparmıyor, onlara bağlıyor.", en:"Your struggles don't cut you off from people; they connect you to them.", de:"Deine Schwierigkeiten trennen dich nicht von Menschen, sie verbinden dich.", es:"Tus dificultades no te separan de la gente, te unen a ella.", pt:"As tuas dificuldades não te afastam das pessoas, ligam-te a elas.", fr:"Tes difficultés ne te coupent pas des autres, elles t'y relient.", ja:"あなたの苦しみは、人から切り離すのではなく、人とつなげてくれる。" },
    old: { tr:"Bunu bir tek ben yaşıyorum, bende bir sorun var.", en:"I'm the only one going through this; something is wrong with me.", de:"Nur ich erlebe das, mit mir stimmt etwas nicht.", es:"Solo yo paso por esto; algo va mal en mí.", pt:"Só eu passo por isto; há algo de errado comigo.", fr:"Je suis seul à vivre ça, quelque chose cloche chez moi.", ja:"こんな思いをしているのは自分だけ。自分はおかしい。" },
    neu: { tr:"Şu an dünyada birileri tam da bunu hissediyor; bu his beni insanlara bağlıyor.", en:"Right now, someone somewhere feels exactly this; this feeling connects me to people.", de:"Gerade fühlt irgendwo jemand genau das; dieses Gefühl verbindet mich mit Menschen.", es:"Ahora mismo alguien en algún lugar siente justo esto; este sentimiento me une a los demás.", pt:"Neste momento, alguém algures sente exatamente isto; este sentimento liga-me às pessoas.", fr:"En ce moment, quelqu'un quelque part ressent exactement cela ; ce sentiment me relie aux autres.", ja:"いまこの瞬間、どこかで誰かが同じ思いをしている。その思いが私を人とつなげる。" },
    carry: { tr:"Zorlandığın an, insan olmanın en ortak anı.", en:"The moment you struggle is one of the most shared human moments.", de:"Der Moment, in dem du kämpfst, ist einer der gemeinsamsten menschlichen Momente.", es:"El momento en que te cuesta es de los más compartidos por los humanos.", pt:"O momento em que te custa é dos mais partilhados entre humanos.", fr:"Le moment où tu peines est l'un des plus partagés entre humains.", ja:"苦しい瞬間は、人がもっとも分かち合っている瞬間のひとつ。" },
  },
  calm: {
    name: { tr:"Duygulara alan açmak", en:"Making room for feelings", de:"Gefühlen Raum geben", es:"Dar espacio a las emociones", pt:"Dar espaço aos sentimentos", fr:"Faire de la place aux émotions", ja:"感情に場所をあけること" },
    strong: { tr:"Zor duygular gelse de seni sürüklemiyor; onlara yer açabiliyorsun.", en:"Hard feelings may come, but they don't sweep you away; you can make room for them.", de:"Schwere Gefühle kommen, aber sie reißen dich nicht mit; du kannst ihnen Raum geben.", es:"Las emociones difíciles llegan, pero no te arrastran; puedes darles espacio.", pt:"Os sentimentos difíceis chegam, mas não te arrastam; consegues dar-lhes espaço.", fr:"Les émotions difficiles viennent, mais ne t'emportent pas ; tu sais leur faire de la place.", ja:"つらい感情が来ても流されない。あなたはそれに場所をあけられる。" },
    old: { tr:"Kötü hissediyorsam bütün günüm kötü geçmeli.", en:"If I feel bad, my whole day is ruined.", de:"Wenn ich mich schlecht fühle, ist der ganze Tag verloren.", es:"Si me siento mal, todo mi día está arruinado.", pt:"Se me sinto mal, o meu dia inteiro está perdido.", fr:"Si je me sens mal, toute ma journée est gâchée.", ja:"気分が悪いなら、一日が台無しだ。" },
    neu: { tr:"Bu duygu bir misafir: geldi, oturdu, gidecek. Ben evin kendisiyim.", en:"This feeling is a guest: it came, it sat down, it will leave. I am the house itself.", de:"Dieses Gefühl ist ein Gast: Es kam, setzte sich, es wird gehen. Ich bin das Haus.", es:"Esta emoción es una visita: llegó, se sentó, se irá. Yo soy la casa.", pt:"Este sentimento é uma visita: chegou, sentou-se, vai partir. Eu sou a casa.", fr:"Cette émotion est une invitée : elle est venue, s'est assise, elle repartira. Je suis la maison.", ja:"この感情はお客さん。来て、座って、やがて帰る。私はその家そのもの。" },
    carry: { tr:"Bir duyguyu fark etmek, ona teslim olmak değil.", en:"Noticing a feeling is not surrendering to it.", de:"Ein Gefühl zu bemerken heißt nicht, sich ihm zu ergeben.", es:"Notar una emoción no es rendirse a ella.", pt:"Notar um sentimento não é render-se a ele.", fr:"Remarquer une émotion, ce n'est pas s'y soumettre.", ja:"感情に気づくことは、それに屈することではない。" },
  },
  see: {
    name: { tr:"Güzelliği görmek", en:"Seeing the beauty", de:"Das Schöne sehen", es:"Ver la belleza", pt:"Ver a beleza", fr:"Voir la beauté", ja:"美しさを見ること" },
    strong: { tr:"Gözün güzelliğe açık; bu, kendine bakışını da yumuşatıyor.", en:"Your eyes are open to beauty, and that softens how you see yourself too.", de:"Dein Blick ist offen für das Schöne, und das macht auch den Blick auf dich weicher.", es:"Tu mirada está abierta a la belleza, y eso suaviza también cómo te ves.", pt:"O teu olhar está aberto à beleza, e isso suaviza também a forma como te vês.", fr:"Ton regard est ouvert à la beauté, et cela adoucit aussi ta façon de te voir.", ja:"あなたの目は美しさに開かれていて、それが自分を見るまなざしもやわらげている。" },
    old: { tr:"Sevilmeye değer olmak için önce daha iyi olmalıyım.", en:"I have to become better before I'm worth loving.", de:"Ich muss erst besser werden, bevor ich Liebe verdiene.", es:"Tengo que ser mejor antes de merecer amor.", pt:"Tenho de ser melhor antes de merecer amor.", fr:"Je dois devenir meilleur avant de mériter d'être aimé.", ja:"愛されるには、まずもっと良くならなければ。" },
    neu: { tr:"Değerim şimdi de burada; güzelliği görmek için önce kendime bakıyorum.", en:"My worth is here already; to see beauty, I start by looking at myself.", de:"Mein Wert ist schon da; um das Schöne zu sehen, beginne ich bei mir.", es:"Mi valor ya está aquí; para ver la belleza, empiezo mirándome a mí.", pt:"O meu valor já está aqui; para ver a beleza, começo por olhar para mim.", fr:"Ma valeur est déjà là ; pour voir la beauté, je commence par me regarder.", ja:"私の価値はもうここにある。美しさを見るために、まず自分を見つめる。" },
    carry: { tr:"Bugün gözüne çarpan küçük bir güzellik, sana da bakıyor.", en:"A small beauty that catches your eye today is looking back at you too.", de:"Eine kleine Schönheit, die dir heute auffällt, schaut auch auf dich.", es:"Una pequeña belleza que hoy te llame la atención también te mira a ti.", pt:"Uma pequena beleza que hoje te chame a atenção também olha para ti.", fr:"Une petite beauté qui attire ton regard aujourd'hui te regarde aussi.", ja:"今日目にとまる小さな美しさは、あなたのことも見つめている。" },
  },
};
export const SL_TXT = {
  eyebrow: { tr:"Kendini sevme yansıması", en:"Self-love reflection", de:"Selbstliebe-Spiegelung", es:"Reflejo de amor propio", pt:"Reflexo de amor-próprio", fr:"Reflet d'amour de soi", ja:"自分を愛するふりかえり" },
  invite:  { tr:"Kendine nasıl bakıyorsun?", en:"How do you look at yourself?", de:"Wie schaust du auf dich?", es:"¿Cómo te miras?", pt:"Como te olhas?", fr:"Comment te regardes-tu ?", ja:"あなたは自分をどう見ている？" },
  inviteSub: { tr:"8 kısa cümle, bir dakika. Yargılamadan, yalnızca fark etmek için.", en:"8 short sentences, one minute. Not to judge, only to notice.", de:"8 kurze Sätze, eine Minute. Nicht urteilen, nur bemerken.", es:"8 frases cortas, un minuto. Sin juzgar, solo para notar.", pt:"8 frases curtas, um minuto. Sem julgar, só para reparar.", fr:"8 phrases courtes, une minute. Sans juger, juste pour remarquer.", ja:"8つの短い文、1分。判断せず、ただ気づくために。" },
  begin:   { tr:"Başla", en:"Begin", de:"Beginnen", es:"Empezar", pt:"Começar", fr:"Commencer", ja:"はじめる" },
  strong:  { tr:"Sende güçlü olan", en:"What is strong in you", de:"Was in dir stark ist", es:"Lo que en ti es fuerte", pt:"O que em ti é forte", fr:"Ce qui est fort en toi", ja:"あなたの強さ" },
  tender:  { tr:"Biraz şefkat isteyen yer", en:"The place asking for a little tenderness", de:"Der Ort, der etwas Zärtlichkeit braucht", es:"El lugar que pide un poco de ternura", pt:"O lugar que pede um pouco de ternura", fr:"L'endroit qui demande un peu de tendresse", ja:"少しやさしさを求めている場所" },
  oldCode: { tr:"Eski kod", en:"Old code", de:"Alter Code", es:"Código antiguo", pt:"Código antigo", fr:"Ancien code", ja:"古いコード" },
  newCode: { tr:"Yeni kod", en:"New code", de:"Neuer Code", es:"Código nuevo", pt:"Código novo", fr:"Nouveau code", ja:"新しいコード" },
  carry:   { tr:"Yanında taşıyacağın cümle", en:"A sentence to carry with you", de:"Ein Satz für unterwegs", es:"Una frase para llevar contigo", pt:"Uma frase para levares contigo", fr:"Une phrase à emporter", ja:"持ち歩くひとこと" },
  remind:  { tr:"Önümüzdeki günlerde yeni kodun birkaç akşam sana hatırlatılacak.", en:"In the coming days, your new code will come back to you on a few evenings.", de:"In den nächsten Tagen kommt dein neuer Code an einigen Abenden zu dir zurück.", es:"En los próximos días, tu código nuevo volverá a ti algunas tardes.", pt:"Nos próximos dias, o teu código novo vai voltar a ti em algumas noites.", fr:"Dans les jours qui viennent, ton nouveau code te reviendra quelques soirs.", ja:"これから数日、いくつかの夜に新しいコードがあなたのもとへ届きます。" },
  again:   { tr:"21 gün sonra yeniden bak: {d}", en:"Look again in 21 days: {d}", de:"In 21 Tagen noch einmal schauen: {d}", es:"Vuelve a mirar en 21 días: {d}", pt:"Volta a olhar daqui a 21 dias: {d}", fr:"Regarde à nouveau dans 21 jours : {d}", ja:"21日後にもう一度：{d}" },
  againNow:{ tr:"Yeniden bak", en:"Look again", de:"Noch einmal schauen", es:"Volver a mirar", pt:"Voltar a olhar", fr:"Regarder à nouveau", ja:"もう一度見る" },
  ready:   { tr:"21 gün geçti. Kendine bakışın nasıl değişti?", en:"21 days have passed. How has the way you see yourself changed?", de:"21 Tage sind vergangen. Wie hat sich dein Blick auf dich verändert?", es:"Han pasado 21 días. ¿Cómo ha cambiado tu forma de verte?", pt:"Passaram 21 dias. Como mudou a forma como te vês?", fr:"21 jours ont passé. Comment ton regard sur toi a-t-il changé ?", ja:"21日がたちました。自分を見るまなざしはどう変わった？" },
  note:    { tr:"Bu bir test ya da tanı değil, kendine bir bakış. Yanıtların yalnızca bu cihazda kalır.", en:"This is not a test or a diagnosis, just a look at yourself. Your answers stay on this device only.", de:"Das ist kein Test und keine Diagnose, nur ein Blick auf dich. Deine Antworten bleiben nur auf diesem Gerät.", es:"No es un test ni un diagnóstico, solo una mirada hacia ti. Tus respuestas se quedan solo en este dispositivo.", pt:"Não é um teste nem um diagnóstico, só um olhar sobre ti. As tuas respostas ficam apenas neste dispositivo.", fr:"Ce n'est ni un test ni un diagnostic, juste un regard sur toi. Tes réponses restent uniquement sur cet appareil.", ja:"これはテストでも診断でもなく、自分を見つめる時間です。回答はこの端末にだけ残ります。" },
  of:      { tr:"{i} / {n}", en:"{i} / {n}", de:"{i} / {n}", es:"{i} / {n}", pt:"{i} / {n}", fr:"{i} / {n}", ja:"{i} / {n}" },
  back:    { tr:"Geri", en:"Back", de:"Zurück", es:"Atrás", pt:"Voltar", fr:"Retour", ja:"戻る" },
};

export function readSelfLove() { try { const v = JSON.parse(localStorage.getItem(SELFLOVE_KEY) || "null"); return v && v.at ? v : null; } catch (_) { return null; } }

// Alan puanı 0..1 (yüksek = güçlü). Ters maddeler çevrilir. Eşitlikte sabit sıra.
export function scoreSelfLove(ans) {
  const sums = {}, cnt = {};
  SL_ITEMS.forEach((it, i) => {
    const a = ans[i]; if (typeof a !== "number") return;
    const v = it.r ? 3 - a : a;            // 0..3
    sums[it.k] = (sums[it.k] || 0) + v; cnt[it.k] = (cnt[it.k] || 0) + 1;
  });
  const order = ["kind", "bond", "calm", "see"];
  const sc = {}; order.forEach((k) => { sc[k] = cnt[k] ? sums[k] / (cnt[k] * 3) : 0.5; });
  const strong = order.slice().sort((a, b) => sc[b] - sc[a])[0];
  let weak = order.slice().sort((a, b) => sc[a] - sc[b])[0];
  if (weak === strong) weak = order.find((k) => k !== strong);
  return { sc, strong, weak };
}

// Akşam bildirimi yerine giden hatırlatma: yansımadan sonraki 2., 5. ve 9. gün.
export function selfLoveEveningLine(lang, day) {
  const r = readSelfLove(); if (!r || !SL_AREAS[r.weak]) return null;
  const d0 = new Date(r.at); d0.setHours(0, 0, 0, 0);
  const d1 = new Date(day); d1.setHours(0, 0, 0, 0);
  const diff = Math.round((d1 - d0) / 86400000);
  if (![2, 5, 9].includes(diff)) return null;
  const a = SL_AREAS[r.weak];
  return diff === 5 ? P(a.carry, lang) : P(a.neu, lang);
}

export function SelfLoveCard({ lang, onTrack, haptic }) {
  const [res, setRes] = useState(() => readSelfLove());
  const [step, setStep] = useState(-1);      // -1 davet, 0..7 soru
  const [ans, setAns] = useState([]);
  const L = (o) => P(o, lang);
  const GOLD = "#e8c07a", LAV = "#b8a4d8", INK = "#ece6f6", BODY = "#c9c1dc", MUTE = "#8e8e99";
  const JOST = "'Jost',sans-serif", INTER = "'Inter',sans-serif", SERIF = "'Cormorant Garamond',Georgia,serif";
  const BTN = { WebkitAppearance:"none", appearance:"none", font:"inherit", cursor:"pointer", margin:0, display:"inline-flex", alignItems:"center", justifyContent:"center" };
  const box = { marginBottom:20, padding:"18px 18px 16px", borderRadius:16, background:"rgba(232,170,190,0.05)", border:"1px solid rgba(232,170,190,0.22)" };
  const eyebrow = <div style={{ fontFamily:JOST, fontSize:10.5, letterSpacing:3, textTransform:"uppercase", color:"#e0a9bd", marginBottom:8 }}>{L(SL_TXT.eyebrow)}</div>;
  const tap = () => { try { haptic && haptic(); } catch (_) {} };
  const answer = (v) => {
    tap();
    const next = ans.slice(); next[step] = v; setAns(next);
    if (step < SL_ITEMS.length - 1) { setStep(step + 1); return; }
    const sc = scoreSelfLove(next);
    const r = { at: Date.now(), ...sc, a: next };
    try { localStorage.setItem(SELFLOVE_KEY, JSON.stringify(r)); } catch (_) {}
    setRes(r); setStep(-1); setAns([]);
    try { onTrack && onTrack({ a: "done", w: sc.weak }); } catch (_) {}
  };
  const begin = () => { tap(); setAns([]); setStep(0); try { onTrack && onTrack({ a: "start" }); } catch (_) {} };

  if (step >= 0) {
    const it = SL_ITEMS[step];
    return (
      <div style={box}>
        <div style={{ display:"flex", alignItems:"center" }}>
          <div style={{ flex:1 }}>{eyebrow}</div>
          <span style={{ fontFamily:JOST, fontSize:11, color:MUTE, letterSpacing:1 }}>{L(SL_TXT.of).replace("{i}", String(step + 1)).replace("{n}", String(SL_ITEMS.length))}</span>
        </div>
        <div style={{ height:3, borderRadius:3, background:"rgba(255,255,255,0.07)", marginBottom:16, overflow:"hidden" }}>
          <div style={{ width:`${(step / SL_ITEMS.length) * 100}%`, height:"100%", background:"#e0a9bd", transition:"width .3s" }} />
        </div>
        <div key={step} style={{ fontFamily:SERIF, fontSize:21, lineHeight:1.4, color:INK, minHeight:88, animation:"fadeIn .3s ease" }}>{L(it.t)}</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginTop:14 }}>
          {SL_SCALE.map((s, v) => (
            <button key={v} onClick={() => answer(v)} style={{ ...BTN, padding:"12px 8px", borderRadius:12, background:"rgba(255,255,255,0.03)",
              border:"1px solid rgba(224,169,189,0.28)", color:BODY, fontFamily:INTER, fontSize:13.5, textAlign:"center", lineHeight:1.25 }}>{L(s)}</button>
          ))}
        </div>
        {step > 0 && (
          <button onClick={() => { tap(); setStep(step - 1); }} style={{ ...BTN, marginTop:10, padding:"6px 2px", background:"transparent", border:"none",
            color:MUTE, fontFamily:JOST, fontSize:11.5, letterSpacing:1.4, textTransform:"uppercase" }}>{L(SL_TXT.back)}</button>
        )}
      </div>
    );
  }

  if (!res) {
    return (
      <div style={box}>
        {eyebrow}
        <div style={{ fontFamily:SERIF, fontSize:22, lineHeight:1.3, color:INK, marginBottom:6 }}>{L(SL_TXT.invite)}</div>
        <div style={{ fontFamily:INTER, fontSize:13, lineHeight:1.5, color:MUTE, marginBottom:14 }}>{L(SL_TXT.inviteSub)}</div>
        <button onClick={begin} style={{ ...BTN, width:"100%", padding:"12px 14px", borderRadius:100, background:"rgba(224,169,189,0.1)",
          border:"1px solid rgba(224,169,189,0.45)", color:"#f2cbd9", fontFamily:JOST, fontSize:12.5, letterSpacing:1.6, textTransform:"uppercase" }}>{L(SL_TXT.begin)}</button>
      </div>
    );
  }

  const S = SL_AREAS[res.strong], W = SL_AREAS[res.weak];
  const againAt = res.at + 21 * 86400000;
  const ready = Date.now() >= againAt;
  let againDate = "";
  try { againDate = new Date(againAt).toLocaleDateString(lang === "pt" ? "pt-PT" : lang, { day:"numeric", month:"long" }); } catch (_) {}
  const lbl = (t, c) => <div style={{ fontFamily:JOST, fontSize:10, letterSpacing:2.2, textTransform:"uppercase", color:c, marginBottom:4 }}>{t}</div>;
  return (
    <div style={box}>
      {eyebrow}
      {ready && <div style={{ fontFamily:SERIF, fontSize:19, lineHeight:1.4, color:INK, marginBottom:12 }}>{L(SL_TXT.ready)}</div>}
      <div style={{ marginBottom:12 }}>
        {lbl(L(SL_TXT.strong), GOLD)}
        <div style={{ fontFamily:JOST, fontSize:15, color:INK, fontWeight:300, marginBottom:2 }}>{L(S.name)}</div>
        <div style={{ fontFamily:INTER, fontSize:13, lineHeight:1.5, color:BODY }}>{L(S.strong)}</div>
      </div>
      <div style={{ paddingTop:12, borderTop:"1px solid rgba(224,169,189,0.15)", marginBottom:12 }}>
        {lbl(L(SL_TXT.tender), "#e0a9bd")}
        <div style={{ fontFamily:JOST, fontSize:15, color:INK, fontWeight:300, marginBottom:8 }}>{L(W.name)}</div>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          <div style={{ padding:"10px 12px", borderRadius:12, background:"rgba(255,255,255,0.025)", border:"1px dashed rgba(255,255,255,0.12)" }}>
            {lbl(L(SL_TXT.oldCode), MUTE)}
            <div style={{ fontFamily:INTER, fontSize:13, lineHeight:1.5, color:MUTE, textDecoration:"line-through", textDecorationColor:"rgba(255,255,255,0.25)" }}>{L(W.old)}</div>
          </div>
          <div style={{ padding:"10px 12px", borderRadius:12, background:"rgba(224,169,189,0.07)", border:"1px solid rgba(224,169,189,0.3)" }}>
            {lbl(L(SL_TXT.newCode), "#e0a9bd")}
            <div style={{ fontFamily:SERIF, fontSize:18, lineHeight:1.4, color:INK }}>{L(W.neu)}</div>
          </div>
        </div>
      </div>
      <div style={{ paddingTop:12, borderTop:"1px solid rgba(224,169,189,0.15)" }}>
        {lbl(L(SL_TXT.carry), LAV)}
        <div style={{ fontFamily:SERIF, fontStyle:"italic", fontSize:17, lineHeight:1.45, color:"#d9cdf0", marginBottom:8 }}>{L(W.carry)}</div>
        <div style={{ fontFamily:INTER, fontSize:12, lineHeight:1.5, color:MUTE }}>{L(SL_TXT.remind)}</div>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginTop:14, flexWrap:"wrap" }}>
        {!ready && <span style={{ flex:1, minWidth:0, fontFamily:INTER, fontSize:12, color:MUTE }}>{L(SL_TXT.again).replace("{d}", againDate)}</span>}
        {ready && <span style={{ flex:1 }} />}
        <button onClick={begin} style={{ ...BTN, padding:"9px 16px", borderRadius:100, background: ready ? "rgba(224,169,189,0.12)" : "transparent",
          border:`1px solid ${ready ? "rgba(224,169,189,0.5)" : "rgba(255,255,255,0.14)"}`, color: ready ? "#f2cbd9" : BODY,
          fontFamily:JOST, fontSize:11.5, letterSpacing:1.4, textTransform:"uppercase" }}>{L(SL_TXT.againNow)}</button>
      </div>
      <div style={{ fontFamily:INTER, fontSize:11, lineHeight:1.5, color:"#6f6a80", marginTop:12 }}>{L(SL_TXT.note)}</div>
    </div>
  );
}
