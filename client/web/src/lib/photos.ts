// Real photographs from Unsplash (free to use under the Unsplash License).
// Each entry is an images.unsplash.com photo id, resized on the fly with the width we ask for.
export type EventKind = 'wedding' | 'concert' | 'college' | 'family' | 'party';

export const PHOTO = {
  couple: '1722952934708-749c22eb2e58',
  couple2: '1665960213508-48f07086d49c',
  mandap: '1587271636175-90d58cdad458',
  bride: '1610173827043-9db50e0d8ef9',
  festival: '1633891119630-cb3665df5b7d',
  diya: '1577083753695-e010191bacb5',
  family: '1659352787906-f809a3b9e86e',
  party: '1714978444614-7a197c2309ee',
  birthday: '1763951778440-13af353b122a',
  grads: '1541339907198-e08756dedf3f',
  tossing: '1570897234456-a6d0a709574f',
  crowd: '1501386761578-eac5c94b800a',
  stage: '1459749411175-04bf5292ceea',
  portrait: '1564564295391-7f24f26f568b',
} as const;

export const photoSrc = (id: string, width = 800) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=75`;

const COVER: Record<EventKind, string> = {
  wedding: PHOTO.mandap,
  family: PHOTO.festival,
  party: PHOTO.party,
  college: PHOTO.grads,
  concert: PHOTO.stage,
};

export const coverPhoto = (kind: EventKind) => COVER[kind];

export function coverKind(name: string, id = ''): EventKind {
  const n = name.toLowerCase();
  if (/wed|shaadi|bibaha|marriage|reception|sangeet|mehendi|mehndi|engagement|haldi/.test(n)) return 'wedding';
  if (/college|school|grad|convocation|campus|reunion|batch/.test(n)) return 'college';
  if (/concert|fest|show|live|music|dj|night/.test(n)) return 'concert';
  if (/birthday|party|anniversary|pasni|baby|bday/.test(n)) return 'party';
  if (/bratabandha|puja|family|ceremony|janai|teej|dashain|tihar|diwali|chhath|holi/.test(n)) return 'family';
  const kinds: EventKind[] = ['wedding', 'concert', 'college', 'family', 'party'];
  const seed = [...(id || name)].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return kinds[seed % kinds.length];
}
