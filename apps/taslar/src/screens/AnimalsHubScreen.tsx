import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius } from '../theme/colors';
import { AnimalLibraryScreen } from './AnimalLibraryScreen';
import { AnimalFinderScreen } from './AnimalFinderScreen';
import { AnimalDetailScreen } from './AnimalDetailScreen';
import { useLocalizedStones } from '../i18n/localize';
import { useSakinHayvanStore } from '../store/useStore';
import { useI18n } from '../i18n/useI18n';

type Panel = 'library' | 'finder';
type FinderView = 'menu' | 'discover' | 'photo';

const PANELS = [
  { key: 'library' as Panel, labelKey: 'animalsHub.panels.library', symbol: '⊕', color: Colors.tealLight },
  { key: 'finder'  as Panel, labelKey: 'animalsHub.panels.finder',  symbol: '✦', color: Colors.gold },
];

// Bu app'in foto-tanı türü (bitkiler kopyasında 'plant').
const PHOTO_KIND: 'stone' | 'plant' = 'stone';

// Küçük 7-dil yardımcısı (Bul menüsü + foto-tanı metinleri — i18n dosyalarına dokunmadan).
function _L(m: Record<string, string>): string {
  const lg = (typeof localStorage !== 'undefined' && localStorage.getItem('sakin_lang')) || 'tr';
  return m[lg] || m.en || m.tr;
}
const TXT = {
  photoCard:   { tr:'Fotoğraf yükle, bul', en:'Upload a photo to find', de:'Foto hochladen, finden', es:'Sube una foto y descúbrelo', pt:'Carrega uma foto e descobre', fr:'Importe une photo, trouve', ja:'写真をアップして見分ける' },
  discoverCardStone: { tr:'Sana uygun taşı keşfet', en:'Discover your stone', de:'Entdecke deinen Stein', es:'Descubre tu piedra', pt:'Descobre a tua pedra', fr:'Découvre ta pierre', ja:'あなたに合う石を見つける' },
  discoverCardPlant: { tr:'Sana uygun bitkiyi keşfet', en:'Discover your plant', de:'Entdecke deine Pflanze', es:'Descubre tu planta', pt:'Descobre a tua planta', fr:'Découvre ta plante', ja:'あなたに合う植物を見つける' },
  back:        { tr:'Geri', en:'Back', de:'Zurück', es:'Atrás', pt:'Voltar', fr:'Retour', ja:'戻る' },
  photoTitleStone: { tr:'Fotoğrafla taşı bul', en:'Find a stone by photo', de:'Stein per Foto finden', es:'Encuentra la piedra por foto', pt:'Encontra a pedra por foto', fr:'Trouve la pierre par photo', ja:'写真で石を見分ける' },
  photoTitlePlant: { tr:'Fotoğrafla bitkiyi bul', en:'Find a plant by photo', de:'Pflanze per Foto finden', es:'Encuentra la planta por foto', pt:'Encontra a planta por foto', fr:'Trouve la plante par photo', ja:'写真で植物を見分ける' },
  pick:        { tr:'Fotoğraf seç / çek', en:'Pick / take a photo', de:'Foto wählen / aufnehmen', es:'Elegir / tomar foto', pt:'Escolher / tirar foto', fr:'Choisir / prendre une photo', ja:'写真を選ぶ / 撮る' },
  again:       { tr:'Yeni fotoğraf', en:'New photo', de:'Neues Foto', es:'Nueva foto', pt:'Nova foto', fr:'Nouvelle photo', ja:'新しい写真' },
  hint:        { tr:'Net, yakın bir fotoğraf en iyi sonucu verir.', en:'A clear, close photo gives the best result.', de:'Ein klares, nahes Foto liefert das beste Ergebnis.', es:'Una foto clara y cercana da el mejor resultado.', pt:'Uma foto nítida e próxima dá o melhor resultado.', fr:'Une photo nette et rapprochée donne le meilleur résultat.', ja:'鮮明で近い写真が最良の結果に。' },
  failId:      { tr:'Tanıyamadım — daha net bir fotoğraf dener misin?', en:"I couldn't identify it — try a clearer photo?", de:'Ich konnte es nicht erkennen — klareres Foto?', es:'No pude identificarlo — ¿una foto más clara?', pt:'Não consegui identificar — uma foto mais nítida?', fr:"Je n'ai pas pu l'identifier — une photo plus nette ?", ja:'見分けられませんでした——もっと鮮明な写真で。' },
  errConn:     { tr:'Bağlantı hatası, tekrar dener misin?', en:'Connection error, please try again.', de:'Verbindungsfehler, bitte erneut.', es:'Error de conexión, inténtalo de nuevo.', pt:'Erro de conexão, tenta de novo.', fr:'Erreur de connexion, réessaie.', ja:'接続エラー。もう一度お試しを。' },
  mostLikely:  { tr:'En olası', en:'Most likely', de:'Am wahrscheinlichsten', es:'Más probable', pt:'Mais provável', fr:'Le plus probable', ja:'最も可能性が高い' },
  openDetail:  { tr:'Sayfasını aç ›', en:'Open its page ›', de:'Seite öffnen ›', es:'Abrir su página ›', pt:'Abrir a página ›', fr:'Ouvrir sa page ›', ja:'ページを開く ›' },
  needClearer: { tr:'Bunu tam seçemedim — biraz daha yakın ve net bir fotoğraf dener misin?', en:"I couldn't quite make it out — try a closer, clearer photo?", de:'Ich konnte es nicht genau erkennen — versuch ein näheres, klareres Foto?', es:'No lo distinguí bien — ¿pruebas una foto más cercana y nítida?', pt:'Não consegui distinguir bem — tenta uma foto mais próxima e nítida?', fr:"Je ne l'ai pas bien distingué — essaie une photo plus proche et nette ?", ja:'はっきり見分けられませんでした——もっと近くで鮮明な写真を試してみて。' },
  sorryId:     { tr:'Üzgünüm, bunu henüz tanıyamadım. İyileştirmelerimiz sürüyor — yakında bulabileceğim. ✦', en:"I'm sorry, I couldn't recognize this yet. I'm still improving — I'll be able to find it soon. ✦", de:'Es tut mir leid, das konnte ich noch nicht erkennen. Ich lerne weiter — bald finde ich es. ✦', es:'Lo siento, aún no pude reconocerlo. Sigo mejorando — pronto podré encontrarlo. ✦', pt:'Desculpa, ainda não consegui reconhecê-lo. Continuo a melhorar — em breve vou conseguir. ✦', fr:"Désolé, je n'ai pas encore pu le reconnaître. Je continue de m'améliorer — bientôt je le trouverai. ✦", ja:'ごめんなさい、まだ見分けられませんでした。改善を続けています——近いうちに見つけられます。✦' },
};

// Netlify fonksiyon tabanı: web'de (https sakin.life) göreceli; iOS'ta (capacitor://)
// yerel sunucu değil sakin.life'a mutlak URL ile git (host App.jsx ile aynı mantık).
const SAKIN_API = (typeof window !== 'undefined' && /^https?:/.test(window.location.protocol)) ? '' : 'https://sakin.life';

// İsim normalizasyonu (eşleştirme için): küçült, aksan/noktalama temizle.
function _norm(s: string): string {
  return (s || '').toLowerCase().normalize('NFD').replace(/[^a-z0-9 ]/gi, ' ').replace(/\s+/g, ' ').trim();
}

export function AnimalsHubScreen() {
  const insets = useSafeAreaInsets();
  const { profile } = useSakinHayvanStore();
  const [panel, setPanelRaw] = useState<Panel>('library');
  const [finderView, setFinderView] = useState<FinderView>('menu');
  const [photoLoading, setPhotoLoading] = useState(false);
  const [photoResult, setPhotoResult] = useState('');
  const [photoDetail, setPhotoDetail] = useState<any>(null); // tıklanınca açılan DB kaydı
  const [photoStatus, setPhotoStatus] = useState<'' | 'retry' | 'sorry'>(''); // tanıyamayınca: 1. deneme→retry, 2.→sorry
  const [failTries, setFailTries] = useState(0);
  const { t } = useI18n();
  const stones = useLocalizedStones();

  // Foto sonuç metninde geçen taş DB'de var mı? "En olası" önce yazıldığı için
  // metinde EN ERKEN geçen ismi seç (alternatifler sonra gelir).
  const photoMatch = useMemo(() => {
    if (!photoResult) return null;
    const norm = _norm(photoResult);
    if (norm.length < 3) return null;
    let best: any = null; let bestIdx = Infinity; let bestLen = 0;
    for (const s of stones as any[]) {
      for (const cand of [s.name, s.nameEn]) {
        const c = _norm(cand);
        if (c.length < 3) continue;
        const idx = norm.indexOf(c);
        if (idx < 0) continue;
        if (idx < bestIdx || (idx === bestIdx && c.length > bestLen)) { best = s; bestIdx = idx; bestLen = c.length; }
      }
    }
    return best;
  }, [photoResult, stones]);

  const setPanel = (p: Panel) => { setPanelRaw(p); if (p !== 'finder') setFinderView('menu'); };
  const active = PANELS.find(p => p.key === panel) ?? PANELS[0];
  const noClose = () => {};
  const isPlant = PHOTO_KIND === 'plant';

  // Foto-tanı: DOM file input → ~1024px küçült → identify fonksiyonu → sonuç (embed içi, postMessage yok).
  const pickPhoto = () => {
    try {
      const input = document.createElement('input');
      input.type = 'file'; input.accept = 'image/*';
      // capture YOK → iOS galeri/kamera seçim menüsü açılır (capture='environment' galeriyi engelliyordu).
      input.style.position = 'fixed'; input.style.left = '-9999px'; input.style.opacity = '0';
      document.body.appendChild(input);
      input.onchange = async () => {
        const file = input.files && input.files[0];
        if (!file) return;
        setPhotoLoading(true); setPhotoResult(''); setPhotoStatus('');
        try {
          const dataUrl: string = await new Promise((resolve, reject) => {
            const img = new (window as any).Image();
            img.onload = () => {
              const max = 1280; let w = img.width, h = img.height;
              if (w > max || h > max) { const s = max / Math.max(w, h); w = Math.round(w * s); h = Math.round(h * s); }
              const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
              (cv.getContext('2d') as any).drawImage(img, 0, 0, w, h);
              resolve(cv.toDataURL('image/jpeg', 0.9));
            };
            img.onerror = reject; img.src = URL.createObjectURL(file);
          });
          const lang = (typeof localStorage !== 'undefined' && localStorage.getItem('sakin_lang')) || 'tr';
          // Kapalı küme: bildiğimiz taş/bitki adlarını (TR + İngilizce) modele context ver.
          const candidates = (stones as any[]).map((s) => {
            const en = (s as any).nameEn;
            return en && _norm(en) !== _norm(s.name) ? `${s.name} (${en})` : s.name;
          });
          const r = await fetch(SAKIN_API + '/.netlify/functions/identify', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: dataUrl, type: PHOTO_KIND, lang, candidates }),
          });
          const d = await r.json();
          const raw = (d.text || '').trim();
          const lines = raw.split('\n').map((l: string) => l.trim()).filter(Boolean);
          const malformed = lines.length < 3
            || lines.some((l: string) => /^\d+[.)]\s*$/.test(l))
            || /^\d+[.)]?\s*sakin\b/i.test(lines[0] || '');
          if (!raw || /^UNSURE\b/i.test(raw) || malformed) {
            // Tanıyamadı: 1. denemede daha net foto iste, 2.+ denemede şefkatli özür.
            const n = failTries + 1; setFailTries(n);
            setPhotoStatus(n >= 2 ? 'sorry' : 'retry');
          } else {
            setFailTries(0); setPhotoStatus(''); setPhotoResult(raw);
          }
        } catch (e) { setPhotoResult(_L(TXT.errConn)); }
        setPhotoLoading(false);
        try { document.body.removeChild(input); } catch (e) {}
      };
      input.click();
    } catch (e) { /* sessiz */ }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      {/* Top: eyebrow + current panel name */}
      <View style={styles.headerBar}>
        <Text style={styles.eyebrow}>{t('animalsHub.eyebrow' as any)}</Text>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{t(active.labelKey as any)}</Text>
        </View>
      </View>

      {/* Chip tabs */}
      <View style={styles.chipWrap}>
        {PANELS.map(p => {
          const isActive = p.key === panel;
          return (
            <TouchableOpacity
              key={p.key}
              style={[styles.chip, isActive && { borderColor: p.color, backgroundColor: p.color + '18' }]}
              onPress={() => setPanel(p.key)}
              activeOpacity={0.8}
            >
              <Text style={[styles.chipSymbol, { color: isActive ? p.color : Colors.textMuted }]}>{p.symbol}</Text>
              <Text style={[styles.chipLabel, { color: isActive ? p.color : Colors.textMuted }, isActive && { fontWeight: Typography.weight.semibold }]}>
                {t(p.labelKey as any)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.divider} />

      <View style={styles.body}>
        {panel === 'library' && <AnimalLibraryScreen onClose={noClose} embedded />}
        {panel === 'finder' && finderView === 'menu' && (
          <View style={styles.menuWrap}>
            <TouchableOpacity style={styles.menuCard} activeOpacity={0.85} onPress={() => { setPhotoResult(''); setPhotoStatus(''); setFailTries(0); setFinderView('photo'); }}>
              <Text style={styles.menuIcon}>📷</Text>
              <Text style={styles.menuCardText}>{_L(TXT.photoCard)}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuCard} activeOpacity={0.85} onPress={() => setFinderView('discover')}>
              <Text style={styles.menuIcon}>✦</Text>
              <Text style={styles.menuCardText}>{_L(isPlant ? TXT.discoverCardPlant : TXT.discoverCardStone)}</Text>
            </TouchableOpacity>
          </View>
        )}
        {panel === 'finder' && finderView === 'discover' && (
          <View style={{ flex: 1 }}>
            <TouchableOpacity style={styles.backBtn} onPress={() => setFinderView('menu')}><Text style={styles.backTxt}>‹ {_L(TXT.back)}</Text></TouchableOpacity>
            <View style={{ flex: 1 }}>
              <AnimalFinderScreen onClose={noClose} embedded prefillBirthDate={profile?.birthDate} prefillBirthHour={profile?.birthHour} prefillBirthCity={profile?.birthCity} />
            </View>
          </View>
        )}
        {panel === 'finder' && finderView === 'photo' && photoDetail && (
          <AnimalDetailScreen stone={photoDetail} onClose={() => setPhotoDetail(null)} />
        )}
        {panel === 'finder' && finderView === 'photo' && !photoDetail && (
          <ScrollView contentContainerStyle={styles.photoWrap} showsVerticalScrollIndicator={false}>
            <TouchableOpacity style={styles.backBtn} onPress={() => { setFinderView('menu'); setPhotoResult(''); setPhotoStatus(''); setFailTries(0); }}><Text style={styles.backTxt}>‹ {_L(TXT.back)}</Text></TouchableOpacity>
            <Text style={styles.photoTitle}>📷 {_L(isPlant ? TXT.photoTitlePlant : TXT.photoTitleStone)}</Text>
            <Text style={styles.photoHint}>{_L(TXT.hint)}</Text>
            {photoLoading ? (
              <ActivityIndicator color={Colors.gold} style={{ marginTop: 28 }} />
            ) : photoStatus === 'retry' ? (
              <>
                <Text style={styles.photoResult}>{_L(TXT.needClearer)}</Text>
                <TouchableOpacity style={styles.photoPickBtn} activeOpacity={0.85} onPress={() => { setPhotoStatus(''); pickPhoto(); }}><Text style={styles.photoPickText}>{_L(TXT.again)}</Text></TouchableOpacity>
              </>
            ) : photoStatus === 'sorry' ? (
              <>
                <Text style={styles.photoResult}>{_L(TXT.sorryId)}</Text>
                <TouchableOpacity style={styles.photoPickBtn} activeOpacity={0.85} onPress={() => { setPhotoStatus(''); setFailTries(0); pickPhoto(); }}><Text style={styles.photoPickText}>{_L(TXT.again)}</Text></TouchableOpacity>
              </>
            ) : photoResult ? (
              <>
                {/* Eski 3-maddelik bilgi metni (en olası + alternatifler + tek cümle) */}
                <Text style={styles.photoResult}>{photoResult}</Text>
                {/* Metinde geçen taş DB'de varsa → tıklanabilir buton, detay sayfasını açar */}
                {photoMatch && (
                  <TouchableOpacity style={styles.photoMatch} activeOpacity={0.85} onPress={() => setPhotoDetail(photoMatch)}>
                    <Text style={styles.photoMatchName}>{(photoMatch as any).emoji ? (photoMatch as any).emoji + '  ' : ''}{(photoMatch as any).name}</Text>
                    <Text style={styles.photoMatchHint}>{_L(TXT.openDetail)}</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.photoPickBtn} activeOpacity={0.85} onPress={() => { setPhotoResult(''); pickPhoto(); }}><Text style={styles.photoPickText}>{_L(TXT.again)}</Text></TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity style={styles.photoPickBtn} activeOpacity={0.85} onPress={pickPhoto}><Text style={styles.photoPickText}>{_L(TXT.pick)}</Text></TouchableOpacity>
            )}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },

  headerBar: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  eyebrow: {
    fontSize: 9,
    color: Colors.sakinLavender,
    letterSpacing: 3,
    opacity: 0.7,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: 3,
  },
  title: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.light,
    color: Colors.textPrimary,
    letterSpacing: 1,
  },
  menuWrap: { padding: Spacing.lg, gap: Spacing.md },
  menuCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 20, paddingHorizontal: 20,
    borderRadius: BorderRadius.lg, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)', backgroundColor: 'rgba(255,255,255,0.04)',
  },
  menuIcon: { fontSize: 26 },
  menuCardText: { flex: 1, fontSize: Typography.size.md, color: Colors.textPrimary, letterSpacing: 0.5, fontWeight: Typography.weight.semibold },
  backBtn: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, alignSelf: 'flex-start' },
  backTxt: { fontSize: Typography.size.sm, color: Colors.sakinLavender, letterSpacing: 1 },
  photoWrap: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxl, alignItems: 'center' },
  photoTitle: { fontSize: Typography.size.lg, color: Colors.textPrimary, fontWeight: Typography.weight.light, letterSpacing: 1, marginTop: Spacing.sm, textAlign: 'center' },
  photoHint: { fontSize: Typography.size.sm, color: Colors.textMuted, textAlign: 'center', marginTop: 6, marginBottom: Spacing.lg, lineHeight: 20 },
  photoResult: { fontSize: Typography.size.sm, color: Colors.textPrimary, lineHeight: 23, marginBottom: Spacing.lg, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: BorderRadius.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', padding: 16, width: '100%' },
  photoPickBtn: { paddingVertical: 15, paddingHorizontal: 30, borderRadius: 26, borderWidth: 1, borderColor: Colors.gold + '66', backgroundColor: Colors.gold + '1a', marginTop: 6 },
  photoPickText: { fontSize: Typography.size.md, color: Colors.gold, letterSpacing: 1, fontWeight: Typography.weight.semibold },
  photoMatch: { width: '100%', backgroundColor: Colors.gold + '14', borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.gold + '55', paddingVertical: 20, paddingHorizontal: 18, marginBottom: Spacing.lg, alignItems: 'center' },
  photoMatchLabel: { fontSize: 10, color: Colors.gold, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 },
  photoMatchName: { fontSize: Typography.size.lg, color: Colors.textPrimary, fontWeight: Typography.weight.semibold, letterSpacing: 0.5, textAlign: 'center' },
  photoMatchHint: { fontSize: 11, color: Colors.gold, marginTop: 10, letterSpacing: 0.5 },

  // Chip row: fixed row, no ScrollView, chips share space equally
  chipWrap: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
  },
  chip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.backgroundCard,
  },
  chipSymbol: { color: Colors.textPrimary, fontSize: 12 },
  chipLabel: {
    fontSize: 11,
    letterSpacing: 0.4,
  },

  divider: { height: 1, backgroundColor: Colors.divider, opacity: 0.4 },
  body: { flex: 1 },
});
