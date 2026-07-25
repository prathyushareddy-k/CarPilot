import type { ChangeEventHandler, KeyboardEventHandler, ReactNode } from 'react';

export type ScreenKey =
  | 'landing'
  | 'intake'
  | 'scanning'
  | 'shortlist'
  | 'compare'
  | 'replan'
  | 'detail'
  | 'packet'
  | 'packets'
  | 'components'
  | 'mobile';

export interface Weights {
  reliability: number;
  resale: number;
  running: number;
  performance: number;
}

export interface MustHavesState {
  awd: boolean;
  carplay: boolean;
  backup: boolean;
  mpg: boolean;
  thirdrow: boolean;
  manual: boolean;
}

export interface AppState {
  screen: ScreenKey;
  intakeStep: number;
  budgetMode: 'cash' | 'monthly';
  cashTotal: number;
  monthly: number;
  term: number;
  down: number;
  activePacket: string;
  packetFrom: string;
  weights: Weights;
  usage: string[];
  timeline: string;
  radius: number;
  zip: string;
  condition: string;
  fuel: string;
  fuelCost: number;
  mustHaves: MustHavesState;
  expanded: string | null;
  showNotes: boolean;
  scanStep: number;
  demoOpen: boolean;
  copied: boolean;
  alertsOpen: boolean;
  dismissedAlerts: string[];
  saved: string[];
  compareSet: string[];
  savedFilter: 'all' | 'saved';
  conditionFilter: string;
  fuelFilter: string;
  sortBy: string;
  justSaved: string | null;
  compareSpecsOpen: boolean;
  customMusts: string[];
  newMust: string;
  detailCarId: string;
}

export interface OptItem {
  label: string;
  sub: string;
  style: string;
  onClick: () => void;
  checked?: boolean;
  boxStyle?: string;
}

export interface MustHaveOptItem {
  label: string;
  onClick: () => void;
  style: string;
}

export interface SummaryRow {
  k: string;
  v: string;
  onEdit: () => void;
}

export interface BriefRow {
  k: string;
  v: string;
}

export interface ChipItem {
  label: string;
  onRemove: () => void;
}

export interface ScanItem {
  label: string;
  count: string;
  mark: string;
  dotStyle: string;
  textStyle: string;
}

export interface MustHaveChip {
  style: string;
  icon: string;
  label: string;
}

export interface CarView {
  id: string;
  name: string;
  miles: string;
  distance: string;
  fit: number;
  tco: string;
  otd: string;
  condition: string;
  fuelType: string;
  dealer: string;
  pros: string[];
  cons: string[];
  why: string;
  fitStyle: string;
  fitBg: string;
  dealStyle: string;
  dealLabel: string;
  dealDelta?: string;
  dealComps?: string;
  hasMustHaveChips: boolean;
  mustHaveChips: MustHaveChip[];
  tradeoff?: string;
  expanded: boolean;
  caret: string;
  onToggle: () => void;
  slotId: string;
  slotPlaceholder: string;
  slotSrc: string;
  conditionIcon: ReactNode;
  fuelIcon: ReactNode;
  saved: boolean;
  onSave: () => void;
  heartGlyph: string;
  heartStyle: string;
  showSavedConfirm: boolean;
  inCompare: boolean;
  compareMark: string;
  onCompare: () => void;
  compareStyle: string;
  compareBoxStyle: string;
  goDetail: () => void;
}

export interface AlertItem {
  type: string;
  time: string;
  title: string;
  body: string;
  cta: string | null;
  hasCta: boolean;
  tagStyle: string;
  bodyStyle: string;
  onOpen: () => void;
  onDismiss: () => void;
}

export interface PacketListItem {
  name: string;
  dealer: string;
  date: string;
  status: string;
  monthly: string;
  otd: string;
  slotId: string;
  slotSrc: string;
  slotPlaceholder: string;
  statusStyle: string;
  onOpen: () => void;
}

export interface WorksheetRow {
  k: string;
  v: string;
  color: string;
  weight: string;
}

export interface FitBreakRow {
  label: string;
  note: string;
  pct: string;
  color: string;
}

export interface SpecRow {
  k: string;
  v: string;
}

export interface SelectOpt {
  value: string;
  label: string;
}

export interface CompareCol {
  name: string;
  sub: string;
  best: boolean;
  slotId: string;
  slotSrc: string;
  slotPlaceholder: string;
}

export interface CompareCell {
  style: string;
  best?: boolean;
  val?: string | number;
  badge?: string;
  pill?: string;
  label?: string;
  text?: string;
}

export interface CompareSpecRow {
  label: string;
  cells: { v: string }[];
}

export interface FinalizeCell {
  best: boolean;
  tip: string;
  onClick: () => void;
  style: string;
  btnStyle: string;
}

export interface AppView {
  alertsOpen: boolean;
  toggleAlerts: () => void;
  closeAlerts: () => void;
  clearAllAlerts: () => void;
  alertList: AlertItem[];
  alertCount: number;
  hasAlerts: boolean;
  noAlerts: boolean;
  bellBtnStyle: string;

  sLanding: boolean;
  sIntake: boolean;
  sScanning: boolean;
  sShortlist: boolean;
  sCompare: boolean;
  sReplan: boolean;
  sDetail: boolean;
  sPacket: boolean;
  sPackets: boolean;
  sComponents: boolean;
  sMobile: boolean;

  showNotes: boolean;
  notesLabel: string;
  notesBtnStyle: string;
  toggleNotes: () => void;

  startIntake: () => void;
  goLanding: () => void;
  goIntake: () => void;
  goShortlist: () => void;
  goDetail: () => void;
  openDetail: (id: string) => void;
  goPacket: () => void;
  goPackets: () => void;
  detailSlotSrc: string;
  packetBack: () => void;
  packetBackLabel: string;
  packetList: PacketListItem[];
  packetCount: number;
  packetName: string;
  packetDealer: string;
  packetDate: string;
  packetGenerated: string;
  packetOtdTotal: string;
  packetOpen: string;
  packetSettle: string;
  packetWalk: string;
  findCars: () => void;
  next: () => void;
  back: () => void;

  intakeInQuestions: boolean;
  nextLabel: string;
  stepLabel: string;
  progressPct: string;
  st1: boolean;
  st2: boolean;
  st3: boolean;
  st4: boolean;
  st5: boolean;
  st6: boolean;
  stFuel: boolean;
  stFuelCost: boolean;
  st7: boolean;
  stReview: boolean;
  usageOpts: OptItem[];
  timelineOpts: OptItem[];
  condOpts: OptItem[];
  fuelOpts: OptItem[];
  mustHaves: MustHaveOptItem[];
  summary: SummaryRow[];
  customChips: ChipItem[];
  fuelIsEv: boolean;
  fuelCost: number;
  fuelCostLabel: string;
  fuelCostTitle: string;
  fuelCostWord: string;
  onFuelCost: ChangeEventHandler<HTMLInputElement>;
  newMust: string;
  onNewMust: ChangeEventHandler<HTMLInputElement>;
  onNewMustKey: KeyboardEventHandler<HTMLInputElement>;
  addCustomMust: () => void;
  canAddMust: boolean;
  addBtnStyle: string;
  radius: number;
  zip: string;
  onRadius: ChangeEventHandler<HTMLInputElement>;
  isCash: boolean;
  isMonthly: boolean;
  setCash: () => void;
  setMonthly: () => void;
  cashTabStyle: string;
  monthlyTabStyle: string;
  cashTotal: number;
  cashLabel: string;
  onCash: ChangeEventHandler<HTMLInputElement>;
  monthly: number;
  monthlyLabel: string;
  onMonthly: ChangeEventHandler<HTMLInputElement>;
  down: number;
  downLabel: string;
  onDown: ChangeEventHandler<HTMLInputElement>;
  term: number;
  onTerm: ChangeEventHandler<HTMLInputElement>;
  wRel: number;
  wResale: number;
  wRun: number;
  wPerf: number;
  wRelLabel: string;
  wResaleLabel: string;
  wRunLabel: string;
  wPerfLabel: string;
  onRel: ChangeEventHandler<HTMLInputElement>;
  onResale: ChangeEventHandler<HTMLInputElement>;
  onRun: ChangeEventHandler<HTMLInputElement>;
  onPerf: ChangeEventHandler<HTMLInputElement>;

  scanItems: ScanItem[];
  briefRows: BriefRow[];
  cars: CarView[];
  fitBreak: FitBreakRow[];
  specs: SpecRow[];
  worksheet: WorksheetRow[];
  scriptLines: string[];
  checklist: string[];
  outreach: string;

  shortlistCars: CarView[];
  savedEmpty: boolean;
  savedCount: number;
  allCount: number;
  sortBy: string;
  sortOpts: SelectOpt[];
  sortSelectStyle: string;
  onSort: ChangeEventHandler<HTMLSelectElement>;
  filterEmpty: boolean;
  filtersActive: boolean;
  conditionOpts: SelectOpt[];
  fuelFilterOpts: SelectOpt[];
  conditionFilter: string;
  fuelFilter: string;
  conditionSelectStyle: string;
  fuelSelectStyle: string;
  onConditionFilter: ChangeEventHandler<HTMLSelectElement>;
  onFuelFilter: ChangeEventHandler<HTMLSelectElement>;
  onClearFilters: () => void;
  onFilterAll: () => void;
  onFilterSaved: () => void;
  filterAllStyle: string;
  filterSavedStyle: string;
  cmpCount: number;
  showCmpBar: boolean;
  cmpBarLabel: string;
  cmpSelLabel: string;
  cmpMaxHint: boolean;
  openCompare: () => void;
  clearCompare: () => void;
  detailSaved: boolean;
  detailHeartGlyph: string;
  onDetailSave: () => void;
  detailJustSaved: boolean;
  detailHeartStyle: string;
  detailName: string;
  detailSub: string;
  detailFit: number;
  detailFitBadgeStyle: string;
  detailFitLabel: string;
  detailTco: string;
  detailOtd: string;
  detailOtdNote: string;
  detailDealLabel: string;
  detailDealPillStyle: string;
  detailDealNote: string;
  detailHeadroom: string;
  detailTradeoff: string;
  gridCols: string;
  compareCols: CompareCol[];
  fitCells: CompareCell[];
  dealCells: CompareCell[];
  otdCells: CompareCell[];
  costCells: CompareCell[];
  tradeoffCells: CompareCell[];
  specRows: CompareSpecRow[];
  recText: string;
  finalizeCells: FinalizeCell[];
  cmpHasCars: boolean;
  cmpEmpty: boolean;
  cmpCountLabel: number;
  compareSpecsOpen: boolean;
  compareSpecsCaret: string;
  toggleCompareSpecs: () => void;

  demoOpen: boolean;
  demoCaret: string;
  toggleDemo: () => void;
  copyLabel: string;
  doCopy: () => void;
}
