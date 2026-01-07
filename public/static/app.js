// Roulette Wheel Application

// State
let options = [];
let spinning = false;
let soundEnabled = true;
let volume = 0.5; // Default volume (0.0 to 1.0)

// Audio Context for sound effects
let audioContext;
let spinSound;
let winSound;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadFromURL(); // Load from URL first
  loadOptions();
  loadVolume();
  initAudio();
  renderOptions();
  drawWheel();
  setupEventListeners();
});

// Audio initialization
function initAudio() {
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
}

// Load settings from URL parameters
function loadFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  
  // Load options from URL
  const optionsParam = urlParams.get('options');
  if (optionsParam) {
    try {
      const decoded = atob(optionsParam);
      const loadedOptions = JSON.parse(decoded);
      if (Array.isArray(loadedOptions) && loadedOptions.length > 0) {
        options = loadedOptions;
        localStorage.setItem('rouletteOptions', JSON.stringify(options));
      }
    } catch (e) {
      console.error('Failed to load options from URL:', e);
    }
  }
  
  // Load volume from URL
  const volumeParam = urlParams.get('volume');
  if (volumeParam) {
    const vol = parseInt(volumeParam);
    if (vol >= 0 && vol <= 100) {
      volume = vol / 100;
      localStorage.setItem('rouletteVolume', volume.toString());
    }
  }
  
  // Load sound setting from URL
  const soundParam = urlParams.get('sound');
  if (soundParam) {
    soundEnabled = soundParam === '1';
  }
}

// Generate share URL
function generateShareURL() {
  const baseURL = window.location.origin + window.location.pathname;
  const params = new URLSearchParams();
  
  // Encode options
  const optionsJSON = JSON.stringify(options);
  const optionsEncoded = btoa(optionsJSON);
  params.set('options', optionsEncoded);
  
  // Add volume
  params.set('volume', Math.round(volume * 100).toString());
  
  // Add sound setting
  params.set('sound', soundEnabled ? '1' : '0');
  
  return baseURL + '?' + params.toString();
}

// Copy share URL to clipboard
function copyShareURL() {
  const shareURL = generateShareURL();
  
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(shareURL).then(() => {
      alert('共有URLをクリップボードにコピーしました！\n\nこのURLを共有すると、他の人が同じルーレット設定を見ることができます。');
    }).catch(err => {
      // Fallback for older browsers
      showShareURLDialog(shareURL);
    });
  } else {
    // Fallback for older browsers
    showShareURLDialog(shareURL);
  }
}

// Show share URL in a dialog (fallback)
function showShareURLDialog(url) {
  const dialog = document.createElement('div');
  dialog.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); z-index: 1000; max-width: 80%;';
  
  const title = document.createElement('h3');
  title.textContent = '共有URL';
  title.style.marginBottom = '10px';
  
  const input = document.createElement('input');
  input.type = 'text';
  input.value = url;
  input.readOnly = true;
  input.style.cssText = 'width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 5px; margin-bottom: 10px; font-size: 14px;';
  
  const button = document.createElement('button');
  button.textContent = '閉じる';
  button.style.cssText = 'background: #3b82f6; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;';
  button.onclick = () => document.body.removeChild(dialog);
  
  dialog.appendChild(title);
  dialog.appendChild(input);
  dialog.appendChild(button);
  document.body.appendChild(dialog);
  
  input.select();
}

// Load volume from localStorage
function loadVolume() {
  const stored = localStorage.getItem('rouletteVolume');
  if (stored) {
    volume = parseFloat(stored);
    document.getElementById('volumeSlider').value = volume * 100;
    document.getElementById('volumeValue').textContent = Math.round(volume * 100) + '%';
  }
}

// Save volume to localStorage
function saveVolume() {
  localStorage.setItem('rouletteVolume', volume.toString());
}

// Generate spin sound
function playSpinSound() {
  if (!soundEnabled || !audioContext || volume === 0) return;
  
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.value = 200;
  oscillator.type = 'sine';
  
  gainNode.gain.setValueAtTime(0.3 * volume, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01 * volume, audioContext.currentTime + 0.1);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.1);
}

// Generate win sound
function playWinSound() {
  if (!soundEnabled || !audioContext || volume === 0) return;
  
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.type = 'sine';
  
  // Play a celebratory melody
  const notes = [523.25, 659.25, 783.99]; // C, E, G
  let time = audioContext.currentTime;
  
  notes.forEach((freq, i) => {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    
    osc.connect(gain);
    gain.connect(audioContext.destination);
    
    osc.frequency.value = freq;
    osc.type = 'sine';
    
    gain.gain.setValueAtTime(0.2 * volume, time + i * 0.15);
    gain.gain.exponentialRampToValueAtTime(0.01 * volume, time + i * 0.15 + 0.3);
    
    osc.start(time + i * 0.15);
    osc.stop(time + i * 0.15 + 0.3);
  });
}

// Setup event listeners
function setupEventListeners() {
  document.getElementById('addBtn').addEventListener('click', addOption);
  document.getElementById('newOption').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addOption();
  });
  document.getElementById('spinBtn').addEventListener('click', spinWheel);
  document.getElementById('closeModal').addEventListener('click', closeModal);
  document.getElementById('soundToggle').addEventListener('click', toggleSound);
  document.getElementById('volumeSlider').addEventListener('input', updateVolume);
  
  // Click outside modal to close
  document.getElementById('resultModal').addEventListener('click', (e) => {
    if (e.target.id === 'resultModal') closeModal();
  });
}

// Update volume
function updateVolume(e) {
  volume = e.target.value / 100;
  document.getElementById('volumeValue').textContent = e.target.value + '%';
  saveVolume();
}

// Toggle sound
function toggleSound() {
  soundEnabled = !soundEnabled;
  const icon = soundEnabled ? 'fa-volume-up' : 'fa-volume-mute';
  const text = soundEnabled ? 'サウンド: ON' : 'サウンド: OFF';
  
  document.getElementById('soundToggle').innerHTML = `
    <i class="fas ${icon} mr-2"></i>
    <span id="soundStatus">${text}</span>
  `;
}

// Load options from localStorage
function loadOptions() {
  const stored = localStorage.getItem('rouletteOptions');
  if (stored) {
    options = JSON.parse(stored);
  } else {
    // Default options
    options = [
      { id: Date.now() + 1, text: 'オプション1', weight: 1, enabled: true },
      { id: Date.now() + 2, text: 'オプション2', weight: 1, enabled: true },
      { id: Date.now() + 3, text: 'オプション3', weight: 1, enabled: true }
    ];
    saveOptions();
  }
}

// Save options to localStorage
function saveOptions() {
  localStorage.setItem('rouletteOptions', JSON.stringify(options));
}

// Add new option
function addOption() {
  const input = document.getElementById('newOption');
  const text = input.value.trim();
  
  if (!text) {
    alert('選択肢を入力してください');
    return;
  }
  
  const newOption = {
    id: Date.now(),
    text: text,
    weight: 1,
    enabled: true
  };
  
  options.push(newOption);
  saveOptions();
  renderOptions();
  drawWheel();
  
  input.value = '';
  input.focus();
}

// Delete option
function deleteOption(id) {
  if (!confirm('この選択肢を削除しますか?')) return;
  
  options = options.filter(opt => opt.id !== id);
  saveOptions();
  renderOptions();
  drawWheel();
}

// Toggle option enabled/disabled
function toggleOption(id) {
  const option = options.find(opt => opt.id === id);
  if (option) {
    option.enabled = !option.enabled;
    saveOptions();
    renderOptions();
    drawWheel();
  }
}

// Change weight
function changeWeight(id, multiplier) {
  const option = options.find(opt => opt.id === id);
  if (option) {
    option.weight = multiplier;
    saveOptions();
    renderOptions();
    drawWheel();
  }
}

// Render options list
function renderOptions() {
  const list = document.getElementById('optionsList');
  const emptyState = document.getElementById('emptyState');
  
  if (options.length === 0) {
    list.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }
  
  emptyState.classList.add('hidden');
  
  list.innerHTML = options.map(opt => `
    <div class="option-item bg-gray-100 rounded-lg p-4 ${!opt.enabled ? 'opacity-50' : ''}">
      <div class="flex items-center gap-3">
        <!-- Toggle Enable/Disable -->
        <button 
          onclick="toggleOption(${opt.id})"
          class="w-10 h-10 rounded-lg ${opt.enabled ? 'bg-green-500' : 'bg-gray-400'} text-white hover:opacity-80 transition flex items-center justify-center"
          title="${opt.enabled ? '有効' : '無効'}"
        >
          <i class="fas ${opt.enabled ? 'fa-check' : 'fa-times'}"></i>
        </button>
        
        <!-- Option Text -->
        <div class="flex-1 text-gray-800 font-semibold">
          ${opt.text}
        </div>
        
        <!-- Weight Buttons -->
        <div class="flex gap-1">
          <button 
            onclick="changeWeight(${opt.id}, 1)"
            class="px-3 py-1 rounded ${opt.weight === 1 ? 'bg-blue-500' : 'bg-blue-300'} text-white text-sm hover:bg-blue-600 transition"
            title="通常の確率"
          >
            x1
          </button>
          <button 
            onclick="changeWeight(${opt.id}, 3)"
            class="px-3 py-1 rounded ${opt.weight === 3 ? 'bg-orange-500' : 'bg-orange-300'} text-white text-sm hover:bg-orange-600 transition"
            title="3倍の確率"
          >
            x3
          </button>
          <button 
            onclick="changeWeight(${opt.id}, 5)"
            class="px-3 py-1 rounded ${opt.weight === 5 ? 'bg-red-500' : 'bg-red-300'} text-white text-sm hover:bg-red-600 transition"
            title="5倍の確率"
          >
            x5
          </button>
        </div>
        
        <!-- Delete Button -->
        <button 
          onclick="deleteOption(${opt.id})"
          class="w-10 h-10 rounded-lg bg-red-500 text-white hover:bg-red-600 transition flex items-center justify-center"
          title="削除"
        >
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
  `).join('');
}

// Draw the roulette wheel
function drawWheel() {
  const canvas = document.getElementById('rouletteCanvas');
  const ctx = canvas.getContext('2d');
  
  // Set canvas size
  canvas.width = 500;
  canvas.height = 500;
  
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = canvas.width / 2 - 10;
  
  // Get enabled options
  const enabledOptions = options.filter(opt => opt.enabled);
  
  if (enabledOptions.length === 0) {
    // Draw empty wheel
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fillStyle = '#e0e0e0';
    ctx.fill();
    
    ctx.fillStyle = '#999';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('有効な選択肢がありません', centerX, centerY);
    return;
  }
  
  // Calculate total weight
  const totalWeight = enabledOptions.reduce((sum, opt) => sum + opt.weight, 0);
  
  // Colors
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788',
    '#FF8C94', '#6C5CE7', '#A29BFE', '#FD79A8', '#FDCB6E'
  ];
  
  // Start from top (12 o'clock = -90 degrees = -Math.PI/2 radians)
  let currentAngle = -Math.PI / 2;
  
  enabledOptions.forEach((opt, index) => {
    const sliceAngle = (opt.weight / totalWeight) * 2 * Math.PI;
    
    // Draw slice
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
    ctx.closePath();
    
    ctx.fillStyle = colors[index % colors.length];
    ctx.fill();
    
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Draw text
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(currentAngle + sliceAngle / 2);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px Arial';
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 4;
    
    // Draw text at radius distance
    const textRadius = radius * 0.65;
    ctx.fillText(opt.text, textRadius, 0);
    
    // Draw weight indicator
    if (opt.weight > 1) {
      ctx.font = 'bold 14px Arial';
      ctx.fillText(`(x${opt.weight})`, textRadius, 25);
    }
    
    ctx.restore();
    
    currentAngle += sliceAngle;
  });
}

// Function to determine which slice is at the pointer after rotation
function getSliceAtPointer(rotationDegrees, enabledOptions, totalWeight) {
  // The pointer is at the top (-90 degrees in canvas coordinates)
  // After rotating the wheel by rotationDegrees (clockwise), 
  // we need to find which slice is now at the pointer position
  
  // Normalize rotation to 0-360 range
  const normalizedRotation = ((rotationDegrees % 360) + 360) % 360;
  
  // The pointer position in canvas is -90 degrees (or 270 degrees in standard coords)
  // After clockwise rotation by normalizedRotation degrees,
  // the slice that was at position (270 - normalizedRotation) is now at the pointer
  
  // But we need to think in terms of the canvas drawing:
  // Canvas draws from -90deg counter-clockwise
  // CSS rotates clockwise
  
  // When we rotate clockwise by X degrees, a point at angle A moves to angle (A + X)
  // The pointer is at -90deg. We want to find what was at angle (-90 - rotation) before rotation
  
  // Convert to the same coordinate system as canvas (starting from -90)
  // In canvas: -90 is top, going counter-clockwise (angles increase)
  // After CSS rotation by R degrees clockwise, 
  // the slice that was at angle (-90 - R) is now at -90 (pointer)
  
  let targetAngle = -90 - normalizedRotation; // in degrees
  
  // Normalize to 0-360
  while (targetAngle < 0) targetAngle += 360;
  targetAngle = targetAngle % 360;
  
  // Now find which slice occupies this angle
  // Canvas drawing starts at -90deg (= 270deg in standard)
  // and goes counter-clockwise (angles increase in canvas terms)
  
  // Convert our target angle to the canvas coordinate system
  // Canvas: -90deg = 270deg standard = 0 in our slice calculation
  let angleFromStart = (targetAngle - 270 + 360) % 360;
  
  // Find the slice
  let currentAngleSum = 0;
  for (const opt of enabledOptions) {
    const sliceAngleDeg = (opt.weight / totalWeight) * 360;
    if (angleFromStart >= currentAngleSum && angleFromStart < currentAngleSum + sliceAngleDeg) {
      return opt;
    }
    currentAngleSum += sliceAngleDeg;
  }
  
  // Fallback to last option
  return enabledOptions[enabledOptions.length - 1];
}

// Spin the wheel
function spinWheel() {
  if (spinning) return;
  
  const enabledOptions = options.filter(opt => opt.enabled);
  
  if (enabledOptions.length === 0) {
    alert('有効な選択肢が1つ以上必要です');
    return;
  }
  
  spinning = true;
  document.getElementById('spinBtn').disabled = true;
  
  // Play spin sound
  if (soundEnabled) {
    const tickInterval = setInterval(() => {
      if (spinning) {
        playSpinSound();
      } else {
        clearInterval(tickInterval);
      }
    }, 100);
  }
  
  // Calculate weighted random selection
  const totalWeight = enabledOptions.reduce((sum, opt) => sum + opt.weight, 0);
  let random = Math.random() * totalWeight;
  let selectedOption = null;
  let cumulativeWeight = 0;
  
  // Find which option was selected based on weighted probability
  for (const opt of enabledOptions) {
    cumulativeWeight += opt.weight;
    if (random <= cumulativeWeight) {
      selectedOption = opt;
      break;
    }
  }
  
  if (!selectedOption) {
    selectedOption = enabledOptions[enabledOptions.length - 1];
  }
  
  // Now calculate rotation needed to bring this option to the pointer
  // Find where this option is in the wheel (its center angle)
  let angleFromStart = 0;
  for (const opt of enabledOptions) {
    const sliceAngleDeg = (opt.weight / totalWeight) * 360;
    if (opt.id === selectedOption.id) {
      angleFromStart += sliceAngleDeg / 2; // Center of the slice
      break;
    }
    angleFromStart += sliceAngleDeg;
  }
  
  // The wheel starts at -90deg (top), going counter-clockwise
  // This slice center is at angleFromStart degrees from the start
  // In canvas terms: -90 + angleFromStart degrees
  // To bring it to the pointer at -90, we need to rotate by -angleFromStart
  
  const targetRotation = -angleFromStart;
  
  // Add multiple full rotations for effect
  const spins = 7 + Math.random() * 3;
  const totalRotation = (360 * spins) + targetRotation;
  
  // Animate
  const canvas = document.getElementById('rouletteCanvas');
  canvas.style.transform = `rotate(${totalRotation}deg)`;
  
  // Show result after animation
  setTimeout(() => {
    spinning = false;
    document.getElementById('spinBtn').disabled = false;
    
    // Verify which option is actually at the pointer (for debugging)
    const finalRotation = totalRotation % 360;
    const actualSelected = getSliceAtPointer(finalRotation, enabledOptions, totalWeight);
    
    // Play win sound
    playWinSound();
    
    // Show modal with the actually selected option
    document.getElementById('resultText').textContent = actualSelected.text;
    document.getElementById('resultModal').classList.remove('hidden');
    
    // Reset rotation after a short delay
    setTimeout(() => {
      canvas.style.transform = 'rotate(0deg)';
    }, 500);
  }, 6000);
}

// Close modal
function closeModal() {
  document.getElementById('resultModal').classList.add('hidden');
}

// Make functions globally accessible
window.deleteOption = deleteOption;
window.toggleOption = toggleOption;
window.changeWeight = changeWeight;
window.copyShareURL = copyShareURL;
