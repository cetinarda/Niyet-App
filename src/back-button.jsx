// ORTAK GERİ DÜĞMESİ (Eki 2026, kullanıcı: "geri çıkış butonu hizalı değil, ok kutuya
// göre ortalanmamış; artık yeni isteklerde çerçeve içine koyulan işaretlerde
// hizalamayı doğru yapması için önlem al").
//
// KÖK SEBEP: ok bir YAZI KARAKTERİYDİ ("←"). Flex ortalaması mürekkebi değil fontun
// satır kutusunu (yükselti + alçaltı) ortalar; ok 1-1,4 px aşağıda duruyordu.
// Portal ile body'ye çizilen ekranlarda (Odalar, Pong) yazı tipi tanımsız kalıp
// Times New Roman'a düşüyordu: her cihaz başka bir yedek fontla başka bir kayma.
// Kural: ÇERÇEVELİ / YUVARLAK düğmede ikon YAZI KARAKTERİ OLMAZ, SVG olur
// (display:block, lineHeight 0, padding 0). Yeni geri düğmesi gerekirse BUNU kullan.
import React from "react";

export function BackArrow({ size = 15, color = "currentColor", strokeWidth = 1.6 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true"
      style={{ display: "block", flexShrink: 0 }}>
      <path d="M7.5 3.5L3 8M3 8L7.5 12.5M3 8H13" stroke={color} strokeWidth={strokeWidth}
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function BackButton({ onClick, label, size = 36, color = "#cfc7e0", style }) {
  return (
    <button type="button" onClick={onClick} aria-label={label}
      style={{
        WebkitAppearance: "none", appearance: "none", margin: 0, padding: 0, lineHeight: 0,
        width: size, height: size, minWidth: size, borderRadius: "50%", flexShrink: 0,
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)",
        color, cursor: "pointer", WebkitTapHighlightColor: "transparent",
        ...style,
      }}>
      <BackArrow size={Math.round(size * 0.42)} />
    </button>
  );
}
