// 1. ИНФОРМАЦИЯ ОБ ЭКРАНЕ
const width = screen.width;
const height = screen.height;

const totalPixels = width * height;
const megaPixels = (totalPixels / 1000000).toFixed(2);

function gcd(a, b) {
  while (b !== 0) {
    const temp = b;
    b = a % b;
    a = temp;
  }
  return a;
}

const divisor = gcd(width, height);
const aspectW = width / divisor;
const aspectH = height / divisor;
const aspectString = `${aspectW}:${aspectH}`;

const colorDepth = screen.colorDepth;
const bytesPerPixel = (colorDepth / 8).toFixed(2);

document.getElementById('screenRes').textContent = `${width} x ${height}`;
document.getElementById('pixels').textContent = megaPixels;
document.getElementById('aspectRatio').textContent = aspectString;
document.getElementById('colorDepth').textContent = colorDepth;
document.getElementById('bytesPerPixel').textContent = bytesPerPixel;

// 2. ИНФОРМАЦИЯ О ПАМЯТИ (ОЗУ)
let ram = navigator.deviceMemory || 4;

const ramMB = ram * 1024;
const ramKB = ramMB * 1024;
const pages = ramKB / 10; // 1 страница ~ 10 КБ

document.getElementById('ramGB').textContent = ram;
document.getElementById('ramMB').textContent = ramMB.toLocaleString('ru-RU');
document.getElementById('ramKB').textContent = ramKB.toLocaleString('ru-RU');
document.getElementById('ramPages').textContent = Math.floor(pages).toLocaleString('ru-RU');

// 3. ИНФОРМАЦИЯ О БРАУЗЕРЕ И СИСТЕМЕ
const ua = navigator.userAgent;
let browser = 'Неизвестный';

if (ua.includes('Edg')) browser = 'Microsoft Edge';
else if (ua.includes('OPR') || ua.includes('Opera')) browser = 'Opera';
else if (ua.includes('Chrome')) browser = 'Google Chrome';
else if (ua.includes('Firefox')) browser = 'Mozilla Firefox';
else if (ua.includes('Safari')) browser = 'Safari';

let arch = 'не определено';
if (/Win64|WOW64|x64|amd64/i.test(ua)) arch = '64-bit';
else if (/Win32|WOW32|x86|i686/i.test(ua)) arch = '32-bit';
else if (/Mac OS X/i.test(ua)) arch = '64-bit (macOS)';

const language = navigator.language || navigator.userLanguage || 'неизвестно';

document.getElementById('browserName').textContent = browser;
document.getElementById('osArch').textContent = arch;
document.getElementById('sysLang').textContent = language;

// Уточнение разрядности через User-Agent Client Hints, если поддерживается
if (navigator.userAgentData?.getHighEntropyValues) {
  navigator.userAgentData
    .getHighEntropyValues(['architecture', 'bitness'])
    .then((data) => {
      const parts = [];
      if (data.architecture) parts.push(data.architecture);
      if (data.bitness) parts.push(`${data.bitness}-bit`);
      if (parts.length) {
        document.getElementById('osArch').textContent = parts.join(' ');
      }
    })
    .catch(() => {});
}

// 4. СЕТЕВЫЕ ВЫЧИСЛЕНИЯ
const connection =
  navigator.connection ||
  navigator.mozConnection ||
  navigator.webkitConnection;

function updateNetworkInfo() {
  const connType = connection
    ? (connection.effectiveType || connection.type || 'не определено')
    : 'не определено';

  let realSpeed =
    connection && Number(connection.downlink) > 0
      ? Number(connection.downlink)
      : 50; // Мбит/с по умолчанию

  const fileSizeMB = 500;
  const speedMBps = realSpeed / 8; // перевод Мбит/с в МБ/с
  const downloadSec = fileSizeMB / speedMBps;

  document.getElementById('connType').textContent = connType;
  document.getElementById('downlinkSpeed').textContent = realSpeed.toFixed(1);
  document.getElementById('downloadTime').textContent = downloadSec.toFixed(1);
}

updateNetworkInfo();

if (connection && typeof connection.addEventListener === 'function') {
  connection.addEventListener('change', updateNetworkInfo);
}

console.log(
  `Система загружена. Разрешение экрана: ${width}x${height}, ОЗУ: ${ram} ГБ`
);