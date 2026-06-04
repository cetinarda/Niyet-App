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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../theme/colors';
import { useTasarimStore } from '../store/useStore';
import { CITIES, City, searchCities } from '../data/cities';
import { TYPES } from '../data/types';

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
        <Text style={styles.emptyTitle}>Profilini oluştur</Text>
        <Text style={styles.emptyDesc}>
          Adın, doğum günün, doğum saatin ve doğum şehrin Human Design haritan için
          gereklidir. Bilgiler cihazında tutulur, dışarı gönderilmez.
        </Text>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => setShowForm(true)}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryBtnText}>Başla →</Text>
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
            {chart.type} · {chart.profile} · {chart.authority === 'lunar' ? 'Lunar' :
              chart.authority === 'emotional' ? 'Duygusal' :
              chart.authority === 'sacral' ? 'Sakral' :
              chart.authority === 'splenic' ? 'Splenik' :
              chart.authority === 'ego' ? 'Kalp/Ego' :
              chart.authority === 'self-projected' ? 'Self' : 'Mental'}
          </Text>
        )}
      </View>

      <TouchableOpacity
        style={styles.idCardCta}
        onPress={() => setShowIdCard(true)}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Kimlik Kartı'nı aç"
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.idCardCtaLabel}>KİMLİK KARTI</Text>
          <Text style={styles.idCardCtaTitle}>
            Haritanı kart olarak indir ya da paylaş
          </Text>
          <Text style={styles.idCardCtaSub}>
            Fotoğraf · tip · profil · kanallar tek görselde
          </Text>
        </View>
        <Text style={styles.idCardCtaArrow}>→</Text>
      </TouchableOpacity>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats.totalOpens}</Text>
          <Text style={styles.statLabel}>Toplam Açılış</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats.streak}🔥</Text>
          <Text style={styles.statLabel}>Süreklilik</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{getLevelTitle(stats.level)}</Text>
          <Text style={styles.statLabel}>Sv. {stats.level}</Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.cardKicker}>DOĞUM BİLGİLERİ</Text>
        <InfoRow k="Tarih" v={activeProfile!.birthDate} />
        <InfoRow k="Saat" v={activeProfile!.birthTime} />
        <InfoRow k="Şehir" v={activeProfile!.city.name} />
        <InfoRow k="Enlem / Boylam"
          v={`${activeProfile!.city.lat.toFixed(2)}° / ${activeProfile!.city.lng.toFixed(2)}°`} />
        <InfoRow k="UTC Ofset" v={`UTC${activeProfile!.city.tz >= 0 ? '+' : ''}${activeProfile!.city.tz}`} />
      </View>

      {chart && (
        <View style={styles.infoCard}>
          <Text style={styles.cardKicker}>HARİTA ÖZETİ</Text>
          <InfoRow k="Tip" v={chart.type} />
          <InfoRow k="Strateji" v={chart.strategy} />
          <InfoRow k="Doğru Frekans" v={chart.signature} />
          <InfoRow k="Yanlış Frekans" v={chart.notSelf} />
          <InfoRow k="Profil" v={chart.profile} />
          <InfoRow k="Tanım" v={chart.definition} />
          <InfoRow k="Aktif Kapı" v={`${chart.activeGates.size} / 64`} />
          <InfoRow k="Aktif Kanal" v={`${chart.activeChannels.length}`} />
          <InfoRow k="Tanımlı Merkez" v={`${chart.definedCenters.size} / 9`} />
        </View>
      )}

      <Text style={styles.sectionTitle}>Kayıtlı Profiller ({profiles.length})</Text>
      {profiles.map(p => {
        const isActive = p.id === activeProfile!.id;
        return (
          <TouchableOpacity
            key={p.id}
            style={[styles.profileRow, isActive && { borderColor: Colors.gold }]}
            activeOpacity={0.85}
            onPress={() => selectProfile(p.id)}
            onLongPress={() => {
              Alert.alert('Profili sil', `${p.name} silinsin mi?`, [
                { text: 'Vazgeç', style: 'cancel' },
                { text: 'Sil', style: 'destructive', onPress: () => deleteProfile(p.id) },
              ]);
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.profileName}>{p.name}</Text>
              <Text style={styles.profileMeta}>
                {p.birthDate} · {p.birthTime} · {p.city.name}
              </Text>
            </View>
            {isActive && <Text style={styles.activeChip}>AKTİF</Text>}
          </TouchableOpacity>
        );
      })}

      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => setShowForm(true)}
        activeOpacity={0.85}
      >
        <Text style={styles.addBtnText}>+ Yeni Profil Ekle</Text>
      </TouchableOpacity>

      <View style={styles.legalLinks}>
        <TouchableOpacity
          onPress={() => Linking.openURL(PRIVACY_URL)}
          accessibilityRole="link"
          accessibilityLabel="Gizlilik politikası"
        >
          <Text style={styles.legalLink}>Gizlilik Politikası</Text>
        </TouchableOpacity>
        <Text style={styles.legalSep}>·</Text>
        <TouchableOpacity
          onPress={() => Linking.openURL(TERMS_URL)}
          accessibilityRole="link"
          accessibilityLabel="Kullanım koşulları"
        >
          <Text style={styles.legalLink}>Koşullar</Text>
        </TouchableOpacity>
        <Text style={styles.legalSep}>·</Text>
        <TouchableOpacity
          onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=Sakin%20Tasarım%20Geri%20Bildirim`)}
          accessibilityRole="link"
          accessibilityLabel="Destek e-postası"
        >
          <Text style={styles.legalLink}>Destek</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footerNote}>
        Bilgilerin yalnızca cihazında saklanır. Hesaplamalar lokal yapılır;
        doğum verin sunucuya gönderilmez. Sakin Tasarım eğitim ve kişisel keşif
        amaçlıdır; tıbbi, psikolojik veya finansal tavsiye değildir.
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
    if (!name.trim()) return 'Lütfen adını gir.';
    let d: string, t: string;
    if (isWeb) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return 'Tarihi YYYY-AA-GG formatında gir.';
      if (!/^\d{2}:\d{2}$/.test(timeStr)) return 'Saati SS:DD formatında gir.';
      d = dateStr; t = timeStr;
      const [y, mo, day] = d.split('-').map(Number);
      if (y < 1900 || y > new Date().getFullYear()) return 'Geçerli bir yıl gir.';
      if (mo < 1 || mo > 12) return 'Ay 1-12 arasında olmalı.';
      if (day < 1 || day > 31) return 'Gün 1-31 arasında olmalı.';
      const [h, mi] = t.split(':').map(Number);
      if (h < 0 || h > 23) return 'Saat 0-23 arasında olmalı.';
      if (mi < 0 || mi > 59) return 'Dakika 0-59 arasında olmalı.';
    } else {
      if (!birth) return 'Lütfen doğum tarihi ve saatini seç.';
    }
    if (!city) return 'Lütfen bir doğum şehri seç.';
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
      <Text style={styles.formTitle}>Yeni Profil</Text>
      <Text style={styles.formSub}>
        Doğum saatin ne kadar net olursa profil ve içsel yetkin o kadar doğru hesaplanır.
        Saatten emin değilsen yaklaşık bir tahmin yine de değerlidir.
      </Text>

      <Text style={styles.label}>İsim</Text>
      <TextInput
        style={styles.input}
        placeholder="Adın"
        placeholderTextColor={Colors.textMuted}
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Doğum Tarihi</Text>
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
            {birth ? fmtDate(birth) : 'Tarih seç'}
          </Text>
          <Text style={styles.pickerChev}>›</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.label}>Doğum Saati</Text>
      {isWeb ? (
        <TextInput
          style={styles.input}
          placeholder="SS:DD (24 saat) — ör. 14:30"
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
            {birth ? fmtTime(birth) : 'Saat seç'}
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

      <Text style={styles.label}>Doğum Şehri</Text>
      <TextInput
        style={styles.input}
        placeholder="Şehir ara: ör. İstanbul"
        placeholderTextColor={Colors.textMuted}
        value={city ? city.name : cityQuery}
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
              <Text style={styles.suggestText}>{c.name}</Text>
              <Text style={styles.suggestMeta}>UTC{c.tz >= 0 ? '+' : ''}{c.tz}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      {city && (
        <Text style={styles.hint}>
          ✓ {city.name} · UTC{city.tz >= 0 ? '+' : ''}{city.tz}
          {city.dst === 'eu' ? ' (AB yaz saati uygulanır)' :
           city.dst === 'us' ? ' (ABD yaz saati uygulanır)' : ''}
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
            {submitting ? 'Hesaplanıyor…' : 'Haritamı Çıkar'}
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
