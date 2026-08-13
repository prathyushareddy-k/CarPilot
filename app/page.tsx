'use client';

import { useAppView } from './_lib/useAppView';
import { parseInlineStyle } from './_lib/parseInlineStyle';
import TopBar from './_components/TopBar';
import LandingScreen from './_components/LandingScreen';
import IntakeScreen from './_components/IntakeScreen';
import ScanningScreen from './_components/ScanningScreen';
import ShortlistScreen from './_components/ShortlistScreen';
import CompareScreen from './_components/CompareScreen';
import ReplanScreen from './_components/ReplanScreen';
import ListingDetailScreen from './_components/ListingDetailScreen';
import DealPacketScreen from './_components/DealPacketScreen';
import DealPacketsScreen from './_components/DealPacketsScreen';
import ComponentsScreen from './_components/ComponentsScreen';
import MobileShortlistScreen from './_components/MobileShortlistScreen';
import ChatWidget from './_components/ChatWidget';

export default function Page() {
  const v = useAppView();
  return (
    <div style={{ minHeight: '100vh', background: '#FBF8F3' }}>
      <TopBar v={v} />

      <div style={parseInlineStyle('padding-top:60px;')}>
        {v.sLanding && <LandingScreen v={v} />}
        {v.sIntake && <IntakeScreen v={v} />}
        {v.sScanning && <ScanningScreen v={v} />}
        {v.sShortlist && <ShortlistScreen v={v} />}
        {v.sCompare && <CompareScreen v={v} />}
        {v.sReplan && <ReplanScreen v={v} />}
        {v.sDetail && <ListingDetailScreen v={v} />}
        {v.sPacket && <DealPacketScreen v={v} />}
        {v.sPackets && <DealPacketsScreen v={v} />}
        {v.sComponents && <ComponentsScreen v={v} />}
        {v.sMobile && <MobileShortlistScreen v={v} />}
      </div>

      {/* ====== COMPARE BOTTOM BAR ====== */}
      {v.showCmpBar && (
        <div style={parseInlineStyle('position:fixed;left:0;right:0;bottom:0;z-index:90;display:flex;justify-content:center;padding:16px;pointer-events:none;')}>
          <div
            style={parseInlineStyle(
              'pointer-events:auto;display:flex;align-items:center;gap:16px;background:#1C1A17;border-radius:14px;padding:10px 10px 10px 20px;box-shadow:0 10px 34px rgba(28,26,23,.28);',
            )}
          >
            <span style={parseInlineStyle('color:#fff;font-size:13px;font-weight:600;')}>
              {v.cmpMaxHint && <span style={parseInlineStyle('color:#9C9189;')}>Compare up to 3 · </span>}
              {v.cmpSelLabel}
            </span>
            <button onClick={v.clearCompare} style={parseInlineStyle('background:none;border:none;color:#9C9189;font-size:13px;font-weight:600;font-family:inherit;cursor:pointer;')}>
              Clear
            </button>
            <button
              onClick={v.openCompare}
              style={parseInlineStyle('background:#0F766E;color:#fff;border:none;border-radius:10px;padding:11px 22px;font-size:14px;font-weight:700;font-family:inherit;cursor:pointer;')}
            >
              {v.cmpBarLabel}
            </button>
          </div>
        </div>
      )}

      <ChatWidget />
    </div>
  );
}
