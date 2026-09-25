import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { track } from './analytics'

// HATA SINIRI (Eyl 2026): tek dev bileşende herhangi bir çizim hatası uygulamayı
// kara ekranda bırakıyordu ve haberimiz olmuyordu. Artık sakin bir yedek ekran
// çıkar ("yeniden aç") ve anonim `js_error` olayı gider (metin/kişisel veri yok,
// yalnızca hata türü; track.mjs beyaz listesinde).
const FALLBACK = {
  tr: ["Bir şey ters gitti.", "Uygulamayı yeniden açalım.", "Yeniden aç"],
  en: ["Something went wrong.", "Let's open the app again.", "Reopen"],
  de: ["Etwas ist schiefgelaufen.", "Lass uns die App neu öffnen.", "Neu öffnen"],
  es: ["Algo salió mal.", "Volvamos a abrir la app.", "Volver a abrir"],
  pt: ["Algo correu mal.", "Vamos abrir a aplicação de novo.", "Voltar a abrir"],
  fr: ["Quelque chose s'est mal passé.", "Rouvrons l'application.", "Rouvrir"],
  ja: ["問題が起きました。", "アプリをもう一度ひらきましょう。", "もう一度ひらく"],
}
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { failed: false } }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch(err) {
    try { track('js_error', { k: String((err && err.name) || 'Error').slice(0, 20) }) } catch (_) {}
  }
  render() {
    if (!this.state.failed) return this.props.children
    let lang = 'tr'
    try { lang = localStorage.getItem('sakin_lang') || 'tr' } catch (_) {}
    const t = FALLBACK[lang] || FALLBACK.en
    return (
      <div style={{ position:'fixed', inset:0, background:'#07060d', color:'#f1ecf9', display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center', gap:14, padding:24, textAlign:'center', fontFamily:"'Inter',sans-serif" }}>
        <div style={{ width:54, height:54, transform:'rotate(45deg)', border:'1px solid rgba(200,180,235,0.55)', borderRadius:10, marginBottom:10 }} />
        <div style={{ fontSize:20, fontFamily:"'Cormorant Garamond',Georgia,serif" }}>{t[0]}</div>
        <div style={{ fontSize:14, color:'#b8aed0' }}>{t[1]}</div>
        <button onClick={() => { try { window.location.reload() } catch (_) {} }}
          style={{ WebkitAppearance:'none', appearance:'none', marginTop:8, padding:'11px 26px', borderRadius:100, cursor:'pointer',
            background:'rgba(232,192,122,0.13)', border:'1px solid rgba(232,192,122,0.45)', color:'#f6dfb0', fontSize:13, letterSpacing:1.5 }}>{t[2]}</button>
      </div>
    )
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
