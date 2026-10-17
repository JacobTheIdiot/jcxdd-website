import { useLanyard } from 'use-lanyard'
import './App.css'
import './BorderGlow.css'
import BorderGlow from './BorderGlow'
import Oneko from "./Oneko"
import StatusIcons from './StatusIcons'
import { useRef, useEffect, useState } from 'react'
import ithinkaboutyouallthetime from './assets/song.mp3'
import imnotgodbutiwishiwas from "./assets/smkdpe2016.mp3"
import lefty from "./assets/lefty.mp3"
import blackfingernails from "./assets/blackfingernails.mp3"

import steamIcon from './assets/steamlogo.svg'
import githubIcon from './assets/github.png'
import tiktokIcon from './assets/tiktokicon.svg'
import discordIcon from './assets/discordicon.svg'

const LASTFM_USER = 'jc9606'
const LASTFM_KEY = 'c5ebb1c4d8a62182233242bcbd6407bd' 
const PLACEHOLDER = '2a96cbd8b46e442fc41c2b86b821562f' 

function TiltContainer({ children, className, max = 12 }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current

    const handleMove = (e) => {
      const rect = el.getBoundingClientRect()
      const x = (e.clientX - (rect.left + rect.width / 2)) / (window.innerWidth / 2)
      const y = (e.clientY - (rect.top + rect.height / 2)) / (window.innerHeight / 2)
      const cx = Math.max(-1, Math.min(1, x))
      const cy = Math.max(-1, Math.min(1, y))

      el.style.transform =
        `perspective(800px) rotateX(${-cy * max}deg) rotateY(${cx * max}deg)`
    }

    const reset = () => {
      el.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg)'
    }

    window.addEventListener('mousemove', handleMove)
    document.addEventListener('mouseleave', reset)

    return () => {
      window.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseleave', reset)
    }
  }, [max])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}

function LocalTime({ timeZone = 'America/Los_Angeles', place = 'California' }) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const time = now.toLocaleTimeString('en-US', {
    timeZone,
    hour: 'numeric',
    minute: '2-digit',
  })

  return (
    <p className="local-time">
      <svg viewBox="0 0 24 24" className="local-pin" aria-hidden="true">
        <path
          d="M12 22s7-6.2 7-12a7 7 0 10-14 0c0 5.8 7 12 7 12z"
          fill="none" stroke="currentColor" strokeWidth="2"
        />
        <circle cx="12" cy="10" r="2.5" fill="currentColor" />
      </svg>
      {place} · {time}
    </p>
  )
}

function StarField({ density = 0.00012, drift = 100, parallax = 12 }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let w = 0, h = 0, stars = [], raf
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const count = Math.floor(w * h * density)
      stars = Array.from({ length: count }, () => {
        const depth = Math.random() // 0 = far, 1 = near
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          depth,
          r: 0.3 + depth * 1.1,
          base: 0.25 + depth * 0.6,
          speed: 0.5 + Math.random() * 1.5,
          phase: Math.random() * Math.PI * 2,
        }
      })
    }

    const onMove = (e) => {
      mouse.tx = (e.clientX / w - 0.5) * 2
      mouse.ty = (e.clientY / h - 0.5) * 2
    }

    let last = performance.now()
    const draw = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now

      mouse.x += (mouse.tx - mouse.x) * 0.05
      mouse.y += (mouse.ty - mouse.y) * 0.05

      ctx.clearRect(0, 0, w, h)

      for (const s of stars) {
        if (!reduced) {
          s.y -= drift * s.depth * dt
          if (s.y < -2) { s.y = h + 2; s.x = Math.random() * w }
        }

        const px = s.x - mouse.x * parallax * s.depth
        const py = s.y - mouse.y * parallax * s.depth
        const twinkle = reduced ? 1 : 0.65 + 0.35 * Math.sin(now / 1000 * s.speed + s.phase)

        ctx.globalAlpha = s.base * twinkle
        ctx.fillStyle = '#fff'
        ctx.beginPath()
        ctx.arc(px, py, s.r, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1

      raf = requestAnimationFrame(draw)
    }

    resize()
    raf = requestAnimationFrame(draw)
    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', onMove)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMove)
    }
  }, [density, drift, parallax])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  )
}

function ProgressBar({ start, end }) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 500)
    return () => clearInterval(id)
  }, [])

  const total = end - start
  if (!(total > 0)) return null
  const elapsed = Math.min(Math.max(now - start, 0), total)

  const fmt = (ms) => {
    const s = Math.floor(ms / 1000)
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
  }

  return (
    <div className="progress">
      <span>{fmt(elapsed)}</span>
      <div className="progress-track">
        <div
          className="progress-fill"
          style={{ width: `${(elapsed / total) * 100}%` }}
        />
      </div>
      <span>{fmt(total)}</span>
    </div>
  )
}

function Activity({ name, details, state, image, start, end }) {
  return (
    <div className="activity">
      <div className="activity-body">
        {typeof image === 'string' && image && <img className="activity-art" src={image} alt="" />}
        <div className="activity-text">
          {name && <p className="activity-name">{name}</p>}
          {details && <p className="activity-title">{details}</p>}
          {state && <p className="activity-line">{state}</p>}
        </div>
      </div>
      {start && end && <ProgressBar start={start} end={end} />}
    </div>
  )
}

function SocialLink({ href, icon, name }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="social-link">
      <img src={icon} alt={name} className="social-icon" />
    </a>
  )
}

const track_list = [ithinkaboutyouallthetime, imnotgodbutiwishiwas, lefty, blackfingernails];
function VolumeControl() {
  const audioRef = useRef(null)
  const skipped = useRef(false)
  const [volume, setVolume] = useState(0.25)
  const [idx, setIdx] = useState(() => Math.floor(Math.random() * track_list.length))
  const track = track_list[idx]

  const skip = () => {
    skipped.current = true
    setIdx(idx + 1 >= track_list.length ? 0 : idx + 1)
  }

  useEffect(() => {
    if (!skipped.current) return
    skipped.current = false
    audioRef.current?.play().catch(() => {})
  }, [idx])

  useEffect(() => {
    const a = audioRef.current
    if (!a) return
    a.volume = volume
  }, [volume])

  useEffect(() => {
    const a = audioRef.current
    if (!a) return

    const cleanup = () => {
      window.removeEventListener('pointerdown', start)
      window.removeEventListener('keydown', start)
    }
    const start = () => {
      a.play().then(cleanup).catch(() => {})
    }

    window.addEventListener('pointerdown', start)
    window.addEventListener('keydown', start)
    return cleanup
  }, [])

  return (
    <BorderGlow
      className="volume-glow"
      glowColor="100 100 100"
      backgroundColor="#11111130"
      colors={['', '', '']}
      glowIntensity={0.5}
      glowRadius={0.5}
      maxTilt={0}
      blurPxls={2.5}
    >
      <div className="volume-control">
        <audio ref={audioRef} src={track} loop />
        <svg viewBox="0 0 24 24" className="volume-icon" aria-hidden="true">
          <path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" />
          {volume > 0 && (
            <path d="M16 9.5a3.5 3.5 0 010 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
          )}
          {volume > 0.5 && (
            <path d="M18.5 7a7 7 0 010 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
          )}
        </svg>
        <input
          type="range"
          className="slider"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          style={{ '--fill': `${volume * 100}%` }}
          aria-label="Volume"
        />
        <button className="skip-btn" onClick={skip} aria-label="Skip track">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 5l9 7-9 7V5z" fill="currentColor" />
            <path d="M18 5v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </BorderGlow>
  )
}

const appIconCache = new Map() 
const appIconInflight = new Map() 

async function getImageFromApplicationID({ id } = {}) {
  if (!id) return null
  if (appIconCache.has(id)) return appIconCache.get(id)

  if (!appIconInflight.has(id)) {
    const p = fetch(`https://discord.com/api/v10/applications/${id}/rpc`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(r.status))))
      .then((data) => {
        if (!data.icon) return null
        const url = `https://cdn.discordapp.com/app-icons/${id}/${data.icon}.png?size=128`
        appIconCache.set(id, url) 
        return url
      })
      .catch((err) => {
        console.error('App icon fetch failed:', err)
        return null
      })
      .finally(() => appIconInflight.delete(id))
    appIconInflight.set(id, p)
  }

  return appIconInflight.get(id)
}

function useAppIcons(activities) {
  const [, rerender] = useState(0)

  useEffect(() => {
    let alive = true
    for (const a of activities ?? []) {
      if (a.type !== 0 || a.assets?.large_image || !a.application_id) continue
      if (appIconCache.has(a.application_id)) continue
      getImageFromApplicationID({ id: a.application_id }).then((url) => {
        if (alive && url) rerender((n) => n + 1)
      })
    }
    return () => { alive = false }
  }, [activities])
}

function getImage(activity) {
  const img = activity.assets?.large_image
  if (!img) return appIconCache.get(activity.application_id) ?? null

  if (img.startsWith('spotify:')) {
    return `https://i.scdn.co/image/${img.replace('spotify:', '')}`
  }
  if (img.startsWith('mp:external/')) {
    return `https://media.discordapp.net/external/${img.replace('mp:external/', '')}`
  }
  if (img.startsWith('mp:')) {
    return `https://media.discordapp.net/${img.replace('mp:', '')}`
  }
  return `https://cdn.discordapp.com/app-assets/${activity.application_id}/${img}.png`
}

function timeAgo(uts) {
  const s = Math.floor(Date.now() / 1000) - Number(uts)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

function useLastFm(limit = 8) {
  const [tracks, setTracks] = useState(null)

  useEffect(() => {
    let alive = true

    const load = async () => {
      try {
        const res = await fetch(
          `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${LASTFM_USER}&api_key=${LASTFM_KEY}&format=json&limit=${limit}`
        )
        const data = await res.json()
        if (!alive || !data.recenttracks) return

        setTracks(
          [].concat(data.recenttracks.track).map((t) => {
            const art = t.image?.find((i) => i.size === 'large')?.['#text']
            return {
              name: t.name,
              artist: t.artist?.['#text'],
              url: t.url,
              image: art && !art.includes(PLACEHOLDER) ? art : null,
              nowPlaying: t['@attr']?.nowplaying === 'true',
              uts: t.date?.uts,
            }
          })
        )
      } catch (err) {
        console.error('Last.fm fetch failed:', err)
      }
    }

    load()
    const id = setInterval(load, 30000)
    return () => {
      alive = false
      clearInterval(id)
    }
  }, [limit])

  return tracks
}

const PERIODS = [
  { id: '7day', label: '7d' },
  { id: '1month', label: '1m' },
  { id: '12month', label: '1y' },
  { id: 'overall', label: 'all' },
]

const TOP_TABS = [
  { id: 'artists', method: 'user.gettopartists', root: 'topartists', item: 'artist' },
  { id: 'albums', method: 'user.gettopalbums', root: 'topalbums', item: 'album' },
  { id: 'tracks', method: 'user.gettoptracks', root: 'toptracks', item: 'track' },
]

function useLastFmTop(tabId, period, limit = 8) {
  const [state, setState] = useState({ key: '', items: null })
  const key = `${tabId}:${period}`

  useEffect(() => {
    let alive = true
    const tab = TOP_TABS.find((t) => t.id === tabId)

    fetch(
      `https://ws.audioscrobbler.com/2.0/?method=${tab.method}&user=${LASTFM_USER}&api_key=${LASTFM_KEY}&period=${period}&format=json&limit=${limit}`
    )
      .then((r) => r.json())
      .then((data) => {
        if (!alive) return
        const list = [].concat(data[tab.root]?.[tab.item] ?? [])
        setState({
          key,
          items: list.map((it) => {
            const art = it.image?.find((i) => i.size === 'extralarge')?.['#text']
            return {
              name: it.name,
              sub: it.artist?.name,           // artists have none; albums/tracks do
              url: it.url,
              plays: Number(it.playcount) || 0,
              image: art && !art.includes(PLACEHOLDER) ? art : null,
            }
          }),
        })
      })
      .catch((err) => console.error('Last.fm top fetch failed:', err))

    return () => { alive = false }
  }, [tabId, period, key, limit])

  // keep showing the old list (dimmed) while the new one loads
  return { items: state.items, loading: state.key !== key }
}

function TopLastFm() {
  const [tabId, setTabId] = useState('artists')
  const [period, setPeriod] = useState('1month')
  const { items, loading } = useLastFmTop(tabId, period)
  const max = items?.length ? Math.max(...items.map((i) => i.plays)) : 1

  return (
    <BorderGlow
      className="lastfm-glow"
      glowColor="100 100 100"
      backgroundColor="#11111130"
      colors={['', '', '']}
      glowIntensity={0.5}
      glowRadius={0.5}
      maxTilt={0}
      blurPxls={2.5}
    >
      <div className="lastfm top">
        <p className="lastfm-heading">top played</p>

        <div className="top-controls">
          <div className="seg">
            {TOP_TABS.map((t) => (
              <button
                key={t.id}
                className={`seg-btn${tabId === t.id ? ' active' : ''}`}
                onClick={() => setTabId(t.id)}
              >
                {t.id}
              </button>
            ))}
          </div>
          <div className="seg">
            {PERIODS.map((p) => (
              <button
                key={p.id}
                className={`seg-btn${period === p.id ? ' active' : ''}`}
                onClick={() => setPeriod(p.id)}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className={`top-list${loading ? ' loading' : ''}`}>
          {(items ?? []).map((it, i) => (
            <a
              key={`${tabId}-${i}`}
              href={it.url}
              target="_blank"
              rel="noopener noreferrer"
              className="top-row"
            >
              <span className="top-rank">{i + 1}</span>
              {tabId !== 'artists' &&
                (it.image ? (
                  <img className="lastfm-art" src={it.image} alt="" />
                ) : (
                  <div className="lastfm-art lastfm-art--empty" />
                ))}
              <div className="lastfm-text">
                <p className="lastfm-title">{it.name}</p>
                {it.sub && <p className="lastfm-artist">{it.sub}</p>}
                <div className="top-bar">
                  <div className="top-bar-fill" style={{ width: `${(it.plays / max) * 100}%` }} />
                </div>
              </div>
              <span className="lastfm-when">{it.plays.toLocaleString()} plays</span>
            </a>
          ))}
          {!items && <p className="top-empty">loading…</p>}
        </div>
      </div>
    </BorderGlow>
  )
}

function RecentTracks({ tracks }) {
  if (!tracks || tracks.length === 0) return null

  return (
    <BorderGlow
      className="lastfm-glow"
      glowColor="100 100 100"
      backgroundColor="#11111130"
      colors={['', '', '']}
      glowIntensity={0.5}
      glowRadius={0.5}
      maxTilt={0}
      blurPxls={2.5}
    >
      <div className="lastfm">
        <p className="lastfm-heading">recently played</p>
        {tracks.map((t, i) => (
          <a
            key={i}
            href={t.url}
            target="_blank"
            rel="noopener noreferrer"
            className="lastfm-row"
          >
            {t.image ? (
              <img className="lastfm-art" src={t.image} alt="" />
            ) : (
              <div className="lastfm-art lastfm-art--empty" />
            )}
            <div className="lastfm-text">
              <p className="lastfm-title">{t.name}</p>
              <p className="lastfm-artist">{t.artist}</p>
            </div>
            <span className="lastfm-when">
              {t.nowPlaying ? 'now' : timeAgo(t.uts)}
            </span>
          </a>
        ))}
      </div>
    </BorderGlow>
  )
}

const COUNTER_URL = 'https://vvv.yokiddo9.workers.dev/'

let counterRequest = null 

function fetchCount() {
  if (counterRequest) return counterRequest

  let alreadyCounted = false
  try {
    alreadyCounted = localStorage.getItem('visitor-counted') === '1'
  } catch {
    // storage blocked: just count
  }

  counterRequest = fetch(alreadyCounted ? COUNTER_URL : `${COUNTER_URL}?up=1`)
    .then((r) => {
      if (!r.ok) throw new Error(`counter responded ${r.status}`)
      return r.json()
    })
    .then((d) => {
      if (!alreadyCounted) {
        try { localStorage.setItem('visitor-counted', '1') } catch { /* ignore */ }
      }
      const value = d?.data?.up_count ?? d?.up_count ?? d?.data?.value ?? d?.value ?? d?.count
      return typeof value === 'number' ? value : null
    })

  counterRequest.catch(() => { counterRequest = null }) // allow a retry after failure
  return counterRequest
}

function VisitorCounter() {
  const [count, setCount] = useState(null)

  useEffect(() => {
    let cancelled = false
    fetchCount()
      .then((v) => { if (!cancelled) setCount(v) })
      .catch((err) => console.warn('visitor counter failed:', err))
    return () => { cancelled = true }
  }, [])

  if (count == null) return null
  return (
    <p className="visitor-count" title="visitors" aria-label={`${count} visitors`}>
      <svg viewBox="0 0 24 24" className="visitor-eye" aria-hidden="true">
        <path
          d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"
          fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"
        />
        <circle cx="12" cy="12" r="3.5" fill="currentColor" />
      </svg>
      {count.toLocaleString()}
    </p>
  )
}

function App() {
  const presence = useLanyard('1125364099363119194')
  const tracks = useLastFm()
  useAppIcons(presence?.activities)

  const [entered, setEntered] = useState(false)
  const pageTwoRef = useRef(null)

  // no scrolling behind the "click" screen
  useEffect(() => {
    document.body.style.overflow = entered ? '' : 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [entered])

  const gate = (
    <button
      className={`enter-gate${entered ? ' gone' : ''}`}
      onClick={() => setEntered(true)}
      style={{ background: 'transparent' }}
    >
      click
    </button>
  )

  if (!presence) return <><StarField />{gate}</>

  const discordUser = presence.discord_user
  const status = presence.discord_status

  const get_activity = () => {
    const found = []
    let hasSpotify = false

    for (const activity of presence.activities) {
      /*
        activity types:
        0: playing
        1: streaming
        2: listening
        3: watching
        i only care abt playing and listening
      */
      switch (activity.type) {
        case 0:
          found.push({
            name: `Playing ${activity.name}`,
            details: activity.details,
            state: activity.state,
            image: getImage(activity),
          })
          break
        case 2:
          hasSpotify = true
          found.push({
            name: 'Listening to Spotify',
            details: activity.details,                    // song
            state: activity.state?.replaceAll(';', ','),  // artist(s)
            image: getImage(activity),
            start: activity.timestamps?.start,
            end: activity.timestamps?.end,
          })
          break
      }
    }

    if (!hasSpotify && tracks?.length) {
      const t = tracks[0]
      found.push({
        name: t.nowPlaying ? 'Listening to music' : 'Last listened to',
        details: t.name,
        state: t.uts ? `${t.artist} · ${timeAgo(t.uts)}` : t.artist,
        image: t.image,
      })
    }

    return found
  }

  const activities = get_activity()

  return (
    <>
    {gate}
    <Oneko/>
      <StarField />
      <div
        className={`discord-profile${entered ? ' visible' : ''}`}
        style={{ position: 'relative', zIndex: 1 }}
      >
        {/*page 1*/}
        <section className="page">
          <TiltContainer className="tilt-stack" max={2}>
            <BorderGlow
              glowColor="100 100 100"
              backgroundColor="#11111130"
              colors={['', '', '']}
              maxTilt={0}
              blurPxls={2.5}
            >
              <div className="main-container">
                <div className="discord-header">
                  <div className="discord-avatar-wrap">
                    <img
                      src={`https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`}
                      alt="avatar"
                      className="discord-avatar"
                    />
                    <div className="discord-status-wrapper">
                      <StatusIcons status={status} className="discord-status" />
                      <div className="discord-status-popup-content">{status}</div>
                    </div>
                  </div>
                  <div className="discord-status-text">
                    <b>{discordUser.username}</b>
                    <p style={{ fontSize: '15px' }}>{status}</p>
                    <LocalTime timeZone="America/Los_Angeles" />
                  </div>
                </div>
                <div className="discord-activity-wrap">
                  <div className="activity-list">
                    {activities.map((activity, i) => (
                      <Activity key={i} {...activity} />
                    ))}
                  </div>
                </div>
                <div className="social-links">
                  <SocialLink href="https://steamcommunity.com/id/herwordskiII" icon={steamIcon} name="Steam" />
                  <SocialLink href="https://github.com/jacobtheidiot" icon={githubIcon} name="GitHub" />
                  <SocialLink href="https://www.tiktok.com/@jagblog" icon={tiktokIcon} name="TikTok" />
                  <SocialLink href="https://discord.com/users/1125364099363119194" icon={discordIcon} name="Discord" />
                </div>
                <VisitorCounter />
              </div>
            </BorderGlow>
            <VolumeControl />
          </TiltContainer>

          <button
            className="scroll-hint"
            aria-label="Scroll down"
            onClick={() => pageTwoRef.current?.scrollIntoView({ behavior: 'smooth' })}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </section>

        {/*page 2*/}
        <section className="page page-two" ref={pageTwoRef}>
          <TiltContainer className='lastfm-wrapper' max={3}>
          <TopLastFm />
          <RecentTracks tracks={tracks} />
          </TiltContainer>
        </section>
      </div>
    </>
  )
}

export default App