-- ÇEMBER (canlı sohbet odası) veritabanı şeması
-- Supabase > SQL Editor > New query > bu dosyanın TAMAMINI yapıştır > Run.
-- Tekrar çalıştırmak güvenli (IF NOT EXISTS).
--
-- GÜVENLİK MODELİ: Tablolarda RLS AÇIK ve HİÇ POLİTİKA YOK. Yani uygulamadaki
-- genel (anon) anahtar bu tabloları OKUYAMAZ ve YAZAMAZ. Tüm okuma/yazma
-- Netlify fonksiyonlarından (chat-send, chat-history, chat-report, chat-admin)
-- servis anahtarıyla yapılır; mesaj önce orada denetlenir (uzunluk, yavaş mod,
-- bağlantı yasağı, AI moderasyonu, kriz algılama). Canlı iletim Supabase Realtime
-- "broadcast" kanalıyla olur (room:tr / room:global); kanala yalnızca sunucu
-- mesaj basar, kimin odada olduğunu "presence" gösterir.

create table if not exists public.chat_messages (
  id          bigserial primary key,
  room        text        not null check (room in ('tr', 'global')),
  nick        text        not null,
  body        text        not null check (char_length(body) between 1 and 140),
  device_hash text        not null,          -- kurulum kimliğinin özeti (kişisel veri değil)
  created_at  timestamptz not null default now(),
  hidden      boolean     not null default false,
  reports     integer     not null default 0
);
create index if not exists chat_messages_room_time on public.chat_messages (room, created_at desc);
create index if not exists chat_messages_device_time on public.chat_messages (device_hash, created_at desc);

create table if not exists public.chat_reports (
  message_id  bigint      not null references public.chat_messages(id) on delete cascade,
  device_hash text        not null,
  created_at  timestamptz not null default now(),
  primary key (message_id, device_hash)       -- bir cihaz bir mesajı bir kez bildirir
);

create table if not exists public.chat_bans (
  device_hash text        primary key,
  reason      text,
  created_at  timestamptz not null default now()
);

alter table public.chat_messages enable row level security;
alter table public.chat_reports  enable row level security;
alter table public.chat_bans     enable row level security;
-- Bilerek POLİTİKA YOK: anon/authenticated rolleri hiçbir satıra erişemez.
