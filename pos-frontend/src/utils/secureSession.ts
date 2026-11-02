// Browser & Session Fingerprint agar tidak bisa dipindah antar browser/device
function getBrowserFingerprint(): string {
  try {
    const nav = window.navigator;
    const screen = window.screen;
    return `${nav.userAgent}_${nav.language}_${screen.width}x${screen.height}_${new Date().getTimezoneOffset()}`;
  } catch (e) {
    return "default_fp";
  }
}

// Secret salt sederhana untuk enkripsi simetris di client-side session
const SALT = "POS_SALT_KUNCI_RAHASIA_SESI_V1";

function xorEncryptDecrypt(input: string, key: string): string {
  let output = "";
  for (let i = 0; i < input.length; i++) {
    const charCode = input.charCodeAt(i) ^ key.charCodeAt(i % key.length);
    output += String.fromCharCode(charCode);
  }
  return output;
}

// Enkripsi string/objek ke Base64 teracak
export function encryptData(data: any, userKey = "pos_default"): string {
  try {
    const jsonStr = JSON.stringify(data);
    const combinedKey = `${SALT}_${userKey}_${getBrowserFingerprint()}`;
    const xored = xorEncryptDecrypt(jsonStr, combinedKey);
    // Menggunakan btoa yang aman untuk UTF-8
    return btoa(encodeURIComponent(xored));
  } catch (err) {
    console.error("Gagal enkripsi data session:", err);
    return "";
  }
}

// Dekripsi data dari Base64 teracak kembali ke objek aslinya
export function decryptData<T = any>(cipherText: string, userKey = "pos_default"): T | null {
  try {
    if (!cipherText) return null;
    const combinedKey = `${SALT}_${userKey}_${getBrowserFingerprint()}`;
    const decodedUri = decodeURIComponent(atob(cipherText));
    const decrypted = xorEncryptDecrypt(decodedUri, combinedKey);
    return JSON.parse(decrypted) as T;
  } catch (err) {
    return null;
  }
}

const USER_ROLE_KEY = "pos_sec_role";

export function saveEncryptedUserRole(role: any, userId: string | number = "user") {
  if (!role) return;
  // Simpan HANYA metadata penting user tersebut: id, name, dan array permissions
  const minimalData = {
    id: role.id,
    name: role.name,
    permissions: Array.isArray(role.permissions) ? role.permissions : []
  };
  const cipher = encryptData(minimalData, String(userId));
  sessionStorage.setItem(USER_ROLE_KEY, cipher);
}

export function getDecryptedUserRole(userId: string | number = "user") {
  const cipher = sessionStorage.getItem(USER_ROLE_KEY);
  if (!cipher) return null;
  return decryptData(cipher, String(userId));
}

export function clearEncryptedUserRole() {
  sessionStorage.removeItem(USER_ROLE_KEY);
  sessionStorage.removeItem("pos_roles_cache"); // pastikan list roles umum bersih
}
