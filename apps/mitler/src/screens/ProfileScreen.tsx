import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Linking,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius } from '../theme/colors';
import { useMitlerStore } from '../store/useStore';
import { useData } from '../data/loader';
import { useLanguage } from '../i18n/useLanguage';
import { calcNumerology } from '../utils/numerology';
import { getLifePathMeaning } from '../utils/numerology';
import { getWeeklyReading } from '../utils/weeklyReading';
import { MitlerDetailScreen, MitlerEntry } from './MitlerDetailScreen';

const ELEMENTS = ['ateş', 'su', 'toprak', 'hava'] as const;
const ELEMENT_EMOJIS: Record<string, string> = {
  ateş: '△', su: '▽', toprak: '⊕', hava: '○'
};

const BADGES = [
  { id: 'b001', titleKey: 'profile.badge.b001.title', descKey: 'profile.badge.b001.desc', emoji: '🌙', required: 7 },
  { id: 'b002', titleKey: 'profile.badge.b002.title', descKey: 'profile.badge.b002.desc', emoji: '📜', required: 21 },
  { id: 'b003', titleKey: 'profile.badge.b003.title', descKey: 'profile.badge.b003.desc', emoji: '🎭', required: 30 },
  { id: 'b004', titleKey: 'profile.badge.b004.title', descKey: 'profile.badge.b004.desc', emoji: '☥', required: 50 },
  { id: 'b005', titleKey: 'profile.badge.b005.title', descKey: 'profile.badge.b005.desc', emoji: '✦', required: 100 },
  { id: 'b006', titleKey: 'profile.badge.b006.title', descKey: 'profile.badge.b006.desc', emoji: '☀️', required: 365 },
] as const;

function openExternal(url: string) {
  if (!url) return;
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer');
  } else {
    Linking.openURL(url).catch(() => {});
  }
}

// Embed → Sakin host köprüsü. Aile uygulamaları sakin.life içinde tam-ekran iframe.
// Eski netlify linkini açmak yerine host'a postMessage yollayıp kardeş uygulamayı
// IN-APP açtırırız (iframe içinde Safari'ye çıkma = App Store 4.2 riski). Native'de
// (standalone) fallback olarak link açılır.
function postToHost(payload: object, fallbackUrl?: string) {
  try {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.parent && window.parent !== window) {
      window.parent.postMessage(payload, window.location.origin);
      return;
    }
  } catch { /* ignore */ }
  if (fallbackUrl) openExternal(fallbackUrl);
}

export function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { profile, isNewUser, bridgePrefill, createProfile, updateBirthData, stats, getTopStat, getLevelTitleKey, clearAllData } = useMitlerStore();
  const { lang, t } = useLanguage();
  const { archetypes: archetypesData, myths: mythsData, images: imagesData } = useData();

  const [showOnboarding, setShowOnboarding] = useState(isNewUser);
  // ── SAKİN HOST KÖPRÜSÜ — onboarding kısayolu ────────────────────────────────
  // Host ad + doğum bilgisini verdiyse onboarding TEK ekrana iner: yalnızca
  // element seçici. Ad (step 1) ve doğum (step 3) ekranları HİÇ render edilmez;
  // değerler host'tan sessizce alınır. Element doğumdan TÜRETİLEMEZ (arketip/mit
  // hesabını bozar), bu yüzden kullanıcı yalnızca onu seçer.
  //
  // `bridged` İLK render'da doğrudur: store, bridgePrefill'i lazy initializer ile
  // senkron localStorage'tan okur (bkz. useStore.ts), dolayısıyla burada async bir
  // tik beklemeden hazırdır. step bu yüzden ilk render'da element adımına ayarlanır.
  const ELEMENT_STEP = 2;
  const bridged = !!(bridgePrefill?.name);
  const [name, setName] = useState(bridgePrefill?.name ?? '');
  const [element, setElement] = useState<typeof ELEMENTS[number]>('ateş');
  const [step, setStep] = useState(bridged ? ELEMENT_STEP : 1);
  const [openEntry, setOpenEntry] = useState<MitlerEntry | null>(null);

  const openArchetype = (a: typeof archetypesData[0]) =>
    setOpenEntry({
      kind: 'archetype', id: a.id, name: a.name, emoji: a.emoji,
      tagline: '', detailMeta: `${a.tradition} · ${a.category}`, searchBlob: '', data: a,
    });
  const openMyth = (m: typeof mythsData[0]) =>
    setOpenEntry({
      kind: 'myth', id: m.id, name: m.name, emoji: m.emoji,
      tagline: '', detailMeta: `${m.culture} · ${m.era}`, searchBlob: '', data: m,
    });
  const openImage = (i: typeof imagesData[0]) =>
    setOpenEntry({
      kind: 'image', id: i.id, name: i.name, emoji: i.emoji,
      tagline: '', detailMeta: `${i.tradition} · ${i.category}`, searchBlob: '', data: i,
    });

  // step 3 birth data — köprüden gelen değerlerle pre-fill
  const bridgeDateParts = (() => {
    const bd = bridgePrefill?.birthDate;
    if (!bd) return { d: '', m: '', y: '' };
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(bd);
    return m ? { y: m[1], m: m[2], d: m[3] } : { d: '', m: '', y: '' };
  })();
  const [fullName, setFullName] = useState(bridgePrefill?.name ?? '');
  const [birthDay, setBirthDay] = useState(bridgeDateParts.d);
  const [birthMonth, setBirthMonth] = useState(bridgeDateParts.m);
  const [birthYear, setBirthYear] = useState(bridgeDateParts.y);

  // inline birth data edit (when already profiled but no birth data)
  const [showBirthForm, setShowBirthForm] = useState(false);
  const [editFullName, setEditFullName] = useState('');
  const [editDay, setEditDay] = useState('');
  const [editMonth, setEditMonth] = useState('');
  const [editYear, setEditYear] = useState('');
  const [editHour, setEditHour] = useState('');
  const [editMinute, setEditMinute] = useState('');
  const [editCity, setEditCity] = useState('');

  const topArchetypeId = getTopStat(stats.archetypeCounts);
  const topMythId      = getTopStat(stats.mythCounts);
  const topImageId     = getTopStat(stats.imageCounts);
  const topTradition   = getTopStat(stats.traditionCounts);

  const topArchetype = topArchetypeId ? archetypesData.find(a => a.id === topArchetypeId) : null;
  const topMyth      = topMythId      ? mythsData.find(m => m.id === topMythId)           : null;
  const topImage     = topImageId     ? imagesData.find(i => i.id === topImageId)         : null;

  const totalReadings = profile?.totalReadings || 0;
  const streak        = profile?.streak || 0;
  const level         = profile?.level || 1;
  const levelTitle    = t(getLevelTitleKey(level) as any);

  const levelProgress = () => {
    const nextAt    = level * 7;
    const currentAt = (level - 1) * 7;
    return Math.min(Math.max((totalReadings - currentAt) / (nextAt - currentAt), 0), 1);
  };

  const analysis = useMemo(() => {
    // İsim host'tan gelir (fullName); yoksa görünen ada düş — embed ASLA doğum/
    // profil formu sormaz, host (giriş + Sakin Ailesi) doğum bilgisinin sahibidir.
    const nm = profile?.fullName || profile?.name;
    if (!nm || !profile?.birthDate) return null;
    try {
      const nums   = calcNumerology(nm, profile.birthDate);
      const weekly = getWeeklyReading(nums, lang);
      const lp     = getLifePathMeaning(nums.lifePath, lang);
      return { nums, weekly, lp };
    } catch {
      return null;
    }
  }, [profile?.fullName, profile?.birthDate, lang]);

  const formatBirthDate = (d: string, m: string, y: string) => {
    const dd = d.padStart(2, '0');
    const mm = m.padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  };

  const birthDataValid = (d: string, m: string, y: string) =>
    parseInt(d) >= 1 && parseInt(d) <= 31 &&
    parseInt(m) >= 1 && parseInt(m) <= 12 &&
    parseInt(y) >= 1900 && parseInt(y) <= new Date().getFullYear();

  const handleOnboarding = async () => {
    // KÖPRÜ AKIŞI: element seçildi → host'tan gelen ad + doğum ile profili
    // doğrudan kur. step 3 (doğum formu) hiç gösterilmez/girilmez.
    if (bridged) {
      await createProfile(
        (bridgePrefill?.name ?? '').trim() || 'Sakin',
        element,
        bridgePrefill?.birthDate,
        (bridgePrefill?.name ?? '').trim() || undefined,
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
      await createProfile(name.trim(), element, bd, fullName.trim() || undefined);
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
    const hourNum = editHour.trim() !== '' ? Math.min(Math.max(parseInt(editHour, 10), 0), 23) : undefined;
    const minNum = editMinute.trim() !== '' ? Math.min(Math.max(parseInt(editMinute, 10), 0), 59) : undefined;
    const city = editCity.trim() || undefined;
    await updateBirthData(editFullName.trim(), bd, { birthHour: hourNum, birthMinute: minNum, birthCity: city });
    setShowBirthForm(false);
  };

  const handleDeleteData = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const ok = window.confirm(`${t('profile.deleteData.confirmTitle')}\n\n${t('profile.deleteData.confirmBody')}`);
      if (ok) { clearAllData(); setShowOnboarding(true); setStep(1); setName(''); }
      return;
    }
    Alert.alert(
      t('profile.deleteData.confirmTitle'),
      t('profile.deleteData.confirmBody'),
      [
        { text: t('profile.deleteData.cancel'), style: 'cancel' },
        { text: t('profile.deleteData.confirm'), style: 'destructive', onPress: () => {
            clearAllData(); setShowOnboarding(true); setStep(1); setName('');
        } },
      ],
    );
  };

  if (showOnboarding || isNewUser) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.onboarding, { paddingTop: insets.top + Spacing.lg }]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.onboardingEmoji}>☥</Text>
        <Text style={styles.onboardingTitle}>{t('profile.onboarding.title')}</Text>
        <Text style={styles.onboardingSubtitle}>{t('profile.onboarding.subtitle')}</Text>

        {step === 1 && (
          <>
            <Text style={styles.onboardingQuestion}>{t('profile.onboarding.q1')}</Text>
            <TextInput
              style={styles.nameInput}
              value={name}
              onChangeText={setName}
              placeholder={t('profile.onboarding.namePlaceholder')}
              placeholderTextColor={Colors.textMuted}
              autoFocus
            />
          </>
        )}

        {step === 2 && (
          <>
            <Text style={styles.onboardingQuestion}>{t('profile.onboarding.q2')}</Text>
            <View style={styles.elementsGrid}>
              {ELEMENTS.map(el => {
                const elKey =
                  el === 'ateş'   ? 'profile.element.fire'  :
                  el === 'su'     ? 'profile.element.water' :
                  el === 'toprak' ? 'profile.element.earth' :
                                    'profile.element.air';
                return (
                  <TouchableOpacity
                    key={el}
                    style={[styles.elementBtn, element === el && styles.elementBtnActive]}
                    onPress={() => setElement(el)}
                  >
                    <Text style={styles.elementEmoji}>{ELEMENT_EMOJIS[el]}</Text>
                    <Text style={[styles.elementName, { color: element === el ? Colors.gold : Colors.textSecondary }]}>
                      {t(elKey)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}

        {step === 3 && (
          <>
            <Text style={styles.onboardingQuestion}>{t('profile.onboarding.q3')}</Text>
            <Text style={styles.onboardingHint}>{t('profile.onboarding.q3desc')}</Text>
            <TextInput
              style={styles.nameInput}
              value={fullName}
              onChangeText={setFullName}
              placeholder={t('profile.onboarding.fullName')}
              placeholderTextColor={Colors.textMuted}
              autoCapitalize="words"
            />
            <View style={styles.dateRow}>
              <TextInput
                style={[styles.dateInput, { flex: 1 }]}
                value={birthDay}
                onChangeText={setBirthDay}
                placeholder={t('finder.birth.day')}
                placeholderTextColor={Colors.textMuted}
                keyboardType="number-pad"
                maxLength={2}
              />
              <TextInput
                style={[styles.dateInput, { flex: 1 }]}
                value={birthMonth}
                onChangeText={setBirthMonth}
                placeholder={t('finder.birth.month')}
                placeholderTextColor={Colors.textMuted}
                keyboardType="number-pad"
                maxLength={2}
              />
              <TextInput
                style={[styles.dateInput, { flex: 2 }]}
                value={birthYear}
                onChangeText={setBirthYear}
                placeholder={t('finder.birth.year')}
                placeholderTextColor={Colors.textMuted}
                keyboardType="number-pad"
                maxLength={4}
              />
            </View>
          </>
        )}

        <TouchableOpacity
          style={[styles.onboardingBtn, { opacity: step === 1 && name.trim().length === 0 ? 0.4 : 1 }]}
          onPress={handleOnboarding}
          disabled={step === 1 && name.trim().length === 0}
        >
          <Text style={styles.onboardingBtnText}>
            {bridged || step >= 3 ? t('profile.onboarding.start') : t('common.continue')}
          </Text>
        </TouchableOpacity>

        {step === 3 && (
          <TouchableOpacity onPress={handleSkipBirth} style={styles.skipBtn}>
            <Text style={styles.skipText}>{t('common.skip')}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    );
  }

  if (!profile) return null;

  if (openEntry) {
    return <MitlerDetailScreen entry={openEntry} onClose={() => setOpenEntry(null)} />;
  }

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.hero}>
        <View style={styles.avatarRing}>
          <View style={styles.avatar}>
            <Text style={styles.avatarEmoji}>{ELEMENT_EMOJIS[profile.element || 'ateş']}</Text>
          </View>
        </View>
        <Text style={styles.heroName}>{profile.name}</Text>
        <Text style={styles.heroLevel}>{levelTitle}</Text>
        <Text style={styles.heroElement}>
          {ELEMENT_EMOJIS[profile.element || 'ateş']} {
            profile.element
              ? t(
                  profile.element === 'ateş'   ? 'profile.element.fire'  :
                  profile.element === 'su'     ? 'profile.element.water' :
                  profile.element === 'toprak' ? 'profile.element.earth' :
                                                 'profile.element.air'
                )
              : t('profile.elementSeparator')
          }
        </Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{totalReadings}</Text>
          <Text style={styles.statLabel}>{t('profile.stat.totalReadings')}</Text>
        </View>
        <View style={[styles.statBox, styles.statBoxCenter]}>
          <Text style={[styles.statValue, { color: Colors.ember }]}>△ {streak}</Text>
          <Text style={styles.statLabel}>{t('profile.stat.streak')}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{level}</Text>
          <Text style={styles.statLabel}>{t('profile.stat.level')}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('profile.section.levelProgress')}</Text>
          <Text style={styles.sectionMeta}>
            {t('profile.section.levelProgressMeta', {
              cur: levelTitle,
              next: t(getLevelTitleKey(level + 1) as any),
            })}
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${levelProgress() * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {t('profile.section.progressText', { cur: totalReadings, total: level * 7 })}
        </Text>
      </View>

      {/* Kişisel Harita */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('profile.section.personalMap')}</Text>

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
                  <Text style={[styles.analysisTitle, { color: Colors.gold }]}>
                    {analysis.lp.title}
                  </Text>
                  <Text style={styles.analysisMeta}>
                    {t('profile.numerology.lifePathLabel', { keyword: analysis.lp.keyword })}
                  </Text>
                </View>
              </View>
              <Text style={styles.analysisDesc}>{analysis.lp.desc}</Text>
              <View style={styles.subNums}>
                <View style={styles.subNum}>
                  <Text style={[styles.subNumVal, { color: Colors.goldLight }]}>{analysis.nums.expression}</Text>
                  <Text style={styles.subNumLabel}>{t('profile.numerology.expression')}</Text>
                </View>
                <View style={styles.subNum}>
                  <Text style={[styles.subNumVal, { color: Colors.goldLight }]}>{analysis.nums.soulUrge}</Text>
                  <Text style={styles.subNumLabel}>{t('profile.numerology.soulUrge')}</Text>
                </View>
                <View style={styles.subNum}>
                  <Text style={[styles.subNumVal, { color: Colors.goldLight }]}>{analysis.nums.personality}</Text>
                  <Text style={styles.subNumLabel}>{t('profile.numerology.personality')}</Text>
                </View>
              </View>
            </View>

            {/* Human Design teaser removed — dedicated Sakin Tasarım app owns HD content. */}

            {/* Weekly Reading */}
            <View style={[styles.analysisCard, { borderColor: Colors.teal + '60' }]}>
              <View style={styles.analysisHeader}>
                <View style={[styles.analysisBadge, { backgroundColor: Colors.teal + '20' }]}>
                  <Text style={{ fontSize: 18 }}>◎</Text>
                </View>
                <View style={styles.analysisHeaderText}>
                  <Text style={[styles.analysisTitle, { color: Colors.tealLight }]}>
                    {analysis.weekly.theme}
                  </Text>
                  <Text style={styles.analysisMeta}>
                    {t('profile.weekly.weekFmt', { week: analysis.weekly.weekNumber })}
                  </Text>
                </View>
              </View>
              <Text style={styles.analysisDesc}>{analysis.weekly.message}</Text>
              <Text style={[styles.analysisMeta, { marginTop: Spacing.xs }]}>
                {t('profile.weekly.personalYearFmt', { year: analysis.weekly.personalYear })}
              </Text>
            </View>
          </>
        ) : showBirthForm ? (
          <View style={styles.birthForm}>
            <Text style={styles.birthFormTitle}>{t('profile.birth.title')}</Text>
            <TextInput
              style={styles.nameInput}
              value={editFullName}
              onChangeText={setEditFullName}
              placeholder={t('profile.onboarding.fullName')}
              placeholderTextColor={Colors.textMuted}
              autoCapitalize="words"
            />
            <View style={styles.dateRow}>
              <TextInput
                style={[styles.dateInput, { flex: 1 }]}
                value={editDay}
                onChangeText={setEditDay}
                placeholder={t('finder.birth.day')}
                placeholderTextColor={Colors.textMuted}
                keyboardType="number-pad"
                maxLength={2}
              />
              <TextInput
                style={[styles.dateInput, { flex: 1 }]}
                value={editMonth}
                onChangeText={setEditMonth}
                placeholder={t('finder.birth.month')}
                placeholderTextColor={Colors.textMuted}
                keyboardType="number-pad"
                maxLength={2}
              />
              <TextInput
                style={[styles.dateInput, { flex: 2 }]}
                value={editYear}
                onChangeText={setEditYear}
                placeholder={t('finder.birth.year')}
                placeholderTextColor={Colors.textMuted}
                keyboardType="number-pad"
                maxLength={4}
              />
            </View>

            <Text style={styles.birthHintInline}>{t('profile.birth.hourCityHint')}</Text>
            <View style={styles.dateRow}>
              <TextInput
                style={[styles.dateInput, { flex: 1 }]}
                value={editHour}
                onChangeText={setEditHour}
                placeholder={t('profile.birth.hourPlaceholder')}
                placeholderTextColor={Colors.textMuted}
                keyboardType="number-pad"
                maxLength={2}
              />
              <TextInput
                style={[styles.dateInput, { flex: 1 }]}
                value={editMinute}
                onChangeText={setEditMinute}
                placeholder={t('profile.birth.minutePlaceholder')}
                placeholderTextColor={Colors.textMuted}
                keyboardType="number-pad"
                maxLength={2}
              />
            </View>

            <TextInput
              style={[styles.nameInput, { fontSize: Typography.size.md }]}
              value={editCity}
              onChangeText={setEditCity}
              placeholder={t('profile.birth.cityPlaceholder')}
              placeholderTextColor={Colors.textMuted}
              autoCapitalize="words"
            />

            <TouchableOpacity
              style={[styles.onboardingBtn, {
                opacity: editFullName.trim().length > 0 && birthDataValid(editDay, editMonth, editYear) ? 1 : 0.4
              }]}
              onPress={handleSaveBirthData}
              disabled={editFullName.trim().length === 0 || !birthDataValid(editDay, editMonth, editYear)}
            >
              <Text style={styles.onboardingBtnText}>{t('profile.birth.create')}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowBirthForm(false)} style={styles.skipBtn}>
              <Text style={styles.skipText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>

      {/* Mit Haritan */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('profile.section.mythMap')}</Text>

        {topArchetype && (
          <TouchableOpacity
            style={[styles.spiritCard, { borderColor: Colors.gold }]}
            onPress={() => openArchetype(topArchetype)}
            activeOpacity={0.85}
          >
            <Text style={styles.spiritEmoji}>{topArchetype.emoji}</Text>
            <View style={styles.spiritInfo}>
              <Text style={styles.spiritLabel}>{t('profile.map.topArchetype')}</Text>
              <Text style={[styles.spiritValue, { color: Colors.gold }]}>{topArchetype.name}</Text>
              <Text style={styles.spiritCount}>
                {t('profile.map.timesAccompanied', {
                  n: stats.archetypeCounts[topArchetype.id] || 0,
                  meta: topArchetype.tradition,
                })}
              </Text>
            </View>
            <Text style={[styles.spiritArrow, { color: Colors.gold }]}>→</Text>
          </TouchableOpacity>
        )}
        {topMyth && (
          <TouchableOpacity
            style={[styles.spiritCard, { borderColor: Colors.purple }]}
            onPress={() => openMyth(topMyth)}
            activeOpacity={0.85}
          >
            <Text style={styles.spiritEmoji}>{topMyth.emoji}</Text>
            <View style={styles.spiritInfo}>
              <Text style={styles.spiritLabel}>{t('profile.map.topMyth')}</Text>
              <Text style={[styles.spiritValue, { color: Colors.purpleLight }]}>{topMyth.name}</Text>
              <Text style={styles.spiritCount}>
                {t('profile.map.timesAccompanied', {
                  n: stats.mythCounts[topMyth.id] || 0,
                  meta: topMyth.culture,
                })}
              </Text>
            </View>
            <Text style={[styles.spiritArrow, { color: Colors.purpleLight }]}>→</Text>
          </TouchableOpacity>
        )}
        {topImage && (
          <TouchableOpacity
            style={[styles.spiritCard, { borderColor: Colors.teal }]}
            onPress={() => openImage(topImage)}
            activeOpacity={0.85}
          >
            <Text style={styles.spiritEmoji}>{topImage.emoji}</Text>
            <View style={styles.spiritInfo}>
              <Text style={styles.spiritLabel}>{t('profile.map.topImage')}</Text>
              <Text style={[styles.spiritValue, { color: Colors.tealLight }]}>{topImage.name}</Text>
              <Text style={styles.spiritCount}>
                {t('profile.map.timesAccompanied', {
                  n: stats.imageCounts[topImage.id] || 0,
                  meta: topImage.tradition,
                })}
              </Text>
            </View>
            <Text style={[styles.spiritArrow, { color: Colors.tealLight }]}>→</Text>
          </TouchableOpacity>
        )}
        {topTradition && (
          <View style={[styles.spiritCard, { borderColor: Colors.ember }]}>
            <Text style={styles.spiritEmoji}>📜</Text>
            <View style={styles.spiritInfo}>
              <Text style={styles.spiritLabel}>{t('profile.map.topTradition')}</Text>
              <Text style={[styles.spiritValue, { color: Colors.emberLight }]}>{topTradition}</Text>
              <Text style={styles.spiritCount}>
                {t('profile.map.timesCalled', { n: stats.traditionCounts[topTradition] || 0 })}
              </Text>
            </View>
          </View>
        )}
        {totalReadings === 0 && (
          <Text style={styles.emptyHint}>{t('profile.map.emptyHint')}</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('profile.section.howTo')}</Text>
        <View style={styles.howCard}>
          <Text style={styles.howLine}>{t('profile.howTo.line1')}</Text>
          <Text style={styles.howLine}>{t('profile.howTo.line2')}</Text>
          <Text style={styles.howLine}>{t('profile.howTo.line3')}</Text>
          <Text style={styles.howLine}>{t('profile.howTo.line4')}</Text>
          <Text style={styles.howLine}>{t('profile.howTo.line5')}</Text>
        </View>
      </View>

      {/* Language picker removed — host (Sakin) controls language. */}

      {/* Veri ve Gizlilik */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('profile.deleteData.section')}</Text>
        <Text style={styles.deleteNote}>{t('profile.deleteData.note')}</Text>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={handleDeleteData}
          activeOpacity={0.8}
        >
          <Text style={styles.deleteBtnText}>{t('profile.deleteData.button')}</Text>
        </TouchableOpacity>
      </View>

      {/* Sakin Ailesi */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('family.title')}</Text>
        <Text style={styles.familyIntro}>{t('family.intro')}</Text>

        <TouchableOpacity
          style={styles.familyMaster}
          onPress={() => postToHost({ type: 'sakin-close-embed' }, 'https://sakin.life')}
          activeOpacity={0.75}
        >
          <Text style={styles.familyMasterSymbol}>✦</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.familyMasterName}>{t('family.master.name')}</Text>
            <Text style={styles.familyMasterDesc}>{t('family.master.desc')}</Text>
          </View>
          <View style={[styles.familyBadge, styles.familyBadgeWeb]}>
            <Text style={[styles.familyBadgeText, { color: Colors.textMuted }]}>
              {t('family.webBadge')}
            </Text>
          </View>
          <Text style={styles.familyMasterArrow}>→</Text>
        </TouchableOpacity>

        <View style={styles.familyGrid}>
          {(() => {
            // Uniform aile menüsü: açık app (aktif, en üstte) → diğerleri sırayla tıklanabilir. Numeroloji yok.
            const isTr = lang === 'tr';
            const ALL = [
              { host: 'hayvan',   name: isTr ? 'Sakin Hayvan'   : 'Sakin Animals', symbol: '⊕' },
              { host: 'mitler',   name: isTr ? 'Sakin Mitler'   : 'Sakin Myths',   symbol: '⚡' },
              { host: 'tasarim',  name: isTr ? 'Sakin Tasarım'  : 'Sakin Design',  symbol: '◉' },
              { host: 'taslar',   name: isTr ? 'Sakin Taşlar'   : 'Sakin Stones',  symbol: '◈' },
              { host: 'bitkiler', name: isTr ? 'Sakin Bitkiler' : 'Sakin Plants',  symbol: '✿' },
            ];
            const CURRENT = 'mitler';
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
              <View style={[styles.familyBadge, { borderColor: Colors.teal + '60' }]}>
                <Text style={[styles.familyBadgeText, { color: Colors.teal }]}>
                  {app.onPress ? '→' : t('family.badge.active')}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Rozetler */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('profile.section.badges')}</Text>
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
                  {earned ? badge.emoji : '🔒'}
                </Text>
                <Text style={[styles.badgeTitle, { color: earned ? Colors.gold : Colors.textMuted }]}>
                  {t(badge.titleKey as any)}
                </Text>
                <Text style={styles.badgeDesc}>{t(badge.descKey as any)}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Attribution & Privacy */}
      <View style={styles.attributionWrap}>
        <Text style={styles.attributionText}>{t('profile.attribution')}</Text>
        <TouchableOpacity onPress={() => openExternal('https://sakin.life/privacy')} activeOpacity={0.7}>
          <Text style={styles.privacyLink}>{t('profile.privacyLinks')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingBottom: Spacing.xxxl },
  onboarding: {
    alignItems: 'center',
    padding: Spacing.xl,
    gap: Spacing.md,
    paddingBottom: Spacing.xxxl,
  },
  onboardingEmoji: { fontSize: 56, marginBottom: Spacing.sm, color: Colors.gold },
  onboardingTitle: {
    fontSize: Typography.size.xxl,
    fontWeight: Typography.weight.bold,
    color: Colors.textPrimary,
    letterSpacing: 3,
  },
  onboardingSubtitle: {
    fontSize: Typography.size.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: Typography.size.sm * 1.6,
  },
  onboardingHint: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: Typography.size.xs * 1.7,
    marginBottom: Spacing.xs,
  },
  onboardingQuestion: {
    fontSize: Typography.size.lg,
    color: Colors.gold,
    marginTop: Spacing.xl,
    textAlign: 'center',
  },
  nameInput: {
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: Typography.size.lg,
    color: Colors.textPrimary,
    backgroundColor: Colors.backgroundCard,
    width: '100%',
    maxWidth: 380,
    textAlign: 'center',
    alignSelf: 'center',
  },
  dateRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    width: '100%',
    maxWidth: 380,
    alignSelf: 'center',
  },
  dateInput: {
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    fontSize: Typography.size.md,
    color: Colors.textPrimary,
    backgroundColor: Colors.backgroundCard,
    minWidth: 0,
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
    marginTop: Spacing.xl,
    backgroundColor: Colors.gold,
    paddingHorizontal: Spacing.xxxl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.round,
  },
  onboardingBtnText: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.bold,
    color: '#1A1208',
    letterSpacing: 1,
  },
  skipBtn: { paddingVertical: Spacing.sm },
  skipText: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    letterSpacing: 0.5,
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

  // Analysis cards
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
  previewBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    borderColor: Colors.purple + '60',
    backgroundColor: Colors.purple + '15',
  },
  previewBadgeText: {
    fontSize: 9,
    fontWeight: Typography.weight.bold,
    letterSpacing: 1.5,
    color: Colors.purpleLight,
  },
  hdCtaBtn: {
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.purple + '60',
    backgroundColor: Colors.purple + '10',
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    gap: 2,
  },
  hdCtaText: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
    color: Colors.purpleLight,
    letterSpacing: 0.8,
  },
  hdCtaSub: {
    fontSize: 10,
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  birthHintInline: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    fontStyle: 'italic',
    marginTop: Spacing.xs,
    lineHeight: Typography.size.xs * 1.6,
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
  spiritArrow: { fontSize: 18, marginLeft: Spacing.sm },
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

  howCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.divider,
    gap: Spacing.sm,
  },
  howLine: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    lineHeight: Typography.size.sm * 1.7,
    fontWeight: Typography.weight.light,
  },

  badgesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },

  langRow: { flexDirection: 'row', gap: Spacing.sm },
  langBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.backgroundCard,
    borderWidth: 1,
    borderColor: Colors.divider,
    alignItems: 'center',
  },
  langBtnActive: {
    borderColor: Colors.gold,
    backgroundColor: Colors.goldGlow,
  },
  langLabel: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
    letterSpacing: 0.5,
  },
  langNote: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    fontStyle: 'italic',
    marginTop: Spacing.sm,
    lineHeight: Typography.size.xs * 1.6,
  },

  // Sakin Ailesi
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
    marginLeft: Spacing.sm,
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
  badgeEmoji: { color: Colors.textPrimary, fontSize: 24 },
  badgeTitle: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.semibold,
    textAlign: 'center',
  },
  badgeDesc: { fontSize: 10, color: Colors.textMuted, textAlign: 'center' },

  deleteNote: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    lineHeight: 18,
    marginBottom: Spacing.sm,
  },
  deleteBtn: {
    borderWidth: 1,
    borderColor: Colors.ember,
    borderRadius: BorderRadius.sm,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  deleteBtnText: {
    color: Colors.ember,
    fontSize: Typography.size.sm,
    letterSpacing: 1,
  },
  familyBadgeWeb: {
    borderColor: Colors.textMuted + '40',
    backgroundColor: 'transparent',
    marginRight: 4,
  },
  attributionWrap: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  attributionText: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 17,
    fontWeight: Typography.weight.light,
  },
  privacyLink: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    letterSpacing: 1.5,
    textDecorationLine: 'underline',
  },
});
