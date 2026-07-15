import React, { useMemo, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../theme/colors';
import { useTasarimStore } from '../store/useStore';
import { generateWeeklyReport } from '../utils/weeklyReport';
import { chartHash, hangingGates } from '../utils/personalize';
import { GATES } from '../data/gates';
import { CENTERS, CenterKey } from '../data/centers';
import { L, getLang } from '../i18n';

// AI yorum tabanı: web'de same-origin, iOS embed'de (capacitor://) mutlak URL gerekir.
const AI_BASE = (typeof location !== 'undefined' && location.protocol.indexOf('http') === 0) ? '' : 'https://sakin.life';

interface Props {
  onNavigate: (t: 'home' | 'chart' | 'profile' | 'report') => void;
}

export function ReportScreen({ onNavigate }: Props) {
  const insets = useSafeAreaInsets();
  const { activeProfile, chart } = useTasarimStore();

  const report = useMemo(() => {
    if (!chart) return null;
    return generateWeeklyReport(chart);
  }, [chart]);

  // ── AI KİŞİSEL YORUM (premium) — chart-hash önbellekli, hata durumunda
  //    yukarıdaki deterministik ritüeller zaten ekranda (fallback doğal).
  const aiLang = getLang() === 'en' ? 'en' : 'tr';
  const aiCacheKey = chart ? `hd_ai_v1_${chartHash(chart)}_${aiLang}` : '';
  const [aiText, setAiText] = useState<string>(() => {
    try { return (typeof window !== 'undefined' && (window as any).localStorage?.getItem(aiCacheKey)) || ''; } catch { return ''; }
  });
  const [aiBusy, setAiBusy] = useState(false);
  const [aiErr, setAiErr] = useState(false);
  const isPremium = (() => {
    try { return typeof window !== 'undefined' && (window as any).localStorage?.getItem('sakin_premium') === '1'; }
    catch { return false; }
  })();
  const openPremium = () => {
    try { (window as any).parent?.postMessage({ type: 'sakin-premium-cta' }, '*'); } catch (_) {}
  };
  const fetchAi = async () => {
    if (!chart || aiBusy) return;
    setAiBusy(true); setAiErr(false);
    try {
      const undef = (Object.keys(CENTERS) as CenterKey[]).filter(k => !chart.definedCenters.has(k));
      const summary = {
        type: chart.type, strategy: chart.strategy, authority: chart.authority,
        profile: chart.profile, definition: chart.definition, cross: chart.incarnationCross,
        definedCenters: Array.from(chart.definedCenters).map(k => CENTERS[k as CenterKey]?.name || k),
        undefinedCenters: undef.map(k => ({
          center: CENTERS[k].name,
          hangingGates: hangingGates(chart, k).map(g => ({ gate: g, name: (GATES as any)[g]?.name, gift: (GATES as any)[g]?.gift, shadow: (GATES as any)[g]?.shadow })),
        })),
        channels: chart.activeChannels.map(c => `${c.id} ${c.name}`),
      };
      const system = 'You are Sakin Tasarım\'s Human Design guide: warm, grounded, second-person, no jargon dumps, no medical/financial claims. Use ONLY the chart data provided by the user message — never invent gates, channels or centers that are not listed. Write ONE flowing personal commentary (5-7 sentences): weave together (a) how this person\'s specific hanging gates color their open centers, (b) one concrete daily "reset ritual" tailored to their authority and strongest channel, (c) one gentle strength they can lean on this week. Refer to gates/channels by number and name exactly as given.';
      const r = await fetch(AI_BASE + '/.netlify/functions/ai-call', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system,
          messages: [{ role: 'user', content: 'CHART JSON:\n' + JSON.stringify(summary) + '\n\nBu haritaya özel yorumunu yaz.' }],
          lang: aiLang, max_tokens: 700,
        }),
      });
      const d = await r.json();
      const txt = (d && d.text || '').trim();
      if (!txt) throw new Error('empty');
      setAiText(txt);
      try { (window as any).localStorage?.setItem(aiCacheKey, txt); } catch (_) {}
    } catch (_) { setAiErr(true); }
    setAiBusy(false);
  };

  if (!activeProfile || !chart || !report) {
    return (
      <View style={[styles.empty, { paddingTop: insets.top + 60 }]}>
        <Text style={styles.medallion}>✦</Text>
        <Text style={styles.emptyTitle}>{getLang() === 'en' ? 'A chart is needed for the report' : 'Rapor için harita gerekli'}</Text>
        <Text style={styles.emptyDesc}>
          {getLang() === 'en'
            ? 'Create your profile first; reports are generated from your chart.'
            : 'Önce profilini oluştur; raporlar haritandan üretilir.'}
        </Text>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => onNavigate('profile')}
        >
          <Text style={styles.primaryBtnText}>{getLang() === 'en' ? 'Create Profile →' : 'Profili Oluştur →'}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + Spacing.lg, paddingBottom: Spacing.xxxl }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.kicker}>{getLang() === 'en' ? 'WEEKLY REPORT' : 'HAFTALIK RAPOR'}</Text>
      <Text style={styles.h1}>{report.theme}</Text>
      <Text style={styles.weekLine}>{report.weekLabel} · {report.weekDates}</Text>
      <Text style={styles.themeDesc}>{report.themeDesc}</Text>

      {/* 3'lü ana blok */}
      <View style={styles.triCard}>
        <Text style={styles.triEmoji}>🎯</Text>
        <Text style={styles.triKicker}>{getLang() === 'en' ? 'PAY ATTENTION' : 'DİKKAT ET'}</Text>
        <Text style={styles.triTitle}>{report.attention.title}</Text>
        <Text style={styles.triBody}>{report.attention.body}</Text>
        {!!report.attention.micro && (
          <Text style={styles.triMicro}>· {report.attention.micro}</Text>
        )}
      </View>

      <View style={[styles.triCard, { borderLeftColor: Colors.tealSoft }]}>
        <Text style={styles.triEmoji}>🍃</Text>
        <Text style={[styles.triKicker, { color: Colors.tealSoft }]}>{getLang() === 'en' ? 'LET GO' : 'SERBEST BIRAK'}</Text>
        <Text style={styles.triTitle}>{report.release.title}</Text>
        <Text style={styles.triBody}>{report.release.body}</Text>
        {!!report.release.micro && (
          <Text style={styles.triMicro}>· {report.release.micro}</Text>
        )}
      </View>

      <View style={[styles.triCard, { borderLeftColor: Colors.purpleSoft }]}>
        <Text style={styles.triEmoji}>👑</Text>
        <Text style={[styles.triKicker, { color: Colors.purpleSoft }]}>{getLang() === 'en' ? 'OWN IT' : 'SAHİPLEN'}</Text>
        <Text style={styles.triTitle}>{report.ownership.title}</Text>
        <Text style={styles.triBody}>{report.ownership.body}</Text>
        {!!report.ownership.micro && (
          <Text style={styles.triMicro}>· {report.ownership.micro}</Text>
        )}
      </View>

      {/* Kapı spotlight */}
      <View style={styles.spotCard}>
        <Text style={styles.spotKicker}>{getLang() === 'en' ? 'GATE OF THE WEEK' : 'HAFTANIN KAPISI'}</Text>
        <Text style={styles.spotGate}>
          {report.spotlightGate.number}.{report.spotlightGate.line}
        </Text>
        <Text style={styles.spotName}>{L(GATES[report.spotlightGate.number], 'name') ?? report.spotlightGate.name}</Text>
        <Text style={styles.spotSection}>
          {report.spotlightGate.section === 'personality'
            ? (getLang() === 'en' ? 'Conscious (Personality)' : 'Bilinçli (Personality)')
            : (getLang() === 'en' ? 'Unconscious (Design)' : 'Bilinçsiz (Design)')}
        </Text>
        <Text style={styles.spotTheme}>{L(GATES[report.spotlightGate.number], 'theme') ?? report.spotlightGate.theme}</Text>
        <View style={styles.row2}>
          <View style={{ flex: 1 }}>
            <Text style={styles.miniLabel}>{getLang() === 'en' ? 'GIFT' : 'HEDİYE'}</Text>
            <Text style={styles.miniValue}>{L(GATES[report.spotlightGate.number], 'gift') ?? report.spotlightGate.gift}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.miniLabel}>{getLang() === 'en' ? 'SHADOW' : 'GÖLGE'}</Text>
            <Text style={styles.miniValue}>{L(GATES[report.spotlightGate.number], 'shadow') ?? report.spotlightGate.shadow}</Text>
          </View>
        </View>
      </View>

      <View style={styles.practiceCard}>
        <Text style={styles.practiceKicker}>{getLang() === 'en' ? "THIS WEEK'S PRACTICE" : 'BU HAFTANIN PRATİĞİ'}</Text>
        <Text style={styles.practiceBody}>{report.practice}</Text>
      </View>

      <Text style={styles.affirmation}>“{report.affirmation}”</Text>

      <View style={styles.divider} />
      <Text style={styles.sectionTitle}>{getLang() === 'en' ? 'Specific to Your Chart' : 'Senin Haritana Özel'}</Text>
      <Text style={styles.sectionDesc}>
        {getLang() === 'en'
          ? 'The sections below depend on your birth chart, not the week. They stay the same each week; over time you deepen into them.'
          : 'Aşağıdaki bölümler haftaya değil, doğum haritana bağlıdır. Her hafta aynı kalır; zaman içinde bunlar üzerine derinleşirsin.'}
      </Text>

      {/* Uyumluluk */}
      <View style={styles.bigCard}>
        <Text style={styles.bigKicker}>{getLang() === 'en' ? '🤝 WHO YOU GET ALONG WITH' : '🤝 KİMLERLE ANLAŞIRSIN'}</Text>
        <Text style={styles.bigNote}>{report.compatibility.note}</Text>

        <Text style={styles.subLabel}>{getLang() === 'en' ? 'Compatible energies' : 'Uyumlu enerjiler'}</Text>
        {report.compatibility.getsAlong.map((s, i) => (
          <Text key={i} style={styles.bullet}>•  {s}</Text>
        ))}

        <Text style={[styles.subLabel, { marginTop: Spacing.md, color: Colors.emberSoft }]}>
          {getLang() === 'en' ? '⚡ Energies that create tension' : '⚡ Gerilim yaratan enerjiler'}
        </Text>
        {report.compatibility.tension.map((s, i) => (
          <Text key={i} style={styles.bullet}>•  {s}</Text>
        ))}
      </View>

      {/* Bedeni Dinleme */}
      <View style={styles.bigCard}>
        <Text style={styles.bigKicker}>{getLang() === 'en' ? '🫁 HOW YOU LISTEN TO YOUR BODY' : '🫁 BEDENİNİ NASIL DİNLERSİN'}</Text>
        <Text style={styles.bigTitle}>{report.bodyListening.authorityName}</Text>

        <Text style={styles.subLabel}>{getLang() === 'en' ? 'How the feeling arrives' : 'Hissin nasıl gelir'}</Text>
        <Text style={styles.bigBody}>{report.bodyListening.howToFeel}</Text>

        <Text style={styles.subLabel}>{getLang() === 'en' ? 'Where in the body' : 'Bedenin neresinde'}</Text>
        <Text style={styles.bigBody}>{report.bodyListening.whereInBody}</Text>

        <Text style={[styles.subLabel, { color: Colors.emberSoft }]}>{getLang() === 'en' ? 'Red flag' : 'Kırmızı bayrak'}</Text>
        <Text style={styles.bigBody}>{report.bodyListening.redFlag}</Text>

        <Text style={[styles.subLabel, { color: Colors.success }]}>{getLang() === 'en' ? 'Reset' : 'Reset'}</Text>
        <Text style={styles.bigBody}>{report.bodyListening.reset}</Text>
      </View>

      {/* Uyarı işaretleri */}
      <View style={[styles.bigCard, { borderColor: Colors.emberSoft + '40' }]}>
        <Text style={[styles.bigKicker, { color: Colors.emberSoft }]}>{getLang() === 'en' ? '🚨 WARNING SIGNS' : '🚨 UYARI İŞARETLERİ'}</Text>
        <Text style={styles.bigNote}>
          {getLang() === 'en'
            ? 'Bodily/emotional signals that show you are off course. These are not your enemy — they are your guide.'
            : 'Yanlış yönde olduğunu gösteren bedensel/duygusal sinyaller. Bunlar düşmanın değil, rehberin.'}
        </Text>

        <Text style={styles.subLabel}>{getLang() === 'en' ? 'Signs from your type' : 'Tipinden gelen işaretler'}</Text>
        {report.warnings.typeSigns.map((s, i) => (
          <Text key={i} style={styles.bullet}>•  {s}</Text>
        ))}

        {report.warnings.centerSigns.length > 0 && (
          <>
            <Text style={[styles.subLabel, { marginTop: Spacing.md }]}>
              {getLang() === 'en' ? 'Questions from your undefined centers' : 'Tanımsız merkezlerinden gelen sorular'}
            </Text>
            {report.warnings.centerSigns.map((s, i) => (
              <View key={i} style={styles.warningRow}>
                <Text style={styles.warningTitle}>{s.title}</Text>
                <Text style={styles.warningBody}>{s.body}</Text>
                {!!s.micro && <Text style={styles.warningMicro}>{s.micro}</Text>}
              </View>
            ))}
          </>
        )}
      </View>

      {/* Söndürme ritüelleri */}
      <View style={[styles.bigCard, { borderColor: Colors.success + '40' }]}>
        <Text style={[styles.bigKicker, { color: Colors.success }]}>{getLang() === 'en' ? '🌿 PUTTING OUT THE WARNING LIGHTS' : '🌿 İKAZ LAMBALARINI SÖNDÜRME'}</Text>
        <Text style={styles.bigNote}>
          {getLang() === 'en'
            ? 'Concrete reset rituals to apply when the warning signs start lighting up.'
            : 'Uyarı işaretleri yanmaya başladığında uygulanacak somut sıfırlama ritüelleri.'}
        </Text>
        {report.warnings.resets.map((s, i) => (
          <Text key={i} style={styles.bullet}>•  {s}</Text>
        ))}
      </View>

      {/* ✦ AI KİŞİSEL YORUM — haritaya özel derin yorum (premium; chart-hash önbellekli) */}
      <View style={[styles.bigCard, { borderColor: 'rgba(201,168,76,0.4)' }]}>
        <Text style={[styles.bigKicker, { color: Colors.gold }]}>{getLang() === 'en' ? '✦ PERSONAL AI READING' : '✦ HARİTANA ÖZEL AI YORUMU'}</Text>
        <Text style={styles.bigNote}>
          {getLang() === 'en'
            ? 'A one-of-a-kind commentary woven from your exact gates, channels and authority — no two charts get the same words.'
            : 'Tam olarak senin kapıların, kanalların ve yetkinden dokunan, eşi olmayan bir yorum — iki harita aynı cümleleri görmez.'}
        </Text>
        {!isPremium ? (
          <TouchableOpacity onPress={openPremium} activeOpacity={0.85}
            style={{ borderWidth: 1, borderColor: Colors.gold, borderRadius: 999, paddingVertical: 12, alignItems: 'center', marginTop: 6 }}>
            <Text style={{ color: Colors.gold, letterSpacing: 1 }}>{getLang() === 'en' ? '🔒 Unlock with Premium' : '🔒 Premium ile aç'}</Text>
          </TouchableOpacity>
        ) : aiText ? (
          <>
            <Text style={[styles.bullet, { lineHeight: 22 }]}>{aiText}</Text>
            <TouchableOpacity onPress={fetchAi} disabled={aiBusy} activeOpacity={0.7} style={{ marginTop: 10, alignSelf: 'center' }}>
              <Text style={{ color: Colors.textMuted, fontSize: 12, letterSpacing: 1 }}>{aiBusy ? '…' : (getLang() === 'en' ? '↻ Regenerate' : '↻ Yeniden üret')}</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity onPress={fetchAi} disabled={aiBusy} activeOpacity={0.85}
            style={{ borderWidth: 1, borderColor: Colors.gold, borderRadius: 999, paddingVertical: 12, alignItems: 'center', marginTop: 6, opacity: aiBusy ? 0.6 : 1 }}>
            <Text style={{ color: Colors.gold, letterSpacing: 1 }}>{aiBusy ? (getLang() === 'en' ? 'Weaving your reading…' : 'Yorumun dokunuyor…') : (getLang() === 'en' ? '✦ Create my reading' : '✦ Yorumumu oluştur')}</Text>
          </TouchableOpacity>
        )}
        {aiErr && (
          <Text style={{ color: Colors.textMuted, fontSize: 12, marginTop: 8, textAlign: 'center' }}>
            {getLang() === 'en' ? 'Could not reach the sky right now — the rituals above are fully yours meanwhile.' : 'Şu an üretilemedi — yukarıdaki ritüeller zaten tamamen sana özel.'}
          </Text>
        )}
      </View>

      <Text style={styles.footerNote}>
        {getLang() === 'en'
          ? 'The weekly theme, the attention / let-go / own-it blocks, the gate, the practice AND the warning signs are all woven from your unique chart — they shift with the week and with you.'
          : 'Haftalık tema, dikkat / bırak / sahiplen blokları, kapı, pratik VE uyarı işaretleri — hepsi senin benzersiz haritandan dokunur; haftayla ve seninle değişir.'}
      </Text>

      <View style={styles.disclaimerBox}>
        <Text style={styles.disclaimerText}>
          {getLang() === 'en'
            ? 'Sakin Tasarım is for education and personal exploration. The content is not medical diagnosis, psychological therapy, financial advice or fortune-telling. Seek professional support for health, mental health and major life decisions.'
            : 'Sakin Tasarım eğitim ve kişisel keşif amaçlıdır. İçerik tıbbi tanı, psikolojik terapi, finansal danışmanlık veya kehanet niteliği taşımaz. Sağlık, ruh sağlığı ve yaşamsal kararlar için profesyonel destek al.'}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: Spacing.lg },

  empty: {
    flex: 1, alignItems: 'center', backgroundColor: Colors.background, paddingHorizontal: Spacing.xl,
  },
  medallion: {
    fontSize: 64, color: Colors.gold, marginBottom: Spacing.lg, opacity: 0.85,
  },
  emptyTitle: {
    fontSize: Typography.size.xxl, color: Colors.text,
    fontFamily: Typography.font.serif, marginBottom: Spacing.md,
  },
  emptyDesc: {
    fontSize: Typography.size.md, color: Colors.textSecondary,
    textAlign: 'center', lineHeight: Typography.size.md * 1.6, marginBottom: Spacing.xl,
  },
  primaryBtn: {
    backgroundColor: Colors.gold,
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md,
    borderRadius: BorderRadius.round,
  },
  primaryBtnText: {
    color: Colors.background, fontWeight: Typography.weight.bold,
  },

  kicker: { fontSize: 10, letterSpacing: 2, color: Colors.gold },
  h1: {
    fontSize: Typography.size.xxxl, color: Colors.text,
    fontFamily: Typography.font.serif, marginTop: 4,
  },
  weekLine: {
    fontSize: Typography.size.xs, letterSpacing: 1, color: Colors.textMuted,
    marginTop: 2,
  },
  themeDesc: {
    fontSize: Typography.size.md, color: Colors.textSecondary,
    lineHeight: Typography.size.md * 1.6,
    marginTop: Spacing.md, marginBottom: Spacing.lg,
  },

  triCard: {
    paddingVertical: Spacing.lg,
    marginBottom: 0,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  triEmoji: { fontSize: 26, marginBottom: 4 },
  triKicker: {
    fontSize: 10, letterSpacing: 1.6, color: Colors.gold, marginBottom: 4,
  },
  triTitle: {
    fontSize: Typography.size.lg, color: Colors.text,
    fontWeight: Typography.weight.semibold,
    fontFamily: Typography.font.serif,
    marginBottom: 4,
  },
  triBody: {
    fontSize: Typography.size.sm, color: Colors.textSecondary,
    lineHeight: Typography.size.sm * 1.6,
  },
  triMicro: {
    fontSize: Typography.size.xs, color: Colors.textMuted,
    marginTop: Spacing.sm, fontStyle: 'italic',
  },

  spotCard: {
    paddingVertical: Spacing.xl,
    marginVertical: Spacing.lg,
    alignItems: 'center',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.divider,
  },
  spotKicker: { fontSize: 10, letterSpacing: 1.6, color: Colors.gold },
  spotGate: {
    fontSize: Typography.size.display, color: Colors.gold,
    fontFamily: Typography.font.serif, fontWeight: Typography.weight.bold,
  },
  spotName: {
    fontSize: Typography.size.lg, color: Colors.text,
    fontWeight: Typography.weight.semibold,
  },
  spotSection: {
    fontSize: 10, letterSpacing: 1, color: Colors.textMuted, marginTop: 2,
  },
  spotTheme: {
    fontSize: Typography.size.sm, color: Colors.textSecondary,
    marginTop: Spacing.sm, textAlign: 'center', lineHeight: Typography.size.sm * 1.5,
  },
  row2: {
    flexDirection: 'row', alignSelf: 'stretch', marginTop: Spacing.md, gap: Spacing.md,
  },
  miniLabel: { fontSize: 9, letterSpacing: 1, color: Colors.textMuted },
  miniValue: { fontSize: Typography.size.xs, color: Colors.text, marginTop: 2 },

  practiceCard: {
    paddingVertical: Spacing.lg,
    marginBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  practiceKicker: {
    fontSize: 10, letterSpacing: 1.6, color: Colors.tealSoft, marginBottom: 4,
  },
  practiceBody: {
    fontSize: Typography.size.md, color: Colors.text,
    lineHeight: Typography.size.md * 1.6,
  },

  affirmation: {
    fontSize: Typography.size.md, color: Colors.gold,
    fontFamily: Typography.font.serif, fontStyle: 'italic',
    textAlign: 'center', marginVertical: Spacing.lg,
    lineHeight: Typography.size.md * 1.6,
  },

  divider: {
    height: 1, backgroundColor: Colors.divider, marginVertical: Spacing.lg,
  },

  sectionTitle: {
    fontSize: Typography.size.xl, color: Colors.text,
    fontFamily: Typography.font.serif,
  },
  sectionDesc: {
    fontSize: Typography.size.sm, color: Colors.textMuted,
    marginTop: 4, marginBottom: Spacing.md,
    lineHeight: Typography.size.sm * 1.5,
  },

  bigCard: {
    paddingVertical: Spacing.lg,
    marginBottom: 0,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  bigKicker: {
    fontSize: 11, letterSpacing: 1.6, color: Colors.gold, marginBottom: 4,
  },
  bigTitle: {
    fontSize: Typography.size.lg, color: Colors.text,
    fontFamily: Typography.font.serif, marginBottom: 4,
  },
  bigNote: {
    fontSize: Typography.size.sm, color: Colors.textSecondary,
    lineHeight: Typography.size.sm * 1.6, marginBottom: Spacing.sm,
  },
  bigBody: {
    fontSize: Typography.size.sm, color: Colors.textSecondary,
    lineHeight: Typography.size.sm * 1.6,
  },
  subLabel: {
    fontSize: 10, letterSpacing: 1.4, color: Colors.gold,
    marginTop: Spacing.sm, marginBottom: 4,
  },
  bullet: {
    fontSize: Typography.size.sm, color: Colors.textSecondary,
    lineHeight: Typography.size.sm * 1.6, marginBottom: 2,
  },

  warningRow: {
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  warningTitle: {
    fontSize: Typography.size.sm, color: Colors.text,
    fontWeight: Typography.weight.semibold,
  },
  warningBody: {
    fontSize: Typography.size.sm, color: Colors.textSecondary,
    lineHeight: Typography.size.sm * 1.5, marginTop: 2,
  },
  warningMicro: {
    fontSize: Typography.size.xs, color: Colors.success,
    marginTop: 4, fontStyle: 'italic',
  },

  footerNote: {
    fontSize: Typography.size.xs, color: Colors.textMuted,
    textAlign: 'center', marginTop: Spacing.lg,
    lineHeight: Typography.size.xs * 1.6, fontStyle: 'italic',
  },
  disclaimerBox: {
    marginTop: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  disclaimerText: {
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
    lineHeight: Typography.size.xs * 1.7,
    fontStyle: 'italic',
  },
});
