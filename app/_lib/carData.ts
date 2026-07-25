/**
 * Car inventory data — 12 realistic Bay Area listings sourced from
 * actual CarMax SF Bay Area inventory patterns (mid-2025 pricing).
 *
 * Fields:
 *   id        – slug used for routing and image lookup (/public/cars/<id>.jpg)
 *   fit       – 0–100 match score vs. the prototype buyer brief
 *   deal      – 'Good' | 'Fair' | 'Over' (vs. market comparables)
 *   tco       – estimated monthly total cost of ownership (insurance + gas/charging + maintenance)
 *   otd       – out-the-door asking price
 *   dealDelta – price difference vs. market (e.g. '−$800')
 *   dealComps – number of comparable listings used (e.g. '14 comps')
 *   mustHaveKeys – which mustHave keys this car satisfies (awd, carplay, backup, mpg, thirdrow, manual)
 *   tradeoff  – one-line tradeoff vs. the top pick
 */

export interface CarListing {
  id: string;
  name: string;
  miles: string;
  distance: string;
  fit: number;
  deal: 'Good' | 'Fair' | 'Over';
  tco: string;
  otd: string;
  condition: 'New' | 'Certified pre-owned' | 'Used';
  fuelType: 'Gas' | 'Hybrid' | 'Electric';
  dealer: string;
  pros: string[];
  cons: string[];
  why: string;
  dealDelta: string;
  dealComps: string;
  mustHaveKeys: string[];
  tradeoff?: string;
  imageUrl: string;
}

// Replace 'try' with your Imagin.Studio customer ID (free trial at imagin.studio)
const IMAGIN = (make: string, model: string, year: number) =>
  `https://cdn.imagin.studio/getimage?customer=try&make=${make}&modelFamily=${model}&modelYear=${year}&angle=side`;

export const carListings: CarListing[] = [
  {
    id: 'crv22',
    name: '2022 Honda CR-V EX',
    miles: '29k mi',
    distance: '18 mi away',
    fit: 91,
    deal: 'Good',
    tco: '$435',
    otd: '$28,490',
    condition: 'Certified pre-owned',
    fuelType: 'Gas',
    dealer: 'CarMax Fremont',
    pros: [
      'Bulletproof reliability — #1 in its class for 3+ years',
      'Roomy cargo with hands-free liftgate',
      'Holds value better than most rivals',
    ],
    cons: ['Underwhelming to drive', 'Smaller rear seat than RAV4'],
    why: "This is the safest pick for someone who ranked reliability first. The 2022 CR-V had zero major recalls and owners routinely keep them past 150k miles. This one is a one-owner CarMax CPO with a 90-day warranty layered on top of the remaining factory coverage. It's priced $800 below comparable listings in the area.",
    dealDelta: '−$800',
    dealComps: '14 comps',
    mustHaveKeys: ['carplay', 'backup'],
    imageUrl: IMAGIN('honda', 'cr-v', 2022),
  },
  {
    id: 'rav4xle',
    name: '2021 Toyota RAV4 XLE',
    miles: '36k mi',
    distance: '24 mi away',
    fit: 87,
    deal: 'Fair',
    tco: '$455',
    otd: '$29,850',
    condition: 'Used',
    fuelType: 'Gas',
    dealer: 'CarMax Oakland',
    pros: [
      'Top-tier long-term reliability (J.D. Power #1)',
      'More rear legroom than most crossovers',
      'Strong resale — retains ~58% after 3 years',
    ],
    cons: ['Priced at market, not a bargain right now', 'Base XLE trim lacks wireless CarPlay'],
    why: "The RAV4 is every bit as dependable as the CR-V — some years even better — and has more rear legroom. The catch is the Bay Area market is running hot on RAV4s right now, so this one is priced at fair value, not below it. I'd watch it for a week before making an offer; RAV4 prices have been drifting down about 2% per month.",
    dealDelta: '+$200',
    dealComps: '18 comps',
    mustHaveKeys: ['backup'],
    tradeoff: 'More legroom than CR-V but priced at market, not below it',
    imageUrl: IMAGIN('toyota', 'rav4', 2021),
  },
  {
    id: 'cx522',
    name: '2022 Mazda CX-5 Touring',
    miles: '23k mi',
    distance: '28 mi away',
    fit: 84,
    deal: 'Good',
    tco: '$390',
    otd: '$26,700',
    condition: 'Used',
    fuelType: 'Gas',
    dealer: 'Bay City Motors · Burlingame',
    pros: [
      'Best driving dynamics in this price range',
      'Interior quality punches above the price tag',
      'Lowest monthly cost on your list',
    ],
    cons: ['Rear seat tighter than RAV4/CR-V', 'Reliability good but not Honda/Toyota tier'],
    why: "If you care even a little about how a car feels to drive, test this one first. The CX-5 has a chassis that most SUVs twice the price can't match, and the cabin materials feel closer to a $40k car. It scores a bit lower here only because reliability is one step below the Japanese-brand benchmark — still excellent, just not class-leading.",
    dealDelta: '−$1,100',
    dealComps: '12 comps',
    mustHaveKeys: ['carplay', 'backup'],
    tradeoff: 'Best to drive but rear seat tighter and reliability one tier below Honda/Toyota',
    imageUrl: IMAGIN('mazda', 'cx-5', 2022),
  },
  {
    id: 'niroev23',
    name: '2023 Kia Niro EV Wind',
    miles: '9k mi',
    distance: '15 mi away',
    fit: 83,
    deal: 'Good',
    tco: '$395',
    otd: '$30,500',
    condition: 'Used',
    fuelType: 'Electric',
    dealer: 'Serramonte Kia · Colma',
    pros: [
      'Cheapest to run if you charge at home (~$35/mo in electricity)',
      'Almost new — full factory warranty still active',
      'No oil changes or brake jobs for years',
    ],
    cons: ['253-mile EPA range (fine for commute, tight for road trips)', 'Public fast-charging adds ~$30–50/mo if you rely on it'],
    why: "This is the dark-horse pick. It's essentially a new car — one prior owner put 9k miles on it before trading up — with Kia's 10-year powertrain warranty still fully intact. If you can plug in at home, your monthly running cost drops well below every gas car on this list. The $30,500 asking price already reflects the $3,750 used EV federal tax credit.",
    dealDelta: '−$950',
    dealComps: '9 comps',
    mustHaveKeys: ['carplay', 'backup', 'mpg'],
    tradeoff: 'Lowest running cost but range limits longer road trips without planning',
    imageUrl: IMAGIN('kia', 'niro', 2023),
  },
  {
    id: 'escape22h',
    name: '2022 Ford Escape SE Hybrid',
    miles: '27k mi',
    distance: '33 mi away',
    fit: 82,
    deal: 'Good',
    tco: '$400',
    otd: '$25,900',
    condition: 'Certified pre-owned',
    fuelType: 'Hybrid',
    dealer: 'CarMax San Rafael',
    pros: [
      '42 mpg combined — best fuel economy of non-EV options',
      'CPO warranty through CarMax covers 90 days bumper-to-bumper',
      'Comfortable, compliant ride on Bay Area roads',
    ],
    cons: ['Ford long-term reliability trails Toyota/Honda', 'Cargo floor sits higher than rivals'],
    why: "A solid middle-ground choice: hybrid efficiency without the range anxiety of full electric, and priced meaningfully below the RAV4 hybrid. The Ford reliability caveat is real — Consumer Reports shows the Escape Hybrid slightly below average — but the CPO coverage gives you a buffer. Worth a test drive if fuel costs are a priority.",
    dealDelta: '−$600',
    dealComps: '11 comps',
    mustHaveKeys: ['carplay', 'backup', 'mpg'],
    tradeoff: 'Best hybrid mpg at the lowest price, but Ford reliability lags Toyota/Honda long-term',
    imageUrl: IMAGIN('ford', 'escape', 2022),
  },
  {
    id: 'tucson23h',
    name: '2023 Hyundai Tucson Hybrid SEL',
    miles: '14k mi',
    distance: '26 mi away',
    fit: 80,
    deal: 'Fair',
    tco: '$430',
    otd: '$31,800',
    condition: 'Certified pre-owned',
    fuelType: 'Hybrid',
    dealer: 'CarMax Oakland',
    pros: [
      'Very nearly new — 1 year old, 38 mi/gallon combined',
      'Loaded with standard safety features (Highway Driving Assist II)',
      'Panoramic sunroof standard at this trim',
    ],
    cons: ['At the top of your budget range', 'Hyundai reliability improving but not Toyota-tier yet'],
    why: "The Tucson Hybrid is genuinely excellent — Hyundai has closed the reliability gap significantly in the 2022+ generation. This one is practically new and fully loaded. It scores Fair on deal because you're paying close to market rate; if your budget was firmer at $28k I'd skip it, but at $31,800 with this mileage you're getting more car per dollar than most of the options here.",
    dealDelta: '+$350',
    dealComps: '10 comps',
    mustHaveKeys: ['carplay', 'backup', 'mpg'],
    tradeoff: 'Most features per dollar but stretches the budget and priced at market',
    imageUrl: IMAGIN('hyundai', 'tucson', 2023),
  },
  {
    id: 'outback22',
    name: '2022 Subaru Outback Wilderness',
    miles: '24k mi',
    distance: '38 mi away',
    fit: 81,
    deal: 'Good',
    tco: '$465',
    otd: '$33,400',
    condition: 'Certified pre-owned',
    fuelType: 'Gas',
    dealer: 'Golden Gate Subaru · SF',
    pros: [
      'Standard AWD with 9.5" ground clearance — genuinely capable off-road',
      'One of the roomiest interiors in this class',
      'Subaru CPO adds 7-year/100k powertrain warranty',
    ],
    cons: ['Near your budget ceiling', '23 mpg combined — thirstier than rivals', 'Dealer is 38 miles away'],
    why: "If you care about AWD or want something that handles Bay Area winters and the occasional Tahoe trip confidently, the Wilderness trim is uniquely capable at this price. The trade-off is fuel cost — running about $65/mo more than the CX-5 — and it stretches to the top of your budget. The CPO warranty is very comprehensive though.",
    dealDelta: '−$700',
    dealComps: '8 comps',
    mustHaveKeys: ['awd', 'backup'],
    tradeoff: 'Only true off-road pick in the list but fuel cost runs $65/mo higher than average',
    imageUrl: IMAGIN('subaru', 'outback', 2022),
  },
  {
    id: 'camry22',
    name: '2022 Toyota Camry SE',
    miles: '28k mi',
    distance: '19 mi away',
    fit: 78,
    deal: 'Fair',
    tco: '$415',
    otd: '$25,500',
    condition: 'Used',
    fuelType: 'Gas',
    dealer: 'CarMax Fremont',
    pros: [
      'Toyota reliability — expect 200k+ miles with normal maintenance',
      'Silky smooth highway cruiser, ultra-quiet cabin',
      'Excellent resale value',
    ],
    cons: ['Sedan — no extra cargo height vs. crossovers', 'AWD not available in this generation'],
    why: "The Camry scores lower here mainly because it's a sedan and your brief mentioned needing cargo space. If that's flexible, this is a deeply reliable car at a fair price — Toyota's near-perfect ownership record on the Camry is hard to argue with. Priced at market right now, so there's not much negotiating room.",
    dealDelta: '+$100',
    dealComps: '21 comps',
    mustHaveKeys: ['carplay', 'backup'],
    tradeoff: 'Toyota reliability at a lower price, but sedan limits cargo vs. every crossover here',
    imageUrl: IMAGIN('toyota', 'camry', 2022),
  },
  {
    id: 'civic21',
    name: '2021 Honda Civic Sport',
    miles: '31k mi',
    distance: '12 mi away',
    fit: 77,
    deal: 'Good',
    tco: '$380',
    otd: '$22,800',
    condition: 'Used',
    fuelType: 'Gas',
    dealer: 'Peninsula Honda · San Mateo',
    pros: [
      'Lowest out-the-door price on your list',
      '32 mpg combined, lowest fuel cost of the gas options',
      'Fun to drive — responsive steering, better than the Camry',
    ],
    cons: ['Compact sedan — less cargo space than any crossover here', 'Rear seat tight for car seats'],
    why: "The best pick if budget is the primary filter. At $22,800 you're paying $6k less than the CR-V with nearly the same reliability DNA. The Civic scores lower here because you mentioned cargo being a factor. But if you reconsider the sedan vs. SUV question, this car will cost you less to own over 5 years than anything else on this list.",
    dealDelta: '−$1,300',
    dealComps: '16 comps',
    mustHaveKeys: ['carplay', 'backup'],
    tradeoff: 'Lowest 5-year ownership cost but cargo space is the clear sacrifice vs. any crossover',
    imageUrl: IMAGIN('honda', 'civic', 2021),
  },
  {
    id: 'forester22',
    name: '2022 Subaru Forester Sport',
    miles: '34k mi',
    distance: '22 mi away',
    fit: 76,
    deal: 'Fair',
    tco: '$450',
    otd: '$27,500',
    condition: 'Certified pre-owned',
    fuelType: 'Gas',
    dealer: 'Golden Gate Subaru · SF',
    pros: [
      'Standard AWD, best-in-class visibility',
      'Tall roofline — easiest car to get kids in and out of',
      'CPO warranty: 7 years / 100k miles powertrain',
    ],
    cons: ['CVT transmission polarizing for driving feel', 'Priced at market — little room to negotiate'],
    why: "The Forester is the choice if AWD and easy entry/exit matter most — it's the tallest SUV here and has the sightlines of a truck without the size. Scored Fair on deal because Golden Gate Subaru's CPO pricing is firm. If reliability is the priority, I'd pick the CR-V; if AWD is the priority and you want a Bay dealer, this is the pick.",
    dealDelta: '+$250',
    dealComps: '13 comps',
    mustHaveKeys: ['awd', 'backup'],
    tradeoff: 'Best AWD value with 7-yr CPO warranty but driving feel and pricing are compromises',
    imageUrl: IMAGIN('subaru', 'forester', 2022),
  },
  {
    id: 'equinox22',
    name: '2022 Chevrolet Equinox LT AWD',
    miles: '32k mi',
    distance: '29 mi away',
    fit: 73,
    deal: 'Good',
    tco: '$440',
    otd: '$23,500',
    condition: 'Certified pre-owned',
    fuelType: 'Gas',
    dealer: 'CarMax Serramonte',
    pros: [
      'AWD at one of the lowest prices on the list',
      'CarMax CPO — 90-day worry-free return policy',
      'More standard safety tech than CR-V at this price',
    ],
    cons: ['GM reliability below Japanese rivals (Consumer Reports below average)', 'Resale value drops faster — worth ~45% in 3 years vs. 58% for RAV4'],
    why: "The Equinox scores lower here because long-term reliability is a real gap compared to Honda and Toyota. That said, at $23,500 with AWD and CarMax's CPO coverage it's genuinely hard to ignore on price. If you're planning to keep the car under 4 years, the reliability delta matters less. If you're in it for 7+ years, I'd spend the extra $5k on the CR-V.",
    dealDelta: '−$1,500',
    dealComps: '15 comps',
    mustHaveKeys: ['awd', 'carplay', 'backup'],
    tradeoff: 'Cheapest AWD option but reliability and resale both trail Japanese rivals meaningfully',
    imageUrl: IMAGIN('chevrolet', 'equinox', 2022),
  },
  {
    id: 'rogue20',
    name: '2020 Nissan Rogue SV AWD',
    miles: '48k mi',
    distance: '16 mi away',
    fit: 71,
    deal: 'Good',
    tco: '$420',
    otd: '$19,900',
    condition: 'Used',
    fuelType: 'Gas',
    dealer: 'Private Seller · Oakland',
    pros: [
      'Lowest asking price on the list — $3,600 below next cheapest',
      'AWD standard, decent cargo space',
      'Zero dealer fees (private sale)',
    ],
    cons: [
      '2020 Rogue CVT had documented reliability issues — check service history',
      'Higher miles means you\'re closer to first major maintenance costs',
      'Private sale: no CPO warranty, no return policy',
    ],
    why: "The lowest price, but I'm flagging two things: the 2020 Rogue's CVT (transmission) had elevated failure rates in that model year — it's the #1 thing to verify before buying. Get a pre-purchase inspection at an independent shop (~$150) and pull the Carfax. If it passes, the $19,900 is genuinely good value. If that comes back messy, walk away — there's no warranty to catch you.",
    dealDelta: '−$2,200',
    dealComps: '19 comps',
    mustHaveKeys: ['awd', 'backup'],
    tradeoff: 'Best price by far but CVT reliability risk on this model year requires a PPI before buying',
    imageUrl: IMAGIN('nissan', 'rogue', 2020),
  },
];
