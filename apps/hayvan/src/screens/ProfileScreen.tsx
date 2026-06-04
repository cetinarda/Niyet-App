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
import { useTuraStore } from '../store/useStore';
import stonesData from '../data/stones.json';
import animalsData from '../data/animals.json';
import nagualsData from '../data/naguals.json';
import { useLocalizedAnimals, useLocalizedStones, useLocalizedNaguals } from '../i18n/localize';
import { calcNumerology, LIFE_PATH_MEANINGS } from '../utils/numerology';
import { getHDProfile, GATE_NAMES } from '../utils/humanDesign';
import { getWeeklyReading } from '../utils/weeklyReading';
import { AnimalFinderScreen } from './AnimalFinderScreen';
import { MythsScreen } from './MythsScreen';
import { PaywallScreen } from './PaywallScreen';
import { usePremium, devClearPremiumCache, devSetMockPremium } from '../lib/premium';
import { redeemLicenseKey } from '../lib/entitlement';
import { HelpButton } from '../components/HelpButton';
import { scheduleDailyReminder, cancelDailyReminder, requestNotificationPermissionWithRationale } from '../lib/notifications';
import { useI18n } from '../i18n/useI18n';

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
  const { profile, isNewUser, createProfile, updateBirthData, updateHDType, stats, getTopStat, getLevelTitle, session, signOut, deleteAccount, setLanguage, language } = useTuraStore();
  const { t, lang } = useI18n();
  const premium = usePremium();
  const [showPaywall, setShowPaywall] = useState(false);
  const [remindersOn, setRemindersOn] = useState(false);
  const [licenseKey, setLicenseKey] = useState('');
  const [licenseStatus, setLicenseStatus] = useState<'idle' | 'busy' | 'ok' | 'error'>('idle');
  const [licenseMsg, setLicenseMsg] = useState('');

  const [showOnboarding, setShowOnboarding] = useState(isNewUser);
  const [name, setName] = useState('');
  const [element, setElement] = useState<typeof ELEMENTS[number]>('ateş');
  const [step, setStep] = useState(1);

  // step 3 birth data
  const [fullName, setFullName] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [birthHour, setBirthHour] = useState('');
  const [birthMinuteOb, setBirthMinuteOb] = useState('');
  const [birthCity, setBirthCity] = useState('');

  // inline birth data edit (when already profiled but no birth data)
  const [showBirthForm, setShowBirthForm] = useState(false);
  const [showAnimalFinder, setShowAnimalFinder] = useState(false);
  const [showMythsScreen, setShowMythsScreen] = useState(false);
  const [showAnimalInfo, setShowAnimalInfo]   = useState(false);
  const [showHDPicker, setShowHDPicker] = useState(false);
  const [editFullName, setEditFullName] = useState('');
  const [editDay, setEditDay] = useState('');
  const [editMonth, setEditMonth] = useState('');
  const [editYear, setEditYear] = useState('');
  const [editHour, setEditHour] = useState('');
  const [editMinute, setEditMinute] = useState('');
  const [editCity, setEditCity] = useState('');

  const localAnimals = useLocalizedAnimals();
  const localStones = useLocalizedStones();
  const localNaguals = useLocalizedNaguals();

  const topStoneId  = getTopStat(stats.stoneCounts);
  const topAnimalId = getTopStat(stats.animalCounts);
  const topSource   = getTopStat(stats.sourceCounts);
  const topNagualId = getTopStat(stats.nagualCounts || {});

  const topStone  = topStoneId  ? localStones.find(s => s.id === topStoneId)  : null;
  const topAnimal = topAnimalId ? localAnimals.find(a => a.id === topAnimalId) : null;
  const topNagual = topNagualId ? localNaguals.find(n => n.id === topNagualId) : null;

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
    if (!profile?.fullName || !profile?.birthDate) return null;
    try {
      const nums   = calcNumerology(profile.fullName, profile.birthDate);
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
              {step < 3 ? t('profile.onboarding.continueBtn') : t('profile.onboarding.startBtn')}
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

  if (showAnimalFinder) {
    return (
      <AnimalFinderScreen
        onClose={() => setShowAnimalFinder(false)}
        prefillBirthDate={profile.birthDate}
      />
    );
  }

  if (showMythsScreen) {
    return <MythsScreen onClose={() => setShowMythsScreen(false)} />;
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

      {/* Bildirimler */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('profile.account.remindersLabel')}</Text>
        <View style={styles.accountCard}>
          <TouchableOpacity
            style={styles.accountRow}
            onPress={() => toggleReminders(!remindersOn)}
            activeOpacity={0.7}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.accountLabel}>{t('profile.account.remindersLabel')}</Text>
              <Text style={styles.accountSub}>{t('profile.account.remindersSub')}</Text>
            </View>
            <View style={[styles.toggle, remindersOn && styles.toggleOn]}>
              <View style={[styles.toggleDot, remindersOn && styles.toggleDotOn]} />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Kişisel Harita ── */}
      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>{t('profile.personalMap.title')}</Text>
          {analysis && !showBirthForm && (
            <TouchableOpacity
              onPress={() => {
                const parts = profile.birthDate?.split('-') ?? [];
                setEditFullName(profile.fullName || '');
                setEditDay(parts[2] ? String(parseInt(parts[2])) : '');
                setEditMonth(parts[1] ? String(parseInt(parts[1])) : '');
                setEditYear(parts[0] ?? '');
                setEditHour(profile.birthHour !== undefined ? String(profile.birthHour) : '');
                setEditMinute(profile.birthMinute !== undefined ? String(profile.birthMinute).padStart(2, '0') : '');
                setEditCity(profile.birthCity || '');
                setShowBirthForm(true);
              }}
              style={styles.editBirthBtn}
            >
              <Text style={styles.editBirthText}>{t('profile.personalMap.editBtn')}</Text>
            </TouchableOpacity>
          )}
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

            {/* Human Design */}
            <View style={[styles.analysisCard, { borderColor: Colors.purple + '60' }]}>
              <View style={styles.analysisHeader}>
                <View style={[styles.analysisBadge, { backgroundColor: Colors.purple + '20' }]}>
                  <Text style={{ fontSize: 18 }}>◈</Text>
                </View>
                <View style={styles.analysisHeaderText}>
                  <View style={styles.titleRow}>
                    <Text style={[styles.analysisTitle, { color: Colors.purpleLight }]}>
                      {lang === 'en' ? (HD_TYPE_EN[analysis.hd.type] ?? analysis.hd.type) : analysis.hd.type}
                    </Text>
                    <HelpButton termKey={hdTypeToGlossaryKey(analysis.hd.type)} />
                  </View>
                  <View style={styles.titleRow}>
                    <Text style={styles.analysisMeta}>
                      {`${t('profile.personalMap.humanDesign')} · ${t('profile.personalMap.strategy')}: ${lang === 'en' ? (HD_STRATEGY_EN[analysis.hd.strategy] ?? analysis.hd.strategy) : analysis.hd.strategy}`}
                      {!analysis.hd.confident && !profile.hdTypeOverride ? ` ${t('profile.personalMap.estimated')}` : ''}
                    </Text>
                    <HelpButton termKey="humanDesign" />
                  </View>
                </View>
                <TouchableOpacity onPress={() => setShowHDPicker(v => !v)} style={styles.hdEditBtn}>
                  <Text style={[styles.hdEditText, { color: Colors.purple }]}>✎</Text>
                </TouchableOpacity>
              </View>
              {showHDPicker && (
                <View style={[styles.hdPicker, { borderColor: Colors.purple + '30' }]}>
                  <Text style={[styles.hdPickerLabel, { color: Colors.textMuted }]}>{t('profile.personalMap.hdTypeSelectHint')}</Text>
                  {(['Jeneratör', 'Manifesting Jeneratör', 'Projektör', 'Manifestor', 'Reflektör'] as const).map(hdType => (
                    <TouchableOpacity
                      key={hdType}
                      style={[styles.hdPickerItem, analysis.hd.type === hdType && { backgroundColor: Colors.purple + '20' }]}
                      onPress={() => { updateHDType(hdType); setShowHDPicker(false); }}
                    >
                      <Text style={[styles.hdPickerText, { color: analysis.hd.type === hdType ? Colors.purpleLight : Colors.textSecondary }]}>
                        {analysis.hd.type === hdType ? '◈ ' : '○ '}{lang === 'en' ? (HD_TYPE_EN[hdType] ?? hdType) : hdType}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  <Text style={styles.hdDisclaimer}>
                    {t('profile.personalMap.hdDisclaimer')}
                  </Text>
                </View>
              )}
              {/* Real gates — always accurate regardless of type confidence */}
              <View style={[styles.gatesBox, { borderColor: Colors.purple + '30' }]}>
                <Text style={styles.gatesTitle}>{t('profile.personalMap.sunGates')}</Text>
                <View style={styles.gatesRow}>
                  <View style={styles.gateCell}>
                    <Text style={[styles.gateNum, { color: Colors.purpleLight }]}>
                      {analysis.hd.gates.consciousSun}.{analysis.hd.gates.consciousSunLine}
                    </Text>
                    <Text style={styles.gateLabel}>{t('profile.personalMap.consciousSun')}</Text>
                    <Text style={styles.gateName}>{GATE_NAMES[analysis.hd.gates.consciousSun]}</Text>
                  </View>
                  <View style={styles.gateCell}>
                    <Text style={[styles.gateNum, { color: Colors.tealLight }]}>
                      {analysis.hd.gates.designSun}.{analysis.hd.gates.designSunLine}
                    </Text>
                    <Text style={styles.gateLabel}>{t('profile.personalMap.designSun')}</Text>
                    <Text style={styles.gateName}>{GATE_NAMES[analysis.hd.gates.designSun]}</Text>
                  </View>
                </View>
                {!analysis.hd.confident && !profile.hdTypeOverride && (
                  <Text style={styles.gatesNote}>
                    {t('profile.personalMap.gatesNote')}
                  </Text>
                )}
              </View>

              {premium.isPremium ? (
                <>
                  <Text style={styles.analysisDesc}>{analysis.hd.desc}</Text>
                  <View style={[styles.notSelfBox, { borderColor: Colors.purple + '30' }]}>
                    <Text style={[styles.notSelfLabel, { color: Colors.purple }]}>{t('profile.personalMap.notSelf')}</Text>
                    <Text style={styles.notSelfText}>{analysis.hd.notSelf}</Text>
                  </View>
                </>
              ) : (
                <PremiumTeaser
                  hint={t('profile.premium.hdTeaser')}
                  color={Colors.purple}
                  onUnlock={() => setShowPaywall(true)}
                />
              )}
            </View>

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
        ) : (
          <TouchableOpacity
            style={styles.unlockBtn}
            onPress={() => {
              setEditFullName('');
              setEditDay(''); setEditMonth(''); setEditYear('');
              setShowBirthForm(true);
            }}
          >
            <Text style={styles.unlockIcon}>✦</Text>
            <Text style={styles.unlockTitle}>{t('profile.personalMap.unlock.title')}</Text>
            <Text style={styles.unlockDesc}>
              {t('profile.personalMap.unlock.desc')}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Hayvan Rehberliği */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.infoToggleBtn}
          onPress={() => setShowAnimalInfo(v => !v)}
          activeOpacity={0.7}
        >
          <Text style={styles.infoToggleTitle}>{t('profile.animalGuidance.sectionTitle')}</Text>
          <Text style={styles.infoToggleArrow}>{showAnimalInfo ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        {showAnimalInfo && (
          <View style={styles.animalInfoCard}>
            <Text style={styles.animalInfoSection}>{t('profile.animalGuidance.totemTitle')}</Text>
            <Text style={styles.animalInfoText}>
              {t('profile.animalGuidance.totemText')}
            </Text>
            <View style={styles.animalInfoDivider} />
            <Text style={styles.animalInfoSection}>{t('profile.animalGuidance.nagualTitle')}</Text>
            <Text style={styles.animalInfoText}>
              {t('profile.animalGuidance.nagualText')}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.finderBtn}
          onPress={() => premium.isPremium ? setShowAnimalFinder(true) : setShowPaywall(true)}
          activeOpacity={0.85}
        >
          <Text style={styles.finderBtnEmoji}>✦</Text>
          <View style={styles.finderBtnText}>
            <Text style={styles.finderBtnTitle}>{t('profile.animalGuidance.finderTitle')}</Text>
            <Text style={styles.finderBtnDesc}>
              {premium.isPremium ? t('profile.animalGuidance.finderDescPremium') : t('profile.animalGuidance.finderDescFree')}
            </Text>
          </View>
          <Text style={[styles.infoToggleArrow, { color: Colors.tealLight }]}>
            {premium.isPremium ? '→' : '✦'}
          </Text>
        </TouchableOpacity>
      </View>

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
          <View style={[styles.spiritCard, { borderColor: Colors.purple }]}>
            <Text style={styles.spiritEmoji}>{topStone.emoji}</Text>
            <View style={styles.spiritInfo}>
              <Text style={styles.spiritLabel}>{t('profile.spiritualMap.topStone')}</Text>
              <Text style={[styles.spiritValue, { color: Colors.purpleLight }]}>{topStone.name}</Text>
              <Text style={styles.spiritCount}>{t('profile.spiritualMap.stoneCount').replace('{n}', String(stats.stoneCounts[topStone.id] || 0)).replace('{chakra}', topStone.chakra)}</Text>
            </View>
          </View>
        )}
        {topAnimal && (
          <View style={[styles.spiritCard, { borderColor: Colors.teal }]}>
            <Text style={styles.spiritEmoji}>{topAnimal.emoji}</Text>
            <View style={styles.spiritInfo}>
              <Text style={styles.spiritLabel}>{t('profile.spiritualMap.topAnimal')}</Text>
              <Text style={[styles.spiritValue, { color: Colors.tealLight }]}>{topAnimal.name}</Text>
              <Text style={styles.spiritCount}>{t('profile.spiritualMap.companionCount').replace('{n}', String(stats.animalCounts[topAnimal.id] || 0))}</Text>
            </View>
          </View>
        )}
        {topNagual && (
          <View style={[styles.spiritCard, { borderColor: Colors.ember }]}>
            <Text style={styles.spiritEmoji}>{topNagual.emoji}</Text>
            <View style={styles.spiritInfo}>
              <Text style={styles.spiritLabel}>{t('profile.spiritualMap.topNagual')}</Text>
              <Text style={[styles.spiritValue, { color: Colors.emberLight }]}>{topNagual.name}</Text>
              <Text style={styles.spiritCount}>{t('profile.spiritualMap.nagualCount').replace('{n}', String((stats.nagualCounts || {})[topNagual.id] || 0)).replace('{aspect}', (topNagual as any).aspect)}</Text>
            </View>
          </View>
        )}
        {totalReadings === 0 && (
          <Text style={styles.emptyHint}>{t('profile.spiritualMap.emptyHint')}</Text>
        )}
      </View>

      {/* Sakin Ailesi — only on web. Hidden on iOS/Android to avoid App Store rejection
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
          onPress={() => Linking.openURL('https://sakin.life')}
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
          {[
            { name: t('profile.sakinFamily.apps.animalGuidance'), symbol: '⊕', desc: t('profile.sakinFamily.appDescs.animalGuidance'), active: true,  onPress: undefined },
            { name: t('profile.sakinFamily.apps.myths'),          symbol: '⚡', desc: t('profile.sakinFamily.appDescs.myths'),          active: true,  onPress: () => Linking.openURL('https://sakinmitler.netlify.app/') },
            { name: t('profile.sakinFamily.apps.humanDesign'),    symbol: '◉', desc: t('profile.sakinFamily.appDescs.humanDesign'),    active: true,  onPress: () => Linking.openURL('https://sakindesign.netlify.app/') },
            { name: t('profile.sakinFamily.apps.stoneGuidance'),  symbol: '◈', desc: t('profile.sakinFamily.appDescs.stoneGuidance'),  active: false, onPress: undefined },
            { name: t('profile.sakinFamily.apps.plantGuidance'),  symbol: '✿', desc: t('profile.sakinFamily.appDescs.plantGuidance'),  active: false, onPress: undefined },
            { name: t('profile.sakinFamily.apps.numerology'),     symbol: '◎', desc: t('profile.sakinFamily.appDescs.numerology'),     active: false, onPress: undefined },
          ].map(app => (
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
          {BADGES.map(badge => {
            const earned = totalReadings >= badge.required || streak >= badge.required;
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
              </View>
            );
          })}
        </View>
      </View>

      {/* Language */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('profile.language.title' as any)}</Text>
        <View style={styles.langBigRow}>
          <TouchableOpacity
            style={[styles.langBigBtn, language === 'tr' && styles.langBigBtnActive]}
            onPress={() => setLanguage('tr')}
            activeOpacity={0.75}
          >
            <Text style={[styles.langBigBtnText, language === 'tr' && styles.langBigBtnTextActive]}>Türkçe</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.langBigBtn, language === 'en' && styles.langBigBtnActive]}
            onPress={() => setLanguage('en')}
            activeOpacity={0.75}
          >
            <Text style={[styles.langBigBtnText, language === 'en' && styles.langBigBtnTextActive]}>English</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.langNote}>{t('profile.language.note' as any)}</Text>
      </View>

      {/* ── DEV-only — stripped from production builds ── */}
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
  onboardingEmoji: { fontSize: 48, textAlign: 'center', marginBottom: 4 },
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
  elementEmoji: { fontSize: 28 },
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
  avatarEmoji: { fontSize: 36 },
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
  spiritEmoji: { fontSize: 32 },
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

  infoToggleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: Spacing.sm, marginBottom: Spacing.sm,
    borderBottomWidth: 1, borderBottomColor: Colors.divider,
  },
  infoToggleTitle: {
    fontSize: Typography.size.md, fontWeight: Typography.weight.semibold,
    color: Colors.textPrimary,
  },
  infoToggleArrow: { fontSize: Typography.size.xs, color: Colors.textMuted },
  animalInfoCard: {
    backgroundColor: Colors.backgroundCard, borderRadius: BorderRadius.lg,
    borderWidth: 1, borderColor: Colors.teal + '35',
    padding: Spacing.md, marginBottom: Spacing.md, gap: Spacing.sm,
  },
  animalInfoSection: {
    fontSize: Typography.size.sm, fontWeight: Typography.weight.semibold,
    color: Colors.tealLight, letterSpacing: 0.3,
  },
  animalInfoText: {
    fontSize: Typography.size.xs, color: Colors.textSecondary,
    lineHeight: Typography.size.xs * 1.9, fontWeight: Typography.weight.light,
  },
  animalInfoDivider: {
    height: 1, backgroundColor: Colors.teal + '25', marginVertical: Spacing.xs,
  },
  finderBtn: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.backgroundCard, borderRadius: BorderRadius.lg,
    borderWidth: 1, borderColor: Colors.teal + '60',
    padding: Spacing.md,
  },
  finderBtnEmoji: { fontSize: 26, width: 32, textAlign: 'center' },
  finderBtnText: { flex: 1 },
  finderBtnTitle: {
    fontSize: Typography.size.md, fontWeight: Typography.weight.semibold,
    color: Colors.tealLight, marginBottom: 2,
  },
  finderBtnDesc: { fontSize: Typography.size.xs, color: Colors.textMuted },

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
  badgeLocked: { opacity: 0.5 },
  badgeEmoji: { fontSize: 24 },
  badgeTitle: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.semibold,
    textAlign: 'center',
  },
  badgeDesc: { fontSize: 10, color: Colors.textMuted, textAlign: 'center' },

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
