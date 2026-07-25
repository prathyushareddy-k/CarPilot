import { createElement, useEffect, useRef, useState } from 'react';
import type { AppState, AppView } from './types';
import { carListings } from './carData';

const initialState: AppState = {
  screen: 'landing',
  intakeStep: 1,
  budgetMode: 'monthly',
  cashTotal: 28000,
  monthly: 450,
  term: 60,
  down: 3000,
  activePacket: 'crv22',
  packetFrom: 'packets',
  weights: { reliability: 80, resale: 55, running: 65, performance: 35 },
  usage: ['commute'],
  timeline: 'month',
  radius: 60,
  zip: '94110',
  condition: 'either',
  fuel: 'either',
  fuelCost: 200,
  mustHaves: { awd: true, carplay: true, backup: true, mpg: false, thirdrow: false, manual: false },
  expanded: null,
  showNotes: false,
  scanStep: 0,
  demoOpen: true,
  copied: false,
  alertsOpen: false,
  dismissedAlerts: [],
  saved: ['crv22', 'rav4xle'],
  compareSet: ['crv22', 'cx522'],
  savedFilter: 'all',
  conditionFilter: 'all',
  fuelFilter: 'all',
  sortBy: 'fit',
  justSaved: null,
  compareSpecsOpen: false,
  customMusts: [],
  newMust: '',
  detailCarId: 'crv22',
};

export function useAppView(): AppView {
  const [state, setStateRaw] = useState<AppState>(initialState);
  const scanRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const savedTRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function setState(patch: Partial<AppState> | ((s: AppState) => Partial<AppState>)) {
    setStateRaw(prev => ({ ...prev, ...(typeof patch === 'function' ? patch(prev) : patch) }));
  }

  useEffect(() => {
    return () => {
      if (scanRef.current) clearInterval(scanRef.current);
      if (savedTRef.current) clearTimeout(savedTRef.current);
    };
  }, []);

  function addCustomMust() {
    setState(s => {
      const v = s.newMust.trim();
      if (!v || s.customMusts.some(c => c.toLowerCase() === v.toLowerCase())) return { newMust: '' };
      return { customMusts: [...s.customMusts, v], newMust: '' };
    });
  }
  function removeCustomMust(v: string) {
    setState(s => ({ customMusts: s.customMusts.filter(x => x !== v) }));
  }

  function go(s: AppState['screen']) {
    if (scanRef.current) {
      clearInterval(scanRef.current);
      scanRef.current = null;
    }
    setState({ screen: s });
    try {
      window.scrollTo(0, 0);
    } catch {
      /* noop */
    }
  }
  function startIntake() {
    setState({ screen: 'intake', intakeStep: 1 });
    try {
      window.scrollTo(0, 0);
    } catch {
      /* noop */
    }
  }
  function next() {
    setState(s => ({ intakeStep: Math.min(10, s.intakeStep + 1) }));
    try {
      window.scrollTo(0, 0);
    } catch {
      /* noop */
    }
  }
  function back() {
    setState(s => (s.intakeStep <= 1 ? { screen: 'landing' } : { intakeStep: s.intakeStep - 1 }));
    try {
      window.scrollTo(0, 0);
    } catch {
      /* noop */
    }
  }
  function goStep(n: number) {
    setState({ screen: 'intake', intakeStep: n });
    try {
      window.scrollTo(0, 0);
    } catch {
      /* noop */
    }
  }
  function openDetail(id: string) {
    setState({ detailCarId: id, screen: 'detail' });
    try { window.scrollTo(0, 0); } catch { /* noop */ }
  }

  function openPacket(id: string, from?: string) {
    setState({ activePacket: id, packetFrom: from || 'packets', screen: 'packet' });
    try {
      window.scrollTo(0, 0);
    } catch {
      /* noop */
    }
  }
  function goPackets() {
    setState({ screen: 'packets' });
    try {
      window.scrollTo(0, 0);
    } catch {
      /* noop */
    }
  }

  function findCars() {
    setState({ screen: 'scanning', scanStep: 0 });
    try {
      window.scrollTo(0, 0);
    } catch {
      /* noop */
    }
    if (scanRef.current) clearInterval(scanRef.current);
    scanRef.current = setInterval(() => {
      setState(st => {
        const n = st.scanStep + 1;
        if (n >= 5) {
          if (scanRef.current) clearInterval(scanRef.current);
          scanRef.current = null;
          setTimeout(() => go('shortlist'), 1000);
        }
        return { scanStep: n };
      });
    }, 850);
  }

  function setW(k: keyof AppState['weights'], v: string | number) {
    setState(s => ({ weights: { ...s.weights, [k]: +v } }));
  }
  function toggleMust(k: keyof AppState['mustHaves']) {
    setState(s => ({ mustHaves: { ...s.mustHaves, [k]: !s.mustHaves[k] } }));
  }
  function toggleExpand(id: string) {
    setState(s => ({ expanded: s.expanded === id ? null : id }));
  }
  function toggleSave(id: string) {
    setState(s => {
      const has = s.saved.includes(id);
      return {
        saved: has ? s.saved.filter(x => x !== id) : [...s.saved, id],
        justSaved: has ? (s.justSaved === id ? null : s.justSaved) : id,
      };
    });
    if (savedTRef.current) clearTimeout(savedTRef.current);
    savedTRef.current = setTimeout(() => setState({ justSaved: null }), 3200);
  }
  function toggleCompare(id: string) {
    setState(s => {
      if (s.compareSet.includes(id)) return { compareSet: s.compareSet.filter(x => x !== id) };
      if (s.compareSet.length >= 3) return {};
      return { compareSet: [...s.compareSet, id] };
    });
  }
  function setSavedFilter(v: AppState['savedFilter']) {
    setState({ savedFilter: v });
  }
  function toggleAlerts() {
    setState(s => ({ alertsOpen: !s.alertsOpen }));
  }
  function closeAlerts() {
    setState({ alertsOpen: false });
  }
  function dismissAlert(id: string) {
    setState(s => ({ dismissedAlerts: [...s.dismissedAlerts, id] }));
  }
  function clearAllAlerts() {
    setState({ dismissedAlerts: _alertIds() });
  }
  function _alertIds() {
    return ['a1', 'a2', 'a3', 'a4'];
  }
  function openAlert(go2: AppState['screen'] | null) {
    setState({ alertsOpen: false });
    if (go2) go(go2);
  }
  function openCompare() {
    go('compare');
  }
  function clearCompare() {
    setState({ compareSet: [] });
  }

  function optStyle(active: boolean) {
    return active
      ? 'text-align:left;padding:16px 18px;border-radius:12px;border:2px solid #0F766E;background:#E6F5F2;cursor:pointer;font-family:inherit;'
      : 'text-align:left;padding:16px 18px;border-radius:12px;border:2px solid #E7E2D9;background:#fff;cursor:pointer;font-family:inherit;';
  }

  // ---- renderVals() ----
  const st = state;
  const s = st.screen;

  const usd = (n: number) => '$' + n.toLocaleString('en-US');

  // intake options
  const mk = (val: string, key: 'timeline' | 'condition' | 'fuel', label: string, sub: string) => ({
    label,
    sub,
    style: optStyle(st[key] === val),
    onClick: () => setState({ [key]: val } as Partial<AppState>),
  });
  const toggleUsage = (val: string) =>
    setState(s2 => {
      const cur = Array.isArray(s2.usage) ? s2.usage : [s2.usage];
      return { usage: cur.includes(val) ? cur.filter(x => x !== val) : [...cur, val] };
    });
  const usageSel = Array.isArray(st.usage) ? st.usage : [st.usage];
  const mkMulti = (val: string, label: string, sub: string) => {
    const checked = usageSel.includes(val);
    return {
      label,
      sub,
      checked,
      style: optStyle(checked),
      boxStyle:
        'flex-shrink:0;width:22px;height:22px;border-radius:6px;margin-top:1px;display:flex;align-items:center;justify-content:center;border:2px solid ' +
        (checked ? '#0F766E' : '#C9C4BB') +
        ';background:' +
        (checked ? '#0F766E' : '#fff') +
        ';color:#fff;font-size:13px;font-weight:800;',
      onClick: () => toggleUsage(val),
    };
  };
  const usageOpts = [
    mkMulti('commute', 'Daily commute', 'Mostly solo, reliability and cost first'),
    mkMulti('family', 'Family hauling', 'Car seats, gear, room to grow'),
    mkMulti('weekend', 'Weekend + occasional', 'Low miles, the fun matters more'),
    mkMulti('first', 'My first car, learning', 'Safe, easy, forgiving to own'),
  ];
  const timelineOpts = [
    mk('asap', 'timeline', 'As soon as possible', 'Agent acts on great deals immediately'),
    mk('month', 'timeline', 'Within a month', 'Balanced — wait for the right one'),
    mk('quarter', 'timeline', '2–3 months', 'Patient, let prices come to us'),
    mk('explore', 'timeline', 'Just exploring', 'Watch only, no pressure'),
  ];
  const condOpts = [
    mk('used', 'condition', 'Used', 'Best value, most choice'),
    mk('cpo', 'condition', 'Certified pre-owned', 'Inspected + warranty, small premium'),
    mk('new', 'condition', 'New', 'Simplest, but depreciates fastest'),
    mk('either', 'condition', 'Open to all', 'Let the agent find the best total cost'),
  ];
  const fuelOpts = [
    mk('ev', 'fuel', 'Electric (EV)', 'Zero gas — charge at home or on the road'),
    mk('hybrid', 'fuel', 'Hybrid', 'Great mpg with no range anxiety'),
    mk('gas', 'fuel', 'Gas', 'Simplest, cheapest upfront, widest choice'),
    mk('either', 'fuel', 'No strong preference', 'Let the agent weigh total running cost'),
  ];
  const mhDefs: [keyof AppState['mustHaves'], string][] = [
    ['awd', 'All-wheel drive'],
    ['carplay', 'Apple CarPlay / Android Auto'],
    ['backup', 'Backup camera'],
    ['mpg', '35+ mpg'],
    ['thirdrow', 'Third row'],
    ['manual', 'Manual transmission'],
  ];
  const mustHaves = mhDefs.map(([k, label]) => ({
    label,
    onClick: () => toggleMust(k),
    style:
      'border-radius:999px;padding:12px 18px;font-size:14px;font-weight:600;font-family:inherit;cursor:pointer;' +
      (st.mustHaves[k] ? 'background:#0F766E;color:#fff;border:2px solid #0F766E;' : 'background:#fff;color:#6B6459;border:2px solid #E7E2D9;'),
  }));

  // summary
  const usageMap: Record<string, string> = { commute: 'Daily commute', family: 'Family hauling', weekend: 'Weekend + occasional', first: 'First car, learning' };
  const timeMap: Record<string, string> = { asap: 'As soon as possible', month: 'Within a month', quarter: '2–3 months', explore: 'Just exploring' };
  const condMap: Record<string, string> = { used: 'Used', cpo: 'Certified pre-owned', new: 'New', either: 'Open to all' };
  const fuelMap: Record<string, string> = { ev: 'Electric (EV)', hybrid: 'Hybrid', gas: 'Gas', either: 'No preference' };
  const customChips = st.customMusts.map(v => ({ label: v, onRemove: () => removeCustomMust(v) }));
  const chosenMust = [...mhDefs.filter(([k]) => st.mustHaves[k]).map(([, l]) => l), ...st.customMusts].join(', ') || 'None set';
  const budgetSummary =
    st.budgetMode === 'cash' ? usd(st.cashTotal) + ' cash, out the door' : usd(st.monthly) + '/mo · ' + usd(st.down) + ' down · ' + st.term + 'mo';
  const summary = [
    { k: 'Primary use', v: usageSel.map(u => usageMap[u]).filter(Boolean).join(', ') || 'Not set', onEdit: () => goStep(1) },
    { k: 'Budget', v: budgetSummary, onEdit: () => goStep(4) },
    { k: 'Timeline', v: timeMap[st.timeline], onEdit: () => goStep(3) },
    { k: 'Search area', v: st.radius + ' mi from ' + st.zip, onEdit: () => goStep(2) },
    { k: 'Condition', v: condMap[st.condition], onEdit: () => goStep(6) },
    { k: 'Fuel type', v: fuelMap[st.fuel], onEdit: () => goStep(7) },
    { k: 'Fuel budget', v: st.fuel === 'ev' ? usd(st.fuelCost) + '/mo energy' : usd(st.fuelCost) + '/mo fuel', onEdit: () => goStep(8) },
    { k: 'Must-haves', v: chosenMust, onEdit: () => goStep(9) },
  ];

  const briefRows = [
    { k: 'Budget', v: budgetSummary },
    { k: 'Primary use', v: usageSel.map(u => usageMap[u]).filter(Boolean).join(', ') || 'Not set' },
    { k: 'Search area', v: st.radius + ' mi · ' + st.zip },
    { k: 'Timeline', v: timeMap[st.timeline] },
    { k: 'Condition', v: condMap[st.condition] },
    { k: 'Fuel type', v: fuelMap[st.fuel] },
    { k: 'Fuel budget', v: usd(st.fuelCost) + '/mo' + (st.fuel === 'ev' ? ' energy' : '') },
  ];

  // scan items
  const scanData: [string, string][] = [
    ['Franchise & independent dealers', '1,240'],
    ['Private-party listings', '380'],
    ['Certified pre-owned inventory', '512'],
    ['30-day comparable sales (pricing)', '2,100'],
    ['Recalls, safety & reliability data', '—'],
  ];
  const scanItems = scanData.map(([label, count], i) => {
    const done = st.scanStep > i;
    const active = st.scanStep === i;
    return {
      label,
      count: done ? count : active ? 'scanning…' : '',
      mark: done ? '✓' : '',
      dotStyle:
        'width:20px;height:20px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;' +
        (done ? 'background:#2563EB;color:#fff;' : 'background:#F5F1EB;color:#9C9189;border:2px solid #E7E2D9;'),
      textStyle: 'font-size:14px;font-weight:600;color:' + (done ? '#1C1A17' : active ? '#2563EB' : '#9C9189') + ';',
    };
  });

  // cars
  const fitStyle = (f: number) => {
    let bg, col;
    if (f >= 85) {
      bg = '#0F766E';
      col = '#fff';
    } else if (f >= 75) {
      bg = '#A7D9D3';
      col = '#115E59';
    } else {
      bg = '#E7E2D9';
      col = '#6B6459';
    }
    return 'width:44px;height:44px;border-radius:11px;display:flex;align-items:center;justify-content:center;font-size:19px;font-weight:800;background:' + bg + ';color:' + col + ';';
  };
  const fitBg = (f: number) => {
    if (f >= 85) return 'background:#0F766E;color:#fff;';
    if (f >= 75) return 'background:#A7D9D3;color:#115E59;';
    return 'background:#E7E2D9;color:#6B6459;';
  };
  const dealStyle = (r: string) => {
    const map: Record<string, string> = {
      Good: 'background:#DCFCE7;color:#15803D;border:1px solid #BBF7D0;',
      Fair: 'background:#F5F1EB;color:#6B6459;border:1px solid #E7E2D9;',
      Over: 'background:#FEE2E2;color:#B91C1C;border:1px solid #FECACA;',
    };
    return 'border-radius:999px;padding:4px 11px;font-size:12px;font-weight:700;white-space:nowrap;' + map[r];
  };
  const dealLabel: Record<string, string> = { Good: 'Good deal', Fair: 'Fair price', Over: 'Overpriced' };
  const carData = carListings;
  const mhLabels: Record<string, string> = { awd: 'AWD', carplay: 'CarPlay', backup: 'Backup cam', mpg: '35+ mpg', thirdrow: 'Third row', manual: 'Manual' };
  const chipStyle = 'display:inline-flex;align-items:center;gap:4px;background:#E6F5F2;border:1px solid #A7D9D3;border-radius:999px;padding:3px 10px;font-size:11px;font-weight:700;color:#115E59;';
  const mkSvg = (children: string[]) =>
    createElement(
      'svg',
      {
        width: 13, height: 13, viewBox: '0 0 24 24', fill: 'none',
        stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round',
        style: { flexShrink: 0, display: 'block' },
      },
      children.map((d, i) => createElement('path', { key: i, d })),
    );
  const condIcon = (cond: string) => {
    if (cond === 'New') return mkSvg(['M12 2.2l2.3 6.9 6.9.1-5.5 4.2 2 6.6L12 16.1l-5.7 4 2-6.6-5.5-4.2 6.9-.1z']);
    if (cond === 'Certified pre-owned') return mkSvg(['M12 2l7.5 3v6c0 4.6-3.2 7.7-7.5 9-4.3-1.3-7.5-4.4-7.5-9V5z', 'M8.5 12l2.5 2.5 4.5-4.5']);
    return mkSvg(['M20.6 13.4l-7.2 7.2a2 2 0 01-2.8 0L2 12V2h10l8.6 8.6a2 2 0 010 2.8z', 'M7 7h.01']);
  };
  const fuelIcon = (fuel: string) => {
    if (fuel === 'Electric') return mkSvg(['M13 2L4 14h7l-1 8 9-12h-7z']);
    if (fuel === 'Hybrid') return mkSvg(['M11 20A7 7 0 019.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8a7 7 0 01-8 10z', 'M2 21c0-3 1.9-5.4 5.1-6']);
    return mkSvg(['M12 2.5S6 9.2 6 14a6 6 0 0012 0c0-4.8-6-11.5-6-11.5z']);
  };
  const carSrc = (id: string) => '/cars/' + id + '.jpg';
  const cars = carData.map(c => {
    const isSaved = st.saved.includes(c.id);
    const inCmp = st.compareSet.includes(c.id);
    const cmpFull = st.compareSet.length >= 3 && !inCmp;
    const chips = c.mustHaveKeys.map(k => ({ style: chipStyle, icon: '✓ ', label: mhLabels[k] || k }));
    return {
      ...c,
      deal: undefined as unknown as string,
      tco: c.tco + '/mo',
      fitStyle: fitStyle(c.fit), fitBg: fitBg(c.fit),
      dealStyle: dealStyle(c.deal), dealLabel: dealLabel[c.deal],
      dealDelta: c.dealDelta,
      dealComps: c.dealComps,
      hasMustHaveChips: chips.length > 0,
      mustHaveChips: chips,
      tradeoff: c.tradeoff,
      expanded: st.expanded === c.id, caret: st.expanded === c.id ? '▲' : '▼',
      onToggle: () => toggleExpand(c.id),
      slotId: 'car-' + c.id, slotPlaceholder: 'Drop a ' + c.name + ' photo', slotSrc: carSrc(c.id),
      conditionIcon: condIcon(c.condition), fuelIcon: fuelIcon(c.fuelType),
      saved: isSaved,
      // eslint-disable-next-line react-hooks/refs -- toggleSave is only ever invoked from an onClick handler, never during render
      onSave: () => toggleSave(c.id),
      heartGlyph: isSaved ? '♥' : '♡',
      heartStyle: 'background:none;border:none;cursor:pointer;font-size:22px;line-height:1;padding:2px 6px;font-family:inherit;color:' + (isSaved ? '#0F766E' : '#9C9189') + ';',
      showSavedConfirm: st.justSaved === c.id,
      inCompare: inCmp,
      compareMark: inCmp ? '✓' : '',
      onCompare: () => toggleCompare(c.id),
      compareStyle: 'display:inline-flex;align-items:center;gap:8px;background:none;border:none;font-family:inherit;font-size:13px;font-weight:600;color:' + (inCmp ? '#0F766E' : '#9C9189') + ';' + (cmpFull ? 'opacity:.4;cursor:not-allowed;pointer-events:none;' : 'cursor:pointer;'),
      compareBoxStyle: 'width:18px;height:18px;border-radius:5px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;color:#fff;border:2px solid ' + (inCmp ? '#0F766E' : '#C9C4BB') + ';background:' + (inCmp ? '#0F766E' : '#fff') + ';',
      goDetail: () => openDetail(c.id),
    };
  });

  const parseMi = (d: string) => parseInt(String(d).replace(/[^0-9]/g, ''), 10) || 0;
  const parseMoney = (t: string) => +String(t).replace(/[^0-9]/g, '') || 0;
  const sorters: Record<string, (a: (typeof cars)[number], b: (typeof cars)[number]) => number> = {
    fit: (a, b) => b.fit - a.fit,
    price: (a, b) => parseMoney(a.tco) - parseMoney(b.tco),
    distance: (a, b) => parseMi(a.distance) - parseMi(b.distance),
  };
  cars.sort(sorters[st.sortBy] || sorters.fit);
  const sortOpts = [
    { value: 'fit', label: 'Sort: Best fit' },
    { value: 'price', label: 'Sort: Lowest price' },
    { value: 'distance', label: 'Sort: Nearest' },
  ];
  const sortSelectStyle = 'appearance:none;-webkit-appearance:none;background:#fff;border:1px solid #E7E2D9;border-radius:9px;padding:9px 30px 9px 14px;font-size:13px;font-weight:600;font-family:inherit;color:#6B6459;cursor:pointer;outline:none;';

  const savedCount = st.saved.length;
  let shortlistCars = st.savedFilter === 'saved' ? cars.filter(c => c.saved) : cars;
  if (st.conditionFilter !== 'all') shortlistCars = shortlistCars.filter(c => c.condition === st.conditionFilter);
  if (st.fuelFilter !== 'all') shortlistCars = shortlistCars.filter(c => c.fuelType === st.fuelFilter);
  const savedEmpty = st.savedFilter === 'saved' && shortlistCars.length === 0 && st.conditionFilter === 'all' && st.fuelFilter === 'all';
  const filtersActive = st.conditionFilter !== 'all' || st.fuelFilter !== 'all';
  const filterEmpty = filtersActive && shortlistCars.length === 0 && !savedEmpty;
  const conditionOpts = [
    { value: 'all', label: 'Condition: All' }, { value: 'New', label: 'New' },
    { value: 'Used', label: 'Used' }, { value: 'Certified pre-owned', label: 'Certified pre-owned' },
  ];
  const fuelFilterOpts = [
    { value: 'all', label: 'Fuel: All' }, { value: 'Gas', label: 'Gas' },
    { value: 'Hybrid', label: 'Hybrid' }, { value: 'Electric', label: 'Electric' },
  ];
  const selBase = 'appearance:none;-webkit-appearance:none;background:#fff;border-radius:9px;padding:9px 30px 9px 14px;font-size:13px;font-weight:600;font-family:inherit;cursor:pointer;outline:none;';
  const conditionSelectStyle = selBase + 'border:1px solid ' + (st.conditionFilter !== 'all' ? '#0F766E' : '#E7E2D9') + ';color:' + (st.conditionFilter !== 'all' ? '#0F766E' : '#6B6459') + ';';
  const fuelSelectStyle = selBase + 'border:1px solid ' + (st.fuelFilter !== 'all' ? '#0F766E' : '#E7E2D9') + ';color:' + (st.fuelFilter !== 'all' ? '#0F766E' : '#6B6459') + ';';
  const cmpCount = st.compareSet.length;
  const segBase = 'border:none;border-radius:8px;padding:8px 16px;font-size:13px;font-weight:700;font-family:inherit;cursor:pointer;';

  // compare screen data
  const cmp = st.compareSet.map(id => carData.find(c => c.id === id)).filter(Boolean) as typeof carData;
  const monthlyNum = (c: (typeof carData)[number]) => +String(c.tco).replace(/[^0-9]/g, '');
  const maxFit = cmp.length ? Math.max(...cmp.map(c => c.fit)) : 0;
  const minCost = cmp.length ? Math.min(...cmp.map(monthlyNum)) : 0;
  const cellBase = 'padding:16px;display:flex;flex-direction:column;gap:8px;align-items:flex-start;justify-content:center;border-bottom:1px solid #F5F1EB;border-left:1px solid #F5F1EB;';
  const winStyle = 'border-left:3px solid #0F766E;background:#F0FAF9;';
  const tradeoffs: Record<string, string> = {
    crv22: 'Fuel runs about $35/mo over your target — the only real knock.',
    rav4xle: 'Priced hot this month, so you\'d pay near full value, not a steal.',
    cx522: 'Reliability is good but not quite Toyota/Honda bulletproof.',
    forester22: 'Priced at market — little room to negotiate.',
    escape22h: 'Ford long-term reliability trails Toyota/Honda.',
    tucson23h: 'At the top of your budget range.',
    niroev23: 'Public fast-charging adds ~$30–50/mo if you rely on it.',
    outback22: 'Near your budget ceiling; fuel economy below rivals.',
    camry22: 'Sedan — no extra cargo height vs. crossovers.',
    civic21: 'Compact sedan — less cargo space than any crossover here.',
    equinox22: 'GM reliability below Japanese rivals.',
    rogue20: '2020 Rogue CVT had documented reliability issues — verify.',
  };
  const cspecs: Record<string, string[]> = {
    crv22: ['AWD', '~$200/mo', '5-star NHTSA', '5', 'None'],
    rav4xle: ['AWD', '~$185/mo', '5-star NHTSA', '5', 'None'],
    cx522: ['AWD', '~$210/mo', '5-star NHTSA', '5', 'None'],
    forester22: ['AWD', '~$205/mo', '5-star NHTSA', '5', 'None'],
    escape22h: ['FWD', '~$155/mo', '5-star NHTSA', '5', 'None'],
    tucson23h: ['AWD', '~$160/mo', '5-star NHTSA', '5', 'None'],
    niroev23: ['FWD', '~$35/mo', '5-star NHTSA', '5', 'None'],
    outback22: ['AWD', '~$220/mo', '5-star NHTSA', '5', 'None'],
    camry22: ['FWD', '~$175/mo', '5-star NHTSA', '5', 'None'],
    civic21: ['FWD', '~$165/mo', '5-star NHTSA', '5', 'None'],
    equinox22: ['AWD', '~$195/mo', '5-star NHTSA', '5', 'None'],
    rogue20: ['AWD', '~$190/mo', '5-star NHTSA', '5', 'None'],
  };
  const gridCols = '150px repeat(' + Math.max(cmp.length, 1) + ', minmax(0, 1fr))';
  const compareCols = cmp.map(c => ({ name: c.name, sub: c.miles + ' · ' + c.distance, best: c.fit === maxFit, slotId: 'car-' + c.id, slotSrc: carSrc(c.id), slotPlaceholder: 'Drop a ' + c.name + ' photo' }));
  const fitCells = cmp.map(c => ({ val: c.fit, badge: fitStyle(c.fit), best: c.fit === maxFit, style: cellBase + (c.fit === maxFit ? winStyle : '') }));
  const dealCells = cmp.map(c => ({ pill: dealStyle(c.deal), label: dealLabel[c.deal], best: c.deal === 'Good', style: cellBase + (c.deal === 'Good' ? winStyle : '') }));
  const otdNum = (c: (typeof carData)[number]) => +String(c.otd).replace(/[^0-9]/g, '') || 0;
  const minOtd = Math.min.apply(null, cmp.map(otdNum));
  const otdCells = cmp.map(c => ({ val: c.otd, best: otdNum(c) === minOtd, style: cellBase + (otdNum(c) === minOtd ? winStyle : '') }));
  const costCells = cmp.map(c => ({ val: '$' + monthlyNum(c) + '/mo', best: monthlyNum(c) === minCost, style: cellBase + (monthlyNum(c) === minCost ? winStyle : '') }));
  const tradeoffCells = cmp.map(c => ({ text: tradeoffs[c.id] ?? c.tradeoff ?? '—', style: cellBase }));
  const specLabels = ['Drivetrain', 'Est. fuel', 'Safety', 'Seats', 'Open recalls'];
  const specRows = specLabels.map((lab, i) => ({ label: lab, cells: cmp.map(c => ({ v: (cspecs[c.id] ?? Array(specLabels.length).fill('—'))[i] })) }));
  const pick = cmp.length ? cmp.reduce((a, b) => (b.fit > a.fit ? b : a)) : carData[0];
  const recText = `The ${pick.name}. You weighted reliability highest, and it's the only one here that stays under your walk-away number — top fit, a genuinely good deal, and the least to worry about after you sign.`;
  const finalizeCells = cmp.map(c => {
    const best = c.id === pick.id;
    return {
      best,
      tip: best ? recText : '',
      onClick: () => go('packet'),
      style: cellBase + (best ? winStyle : ''),
      btnStyle: 'width:100%;border-radius:10px;padding:12px 14px;font-size:13px;font-weight:700;font-family:inherit;cursor:pointer;line-height:1.3;' +
        (best ? 'background:#0F766E;color:#fff;border:none;box-shadow:0 2px 8px rgba(15,118,110,.22);' : 'background:#fff;color:#0F766E;border:1px solid #A7D9D3;'),
    };
  });
  // ── Detail screen helpers ────────────────────────────────────────────────
  const detailCar = carData.find(c => c.id === st.detailCarId) ?? carData[0];

  function buildFitBreak(car: typeof carData[number]) {
    const n = car.name.toLowerCase();
    const relBase = (n.includes('toyota') || n.includes('honda') || n.includes('lexus') || n.includes('acura')) ? 93
      : (n.includes('mazda') || n.includes('subaru')) ? 85
      : (n.includes('kia') || n.includes('hyundai')) ? 80
      : (n.includes('tesla')) ? 76
      : 68;
    const relPct = Math.min(97, relBase + (car.condition === 'Certified pre-owned' ? 3 : 0));

    const resBase = (n.includes('toyota') || n.includes('honda') || n.includes('lexus')) ? 87
      : (n.includes('subaru') || n.includes('mazda') || n.includes('tesla')) ? 80
      : (n.includes('kia') || n.includes('hyundai') || n.includes('acura')) ? 74
      : 65;
    const resPct = Math.min(95, resBase + (car.deal === 'Good' ? 2 : 0));

    const isElec = car.fuelType === 'Electric';
    const isHyb = car.fuelType === 'Hybrid';
    const runPct = isElec ? 93 : isHyb ? 78 : 62;
    const tcoNum = +car.tco.replace(/[^0-9]/g, '');
    const runNote = isElec ? `~$${Math.round(tcoNum * 0.12)}/mo electricity`
      : isHyb ? '35–45 mpg, low fuel cost'
      : `~$${Math.round(tcoNum * 0.3)}/mo fuel`;

    const perfPct = isElec ? 83 : isHyb ? 70 : 68;
    const perfNote = isElec ? 'Instant torque, smooth' : isHyb ? 'Smooth, efficient' : 'Adequate';

    const col = (v: number) => v >= 80 ? '#0F766E' : '#A7D9D3';
    const relNote = relPct >= 88 ? 'Excellent' : relPct >= 78 ? 'Very good' : 'Good';
    const resNote = resPct >= 83 ? 'Very strong' : resPct >= 73 ? 'Good' : 'Average';
    return [
      { label: 'Reliability', note: relNote, pct: relPct + '%', color: col(relPct) },
      { label: 'Resale value', note: resNote, pct: resPct + '%', color: col(resPct) },
      { label: 'Running cost', note: runNote, pct: runPct + '%', color: col(runPct) },
      { label: 'Performance & fun', note: perfNote, pct: perfPct + '%', color: col(perfPct) },
    ];
  }

  function buildSpecs(car: typeof carData[number]) {
    const n = car.name.toLowerCase();
    const hasAwd = car.mustHaveKeys?.includes('awd')
      || car.pros.some(p => p.toLowerCase().includes('awd'))
      || n.includes(' awd');
    const is8Seat = ['odyssey', 'sienna', 'pacifica', 'traverse', 'atlas', 'palisade',
      'telluride', 'highlander', 'ascent', 'pilot', 'sequoia', 'tahoe', 'suburban', 'expedition'].some(x => n.includes(x));
    return [
      { k: 'Condition', v: car.condition },
      { k: 'Fuel type', v: car.fuelType },
      { k: 'Dealership', v: car.dealer },
      { k: 'Drivetrain', v: hasAwd ? 'AWD' : 'FWD' },
      { k: 'Mileage', v: car.miles },
      { k: 'Safety rating', v: '5-star NHTSA' },
      { k: 'Open recalls', v: 'None outstanding' },
      { k: 'Seats', v: is8Seat ? '7–8' : '5' },
    ];
  }

  const detailSaved = st.saved.includes(st.detailCarId);

  // detail fit breakdown — derived from selected car
  const fitBreak = buildFitBreak(detailCar);
  const specs = buildSpecs(detailCar);

  // packet — per-car data
  const packetData: Record<
    string,
    {
      name: string; dealer: string; date: string; status: string; statusTone: string; generated: string;
      otdTotal: string; monthly: string; open: string; settle: string; walk: string;
      worksheet: { k: string; v: string; color: string; weight: string }[];
      scriptLines: string[]; checklist: string[]; outreach: string;
    }
  > = {
    crv22: {
      name: '2022 Honda CR-V EX', dealer: 'CarMax Fremont', date: 'Jul 8, 2026',
      status: 'Ready to send', statusTone: 'green', generated: 'Ready to use today',
      otdTotal: '$27,040', monthly: '$435/mo', open: '$25,200', settle: '$25,900', walk: '$26,500',
      worksheet: [
        { k: 'Asking price', v: '$26,500', color: '#27272a', weight: '600' },
        { k: 'Negotiated price (target)', v: '$25,900', color: '#1e8a5b', weight: '700' },
        { k: 'Doc & dealer fees', v: '+ $185', color: '#52525b', weight: '500' },
        { k: 'Sales tax (est.)', v: '+ $2,265', color: '#52525b', weight: '500' },
        { k: 'Title & registration', v: '+ $391', color: '#52525b', weight: '500' },
        { k: 'First payment', v: '+ $300', color: '#52525b', weight: '500' },
      ],
      scriptLines: [
        "I've done my homework — comparable 2022 CR-V EX CPOs nearby are going for around $25,900, and CarMax's price guarantee means you won't move much. I can do $25,200 today.",
        "I hear you. Let's land at $25,900 out the door — that's fair on both sides and I can sign today.",
        "That's over where comps sit, so I'll pass — but reach out if anything changes.",
      ],
      checklist: [
        'Cold-start and listen for VTC actuator rattle (first 10 seconds on startup)',
        'Check infotainment for screen flicker or reboot loop (2022 software bug)',
        'Confirm AC blows cold at idle, not only while moving',
        'Inspect rear cargo floor seal for water staining',
        'Verify all driver-assist features engage: lane keep, adaptive cruise, automatic braking',
        'Ask for CarMax inspection report and any available service records',
      ],
      outreach:
        "Hi — I'm interested in your 2022 CR-V EX CPO (Stock #29183). I'm a serious, financing-ready buyer and can come in this week.\n\nBased on comparable CPO CR-Vs in the Bay Area, I'd be targeting around $25,900 out the door. If that's workable, let's get a test drive scheduled.\n\nIs the car still available? Thanks!",
    },
    rav4xle: {
      name: '2021 Toyota RAV4 XLE', dealer: 'CarMax Oakland', date: 'Jul 6, 2026',
      status: 'Draft', statusTone: 'gray', generated: 'Draft — awaiting your review',
      otdTotal: '$29,040', monthly: '$455/mo', open: '$26,800', settle: '$27,700', walk: '$28,500',
      worksheet: [
        { k: 'Asking price', v: '$28,500', color: '#27272a', weight: '600' },
        { k: 'Negotiated price (target)', v: '$27,700', color: '#1e8a5b', weight: '700' },
        { k: 'Doc & dealer fees', v: '+ $185', color: '#52525b', weight: '500' },
        { k: 'Sales tax (est.)', v: '+ $2,423', color: '#52525b', weight: '500' },
        { k: 'Title & registration', v: '+ $391', color: '#52525b', weight: '500' },
        { k: 'First payment', v: '+ $341', color: '#52525b', weight: '500' },
      ],
      scriptLines: [
        "RAV4 prices are firm right now — I know that. This one's been on the lot 3 weeks, so I can do $26,800 today, financing lined up.",
        "Let's meet at $27,700 out the door. That's fair on the comps and I can sign this week.",
        "That's above where I'm seeing comparable XLEs sell, so I'll hold off — but feel free to call if the price moves.",
      ],
      checklist: [
        'Verify the 8-speed automatic doesn\'t hesitate pulling away from a stop (known issue on early 2021s)',
        'Inspect for uneven front tire wear — common on RAV4 if alignment is off',
        'Confirm Apple CarPlay / Android Auto connects reliably',
        'Cold-start on a cool morning and listen for any engine rattle',
        'Pull CarMax inspection report; ask for any service history',
        'Check all four door seals for water intrusion',
      ],
      outreach:
        "Hi — I'm interested in the 2021 RAV4 XLE at CarMax Oakland. I'm financing-ready and can come in this week.\n\nBased on comparable RAV4 XLEs in the area, I'd be targeting $27,700 out the door. If that works, I'd like to schedule a test drive.\n\nIs it still available? Thanks!",
    },
    cx522: {
      name: '2022 Mazda CX-5 Touring', dealer: 'Bay City Motors · Burlingame', date: 'Jul 2, 2026',
      status: 'Sent', statusTone: 'blue', generated: 'Sent to dealer · awaiting reply',
      otdTotal: '$25,860', monthly: '$390/mo', open: '$23,800', settle: '$24,600', walk: '$25,200',
      worksheet: [
        { k: 'Asking price', v: '$25,200', color: '#27272a', weight: '600' },
        { k: 'Negotiated price (target)', v: '$24,600', color: '#1e8a5b', weight: '700' },
        { k: 'Doc & dealer fees', v: '+ $499', color: '#52525b', weight: '500' },
        { k: 'Sales tax (est.)', v: '+ $2,151', color: '#52525b', weight: '500' },
        { k: 'Title & registration', v: '+ $391', color: '#52525b', weight: '500' },
        { k: 'First payment', v: '+ $219', color: '#52525b', weight: '500' },
      ],
      scriptLines: [
        "Comparable 2022 CX-5 Tourings are selling around $24,600. This one looks clean — I can do $23,800 today, financing ready.",
        "Let's land at $24,600 out the door and I'll sign this week.",
        "That's a bit over where the comps sit — I'll keep watching. Feel free to reach out if anything changes.",
      ],
      checklist: [
        'Test the Skyactiv-G engine cold — should start clean with no hesitation',
        'Verify the i-Activsense suite (auto emergency braking, lane departure) activates',
        'Check the rotary infotainment controller for smooth action',
        'Inspect the cabin air filter and confirm HVAC blows clean',
        'Look for any rust or bubbling near wheel arches (rare but check)',
        'Confirm rear cross-traffic alert and blind-spot monitoring work',
      ],
      outreach:
        "Hi — I'm interested in your 2022 CX-5 Touring. I'm financing-ready and can come in this week.\n\nBased on recent comparable sales, I'd be targeting around $24,600 out the door. If that works, let's set up a test drive.\n\nIs it still available? Thanks!",
    },
  };
  const activeId = packetData[st.activePacket] ? st.activePacket : 'crv22';
  const activePacket = packetData[activeId];
  const worksheet = activePacket.worksheet;
  const scriptLines = activePacket.scriptLines;
  const checklist = activePacket.checklist;
  const outreach = activePacket.outreach;

  // packet history list
  const packetToneMap: Record<string, string> = { green: 'background:#DCFCE7;color:#15803D;', blue: 'background:#E8F0FE;color:#2563EB;', gray: 'background:#F5F1EB;color:#9C9189;' };
  const packetOrder = ['crv22', 'rav4xle', 'cx522'];
  const packetList = packetOrder.map(id => {
    const p = packetData[id];
    return {
      name: p.name, dealer: p.dealer, date: p.date, status: p.status, monthly: p.monthly, otd: p.otdTotal,
      slotId: 'car-' + id, slotSrc: carSrc(id), slotPlaceholder: 'Photo of ' + p.name,
        statusStyle: 'border-radius:999px;padding:4px 11px;font-size:11px;font-weight:800;letter-spacing:.3px;white-space:nowrap;' + packetToneMap[p.statusTone],
      onOpen: () => openPacket(id, 'packets'),
    };
  });

  // alerts / notifications
  const toneMap: Record<string, string> = {
    green: 'background:#DCFCE7;color:#15803D;',
    blue: 'background:#E8F0FE;color:#2563EB;',
    purple: 'background:#EDE9FE;color:#7C3AED;',
    gray: 'background:#F5F1EB;color:#9C9189;',
  };
  const alertDefs: { id: string; type: string; tone: string; time: string; title: string; body: string; go: AppState['screen'] | null; cta: string | null }[] = [
    { id: 'a1', type: 'PRICE DROP', tone: 'green', time: '2 hours ago', title: 'Price dropped on the RAV4 XLE', body: 'Asking price fell from $30,800 to $29,850 (−$950) on a car you saved. Still tracking as a Fair price.', go: 'detail', cta: 'View listing' },
    { id: 'a2', type: 'MARKET SHIFT', tone: 'blue', time: 'Yesterday', title: 'Market prices shifted this week', body: 'Used prices on your shortlist rose about 8%. A certified pre-owned deal may now beat the private-party target.', go: 'replan', cta: 'See what changed' },
    { id: 'a3', type: 'BETTER MATCH', tone: 'purple', time: '3 days ago', title: 'A better match just appeared', body: '2022 Mazda CX-5 Touring — 23k mi, one owner, priced under target, scores higher than your current #1 pick.', go: 'shortlist', cta: 'Open shortlist' },
    { id: 'a4', type: 'SOLD', tone: 'gray', time: '4 days ago', title: 'Forester Sport listing sold', body: 'This listing is no longer available and has been removed from active tracking.', go: null, cta: null },
  ];
  const visibleAlerts = alertDefs.filter(a => !st.dismissedAlerts.includes(a.id));
  const alertList = visibleAlerts.map(a => ({
    type: a.type, time: a.time, title: a.title, body: a.body, cta: a.cta, hasCta: !!a.go,
      tagStyle: 'border-radius:6px;padding:3px 9px;font-size:10.5px;font-weight:800;letter-spacing:.5px;' + toneMap[a.tone],
    bodyStyle: 'cursor:' + (a.go ? 'pointer' : 'default') + ';',
    // eslint-disable-next-line react-hooks/refs -- openAlert (via go) is only ever invoked from an onClick handler, never during render
    onOpen: () => openAlert(a.go),
    onDismiss: () => dismissAlert(a.id),
  }));
  const alertCount = visibleAlerts.length;

  return {
    alertsOpen: st.alertsOpen, toggleAlerts: () => toggleAlerts(), closeAlerts: () => closeAlerts(),
    clearAllAlerts: () => clearAllAlerts(),
    alertList, alertCount, hasAlerts: alertCount > 0, noAlerts: alertCount === 0,
    bellBtnStyle: 'position:relative;background:' + (st.alertsOpen ? '#E6F5F2' : '#fff') + ';border:1px solid ' + (st.alertsOpen ? '#A7D9D3' : '#E7E2D9') + ';border-radius:10px;width:40px;height:40px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:' + (st.alertsOpen ? '#0F766E' : '#6B6459') + ';font-family:inherit;',
    sLanding: s === 'landing', sIntake: s === 'intake', sScanning: s === 'scanning',
    sShortlist: s === 'shortlist', sReplan: s === 'replan', sDetail: s === 'detail',
    sPacket: s === 'packet', sPackets: s === 'packets', sComponents: s === 'components', sMobile: s === 'mobile',
    showNotes: st.showNotes, notesLabel: st.showNotes ? 'Notes: On' : 'Notes: Off',
    notesBtnStyle: 'flex-shrink:0;border:1px solid ' + (st.showNotes ? '#D4A72C' : '#E7E2D9') + ';background:' + (st.showNotes ? '#FFFBEB' : '#fff') + ';color:' + (st.showNotes ? '#A8801A' : '#9C9189') + ';border-radius:7px;padding:6px 11px;font-size:12px;font-weight:700;font-family:inherit;cursor:pointer;',
    toggleNotes: () => setState(p => ({ showNotes: !p.showNotes })),

    // nav helpers
    startIntake: () => startIntake(),
    goLanding: () => go('landing'), goIntake: () => go('intake'),
    goShortlist: () => go('shortlist'), goDetail: () => go('detail'), openDetail,
    goPacket: () => openPacket(st.detailCarId, 'detail'), goPackets: () => goPackets(),
    detailSlotSrc: carSrc(st.detailCarId),
    packetBack: () => (st.packetFrom === 'detail' ? go('detail') : goPackets()),
    packetBackLabel: st.packetFrom === 'detail' ? '← Back to listing' : '← Back to deal packets',
    packetList, packetCount: packetList.length,
    packetName: activePacket.name, packetDealer: activePacket.dealer, packetDate: activePacket.date,
    packetGenerated: activePacket.generated, packetOtdTotal: activePacket.otdTotal,
    packetOpen: activePacket.open, packetSettle: activePacket.settle, packetWalk: activePacket.walk,
    findCars: () => findCars(),
    next: () => next(), back: () => back(),

    // intake
    intakeInQuestions: st.intakeStep <= 9,
    nextLabel: st.intakeStep >= 9 ? 'Finish' : 'Continue',
    stepLabel: 'Step ' + Math.min(st.intakeStep, 9) + ' of 9',
    progressPct: Math.round((Math.min(st.intakeStep, 9) / 9) * 100) + '%',
    st1: st.intakeStep === 1, st2: st.intakeStep === 2, st3: st.intakeStep === 3, st4: st.intakeStep === 4,
    st5: st.intakeStep === 5, st6: st.intakeStep === 6, stFuel: st.intakeStep === 7, stFuelCost: st.intakeStep === 8, st7: st.intakeStep === 9, stReview: st.intakeStep === 10,
    usageOpts, timelineOpts, condOpts, fuelOpts, mustHaves, summary, customChips,
    fuelIsEv: st.fuel === 'ev',
    fuelCost: st.fuelCost, fuelCostLabel: usd(st.fuelCost),
    fuelCostTitle: st.fuel === 'ev' ? 'What can you spend on charging?' : 'What can you spend on fuel?',
    fuelCostWord: st.fuel === 'ev' ? 'on energy' : 'on gas',
    onFuelCost: e => setState({ fuelCost: +e.target.value }),
    newMust: st.newMust,
    onNewMust: e => setState({ newMust: e.target.value }),
    onNewMustKey: e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addCustomMust();
      }
    },
    addCustomMust: () => addCustomMust(),
    canAddMust: st.newMust.trim().length > 0,
    addBtnStyle: 'flex-shrink:0;border:none;border-radius:999px;padding:11px 18px;font-size:14px;font-weight:700;font-family:inherit;' + (st.newMust.trim().length > 0 ? 'background:#0F766E;color:#fff;cursor:pointer;' : 'background:#E7E2D9;color:#9C9189;cursor:not-allowed;'),
    radius: st.radius, zip: st.zip, onRadius: e => setState({ radius: +e.target.value }),
    isCash: st.budgetMode === 'cash', isMonthly: st.budgetMode === 'monthly',
    setCash: () => setState({ budgetMode: 'cash' }), setMonthly: () => setState({ budgetMode: 'monthly' }),
    cashTabStyle: 'flex:1;border:none;border-radius:8px;padding:11px;font-size:14px;font-weight:700;font-family:inherit;cursor:pointer;' + (st.budgetMode === 'cash' ? 'background:#fff;color:#0F766E;box-shadow:0 1px 3px rgba(0,0,0,.1);' : 'background:transparent;color:#6B6459;'),
    monthlyTabStyle: 'flex:1;border:none;border-radius:8px;padding:11px;font-size:14px;font-weight:700;font-family:inherit;cursor:pointer;' + (st.budgetMode === 'monthly' ? 'background:#fff;color:#0F766E;box-shadow:0 1px 3px rgba(0,0,0,.1);' : 'background:transparent;color:#6B6459;'),
    cashTotal: st.cashTotal, cashLabel: usd(st.cashTotal), onCash: e => setState({ cashTotal: +e.target.value }),
    monthly: st.monthly, monthlyLabel: usd(st.monthly), onMonthly: e => setState({ monthly: +e.target.value }),
    down: st.down, downLabel: usd(st.down), onDown: e => setState({ down: +e.target.value }),
    term: st.term, onTerm: e => setState({ term: +e.target.value }),
    wRel: st.weights.reliability, wResale: st.weights.resale, wRun: st.weights.running, wPerf: st.weights.performance,
    wRelLabel: st.weights.reliability + '%', wResaleLabel: st.weights.resale + '%', wRunLabel: st.weights.running + '%', wPerfLabel: st.weights.performance + '%',
    onRel: e => setW('reliability', e.target.value), onResale: e => setW('resale', e.target.value),
    onRun: e => setW('running', e.target.value), onPerf: e => setW('performance', e.target.value),

    scanItems, briefRows, cars, fitBreak, specs, worksheet, scriptLines, checklist, outreach,
    sCompare: s === 'compare',
    shortlistCars, savedEmpty, savedCount, allCount: cars.length,
    sortBy: st.sortBy, sortOpts, sortSelectStyle,
    onSort: e => setState({ sortBy: e.target.value }),
    filterEmpty, filtersActive, conditionOpts, fuelFilterOpts,
    conditionFilter: st.conditionFilter, fuelFilter: st.fuelFilter,
    conditionSelectStyle, fuelSelectStyle,
    onConditionFilter: e => setState({ conditionFilter: e.target.value }),
    onFuelFilter: e => setState({ fuelFilter: e.target.value }),
    onClearFilters: () => setState({ conditionFilter: 'all', fuelFilter: 'all' }),
    onFilterAll: () => setSavedFilter('all'), onFilterSaved: () => setSavedFilter('saved'),
    filterAllStyle: segBase + (st.savedFilter === 'all' ? 'background:#fff;color:#0F766E;box-shadow:0 1px 3px rgba(0,0,0,.1);' : 'background:transparent;color:#6B6459;'),
    filterSavedStyle: segBase + (st.savedFilter === 'saved' ? 'background:#fff;color:#0F766E;box-shadow:0 1px 3px rgba(0,0,0,.1);' : 'background:transparent;color:#6B6459;'),
    cmpCount, showCmpBar: cmpCount >= 1 && s === 'shortlist', cmpBarLabel: 'Compare (' + cmpCount + ')', cmpSelLabel: cmpCount + ' selected', cmpMaxHint: cmpCount >= 3,
    openCompare: () => openCompare(), clearCompare: () => clearCompare(),
    detailSaved, detailHeartGlyph: detailSaved ? '♥' : '♡', onDetailSave: () => toggleSave(st.detailCarId), detailJustSaved: st.justSaved === st.detailCarId,
    detailHeartStyle: 'background:none;border:1px solid ' + (detailSaved ? '#0F766E' : '#E7E2D9') + ';border-radius:10px;cursor:pointer;font-size:20px;line-height:1;padding:8px 13px;font-family:inherit;color:' + (detailSaved ? '#0F766E' : '#9C9189') + ';',
    detailName: detailCar.name,
    detailSub: (() => {
      const hasAwd = detailCar.mustHaveKeys?.includes('awd') || detailCar.pros.some(p => p.toLowerCase().includes('awd'));
      const hasCp = detailCar.mustHaveKeys?.includes('carplay');
      return [detailCar.miles, hasAwd ? 'AWD' : null, detailCar.distance, hasCp ? 'CarPlay' : null, detailCar.dealer].filter(Boolean).join(' · ');
    })(),
    detailFit: detailCar.fit,
    detailFitBadgeStyle: 'width:56px;height:56px;border-radius:13px;display:flex;align-items:center;justify-content:center;font:800 24px/1 var(--font-mono,monospace);' + fitBg(detailCar.fit),
    detailFitLabel: detailCar.fit >= 88 ? 'Strong match for your brief' : detailCar.fit >= 78 ? 'Good match for your brief' : 'Partial match for your brief',
    detailTco: detailCar.tco,
    detailOtd: detailCar.otd,
    detailOtdNote: detailCar.otd + ' out the door',
    detailDealLabel: ({ Good: 'Good deal', Fair: 'Fair price', Over: 'Overpriced' } as Record<string, string>)[detailCar.deal] ?? detailCar.deal,
    detailDealPillStyle: (() => {
      const m: Record<string, string> = { Good: 'background:#DCFCE7;border:1px solid #BBF7D0;color:#15803D;', Fair: 'background:#F5F1EB;border:1px solid #E7E2D9;color:#6B6459;', Over: 'background:#FEE2E2;border:1px solid #FECACA;color:#B91C1C;' };
      return 'display:inline-flex;align-items:center;gap:8px;border-radius:9px;padding:9px 13px;margin-bottom:16px;' + (m[detailCar.deal] ?? m.Fair);
    })(),
    detailDealNote: (() => {
      const delta = detailCar.dealDelta.replace(/[^0-9]/g, '');
      const comps = detailCar.dealComps.replace(' comps', '');
      if (detailCar.deal === 'Good') return `Asking ${detailCar.otd} sits $${delta} under the average of ${comps} comparable listings nearby in the last 30 days.`;
      if (detailCar.deal === 'Over') return `Asking price sits $${delta} above comparable listings — room to negotiate.`;
      return `Priced within $${delta} of the average of ${comps} comparable listings nearby — at market, not a steal.`;
    })(),
    detailHeadroom: (() => {
      const otdNum = parseMoney(detailCar.otd);
      return '$' + Math.round(otdNum * 0.02).toLocaleString() + '–$' + Math.round(otdNum * 0.04).toLocaleString();
    })(),
    detailTradeoff: detailCar.tradeoff ?? detailCar.why,
    gridCols, compareCols, fitCells, dealCells, otdCells, costCells, tradeoffCells, specRows, recText, finalizeCells,
    cmpHasCars: cmp.length > 0, cmpEmpty: cmp.length === 0, cmpCountLabel: cmp.length,
    compareSpecsOpen: st.compareSpecsOpen, compareSpecsCaret: st.compareSpecsOpen ? '▲' : '▼', toggleCompareSpecs: () => setState(p => ({ compareSpecsOpen: !p.compareSpecsOpen })),

    // components demo
    demoOpen: st.demoOpen, demoCaret: st.demoOpen ? '▲' : '▼', toggleDemo: () => setState(p => ({ demoOpen: !p.demoOpen })),
    copyLabel: st.copied ? 'Copied ✓' : 'Copy message',
    doCopy: () => {
      try {
        if (navigator.clipboard) navigator.clipboard.writeText(outreach);
      } catch {
        /* noop */
      }
      setState({ copied: true });
      setTimeout(() => setState({ copied: false }), 1800);
    },
  };
}
