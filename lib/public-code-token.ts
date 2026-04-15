const TOKEN_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const SOURCE_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_.';
const DEFAULT_OBFUSCATION_KEY = 'javstash-public-view';

function getObfuscationKey() {
  return (
    process.env.NEXT_PUBLIC_PUBLIC_CODE_OBFUSCATION_KEY ||
    process.env.PUBLIC_CODE_OBFUSCATION_KEY ||
    DEFAULT_OBFUSCATION_KEY
  );
}

function createSeed(input: string) {
  let hash = 2166136261;

  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function createPrng(seed: number) {
  let value = seed || 0x6d2b79f5;

  return () => {
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function buildTokenPairs() {
  const pairs: string[] = [];

  for (const first of TOKEN_ALPHABET) {
    for (const second of TOKEN_ALPHABET) {
      pairs.push(`${first}${second}`);
    }
  }

  const prng = createPrng(createSeed(`${getObfuscationKey()}:pairs`));

  for (let index = pairs.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(prng() * (index + 1));
    [pairs[index], pairs[swapIndex]] = [pairs[swapIndex], pairs[index]];
  }

  return pairs;
}

const tokenPairs = buildTokenPairs();
const encodeMap = new Map(
  SOURCE_ALPHABET.split('').map((char, index) => [char, tokenPairs[index]])
);
const decodeMap = new Map(
  SOURCE_ALPHABET.split('').map((char, index) => [tokenPairs[index], char])
);

export function encodePublicCodeToken(code: string) {
  return code
    .split('')
    .map((char) => encodeMap.get(char) ?? char)
    .join('');
}

export function decodePublicCodeToken(token: string) {
  if (!token.trim() || token.length % 2 !== 0 || /[^A-Za-z]/.test(token)) {
    return null;
  }

  let decoded = '';

  for (let index = 0; index < token.length; index += 2) {
    const chunk = token.slice(index, index + 2);
    const sourceChar = decodeMap.get(chunk);

    if (!sourceChar) {
      return null;
    }

    decoded += sourceChar;
  }

  return decoded;
}
