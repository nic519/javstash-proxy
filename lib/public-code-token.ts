const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const DIGITS = '0123456789';
const PASSTHROUGH_CHARS = new Set(['-', '_', '.']);
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

function shuffleAlphabet(alphabet: string, namespace: string) {
  const chars = alphabet.split('');
  const prng = createPrng(createSeed(`${getObfuscationKey()}:${namespace}`));

  for (let index = chars.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(prng() * (index + 1));
    [chars[index], chars[swapIndex]] = [chars[swapIndex], chars[index]];
  }

  return chars.join('');
}

const uppercaseCipher = shuffleAlphabet(UPPERCASE, 'uppercase');
const digitCipher = shuffleAlphabet(DIGITS, 'digits');

function mapCharacter(char: string, source: string, target: string) {
  const index = source.indexOf(char);
  return index === -1 ? null : target[index];
}

export function encodePublicCodeToken(code: string) {
  return code
    .split('')
    .map((char) => {
      if (PASSTHROUGH_CHARS.has(char)) return char;

      return (
        mapCharacter(char, UPPERCASE, uppercaseCipher) ??
        mapCharacter(char, DIGITS, digitCipher) ??
        char
      );
    })
    .join('');
}

export function decodePublicCodeToken(token: string) {
  if (!token.trim()) return null;

  const decoded = token
    .split('')
    .map((char) => {
      if (PASSTHROUGH_CHARS.has(char)) return char;

      return (
        mapCharacter(char, uppercaseCipher, UPPERCASE) ??
        mapCharacter(char, digitCipher, DIGITS)
      );
    });

  if (decoded.some((char) => char == null)) {
    return null;
  }

  return decoded.join('');
}
