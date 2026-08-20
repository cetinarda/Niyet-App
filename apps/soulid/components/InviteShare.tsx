'use client';

import { useEffect, useState } from 'react';
import { inviteUrl } from '@/lib/compatibility/invite';
import { useT } from '@/lib/i18n';
import type { BirthInput } from '@/lib/types';
import { shareInvite, copyToClipboard } from '@/lib/native/share';

export function InviteShare({ birth }: { birth: BirthInput }) {
  const { locale } = useT();
  const [copied, setCopied] = useState(false);
  const [working, setWorking] = useState(false);
  const [url, setUrl] = useState<string>('');

  useEffect(() => {
    let cancelled = false;
    inviteUrl(birth).then((u) => {
      if (!cancelled) setUrl(u);
    });
    return () => {
      cancelled = true;
    };
  }, [birth]);

  async function copy() {
    const ok = await copyToClipboard(url);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function share() {
    setWorking(true);
    try {
      const result = await shareInvite({
        title: locale === 'tr' ? 'İkili Kozmik Uyum' : 'Dual Cosmic Compatibility',
        text:
          locale === 'tr'
            ? `Senin ile uyumumu görelim — ${url}`
            : `Let's see our compatibility — ${url}`,
        url,
      });
      if (result === 'clipboard') {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } finally {
      setWorking(false);
    }
  }

  return (
    <div className="rounded-3xl border border-cosmic/40 bg-gradient-to-br from-[#0b0524] via-[#1e1a6e] to-[#9d3cb1]/30 p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cosmic/20 text-2xl">
          ⚯
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-cosmic">
            {locale === 'tr' ? 'BİRİYLE EŞLEŞ' : 'MATCH WITH SOMEONE'}
          </p>
          <h3 className="mt-1 font-display text-2xl text-ink">
            {locale === 'tr'
              ? 'Bu linki birine gönder, uyumunuzu görsün'
              : 'Send this link — they\'ll see your match'}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {locale === 'tr'
              ? 'Doğum verin link içine şifrelenmiş gider, sunucumuza kayıt OLMAZ. Karşı taraf kendi bilgisini girer ve ikili uyumunuzu açar.'
              : 'Your birth data is encoded inside the link — we DO NOT save it on our servers. The other side enters their info and unlocks your match.'}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-xl border border-white/10 bg-bg/50 px-3 py-2">
        <input
          type="text"
          readOnly
          value={url}
          className="flex-1 truncate bg-transparent text-xs text-muted outline-none"
          onFocus={(e) => e.currentTarget.select()}
        />
        <button
          type="button"
          onClick={copy}
          className="shrink-0 rounded-full bg-cosmic/30 px-3 py-1 text-[11px] font-bold text-white transition-colors hover:bg-cosmic/50"
        >
          {copied ? (locale === 'tr' ? 'Kopyalandı ✓' : 'Copied ✓') : (locale === 'tr' ? 'Kopyala' : 'Copy')}
        </button>
      </div>

      <button
        type="button"
        onClick={share}
        disabled={working}
        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-cosmic px-6 py-3 text-sm font-bold text-white transition-transform hover:scale-[1.02]"
      >
        <span>📤</span>
        {locale === 'tr' ? 'Daveti Paylaş' : 'Share Invite'}
      </button>
    </div>
  );
}
