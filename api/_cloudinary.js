import { createHash } from 'node:crypto';

// Server-side only — uses the API secret to authenticate deletions.
// Uploads happen client-side via an unsigned preset; deletion requires
// the signed Admin API, so it stays here and never reaches the browser.
export async function destroyCloudinaryAsset(publicId) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret || !publicId) return;

  const timestamp = Math.floor(Date.now() / 1000);
  const toSign = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
  const signature = createHash('sha1').update(toSign).digest('hex');

  const body = new URLSearchParams({
    public_id: publicId,
    timestamp: String(timestamp),
    api_key: apiKey,
    signature,
  });

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!res.ok) {
    console.error('Cloudinary destroy failed', await res.text());
  }
}

// Club logos live as loose, unorganized uploads at the account root (not the
// jersey-catalog/ folder the admin panel's upload preset writes to) — several
// were named by the OS's default download name rather than the club, so a
// curated override map fixes the ones generic cleanup can't get right, and a
// short exclude list keeps out logos that duplicate another upload or can't
// be identified at all. Anything uploaded later with a sane filename and not
// in either list picks up automatically via the generic cleanup.
const CLUB_NAME_OVERRIDES = {
  'Arsenal_Football_Club_Official_Logo_glaaem': 'Arsenal',
  'Paris_Saint-Germain_F_C_tclvlq': 'Paris Saint-Germain',
  'Real_Madrid_C_F_s7hfko': 'Real Madrid',
  'Liverpool_Football_Club_Logo_PNG___TopPNG_ivib3s': 'Liverpool',
  'Chelsea_Football_Club_Logo_PNG_zpumh8': 'Chelsea',
  'Juventus_Fit11041104w640_-_Dls_Juventus_Logo_2018_PNG_Transparent_With_Clear_Background_ID_164979___TopPNG_dyto5k': 'Juventus',
  'Al-Nassr_Football_Club_Logo_nohc8x': 'Al-Nassr',
  'Équipe_National_Football___Argentine_iqoanh': 'Argentina',
  'Brasil_CBF_Crest_Futbol_Soccer_Sticker_rgbeus': 'Brazil',
  'AL_HILAL_ARABIA_SAUDITA_erjahs': 'Al Hilal',
  'Newcastle_United_Fc_Vector_Logo___TopPNG_gr8qmo': 'Newcastle United',
  'Club_Atlético_de_Madrid_Logo_dphdb5': 'Atlético Madrid',
  'Bayer_04_Leverkusen_FC_Logo_Sign_nwrtzn': 'Bayer Leverkusen',
  'FC_Bayern_München_Logo_p5ak69': 'Bayern Munich',
  'Olympique_de_Marseille_xrjdhf': 'Marseille',
  'S_S.C_x2ithi': 'Napoli',
  'Philips_Sport_Vereniging_NED_1_sybzxj': 'PSV Eindhoven',
  'Olympiakos_Olympiacos_Ολυμπιακος_l98aet': 'Olympiacos',
  'Sport_Lisboa_E_Benfica_Vector_Logo___TopPNG_c6vcvd': 'Benfica',
  'Galatasaray_5-Star_Emblem_PNG___Free_Download_m2nokg': 'Galatasaray',
  'Atalanta_BC_Football_Club_Logo_Sign_ed4f4z': 'Atalanta',
  'Download_Bodo_And_Glimt_Club_Logo_Symbol_Norway_League_Football_Abstract_Design_Vector_Illustration_With_Yellow_Background_vvn5aj': 'Bodø/Glimt',
  'Qarabağ_Futbol_Klubu_-_Quzanlı-AZE_jndzx8': 'Qarabağ',
  'Pafos_Football_Club_-_Pafos-CYP_ozcdyu': 'Pafos',
};

const CLUB_EXCLUDE = new Set([
  'sublimation_version_ohd5iq',
  'embroy_version_xicda2',
  'Olympiakos_Olympiacos_Ολυμπιακος_-_Copy_zjowp3', // duplicate of the Olympiacos upload kept above
  'download_bj5fnu', 'download_1_gds260', 'download_2_gjy0xe', 'download_3_tejvni',
  'download_4_tzwug7', 'download_5_xfpgjv', 'download_6_fd4us3', 'download_7_bsyu5n',
  'download_8_muhnts', 'download_9_ynf0u5', 'download_10_qswmlj', 'download_11_kkn0hs', 'download_12_x8caye',
]);

const JUNK_WORDS = /\b(football|soccer|futbol|klubu|club|fc|f c|logo|sign|crest|vector|png|topng|official|download|free|transparent|clear|background|sticker|emblem|symbol|abstract|design|illustration|with|yellow|dls|fit\d+\w*|id\d+|copy)\b/gi;

function deriveClubName(publicId) {
  let s = publicId.replace(/_[a-z0-9]{6}$/i, ''); // strip Cloudinary's random upload suffix
  s = s.replace(/[_-]+/g, ' ');
  s = s.replace(JUNK_WORDS, ' ');
  s = s.replace(/\s+/g, ' ').trim();
  if (!/[a-zA-Z]{3,}/.test(s)) return null; // no real name left (e.g. bare "download 13")
  return s.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

let cache = null;
let cacheAt = 0;
const CACHE_TTL_MS = 5 * 60 * 1000;

// Public read — lists whatever club logos currently live in Cloudinary, with
// a short in-memory cache so repeat page loads don't all hit Cloudinary's API.
export async function listClubLogos() {
  if (cache && Date.now() - cacheAt < CACHE_TTL_MS) return cache;

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) return [];

  const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/resources/image?max_results=500`, {
    headers: { Authorization: `Basic ${auth}` },
  });
  if (!res.ok) {
    console.error('Cloudinary list resources failed', await res.text());
    return cache || [];
  }
  const { resources = [] } = await res.json();

  const seen = new Set();
  const clubs = [];
  for (const r of resources) {
    const publicId = r.public_id;
    if (publicId.startsWith('jersey-catalog/')) continue;
    if (publicId.startsWith('WhatsApp_Image')) continue;
    if (CLUB_EXCLUDE.has(publicId)) continue;

    const name = CLUB_NAME_OVERRIDES[publicId] || deriveClubName(publicId);
    if (!name || seen.has(name)) continue;
    seen.add(name);

    clubs.push({
      publicId,
      name,
      logoUrl: `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto,w_160/${publicId}`,
    });
  }
  clubs.sort((a, b) => a.name.localeCompare(b.name));

  cache = clubs;
  cacheAt = Date.now();
  return clubs;
}
