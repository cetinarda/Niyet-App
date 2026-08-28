import React, { useMemo, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, Alert, Linking, Platform,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { IdCardScreen } from './IdCardScreen';
import { BUILD_INFO } from '../buildInfo';

const PRIVACY_URL = 'https://sakin.life/tasarim/gizlilik';
const TERMS_URL = 'https://sakin.life/tasarim/kosullar';
const SUPPORT_EMAIL = 'info@sakin.life';

// Embed → Sakin host köprüsü. Diğer 4 aile uygulamasında (hayvan/mitler/taslar/
// bitkiler) var, Tasarım'da hiç yoktu: kullanıcı diğer uygulamalara geçmek için
// host'a manuel dönüp Ailesi panelini aramak zorunda kalıyordu. Native'de (App
// Store 2.5.6/4.2.6 riski) gizli, sadece web'de gösterilir: diğer 4 embed'le birebir aynı desen.
function postToHost(payload: object, fallbackUrl?: string) {
  try {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.parent && window.parent !== window) {
      window.parent.postMessage(payload, window.location.origin);
      return;
    }
  } catch { /* ignore */ }
  if (fallbackUrl) Linking.openURL(fallbackUrl).catch(() => {});
}

const SAKIN_FAMILY_APPS = [
  // Kardeş uygulama adları host'un i18n'iyle birebir aynı olmalı
  // (host EN'de "Sakin Animals / Myths / Design / Stones / Plants" diyor).
  { host: 'hayvan',   name: 'Sakin Hayvan',   nameEn: 'Sakin Animals', symbol: '⊕' },
  { host: 'mitler',   name: 'Sakin Mitler',   nameEn: 'Sakin Myths',   symbol: '⚡' },
  { host: 'tasarim',  name: 'Sakin Tasarım',  nameEn: 'Sakin Design',  symbol: '◉' },
  { host: 'taslar',   name: 'Sakin Taşlar',   nameEn: 'Sakin Stones',  symbol: '◈' },
  { host: 'bitkiler', name: 'Sakin Bitkiler', nameEn: 'Sakin Plants',  symbol: '✿' },
] as const;
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../theme/colors';
import { useTasarimStore } from '../store/useStore';
import { CITIES, City, searchCities } from '../data/cities';
import { TYPES } from '../data/types';
import { AUTHORITIES } from '../data/authorities';
import { getLang, L } from '../i18n';
import { cityLabel } from '../data/cities';
import { definitionLabel } from '../utils/humanDesign';

// Profil ekranı hiç i18n kullanmıyordu: tüm etiketler, form alanları, hata
// mesajları ve uyarılar her dilde Türkçe basıyordu (kullanıcı: "eng modda
// türkçe sızıyor"). B() ile iki dilli hale getirildi.
const B = (tr: string, en: string) => (getLang() === 'en' ? en : tr);

export function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const {
    profiles, activeProfile, stats, getLevelTitle,
    addProfile, selectProfile, deleteProfile, chart, bridgePrefill,
  } = useTasarimStore();

  const [showForm, setShowForm] = useState(!!bridgePrefill);
  const [showIdCard, setShowIdCard] = useState(false);

  if (showIdCard) {
    return <IdCardScreen onClose={() => setShowIdCard(false)} />;
  }

  if (!activeProfile && !showForm) {
    return (
      <View style={[styles.empty, { paddingTop: insets.top + 60 }]}>
        <Text style={styles.medallion}>✦</Text>
        <Text style={styles.emptyTitle}>{B('Profilini oluştur', 'Create your profile')}</Text>
        <Text style={styles.emptyDesc}>
          Adın, doğum günün, doğum saatin ve doğum şehrin Human Design haritan için
          gereklidir. Bilgiler cihazında tutulur, dışarı gönderilmez.
        </Text>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => setShowForm(true)}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryBtnText}>{B('Başla →', 'Start →')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (showForm) {
    return (
      <NewProfileForm
        prefill={bridgePrefill}
        onCancel={() => setShowForm(false)}
        onSave={async (name, date, time, city) => {
          await addProfile(name, date, time, city, true);
          setShowForm(false);
        }}
      />
    );
  }

  const t = chart ? TYPES[chart.type] : null;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + Spacing.lg, paddingBottom: Spacing.xxl }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarEmoji}>{t?.emoji || '✦'}</Text>
        </View>
        <Text style={styles.name}>{activeProfile!.name}</Text>
        {chart && (
          <Text style={styles.subtitle}>
            {L(TYPES[chart.type], 'name')} · {chart.profile} · {L(AUTHORITIES[chart.authority], 'name')}
          </Text>
        )}
      </View>

      <TouchableOpacity
        style={styles.idCardCta}
        onPress={() => setShowIdCard(true)}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={B("Kimlik Kartı'nı aç", 'Open ID card')}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.idCardCtaLabel}>{B('KİMLİK KARTI', 'ID CARD')}</Text>
          <Text style={styles.idCardCtaTitle}>
            {B("Haritanı kart olarak indir ya da paylaş", "Download or share your chart as a card")}
          </Text>
          <Text style={styles.idCardCtaSub}>
            {B("Fotoğraf · tip · profil · kanallar tek görselde", "Photo · type · profile · channels in one image")}
          </Text>
        </View>
        <Text style={styles.idCardCtaArrow}>→</Text>
      </TouchableOpacity>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats.totalOpens}</Text>
          <Text style={styles.statLabel}>{B('Toplam Açılış', 'Total Opens')}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats.streak}🔥</Text>
          <Text style={styles.statLabel}>{B('Süreklilik', 'Streak')}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{getLevelTitle(stats.level)}</Text>
          <Text style={styles.statLabel}>Sv. {stats.level}</Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.cardKicker}>{B('DOĞUM BİLGİLERİ', 'BIRTH DETAILS')}</Text>
        <InfoRow k={B('Tarih', 'Date')} v={activeProfile!.birthDate} />
        <InfoRow k={B('Saat', 'Time')} v={activeProfile!.birthTime} />
        <InfoRow k={B('Şehir', 'City')} v={cityLabel(activeProfile!.city)} />
        <InfoRow k={B('Enlem / Boylam', 'Latitude / Longitude')}
          v={`${activeProfile!.city.lat.toFixed(2)}° / ${activeProfile!.city.lng.toFixed(2)}°`} />
        <InfoRow k={B('UTC Ofset', 'UTC offset')} v={`UTC${activeProfile!.city.tz >= 0 ? '+' : ''}${activeProfile!.city.tz}`} />
      </View>

      {chart && (
        <View style={styles.infoCard}>
          <Text style={styles.cardKicker}>{B('HARİTA ÖZETİ', 'CHART SUMMARY')}</Text>
          <InfoRow k={B('Tip', 'Type')} v={chart.type} />
          <InfoRow k={B('Strateji', 'Strategy')} v={L(TYPES[chart.type], 'strategy')} />
          <InfoRow k={B('Doğru Frekans', 'Signature')} v={L(TYPES[chart.type], 'signature')} />
          <InfoRow k={B('Yanlış Frekans', 'Not-Self')} v={L(TYPES[chart.type], 'notSelf')} />
          <InfoRow k={B('Profil', 'Profile')} v={chart.profile} />
          <InfoRow k={B('Tanım', 'Definition')} v={definitionLabel(chart.definition)} />
          <InfoRow k={B('Aktif Kapı', 'Active Gates')} v={`${chart.activeGates.size} / 64`} />
          <InfoRow k={B('Aktif Kanal', 'Active Channels')} v={`${chart.activeChannels.length}`} />
          <InfoRow k={B('Tanımlı Merkez', 'Defined Centres')} v={`${chart.definedCenters.size} / 9`} />
        </View>
      )}

      <Text style={styles.sectionTitle}>{B('Kayıtlı Profiller', 'Saved Profiles')} ({profiles.length})</Text>
      {profiles.map(p => {
        const isActive = p.id === activeProfile!.id;
        return (
          <TouchableOpacity
            key={p.id}
            style={[styles.profileRow, isActive && { borderColor: Colors.gold }]}
            activeOpacity={0.85}
            onPress={() => selectProfile(p.id)}
            onLongPress={() => {
              Alert.alert(B('Profili sil', 'Delete profile'), `${p.name} silinsin mi?`, [
                { text: B('Vazgeç', 'Cancel'), style: 'cancel' },
                { text: B('Sil', 'Delete'), style: 'destructive', onPress: () => deleteProfile(p.id) },
              ]);
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.profileName}>{p.name}</Text>
              <Text style={styles.profileMeta}>
                {p.birthDate} · {p.birthTime} · {cityLabel(p.city)}
              </Text>
            </View>
            {isActive && <Text style={styles.activeChip}>{B('AKTİF', 'ACTIVE')}</Text>}
          </TouchableOpacity>
        );
      })}

      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => setShowForm(true)}
        activeOpacity={0.85}
      >
        <Text style={styles.addBtnText}>{B('+ Yeni Profil Ekle', '+ Add New Profile')}</Text>
      </TouchableOpacity>

      {Platform.OS === 'web' && (
        <View style={styles.familySection}>
          <Text style={styles.sectionTitle}>{B('Sakin Ailesi', 'Sakin Family')}</Text>
          <Text style={styles.familyIntro}>{B('Tek ekosistem. Tek abonelik. Birçok kapı.', 'One ecosystem. One subscription. Many doors.')}</Text>

          <TouchableOpacity
            style={styles.familyMaster}
            onPress={() => postToHost({ type: 'sakin-close-embed' }, 'https://sakin.life')}
            activeOpacity={0.75}
          >
            <Text style={styles.familyMasterSymbol}>✦</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.familyMasterName}>sakin.life</Text>
              <Text style={styles.familyMasterDesc}>{B('Ana merkez: tüm uygulamalara giriş', 'The hub: entry to every app')}</Text>
            </View>
            <Text style={styles.familyMasterArrow}>→</Text>
          </TouchableOpacity>

          {SAKIN_FAMILY_APPS
            .slice()
            .sort((a, b) => (a.host === 'tasarim' ? 0 : 1) - (b.host === 'tasarim' ? 0 : 1))
            .map(app => {
              const isCurrent = app.host === 'tasarim';
              return (
                <TouchableOpacity
                  key={app.host}
                  style={[styles.familyCard, isCurrent && styles.familyCardActive]}
                  onPress={isCurrent ? undefined : () => postToHost({ type: 'sakin-open-embed', app: app.host }, '')}
                  activeOpacity={isCurrent ? 1 : 0.7}
                  disabled={isCurrent}
                >
                  <Text style={[styles.familySymbol, isCurrent && { color: Colors.purple }]}>{app.symbol}</Text>
                  <Text style={[styles.familyName, isCurrent && { color: Colors.purple }]}>{L(app, "name")}</Text>
                  <View style={[styles.familyBadge, isCurrent && { borderColor: Colors.purple + '60' }]}>
                    <Text style={[styles.familyBadgeText, isCurrent && { color: Colors.purple }]}>
                      {isCurrent ? B('AKTİF', 'ACTIVE') : '→'}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
        </View>
      )}

      <View style={styles.legalLinks}>
        <TouchableOpacity
          onPress={() => Linking.openURL(PRIVACY_URL)}
          accessibilityRole="link"
          accessibilityLabel="Gizlilik politikası"
        >
          <Text style={styles.legalLink}>{B('Gizlilik Politikası', 'Privacy Policy')}</Text>
        </TouchableOpacity>
        <Text style={styles.legalSep}>·</Text>
        <TouchableOpacity
          onPress={() => Linking.openURL(TERMS_URL)}
          accessibilityRole="link"
          accessibilityLabel="Kullanım koşulları"
        >
          <Text style={styles.legalLink}>{B('Koşullar', 'Terms')}</Text>
        </TouchableOpacity>
        <Text style={styles.legalSep}>·</Text>
        <TouchableOpacity
          onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=Sakin%20Tasarım%20Geri%20Bildirim`)}
          accessibilityRole="link"
          accessibilityLabel="Destek e-postası"
        >
          <Text style={styles.legalLink}>{B('Destek', 'Support')}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footerNote}>
        {B('Bilgilerin yalnızca cihazında saklanır. Hesaplamalar lokal yapılır; doğum verin sunucuya gönderilmez. Sakin Tasarım eğitim ve kişisel keşif amaçlıdır; tıbbi, psikolojik veya finansal tavsiye değildir.', 'Your details are stored only on your device. Calculations run locally; your birth data is never sent to a server. Sakin Design is for education and personal exploration; it is not medical, psychological or financial advice.')}
      </Text>
      <Text style={styles.buildStamp}>
        v{BUILD_INFO.version} · {BUILD_INFO.commit} · {BUILD_INFO.builtAt.slice(0, 16).replace('T', ' ')}
      </Text>
    </ScrollView>
  );
}

function InfoRow({ k, v }: { k: string; v: string }) {
  return (
    <View style={infoStyles.row}>
      <Text style={infoStyles.k}>{k}</Text>
      <Text style={infoStyles.v} numberOfLines={2}>{v}</Text>
    </View>
  );
}

const isWeb = Platform.OS === 'web';

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function fmtDate(d: Date) {
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function fmtTime(d: Date) {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function NewProfileForm({
  onCancel,
  onSave,
  prefill,
}: {
  onCancel: () => void;
  onSave: (name: string, date: string, time: string, city: City) => Promise<void>;
  prefill?: { name?: string; birthDate?: string; birthTime?: string; city?: City | null } | null;
}) {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState(prefill?.name ?? '');

  // Native: birleşik Date; Web: ayrı text inputlar
  const [birth, setBirth] = useState<Date | null>(() => {
    if (prefill?.birthDate) {
      const [y, m, d] = prefill.birthDate.split('-').map(Number);
      const [hh, mm] = (prefill.birthTime ?? '12:00').split(':').map(Number);
      if (y && m && d) return new Date(y, m - 1, d, hh || 12, mm || 0, 0, 0);
    }
    return null;
  });
  const [dateOpen, setDateOpen] = useState(false);
  const [timeOpen, setTimeOpen] = useState(false);

  // Web fallback için
  const [dateStr, setDateStr] = useState(prefill?.birthDate ?? '');   // YYYY-MM-DD
  const [timeStr, setTimeStr] = useState(prefill?.birthTime ?? '');   // HH:MM

  const [cityQuery, setCityQuery] = useState(prefill?.city?.name ?? '');
  const [city, setCity] = useState<City | null>(prefill?.city ?? null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const suggestions = useMemo(
    () => (city ? [] : searchCities(cityQuery, 6)),
    [cityQuery, city]
  );

  function onDateChange(_event: DateTimePickerEvent, selected?: Date) {
    if (Platform.OS === 'android') setDateOpen(false);
    if (selected) {
      const next = birth ? new Date(birth) : new Date(1990, 5, 15, 12, 0);
      next.setFullYear(selected.getFullYear(), selected.getMonth(), selected.getDate());
      setBirth(next);
    }
  }

  function onTimeChange(_event: DateTimePickerEvent, selected?: Date) {
    if (Platform.OS === 'android') setTimeOpen(false);
    if (selected) {
      const next = birth ? new Date(birth) : new Date(1990, 5, 15, 12, 0);
      next.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
      setBirth(next);
    }
  }

  function validate(): string | null {
    if (!name.trim()) return B('Lütfen adını gir.', 'Please enter your name.');
    let d: string, t: string;
    if (isWeb) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return B('Tarihi YYYY-AA-GG formatında gir.', 'Enter the date as YYYY-MM-DD.');
      if (!/^\d{2}:\d{2}$/.test(timeStr)) return B('Saati SS:DD formatında gir.', 'Enter the time as HH:MM.');
      d = dateStr; t = timeStr;
      const [y, mo, day] = d.split('-').map(Number);
      if (y < 1900 || y > new Date().getFullYear()) return B('Geçerli bir yıl gir.', 'Enter a valid year.');
      if (mo < 1 || mo > 12) return B('Ay 1-12 arasında olmalı.', 'Month must be between 1 and 12.');
      if (day < 1 || day > 31) return B('Gün 1-31 arasında olmalı.', 'Day must be between 1 and 31.');
      const [h, mi] = t.split(':').map(Number);
      if (h < 0 || h > 23) return B('Saat 0-23 arasında olmalı.', 'Hour must be between 0 and 23.');
      if (mi < 0 || mi > 59) return B('Dakika 0-59 arasında olmalı.', 'Minute must be between 0 and 59.');
    } else {
      if (!birth) return B('Lütfen doğum tarihi ve saatini seç.', 'Please pick a birth date and time.');
    }
    if (!city) return B('Lütfen bir doğum şehri seç.', 'Please pick a birth city.');
    return null;
  }

  async function handleSave() {
    const err = validate();
    if (err) { setError(err); return; }
    setError(null);
    setSubmitting(true);
    let dStr: string, tStr: string;
    if (isWeb) {
      dStr = dateStr;
      tStr = timeStr;
    } else {
      const b = birth!;
      dStr = `${b.getFullYear()}-${pad(b.getMonth() + 1)}-${pad(b.getDate())}`;
      tStr = `${pad(b.getHours())}:${pad(b.getMinutes())}`;
    }
    try {
      await onSave(name.trim(), dStr, tStr, city!);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + Spacing.lg, paddingBottom: Spacing.xxl }]}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.formTitle}>{B('Yeni Profil', 'New Profile')}</Text>
      <Text style={styles.formSub}>
        Doğum saatin ne kadar net olursa profil ve içsel yetkin o kadar doğru hesaplanır.
        Saatten emin değilsen yaklaşık bir tahmin yine de değerlidir.
      </Text>

      <Text style={styles.label}>{B('İsim', 'Name')}</Text>
      <TextInput
        style={styles.input}
        placeholder="Adın"
        placeholderTextColor={Colors.textMuted}
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>{B('Doğum Tarihi', 'Birth Date')}</Text>
      {isWeb ? (
        <TextInput
          style={styles.input}
          placeholder="YYYY-AA-GG (ör. 1990-06-15)"
          placeholderTextColor={Colors.textMuted}
          value={dateStr}
          onChangeText={setDateStr}
          accessibilityLabel="Doğum tarihi"
        />
      ) : (
        <TouchableOpacity
          style={styles.pickerRow}
          onPress={() => setDateOpen(true)}
          accessibilityRole="button"
          accessibilityLabel="Doğum tarihi seç"
        >
          <Text style={[styles.pickerText, !birth && styles.pickerPlaceholder]}>
            {birth ? fmtDate(birth) : B('Tarih seç', 'Pick date')}
          </Text>
          <Text style={styles.pickerChev}>›</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.label}>{B('Doğum Saati', 'Birth Time')}</Text>
      {isWeb ? (
        <TextInput
          style={styles.input}
          placeholder="SS:DD (24 saat): ör. 14:30"
          placeholderTextColor={Colors.textMuted}
          value={timeStr}
          onChangeText={setTimeStr}
          accessibilityLabel="Doğum saati"
        />
      ) : (
        <TouchableOpacity
          style={styles.pickerRow}
          onPress={() => setTimeOpen(true)}
          accessibilityRole="button"
          accessibilityLabel="Doğum saati seç"
        >
          <Text style={[styles.pickerText, !birth && styles.pickerPlaceholder]}>
            {birth ? fmtTime(birth) : B('Saat seç', 'Pick time')}
          </Text>
          <Text style={styles.pickerChev}>›</Text>
        </TouchableOpacity>
      )}

      {!isWeb && (dateOpen || Platform.OS === 'ios') && (
        <DateTimePicker
          value={birth || new Date(1990, 5, 15)}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
          maximumDate={new Date()}
          minimumDate={new Date(1900, 0, 1)}
          style={Platform.OS === 'ios' ? styles.iosPicker : undefined}
        />
      )}
      {!isWeb && (timeOpen || Platform.OS === 'ios') && (
        <DateTimePicker
          value={birth || new Date(1990, 5, 15, 12, 0)}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onTimeChange}
          is24Hour
          style={Platform.OS === 'ios' ? styles.iosPicker : undefined}
        />
      )}

      <Text style={styles.label}>{B('Doğum Şehri', 'Birth City')}</Text>
      <TextInput
        style={styles.input}
        placeholder="Şehir ara: ör. İstanbul"
        placeholderTextColor={Colors.textMuted}
        value={city ? cityLabel(city) : cityQuery}
        onChangeText={t => { setCity(null); setCityQuery(t); }}
      />
      {suggestions.length > 0 && (
        <View style={styles.suggestBox}>
          {suggestions.map(c => (
            <TouchableOpacity
              key={c.name}
              style={styles.suggestRow}
              onPress={() => { setCity(c); setCityQuery(c.name); }}
            >
              <Text style={styles.suggestText}>{cityLabel(c)}</Text>
              <Text style={styles.suggestMeta}>UTC{c.tz >= 0 ? '+' : ''}{c.tz}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      {city && (
        <Text style={styles.hint}>
          ✓ {cityLabel(city)} · UTC{city.tz >= 0 ? '+' : ''}{city.tz}
          {city.dst === 'eu' ? B(' (AB yaz saati uygulanır)', ' (EU daylight saving applies)') :
           city.dst === 'us' ? B(' (ABD yaz saati uygulanır)', ' (US daylight saving applies)') : ''}
        </Text>
      )}

      {error && <Text style={styles.error}>! {error}</Text>}

      <View style={styles.btnRow}>
        <TouchableOpacity style={styles.secondaryBtn} onPress={onCancel}>
          <Text style={styles.secondaryBtnText}>Vazgeç</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.primaryBtn, { flex: 1 }]}
          onPress={handleSave}
          disabled={submitting}
        >
          <Text style={styles.primaryBtnText}>
            {submitting ? B('Hesaplanıyor…', 'Calculating…') : B('Haritamı Çıkar', 'Generate My Chart')}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const infoStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  k: { fontSize: Typography.size.sm, color: Colors.textMuted },
  v: {
    fontSize: Typography.size.sm, color: Colors.text,
    fontWeight: Typography.weight.medium, maxWidth: '60%', textAlign: 'right',
  },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: Spacing.lg },

  empty: {
    flex: 1, alignItems: 'center', backgroundColor: Colors.background,
    paddingHorizontal: Spacing.xl,
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
    textAlign: 'center', lineHeight: Typography.size.md * 1.6,
    marginBottom: Spacing.xl,
  },

  header: { alignItems: 'center', marginBottom: Spacing.lg },
  avatar: {
    width: 84, height: 84, borderRadius: 999,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.gold + '40',
    marginBottom: Spacing.md,
    ...Shadows.gold,
  },
  avatarEmoji: { fontSize: 36 },
  name: {
    fontSize: Typography.size.xxl, color: Colors.text,
    fontFamily: Typography.font.serif,
  },
  subtitle: {
    fontSize: Typography.size.sm, color: Colors.gold, marginTop: 4, letterSpacing: 0.6,
  },

  idCardCta: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.divider,
  },
  idCardCtaLabel: {
    fontSize: 10, letterSpacing: 1.8, color: Colors.gold,
    marginBottom: 4,
  },
  idCardCtaTitle: {
    fontSize: Typography.size.md, color: Colors.text,
    fontWeight: Typography.weight.regular,
  },
  idCardCtaSub: {
    fontSize: Typography.size.xs, color: Colors.textMuted,
    marginTop: 2,
  },
  idCardCtaArrow: {
    fontSize: 22, color: Colors.gold, marginLeft: Spacing.md,
  },

  statsRow: {
    flexDirection: 'row',
    paddingVertical: Spacing.md,
    marginBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  statBox: { flex: 1, alignItems: 'center' },
  statValue: {
    fontSize: Typography.size.lg, color: Colors.text,
    fontFamily: Typography.font.serif, fontWeight: Typography.weight.bold,
  },
  statLabel: {
    fontSize: 10, letterSpacing: 1, color: Colors.textMuted, marginTop: 2,
  },

  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  cardKicker: {
    fontSize: 10, letterSpacing: 1.5, color: Colors.gold, marginBottom: Spacing.sm,
  },

  sectionTitle: {
    fontSize: Typography.size.lg, color: Colors.text,
    fontFamily: Typography.font.serif,
    marginTop: Spacing.lg, marginBottom: Spacing.sm,
  },
  profileRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  profileName: {
    fontSize: Typography.size.md, color: Colors.text,
    fontWeight: Typography.weight.semibold,
  },
  profileMeta: {
    fontSize: Typography.size.xs, color: Colors.textMuted, marginTop: 2,
  },
  activeChip: {
    fontSize: 10, letterSpacing: 1, color: Colors.gold,
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.gold + '15',
  },
  addBtn: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.round,
    padding: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
    borderWidth: 1, borderColor: Colors.gold + '40',
    borderStyle: 'dashed',
  },
  addBtnText: {
    color: Colors.gold, fontWeight: Typography.weight.semibold,
  },
  footerNote: {
    fontSize: Typography.size.xs, color: Colors.textMuted,
    textAlign: 'center', marginTop: Spacing.md, lineHeight: Typography.size.xs * 1.6,
    fontStyle: 'italic',
    paddingHorizontal: Spacing.md,
  },
  legalLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.xl,
    flexWrap: 'wrap',
  },
  legalLink: {
    fontSize: Typography.size.xs,
    color: Colors.purpleSoft,
    textDecorationLine: 'underline',
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  legalSep: {
    color: Colors.textMuted,
    fontSize: Typography.size.xs,
  },
  buildStamp: {
    fontSize: 9,
    letterSpacing: 1.4,
    color: Colors.textDim,
    textAlign: 'center',
    marginTop: Spacing.md,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },

  // Sakin Ailesi (web-only cross-app switcher)
  familySection: { marginTop: Spacing.xl, marginBottom: Spacing.lg },
  familyIntro: {
    fontSize: Typography.size.sm, color: Colors.textMuted,
    marginTop: -Spacing.xs, marginBottom: Spacing.md,
  },
  familyMaster: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg,
    borderWidth: 1, borderColor: Colors.gold + '40',
    padding: Spacing.md, marginBottom: Spacing.sm,
  },
  familyMasterSymbol: { fontSize: 20, color: Colors.gold },
  familyMasterName: { fontSize: Typography.size.md, fontWeight: Typography.weight.bold, color: Colors.text },
  familyMasterDesc: { fontSize: Typography.size.xs, color: Colors.textMuted, marginTop: 2 },
  familyMasterArrow: { fontSize: 16, color: Colors.textMuted },
  familyCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.surface, borderRadius: BorderRadius.md,
    borderWidth: 1, borderColor: Colors.glassBorder,
    paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md,
    marginBottom: Spacing.xs,
  },
  familyCardActive: { borderColor: Colors.purple + '60' },
  familySymbol: { fontSize: 16, color: Colors.textMuted, width: 22 },
  familyName: { flex: 1, fontSize: Typography.size.sm, color: Colors.text },
  familyBadge: {
    borderWidth: 1, borderColor: Colors.glassBorder, borderRadius: BorderRadius.round,
    paddingHorizontal: 10, paddingVertical: 3,
  },
  familyBadgeText: { fontSize: 10, letterSpacing: 1, color: Colors.textMuted },

  // Form
  formTitle: {
    fontSize: Typography.size.xxl, color: Colors.text,
    fontFamily: Typography.font.serif, marginBottom: 4,
  },
  formSub: {
    fontSize: Typography.size.sm, color: Colors.textMuted,
    lineHeight: Typography.size.sm * 1.6,
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: 11, letterSpacing: 1.2, color: Colors.gold,
    marginTop: Spacing.md, marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.surface,
    color: Colors.text,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.md,
    fontSize: Typography.size.md,
    borderWidth: 1, borderColor: Colors.glassBorder,
  },
  row3: { flexDirection: 'row', gap: Spacing.sm },
  row3Item: { flex: 1 },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md + 2,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  pickerText: {
    fontSize: Typography.size.md,
    color: Colors.text,
  },
  pickerPlaceholder: {
    color: Colors.textMuted,
  },
  pickerChev: {
    fontSize: 22,
    color: Colors.textMuted,
  },
  iosPicker: {
    backgroundColor: Colors.surface,
    marginTop: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  suggestBox: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    marginTop: 4, overflow: 'hidden',
    borderWidth: 1, borderColor: Colors.glassBorder,
  },
  suggestRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: Spacing.md, paddingHorizontal: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.divider,
  },
  suggestText: { color: Colors.text, fontSize: Typography.size.sm },
  suggestMeta: { color: Colors.textMuted, fontSize: Typography.size.xs },
  hint: {
    fontSize: Typography.size.xs, color: Colors.success,
    marginTop: 4, marginLeft: 4,
  },
  error: {
    color: Colors.emberSoft, fontSize: Typography.size.sm,
    marginTop: Spacing.md, fontStyle: 'italic',
  },
  btnRow: {
    flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.xl,
  },
  primaryBtn: {
    backgroundColor: Colors.gold,
    borderRadius: BorderRadius.round,
    paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    ...Shadows.gold,
  },
  primaryBtnText: {
    color: Colors.background, fontWeight: Typography.weight.bold,
    fontSize: Typography.size.md,
  },
  secondaryBtn: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.round,
    paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1, borderColor: Colors.glassBorder,
  },
  secondaryBtnText: { color: Colors.text },
});
