import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Linking,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius } from '../theme/colors';
import { useSakinHayvanStore } from '../store/useStore';
import { useLocalizedStones } from '../i18n/localize';
import stonesData from '../data/plants.json';
import stoneZodiac from '../data/stoneZodiac.json';
import { AnimalDetailScreen } from './AnimalDetailScreen';
import { shareCard, isShareable } from '../utils/shareCard';
import { calcNumerology, LIFE_PATH_MEANINGS } from '../utils/numerology';
import { getHDProfile } from '../utils/humanDesign';
import { getWeeklyReading } from '../utils/weeklyReading';
import { PaywallScreen } from './PaywallScreen';
import { usePremium, devClearPremiumCache, devSetMockPremium } from '../lib/premium';
import { redeemLicenseKey } from '../lib/entitlement';
import { HelpButton } from '../components/HelpButton';
import { scheduleDailyReminder, cancelDailyReminder, requestNotificationPermissionWithRationale } from '../lib/notifications';
import { useI18n } from '../i18n/useI18n';

// Embed → Sakin host köprüsü. Aile uygulamaları sakin.life içinde tam-ekran iframe
// olarak açılır; eski netlify linklerini açmak yerine host'a postMessage yollayıp
// kardeş uygulamayı IN-APP açtırırız (iframe içinde Safari'ye çıkmak App Store 4.2
// riski + kafa karıştırıcı). Native'de (standalone app) fallback olarak link açılır.
function postToHost(payload: object, fallbackUrl?: string) {
  try {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.parent && window.parent !== window) {
      window.parent.postMessage(payload, window.location.origin);
      return;
    }
  } catch { /* ignore */ }
  if (fallbackUrl) Linking.openURL(fallbackUrl).catch(() => {});
}

function hdTypeToGlossaryKey(type: string): string {
  switch (type) {
    case 'Jeneratör':             return 'jeneratör';
    case 'Manifesting Jeneratör': return 'manifestingJeneratör';
    case 'Projektör':             return 'projektör';
    case 'Manifestor':            return 'manifestor';
    case 'Reflektör':             return 'reflektör';
    default:                       return 'humanDesign';
  }
}

const ELEMENTS = ['ateş', 'su', 'toprak', 'hava'] as const;
const ELEMENT_EMOJIS: Record<string, string> = {
  ateş: '△', su: '▽', toprak: '⊕', hava: '○'
};

const BADGES = [
  { id: 'b001', title: 'Yol Başlangıcı', desc: 'İlk 7 okuma',   emoji: '☾', required: 7 },
  { id: 'b002', title: 'Ateş Dervişi',   desc: '21 gün silsile', emoji: '△', required: 21 },
  { id: 'b003', title: 'Mesnevi Yolcusu',desc: '30 okuma',       emoji: '❀', required: 30 },
  { id: 'b004', title: 'Tesbih',         desc: '33 taş görüldü', emoji: '◌', required: 33 },
  { id: 'b005', title: 'Hak Dostu',      desc: '100 okuma',      emoji: '✦',  required: 100 },
  { id: 'b006', title: 'ışık Yolcusu',   desc: '365 okuma',      emoji: '☀', required: 365 },
];

const HD_TYPE_EN: Record<string, string> = {
  'Jeneratör': 'Generator',
  'Manifesting Jeneratör': 'Manifesting Generator',
  'Projektör': 'Projector',
  'Manifestor': 'Manifestor',
  'Reflektör': 'Reflector',
};

const HD_STRATEGY_EN: Record<string, string> = {
  'Yanıt vermek': 'Respond',
  'Yanıt ver, sonra harekete geç': 'Respond, then Act',
  'Davetleri beklemek': 'Wait for Invitation',
  'Bildirmek': 'Inform',
  '28 gün beklemek': 'Wait 28 Days',
};

export function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { profile, isNewUser, bridgePrefill, createProfile, updateBirthData, updateHDType, stats, getTopStat, getLevelTitle, session, signOut, deleteAccount, setLanguage, language } = useSakinHayvanStore();
  const { t, lang } = useI18n();
  const premium = usePremium();
  const [showPaywall, setShowPaywall] = useState(false);
  const [remindersOn, setRemindersOn] = useState(false);
  const [licenseKey, setLicenseKey] = useState('');
  const [licenseStatus, setLicenseStatus] = useState<'idle' | 'busy' | 'ok' | 'error'>('idle');
  const [licenseMsg, setLicenseMsg] = useState('');

  // ── SAKİN HOST KÖPRÜSÜ, onboarding kısayolu ──────────────────────────────
  // Host ad + doğum verdiyse onboarding TEK ekrana iner: yalnızca element seçici.
  // Ad (step 1) ve doğum (step 3) ekranları gösterilmez; değerler host'tan gelir.
  // Element doğumdan türetilemez (arketip hesabını bozar), onu kullanıcı seçer.
  const ELEMENT_STEP = 2;
  const bridged = !!(bridgePrefill?.name);
  const bridgeDateParts = (() => {
    const bd = bridgePrefill?.birthDate;
    const m = bd ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(bd) : null;
    return m ? { y: m[1], m: m[2], d: m[3] } : { d: '', m: '', y: '' };
  })();

  const [showOnboarding, setShowOnboarding] = useState(isNewUser);
  const [name, setName] = useState(bridgePrefill?.name ?? '');
  const [element, setElement] = useState<typeof ELEMENTS[number]>('ateş');
  const [step, setStep] = useState(bridged ? ELEMENT_STEP : 1);

  // step 3 birth data, köprüden gelen değerlerle ön-doldurulur
  const [fullName, setFullName] = useState(bridgePrefill?.name ?? '');
  const [birthDay, setBirthDay] = useState(bridgeDateParts.d);
  const [birthMonth, setBirthMonth] = useState(bridgeDateParts.m);
  const [birthYear, setBirthYear] = useState(bridgeDateParts.y);
  const [birthHour, setBirthHour] = useState(bridgePrefill?.birthHour != null ? String(bridgePrefill.birthHour).padStart(2, '0') : '');
  const [birthMinuteOb, setBirthMinuteOb] = useState(bridgePrefill?.birthMinute != null ? String(bridgePrefill.birthMinute).padStart(2, '0') : '');
  const [birthCity, setBirthCity] = useState(bridgePrefill?.birthCity ?? '');

  // inline birth data edit (when already profiled but no birth data)
  const [showBirthForm, setShowBirthForm] = useState(false);
  const [showHDPicker, setShowHDPicker] = useState(false);
  const [editFullName, setEditFullName] = useState('');
  const [editDay, setEditDay] = useState('');
  const [editMonth, setEditMonth] = useState('');
  const [editYear, setEditYear] = useState('');
  const [editHour, setEditHour] = useState('');
  const [editMinute, setEditMinute] = useState('');
  const [editCity, setEditCity] = useState('');

  const localStones = useLocalizedStones();

  const [detailStone, setDetailStone] = useState<typeof stonesData[0] | null>(null);

  // Doğum taşı/bitkisi: ay bazlı zodyak eşlemesinden (aynı mantık
  // AnimalFinderScreen'de kullanılıyor). "en çok çıkan" (topStone) ile
  // KARIŞTIRILMASIN: bu, doğum ayından SABİT hesaplanan rehber (kullanıcı:
  // "kişinin doğum taşı/bitkisi profilde gözüksün").
  const birthStones = useMemo(() => {
    if (!profile?.birthDate) return [] as typeof stonesData;
    const parts = profile.birthDate.split('-');
    const m = parseInt(parts[1]);
    if (!(m >= 1 && m <= 12)) return [] as typeof stonesData;
    const ids = (stoneZodiac.monthStones as Record<string, string[]>)[String(m)] || [];
    const byId = new Map((localStones as typeof stonesData).map(s => [s.id, s]));
    return ids.map(id => byId.get(id)).filter(Boolean) as typeof stonesData;
  }, [profile?.birthDate, localStones]);

  const topStoneId  = getTopStat(stats.stoneCounts);
  const topSource   = getTopStat(stats.sourceCounts);

  const topStone  = topStoneId  ? localStones.find(s => s.id === topStoneId)  : null;

  const totalReadings = profile?.totalReadings || 0;
  const streak        = profile?.streak || 0;
  const level         = profile?.level || 1;
  const levelTitle = lang === 'en'
    ? ['Seeker','Disciple','Dervish','Enlightened','Saint','Elder','Pole Star'][Math.min(level - 1, 6)]
    : getLevelTitle(level);
  const nextLevelTitle = lang === 'en'
    ? ['Seeker','Disciple','Dervish','Enlightened','Saint','Elder','Pole Star'][Math.min(level, 6)]
    : getLevelTitle(level + 1);

  const getLevelTitleLocal = (lvl: number) => {
    const enTitles = ['Seeker', 'Disciple', 'Dervish', 'Enlightened', 'Saint', 'Elder', 'Pole Star'];
    if (lang === 'en') return enTitles[Math.min(lvl - 1, enTitles.length - 1)];
    return getLevelTitle(lvl);
  };

  const levelProgress = () => {
    const nextAt    = level * 7;
    const currentAt = (level - 1) * 7;
    return Math.min(Math.max((totalReadings - currentAt) / (nextAt - currentAt), 0), 1);
  };

  // compute analysis when birth data is present
  const analysis = useMemo(() => {
    // İsim host'tan gelir; yoksa görünen ada düş: embed ASLA doğum/profil formu
    // sormaz, host (giriş + Sakin Ailesi) doğum bilgisinin sahibidir.
    const nm = profile?.fullName || profile?.name;
    if (!nm || !profile?.birthDate) return null;
    try {
      const nums   = calcNumerology(nm, profile.birthDate);
      const hd     = getHDProfile(
        profile.birthDate,
        profile.birthHour,
        profile.birthMinute,
        profile.hdTypeOverride,
      );
      if (profile.hdTypeOverride) {
        hd.type = profile.hdTypeOverride as typeof hd.type;
      }
      const weekly = getWeeklyReading(nums);
      const lp     = LIFE_PATH_MEANINGS[nums.lifePath];
      return { nums, hd, weekly, lp };
    } catch {
      return null;
    }
  }, [profile?.fullName, profile?.birthDate, profile?.hdTypeOverride]);

  const formatBirthDate = (d: string, m: string, y: string) => {
    const dd = d.padStart(2, '0');
    const mm = m.padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  };

  const birthDataValid = (d: string, m: string, y: string) =>
    parseInt(d) >= 1 && parseInt(d) <= 31 &&
    parseInt(m) >= 1 && parseInt(m) <= 12 &&
    parseInt(y) >= 1900 && parseInt(y) <= new Date().getFullYear();

  // ── Onboarding ────────────────────────────────────────────────────────────────────────

  const handleOnboarding = async () => {
    // KÖPRÜ AKIŞI: element seçildi → host'tan gelen ad + doğum ile profili kur.
    // step 3 (doğum formu) hiç gösterilmez/girilmez.
    if (bridged) {
      const bp = bridgePrefill!;
      await createProfile(
        (bp.name ?? '').trim() || 'Sakin', element, bp.birthDate,
        (bp.name ?? '').trim() || undefined,
        bp.birthHour, bp.birthMinute, bp.birthCity,
      );
      setShowOnboarding(false);
      return;
    }
    if (step === 1 && name.trim().length > 0) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      const bd = birthDataValid(birthDay, birthMonth, birthYear)
        ? formatBirthDate(birthDay, birthMonth, birthYear)
        : undefined;
      const h  = parseInt(birthHour);
      const mi = parseInt(birthMinuteOb);
      await createProfile(
        name.trim(), element, bd, fullName.trim() || undefined,
        !isNaN(h)  && h  >= 0 && h  <= 23 ? h  : undefined,
        !isNaN(mi) && mi >= 0 && mi <= 59  ? mi : undefined,
        birthCity.trim() || undefined,
      );
      setShowOnboarding(false);
    }
  };

  const handleSkipBirth = async () => {
    await createProfile(name.trim(), element);
    setShowOnboarding(false);
  };

  const handleSaveBirthData = async () => {
    if (!birthDataValid(editDay, editMonth, editYear)) return;
    const bd = formatBirthDate(editDay, editMonth, editYear);
    const h = parseInt(editHour);
    const mi = parseInt(editMinute);
    await updateBirthData(
      editFullName.trim(),
      bd,
      !isNaN(h) && h >= 0 && h <= 23 ? h : undefined,
      !isNaN(mi) && mi >= 0 && mi <= 59 ? mi : undefined,
      editCity.trim() || undefined,
    );
    setShowBirthForm(false);
  };

  // ── Onboarding modal ─────────────────────────────────────────────────────────────────

  if (showOnboarding || isNewUser) {
    return (
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: Colors.background }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Scrollable content */}
        <ScrollView
          style={{ flex: 1, paddingTop: insets.top }}
          contentContainerStyle={styles.onboardingScroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.onboardingEmoji}>☾</Text>
          <Text style={styles.onboardingTitle}>{t('profile.onboarding.title')}</Text>
          <Text style={styles.onboardingSubtitle}>
            {t('profile.onboarding.subtitle')}
          </Text>

          {step === 1 && (
            <>
              <Text style={styles.onboardingQuestion}>{t('profile.onboarding.step1Question')}</Text>
              <TextInput
                style={styles.nameInput}
                value={name}
                onChangeText={setName}
                placeholder={t('profile.onboarding.step1Placeholder')}
                placeholderTextColor={Colors.textMuted}
                autoFocus
              />
            </>
          )}

          {step === 2 && (
            <>
              <Text style={styles.onboardingQuestion}>{t('profile.onboarding.step2Question')}</Text>
              <View style={styles.elementsGrid}>
                {ELEMENTS.map(el => (
                  <TouchableOpacity
                    key={el}
                    style={[styles.elementBtn, element === el && styles.elementBtnActive]}
                    onPress={() => setElement(el)}
                  >
                    <Text style={styles.elementEmoji}>{ELEMENT_EMOJIS[el]}</Text>
                    <Text style={[styles.elementName, { color: element === el ? Colors.gold : Colors.textSecondary }]}>
                      {el.charAt(0).toUpperCase() + el.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {step === 3 && (
            <>
              <Text style={styles.onboardingQuestion}>{t('profile.onboarding.step3Question')}</Text>
              <Text style={styles.onboardingHint}>
                {t('profile.onboarding.step3Hint')}
              </Text>
              <TextInput
                style={styles.nameInput}
                value={fullName}
                onChangeText={setFullName}
                placeholder={t('profile.onboarding.fullNamePlaceholder')}
                placeholderTextColor={Colors.textMuted}
                autoCapitalize="words"
              />
              <Text style={styles.obFieldLabel}>{t('profile.onboarding.birthDateLabel')}</Text>
              <View style={styles.dateRow}>
                <TextInput
                  style={[styles.dateInput, { flex: 1 }]}
                  value={birthDay}
                  onChangeText={setBirthDay}
                  placeholder={t('profile.onboarding.dayPlaceholder')}
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="number-pad"
                  maxLength={2}
                />
                <TextInput
                  style={[styles.dateInput, { flex: 1 }]}
                  value={birthMonth}
                  onChangeText={setBirthMonth}
                  placeholder={t('profile.onboarding.monthPlaceholder')}
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="number-pad"
                  maxLength={2}
                />
                <TextInput
                  style={[styles.dateInput, { flex: 2 }]}
                  value={birthYear}
                  onChangeText={setBirthYear}
                  placeholder={t('profile.onboarding.yearPlaceholder')}
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="number-pad"
                  maxLength={4}
                />
              </View>
              <Text style={styles.obFieldLabel}>
                {t('profile.onboarding.birthHourLabel')} <Text style={styles.obFieldOpt}>{t('profile.onboarding.hourOptional')}</Text>
              </Text>
              <View style={styles.dateRow}>
                <TextInput
                  style={[styles.dateInput, { flex: 1 }]}
                  value={birthHour}
                  onChangeText={setBirthHour}
                  placeholder={t('profile.onboarding.hourPlaceholder')}
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="number-pad"
                  maxLength={2}
                />
                <Text style={styles.obTimeSep}>:</Text>
                <TextInput
                  style={[styles.dateInput, { flex: 1 }]}
                  value={birthMinuteOb}
                  onChangeText={setBirthMinuteOb}
                  placeholder={t('profile.onboarding.minutePlaceholder')}
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="number-pad"
                  maxLength={2}
                />
                <View style={{ flex: 2 }} />
              </View>
              <Text style={styles.obFieldLabel}>
                {t('profile.onboarding.birthCityLabel')} <Text style={styles.obFieldOpt}>{t('profile.onboarding.cityOptional')}</Text>
              </Text>
              <TextInput
                style={[styles.nameInput, { marginBottom: Spacing.xl }]}
                value={birthCity}
                onChangeText={setBirthCity}
                placeholder={t('profile.onboarding.cityPlaceholder')}
                placeholderTextColor={Colors.textMuted}
                autoCapitalize="words"
              />
            </>
          )}
        </ScrollView>

        {/* Pinned CTA at bottom */}
        <View style={[styles.onboardingFooter, { paddingBottom: insets.bottom + Spacing.md }]}>
          <TouchableOpacity
            style={[styles.onboardingBtn, { opacity: step === 1 && name.trim().length === 0 ? 0.4 : 1 }]}
            onPress={handleOnboarding}
            disabled={step === 1 && name.trim().length === 0}
          >
            <Text style={styles.onboardingBtnText}>
              {bridged || step >= 3 ? t('profile.onboarding.startBtn') : t('profile.onboarding.continueBtn')}
            </Text>
          </TouchableOpacity>
          {step === 3 && (
            <TouchableOpacity onPress={handleSkipBirth} style={styles.skipBtn}>
              <Text style={styles.skipText}>{t('profile.onboarding.skipBtn')}</Text>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    );
  }

  if (!profile) return null;

  if (detailStone) {
    return <AnimalDetailScreen stone={detailStone} onClose={() => setDetailStone(null)} />;
  }

  if (showPaywall) {
    return (
      <PaywallScreen
        onClose={() => setShowPaywall(false)}
        onActivated={() => { premium.refresh(); setShowPaywall(false); }}
      />
    );
  }

  const toggleReminders = async (val: boolean) => {
    if (val) {
      const granted = await requestNotificationPermissionWithRationale({
        title: t('profile.notif.rationaleTitle' as any),
        message: t('profile.notif.rationaleMessage' as any),
        confirm: t('profile.notif.rationaleConfirm' as any),
        cancel: t('profile.notif.rationaleCancel' as any),
      });
      if (!granted) return;
      await scheduleDailyReminder(8, 0);
      setRemindersOn(true);
    } else {
      await cancelDailyReminder();
      setRemindersOn(false);
    }
  };

  const handleLicenseRedeem = async () => {
    if (!licenseKey.trim()) return;
    if (!session) {
      setLicenseStatus('error');
      setLicenseMsg(t('profile.account.licenseSignInRequired' as any));
      return;
    }
    setLicenseStatus('busy');
    setLicenseMsg('');
    const result = await redeemLicenseKey(licenseKey);
    if (result.success) {
      setLicenseStatus('ok');
      setLicenseMsg(result.alreadyActive
        ? t('profile.account.licenseAlready' as any)
        : t('profile.account.licenseSuccess' as any));
      setLicenseKey('');
      premium.refresh();
    } else {
      setLicenseStatus('error');
      const msgKey = result.error === 'not-authenticated' ? 'licenseSignInRequired'
        : result.error === 'network' ? 'licenseNetwork'
        : 'licenseInvalid';
      setLicenseMsg(t(`profile.account.${msgKey}` as any));
    }
  };

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero */}
      <View style={styles.hero}>
        <View style={styles.avatarRing}>
          <View style={styles.avatar}>
            <Text style={styles.avatarEmoji}>{ELEMENT_EMOJIS[profile.element || 'ateş']}</Text>
          </View>
        </View>
        <Text style={styles.heroName}>{profile.name}</Text>
        <Text style={styles.heroLevel}>{levelTitle}</Text>
        <Text style={styles.heroElement}>
          {ELEMENT_EMOJIS[profile.element || 'ateş']} {profile.element || t('profile.elementNotSet')}
        </Text>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{totalReadings}</Text>
          <Text style={styles.statLabel}>{t('profile.stats.totalReadings')}</Text>
        </View>
        <View style={[styles.statBox, styles.statBoxCenter]}>
          <Text style={[styles.statValue, { color: Colors.ember }]}>△ {streak}</Text>
          <Text style={styles.statLabel}>{t('profile.stats.streak')}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{level}</Text>
          <Text style={styles.statLabel}>{t('profile.stats.level')}</Text>
        </View>
      </View>

      {/* Level progress */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('profile.levelProgress')}</Text>
          <Text style={styles.sectionMeta}>{levelTitle} → {nextLevelTitle}</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${levelProgress() * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {t('profile.readingsProgress').replace('{current}', String(totalReadings)).replace('{next}', String(level * 7))}
        </Text>
      </View>

      {/* Bildirimler kaldırıldı (kullanıcı geri bildirimi): hatırlatmalar host Sakin
          uygulaması tarafından yönetiliyor (08:00 günlük); embed'de ayrı/çakışan
          bildirim sistemi gereksizdi. */}

      {/* ── Kişisel Harita ── */}
      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>{t('profile.personalMap.title')}</Text>
          {/* Doğum bilgisi düzenleme embed'de GİZLİ: doğum bilgisi yalnızca host
              (Sakin giriş + Sakin Ailesi paneli) üzerinden girilir/değiştirilir.
              Embed sadece rehberlik gösterir, hiçbir doğum alanı göstermez. */}
        </View>

        {analysis ? (
          <>
            {/* Life Path */}
            <View style={[styles.analysisCard, { borderColor: Colors.gold + '60' }]}>
              <View style={styles.analysisHeader}>
                <View style={[styles.analysisBadge, { backgroundColor: Colors.goldGlow }]}>
                  <Text style={[styles.analysisBadgeNum, { color: Colors.gold }]}>
                    {analysis.nums.lifePath}
                  </Text>
                </View>
                <View style={styles.analysisHeaderText}>
                  <View style={styles.titleRow}>
                    <Text style={[styles.analysisTitle, { color: Colors.gold }]}>
                      {analysis.lp.title}
                    </Text>
                    <HelpButton termKey="hayatYolu" />
                  </View>
                  <Text style={styles.analysisMeta}>
                    {`${t('profile.personalMap.lifePath')} · ${analysis.lp.keyword}`}
                  </Text>
                </View>
              </View>
              <Text style={styles.analysisDesc}>{analysis.lp.desc}</Text>
              <View style={styles.subNums}>
                <View style={styles.subNum}>
                  <Text style={[styles.subNumVal, { color: Colors.goldLight }]}>{analysis.nums.expression}</Text>
                  <Text style={styles.subNumLabel}>{t('profile.personalMap.expression')}</Text>
                </View>
                <View style={styles.subNum}>
                  <Text style={[styles.subNumVal, { color: Colors.goldLight }]}>{analysis.nums.soulUrge}</Text>
                  <Text style={styles.subNumLabel}>{t('profile.personalMap.soulUrge')}</Text>
                </View>
                <View style={styles.subNum}>
                  <Text style={[styles.subNumVal, { color: Colors.goldLight }]}>{analysis.nums.personality}</Text>
                  <Text style={styles.subNumLabel}>{t('profile.personalMap.personality')}</Text>
                </View>
              </View>
            </View>

            {/* Human Design teaser removed, dedicated Sakin Tasarım app owns HD content. */}

            {/* Weekly Reading */}
            <View style={[styles.analysisCard, { borderColor: Colors.teal + '60' }]}>
              <View style={styles.analysisHeader}>
                <View style={[styles.analysisBadge, { backgroundColor: Colors.teal + '20' }]}>
                  <Text style={{ fontSize: 18 }}>◎</Text>
                </View>
                <View style={styles.analysisHeaderText}>
                  <Text style={[styles.analysisTitle, { color: Colors.tealLight }]}>
                    {premium.isPremium ? analysis.weekly.theme : t('profile.personalMap.weeklyReading')}
                  </Text>
                  <Text style={styles.analysisMeta}>
                    {premium.isPremium
                      ? t('profile.personalMap.weeklyMeta').replace('{week}', String(analysis.weekly.weekNumber))
                      : t('profile.personalMap.weeklyThisWeek')}
                  </Text>
                </View>
              </View>
              {premium.isPremium ? (
                <>
                  <Text style={styles.analysisDesc}>{analysis.weekly.message}</Text>
                  <Text style={[styles.analysisMeta, { marginTop: Spacing.xs }]}>
                    {t('profile.personalMap.personalYear').replace('{year}', String(analysis.weekly.personalYear))}
                  </Text>
                </>
              ) : (
                <PremiumTeaser
                  hint={t('profile.premium.weeklyTeaser')}
                  color={Colors.teal}
                  onUnlock={() => setShowPaywall(true)}
                />
              )}
            </View>
          </>
        ) : showBirthForm ? (
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ width: '100%' }}>
          <View style={styles.birthForm}>
            <Text style={styles.birthFormTitle}>{t('profile.personalMap.birthForm.title')}</Text>
            <Text style={styles.birthFormHint}>
              {t('profile.personalMap.birthForm.hint')}
            </Text>

            <TextInput
              style={styles.nameInput}
              value={editFullName}
              onChangeText={setEditFullName}
              placeholder={t('profile.personalMap.birthForm.fullNamePlaceholder')}
              placeholderTextColor={Colors.textMuted}
              autoCapitalize="words"
            />

            <Text style={styles.formLabel}>{t('profile.personalMap.birthForm.dateLabel')}</Text>
            <View style={styles.dateRow}>
              <TextInput
                style={[styles.dateInput, { flex: 1 }]}
                value={editDay}
                onChangeText={setEditDay}
                placeholder={t('profile.personalMap.birthForm.dayPlaceholder')}
                placeholderTextColor={Colors.textMuted}
                keyboardType="number-pad"
                maxLength={2}
              />
              <TextInput
                style={[styles.dateInput, { flex: 1 }]}
                value={editMonth}
                onChangeText={setEditMonth}
                placeholder={t('profile.personalMap.birthForm.monthPlaceholder')}
                placeholderTextColor={Colors.textMuted}
                keyboardType="number-pad"
                maxLength={2}
              />
              <TextInput
                style={[styles.dateInput, { flex: 2 }]}
                value={editYear}
                onChangeText={setEditYear}
                placeholder={t('profile.personalMap.birthForm.yearPlaceholder')}
                placeholderTextColor={Colors.textMuted}
                keyboardType="number-pad"
                maxLength={4}
              />
            </View>

            <Text style={styles.formLabel}>{t('profile.personalMap.birthForm.hourLabel')} <Text style={styles.formLabelOpt}>{t('profile.personalMap.birthForm.hourOptional')}</Text></Text>
            <View style={styles.dateRow}>
              <TextInput
                style={[styles.dateInput, { flex: 1 }]}
                value={editHour}
                onChangeText={setEditHour}
                placeholder={t('profile.personalMap.birthForm.hourPlaceholder')}
                placeholderTextColor={Colors.textMuted}
                keyboardType="number-pad"
                maxLength={2}
              />
              <TextInput
                style={[styles.dateInput, { flex: 1 }]}
                value={editMinute}
                onChangeText={setEditMinute}
                placeholder={t('profile.personalMap.birthForm.minutePlaceholder')}
                placeholderTextColor={Colors.textMuted}
                keyboardType="number-pad"
                maxLength={2}
              />
            </View>

            <Text style={styles.formLabel}>{t('profile.personalMap.birthForm.cityLabel')} <Text style={styles.formLabelOpt}>{t('profile.personalMap.birthForm.cityOptional')}</Text></Text>
            <TextInput
              style={styles.nameInput}
              value={editCity}
              onChangeText={setEditCity}
              placeholder={t('profile.personalMap.birthForm.cityPlaceholder')}
              placeholderTextColor={Colors.textMuted}
              autoCapitalize="words"
              autoCorrect={false}
            />

            <TouchableOpacity
              style={[styles.onboardingBtn, {
                opacity: editFullName.trim().length > 0 && birthDataValid(editDay, editMonth, editYear) ? 1 : 0.4
              }]}
              onPress={handleSaveBirthData}
              disabled={editFullName.trim().length === 0 || !birthDataValid(editDay, editMonth, editYear)}
            >
              <Text style={styles.onboardingBtnText}>{t('profile.personalMap.birthForm.saveBtn')}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowBirthForm(false)} style={styles.skipBtn}>
              <Text style={styles.skipText}>{t('profile.personalMap.birthForm.cancelBtn')}</Text>
            </TouchableOpacity>
          </View>
          </KeyboardAvoidingView>
        ) : null}
      </View>

      {/* Doğum Taşın/Bitkin */}
      {birthStones.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.animalGuidance.birthStoneTitle' as any)}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {birthStones.map(s => (
              <TouchableOpacity
                key={s.id}
                style={{
                  flexDirection: 'row', alignItems: 'center', gap: 8,
                  backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: Colors.purple + '40',
                  borderRadius: BorderRadius.lg, paddingVertical: 8, paddingHorizontal: 12,
                }}
                onPress={() => setDetailStone(s)}
                activeOpacity={0.8}
              >
                <Text style={{ fontSize: 18 }}>{s.emoji}</Text>
                <Text style={{ fontSize: Typography.size.sm, color: Colors.textPrimary }}>{s.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Ruhsal Harita */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('profile.spiritualMap.title')}</Text>

        {topSource && (
          <View style={[styles.spiritCard, { borderColor: Colors.gold }]}>
            <Text style={styles.spiritEmoji}>⌘</Text>
            <View style={styles.spiritInfo}>
              <Text style={styles.spiritLabel}>{t('profile.spiritualMap.topGuide')}</Text>
              <Text style={[styles.spiritValue, { color: Colors.gold }]}>{topSource}</Text>
              <Text style={styles.spiritCount}>{t('profile.spiritualMap.companionCount').replace('{n}', String(stats.sourceCounts[topSource] || 0))}</Text>
            </View>
          </View>
        )}
        {topStone && (
          <TouchableOpacity
            style={[styles.spiritCard, { borderColor: Colors.purple }]}
            onPress={() => setDetailStone(topStone as typeof stonesData[0])}
            activeOpacity={0.8}
          >
            <Text style={styles.spiritEmoji}>{topStone.emoji}</Text>
            <View style={styles.spiritInfo}>
              <Text style={styles.spiritLabel}>{t('profile.spiritualMap.topStone')}</Text>
              <Text style={[styles.spiritValue, { color: Colors.purpleLight }]}>{topStone.name}</Text>
              <Text style={styles.spiritCount}>{t('profile.spiritualMap.stoneCount').replace('{n}', String(stats.stoneCounts[topStone.id] || 0)).replace('{chakra}', topStone.chakra)}</Text>
            </View>
            <Text style={{ fontSize: 14, color: Colors.purpleLight }}>→</Text>
          </TouchableOpacity>
        )}
        {totalReadings === 0 && (
          <Text style={styles.emptyHint}>{t('profile.spiritualMap.emptyHint')}</Text>
        )}
      </View>

      {/* Sakin Ailesi: only on web. Hidden on iOS/Android to avoid App Store rejection
          for cross-promoting external apps/services (Guideline 2.5.6 / 4.2.6). */}
      {Platform.OS === 'web' && (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('profile.sakinFamily.title')}</Text>
        <Text style={styles.familyIntro}>
          {t('profile.sakinFamily.intro')}
        </Text>

        {/* sakin.life master link */}
        <TouchableOpacity
          style={styles.familyMaster}
          onPress={() => postToHost({ type: 'sakin-close-embed' }, 'https://sakin.life')}
          activeOpacity={0.75}
        >
          <Text style={styles.familyMasterSymbol}>✦</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.familyMasterName}>sakin.life</Text>
            <Text style={styles.familyMasterDesc}>{t('profile.sakinFamily.masterDesc')}</Text>
          </View>
          <Text style={styles.familyMasterArrow}>→</Text>
        </TouchableOpacity>

        <View style={styles.familyGrid}>
          {(() => {
            // Uniform aile menüsü: açık app (aktif, en üstte) → diğerleri sırayla tıklanabilir. Numeroloji yok.
            const ALL = [
              { host: 'hayvan',   name: 'Sakin Hayvan',   symbol: '⊕' },
              { host: 'mitler',   name: 'Sakin Mitler',   symbol: '⚡' },
              { host: 'tasarim',  name: 'Sakin Tasarım',  symbol: '◉' },
              { host: 'taslar',   name: 'Sakin Taşlar',   symbol: '◈' },
              { host: 'bitkiler', name: 'Sakin Bitkiler', symbol: '✿' },
            ];
            const CURRENT = 'bitkiler';
            return ALL.slice()
              .sort((a, b) => (a.host === CURRENT ? 0 : 1) - (b.host === CURRENT ? 0 : 1))
              .map(a => ({
                name: a.name, symbol: a.symbol, desc: '', active: true,
                onPress: a.host === CURRENT ? undefined : () => postToHost({ type: 'sakin-open-embed', app: a.host }, ''),
              }));
          })().map(app => (
            <TouchableOpacity
              key={app.name}
              style={[styles.familyCard, app.active && styles.familyCardActive]}
              onPress={app.onPress}
              activeOpacity={app.onPress ? 0.7 : 1}
              disabled={!app.onPress && !app.active}
            >
              <Text style={[styles.familySymbol, app.active && { color: Colors.teal }]}>{app.symbol}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.familyName, app.active && { color: Colors.tealLight }]}>{app.name}</Text>
                <Text style={styles.familyDesc}>{app.desc}</Text>
              </View>
              {app.active ? (
                <View style={[styles.familyBadge, { borderColor: Colors.teal + '60' }]}>
                  <Text style={[styles.familyBadgeText, { color: Colors.teal }]}>
                    {app.onPress ? '→' : t('profile.sakinFamily.active')}
                  </Text>
                </View>
              ) : (
                <View style={styles.familyBadge}>
                  <Text style={styles.familyBadgeText}>{t('profile.sakinFamily.comingSoon')}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
      )}

      {/* Rozetler */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('profile.badges.title')}</Text>
        <View style={styles.badgesGrid}>
          {(() => {
            const nextBadgeId = BADGES.find(b => totalReadings < b.required && streak < b.required)?.id;
            return BADGES.map(badge => {
            const earned = totalReadings >= badge.required || streak >= badge.required;
            const progress = Math.min(Math.max(totalReadings, streak), badge.required);
            const pct = Math.round((progress / badge.required) * 100);
            return (
              <View
                key={badge.id}
                style={[
                  styles.badgeCard,
                  earned ? { borderColor: Colors.gold, backgroundColor: Colors.goldGlow } : styles.badgeLocked
                ]}
              >
                <Text style={[styles.badgeEmoji, !earned && { opacity: 0.4 }]}>
                  {earned ? badge.emoji : '⊘'}
                </Text>
                <Text style={[styles.badgeTitle, { color: earned ? Colors.gold : Colors.textMuted }]}>
                  {t(('profile.badges.list.' + badge.id + '.title') as any)}
                </Text>
                <Text style={styles.badgeDesc}>{t(('profile.badges.list.' + badge.id + '.desc') as any)}</Text>
                {!earned && badge.id === nextBadgeId && (
                  <>
                    <View style={styles.badgeProgressTrack}>
                      <View style={[styles.badgeProgressFill, { width: `${pct}%` }]} />
                    </View>
                    <Text style={styles.badgeProgressText}>{progress}/{badge.required}</Text>
                  </>
                )}
              </View>
            );
            });
          })()}
        </View>
      </View>

      {/* Language picker removed: host (Sakin) controls language via the bridge. */}

      {/* ── DEV-only: stripped from production builds ── */}
      {__DEV__ && (
        <View style={styles.devSection}>
          <TouchableOpacity
            style={styles.devBtn}
            onPress={async () => {
              if (premium.isPremium) {
                await devClearPremiumCache();
              } else {
                await devSetMockPremium('yearly');
              }
              premium.refresh();
            }}
          >
            <Text style={styles.devBtnText}>
              {premium.isPremium ? t('profile.dev.disablePremium') : t('profile.dev.enablePremium')}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

function PremiumTeaser({
  hint, color, onUnlock,
}: { hint: string; color: string; onUnlock: () => void }) {
  return (
    <TouchableOpacity
      style={[styles.teaserBox, { borderColor: color + '40', backgroundColor: color + '10' }]}
      onPress={onUnlock}
      activeOpacity={0.85}
    >
      <Text style={[styles.teaserLock, { color }]}>✦</Text>
      <Text style={styles.teaserHint}>{hint}</Text>
      <Text style={[styles.teaserCTA, { color }]}>Üstad Ol →</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingBottom: Spacing.xxxl },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flexWrap: 'wrap' },
  devSection: { padding: Spacing.lg, paddingTop: 0, alignItems: 'center' },
  devBtn: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: BorderRadius.sm,
    borderStyle: 'dashed',
    opacity: 0.4,
  },
  devBtnText: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    letterSpacing: 1,
  },
  onboarding: {
    alignItems: 'center',
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  onboardingScroll: {
    alignItems: 'stretch',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
    gap: Spacing.md,
  },
  onboardingFooter: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.sm,
    gap: Spacing.xs,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  onboardingEmoji: { color: Colors.textPrimary, fontSize: 48, textAlign: 'center', marginBottom: 4 },
  onboardingTitle: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
    color: Colors.textPrimary,
    letterSpacing: 3,
    textAlign: 'center',
  },
  onboardingSubtitle: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: Typography.size.xs * 1.6,
  },
  onboardingHint: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: Typography.size.xs * 1.7,
    marginBottom: Spacing.xs,
  },
  onboardingQuestion: {
    fontSize: Typography.size.md,
    color: Colors.gold,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  nameInput: {
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: BorderRadius.md,
    paddingVertical: 10,
    paddingHorizontal: Spacing.md,
    fontSize: Typography.size.sm,
    color: Colors.textPrimary,
    backgroundColor: Colors.backgroundCard,
    textAlign: 'center',
  },
  obFieldLabel: {
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 2,
    marginTop: Spacing.xs,
  },
  obFieldOpt: {
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  obTimeSep: {
    fontSize: Typography.size.lg,
    color: Colors.textMuted,
    alignSelf: 'center',
    marginTop: 2,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  dateInput: {
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: BorderRadius.md,
    paddingVertical: 10,
    paddingHorizontal: 6,
    fontSize: Typography.size.sm,
    color: Colors.textPrimary,
    backgroundColor: Colors.backgroundCard,
    textAlign: 'center',
  },
  elementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    justifyContent: 'center',
  },
  elementBtn: {
    width: 130,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.backgroundCard,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.divider,
    gap: Spacing.xs,
  },
  elementBtnActive: {
    borderColor: Colors.gold,
    backgroundColor: Colors.goldGlow,
  },
  elementEmoji: { color: Colors.textPrimary, fontSize: 28 },
  elementName: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.medium,
    letterSpacing: 1,
  },
  onboardingBtn: {
    backgroundColor: Colors.gold,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.round,
    alignItems: 'center',
  },
  onboardingBtnText: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.bold,
    color: '#1A1208',
    letterSpacing: 1,
  },
  skipBtn: { paddingVertical: Spacing.sm, alignItems: 'center' },
  skipText: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    letterSpacing: 0.5,
    textAlign: 'center',
  },

  hero: { alignItems: 'center', paddingVertical: Spacing.xl },
  avatarRing: {
    width: 100, height: 100, borderRadius: 50,
    borderWidth: 1.5, borderColor: Colors.gold,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.md,
    backgroundColor: Colors.goldGlow,
  },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.backgroundCard,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarEmoji: { color: Colors.textPrimary, fontSize: 36 },
  heroName: {
    fontSize: Typography.size.xxl,
    fontWeight: Typography.weight.bold,
    color: Colors.textPrimary,
    letterSpacing: 1,
  },
  heroLevel: {
    fontSize: Typography.size.sm,
    color: Colors.gold,
    letterSpacing: 3,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  heroElement: { fontSize: Typography.size.sm, color: Colors.textMuted, marginTop: 4 },

  statsRow: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    overflow: 'hidden',
  },
  statBox: { flex: 1, alignItems: 'center', paddingVertical: Spacing.md },
  statBoxCenter: {
    borderLeftWidth: 1, borderRightWidth: 1, borderColor: Colors.divider,
  },
  statValue: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
    color: Colors.textPrimary,
  },
  statLabel: { fontSize: Typography.size.xs, color: Colors.textMuted, marginTop: 2 },

  section: { marginHorizontal: Spacing.lg, marginBottom: Spacing.xl },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.semibold,
    color: Colors.textPrimary,
    letterSpacing: 0.5,
    marginBottom: Spacing.md,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  editBirthBtn: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.teal + '50',
    borderRadius: BorderRadius.round,
  },
  editBirthText: {
    fontSize: Typography.size.xs,
    color: Colors.tealLight,
    letterSpacing: 0.5,
  },
  gatesBox: {
    borderWidth: 1, borderRadius: BorderRadius.sm,
    padding: Spacing.md, marginTop: Spacing.sm,
    backgroundColor: Colors.purple + '08',
  },
  gatesTitle: {
    fontSize: 9, color: Colors.purple, letterSpacing: 2,
    textTransform: 'uppercase', marginBottom: Spacing.sm,
  },
  gatesRow: { flexDirection: 'row', gap: Spacing.md },
  gateCell: { flex: 1, alignItems: 'center', gap: 2 },
  gateNum: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.semibold,
    letterSpacing: 1,
  },
  gateLabel: { fontSize: 9, color: Colors.textMuted, letterSpacing: 1 },
  gateName: {
    fontSize: Typography.size.xs, color: Colors.textSecondary,
    fontStyle: 'italic', textAlign: 'center',
  },
  gatesNote: {
    fontSize: 10, color: Colors.textMuted, fontStyle: 'italic',
    marginTop: Spacing.sm, textAlign: 'center', lineHeight: 14,
  },
  formLabel: {
    fontSize: Typography.size.xs, color: Colors.textMuted,
    letterSpacing: 0.5, marginBottom: 4, marginTop: Spacing.sm,
  },
  formLabelOpt: {
    fontSize: Typography.size.xs, color: Colors.textMuted, fontStyle: 'italic',
  },
  birthFormHint: {
    fontSize: Typography.size.xs, color: Colors.textMuted, fontStyle: 'italic',
    marginBottom: Spacing.sm, lineHeight: Typography.size.xs * 1.6,
  },
  hdDisclaimer: {
    fontSize: 10,
    color: Colors.textMuted,
    fontStyle: 'italic',
    lineHeight: 15,
    marginTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    paddingTop: Spacing.sm,
  },
  sectionMeta: { fontSize: Typography.size.xs, color: Colors.textMuted },
  progressBar: {
    height: 6,
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.round,
    overflow: 'hidden',
    marginBottom: Spacing.xs,
  },
  progressFill: { height: '100%', backgroundColor: Colors.gold, borderRadius: BorderRadius.round },
  progressText: { fontSize: Typography.size.xs, color: Colors.textMuted },

  analysisCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  analysisHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  analysisBadge: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center',
  },
  analysisBadgeNum: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
  },
  analysisHeaderText: { flex: 1 },
  analysisTitle: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.semibold,
    letterSpacing: 0.5,
  },
  analysisMeta: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    letterSpacing: 0.3,
    marginTop: 2,
  },
  analysisDesc: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    lineHeight: Typography.size.sm * 1.8,
    fontWeight: Typography.weight.light,
  },
  subNums: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  subNum: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.sm,
    paddingVertical: Spacing.sm,
  },
  subNumVal: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
  },
  subNumLabel: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  notSelfBox: {
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    marginTop: Spacing.xs,
  },
  notSelfLabel: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.semibold,
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  notSelfText: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    fontStyle: 'italic',
    lineHeight: Typography.size.xs * 1.7,
  },

  hdEditBtn: { padding: 4 },
  hdEditText: { fontSize: 16 },
  hdPicker: {
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    gap: 2,
    marginBottom: Spacing.xs,
  },
  hdPickerLabel: {
    fontSize: 10,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  hdPickerItem: {
    paddingVertical: 6,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  hdPickerText: {
    fontSize: Typography.size.sm,
    letterSpacing: 0.3,
  },

  unlockBtn: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderStyle: 'dashed',
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  unlockIcon: { fontSize: 28, color: Colors.gold, opacity: 0.7 },
  unlockTitle: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.semibold,
    color: Colors.gold,
    letterSpacing: 0.5,
  },
  unlockDesc: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: Typography.size.xs * 1.7,
  },

  birthForm: { gap: Spacing.sm },
  birthFormTitle: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },

  spiritCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    gap: Spacing.md,
  },
  spiritEmoji: { color: Colors.textPrimary, fontSize: 32 },
  spiritInfo: { flex: 1 },
  spiritLabel: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  spiritValue: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.semibold,
    marginVertical: 2,
  },
  spiritCount: { fontSize: Typography.size.xs, color: Colors.textMuted },
  emptyHint: {
    fontSize: Typography.size.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: Spacing.md,
  },

  badgesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  badgeCard: {
    width: '30%', flex: 1, minWidth: 90,
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.divider,
    gap: 4,
  },
  badgeLocked: { opacity: 0.72 },
  badgeEmoji: { color: Colors.textPrimary, fontSize: 24 },
  badgeTitle: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.semibold,
    textAlign: 'center',
  },
  badgeDesc: { fontSize: 10, color: Colors.textMuted, textAlign: 'center' },
  badgeProgressTrack: {
    width: '100%', height: 3, borderRadius: 2, marginTop: 4,
    backgroundColor: 'rgba(255,255,255,0.10)', overflow: 'hidden',
  },
  badgeProgressFill: { height: '100%', borderRadius: 2, backgroundColor: Colors.gold },
  badgeProgressText: { fontSize: 9, color: Colors.textMuted, textAlign: 'center', marginTop: 1 },

  accountCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    overflow: 'hidden',
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  accountLabel: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
    color: Colors.textPrimary,
  },
  accountSub: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  accountDivider: { height: 1, backgroundColor: Colors.divider, marginHorizontal: Spacing.md },
  upgradeBtn: {
    backgroundColor: Colors.gold,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.round,
  },
  upgradeBtnText: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.bold,
    color: '#1A1208',
    letterSpacing: 0.5,
  },
  licenseSection: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  licenseSectionTitle: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  licenseRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
  },
  licenseInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    fontSize: Typography.size.sm,
    color: Colors.textPrimary,
    fontFamily: 'monospace',
    letterSpacing: 2,
    backgroundColor: Colors.backgroundCard,
  },
  licenseApplyBtn: {
    backgroundColor: Colors.teal,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  licenseApplyText: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.bold,
    color: Colors.background,
    letterSpacing: 0.5,
  },
  licenseMsg: {
    fontSize: Typography.size.xs,
    lineHeight: 18,
  },
  linkBtn: { paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs },
  linkBtnText: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  toggle: {
    width: 40, height: 22,
    borderRadius: 11,
    backgroundColor: Colors.divider,
    padding: 2,
    justifyContent: 'center',
  },
  toggleOn: { backgroundColor: Colors.gold },
  toggleDot: {
    width: 18, height: 18,
    borderRadius: 9,
    backgroundColor: Colors.background,
  },
  toggleDotOn: { transform: [{ translateX: 18 }] },

  teaserBox: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  teaserLock: { fontSize: 20, marginBottom: 4 },
  teaserHint: {
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: Typography.size.xs * 1.6,
    marginBottom: Spacing.sm,
  },
  teaserCTA: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.semibold,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  familyIntro: {
    fontSize: Typography.size.xs,
    color: Colors.sakinLavender,
    letterSpacing: 1.5,
    fontStyle: 'italic',
    marginTop: -Spacing.sm,
    marginBottom: Spacing.md,
  },
  familyMaster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.sakinLavender + '12',
    borderWidth: 1,
    borderColor: Colors.sakinLavender + '55',
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  familyMasterSymbol: {
    fontSize: 22,
    color: Colors.sakinLavender,
    width: 28,
    textAlign: 'center',
  },
  familyMasterName: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
    color: Colors.sakinLavender,
    letterSpacing: 1,
  },
  familyMasterDesc: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  familyMasterArrow: {
    fontSize: Typography.size.md,
    color: Colors.sakinLavender,
    opacity: 0.7,
  },
  familyGrid: { gap: Spacing.sm },
  familyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.backgroundCard,
    borderWidth: 1,
    borderColor: Colors.sakinLavender + '25',
    borderRadius: BorderRadius.md,
  },
  familyCardActive: {
    borderColor: Colors.teal + '40',
    backgroundColor: Colors.teal + '08',
  },
  familySymbol: {
    fontSize: 20,
    color: Colors.sakinLavender,
    width: 28,
    textAlign: 'center',
  },
  familyName: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
    color: Colors.textPrimary,
    letterSpacing: 0.3,
  },
  familyDesc: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  familyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: Colors.sakinLavender + '50',
    borderRadius: BorderRadius.round,
  },
  familyBadgeText: {
    fontSize: 9,
    color: Colors.sakinLavender,
    letterSpacing: 1.5,
    fontWeight: Typography.weight.semibold,
  },

  heroNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  langRow: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  langBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    backgroundColor: Colors.backgroundSecondary,
  },
  langBtnActive: {
    borderColor: Colors.gold,
    backgroundColor: Colors.gold + '18',
  },
  langBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
    letterSpacing: 1,
  },
  langBtnTextActive: {
    color: Colors.gold,
  },

  langBigRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  langBigBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    backgroundColor: Colors.backgroundCard,
    alignItems: 'center',
  },
  langBigBtnActive: {
    borderColor: Colors.gold,
    backgroundColor: Colors.goldGlow,
  },
  langBigBtnText: {
    fontSize: Typography.size.md,
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  langBigBtnTextActive: {
    color: Colors.gold,
    fontWeight: Typography.weight.semibold,
  },
  langNote: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    fontStyle: 'italic',
    marginTop: 4,
  },
});
