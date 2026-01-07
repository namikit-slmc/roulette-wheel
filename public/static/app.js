// Roulette Wheel Application

// State
let options = [];
let spinning = false;
let soundEnabled = true;

// Audio Context for sound effects
let audioContext;
let spinSound;
let winSound;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadOptions();
  initAudio();
  renderOptions();
  drawWheel();
  setupEventListeners();
});

// Audio initialization
function initAudio() {
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
}

// Generate spin sound
function playSpinSound() {
  if (!soundEnabled || !audioContext) return;
  
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.value = 200;
  oscillator.type = 'sine';
  
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.1);
}

// Generate win sound
function playWinSound() {
  if (!soundEnabled || !audioContext) return;
  
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
    
    gain.gain.setValueAtTime(0.2, time + i * 0.15);
    gain.gain.exponentialRampToValueAtTime(0.01, time + i * 0.15 + 0.3);
    
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
  
  // Click outside modal to close
  document.getElementById('resultModal').addEventListener('click', (e) => {
    if (e.target.id === 'resultModal') closeModal();
  });
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
    <div class="option-item bg-white bg-opacity-20 rounded-lg p-4 ${!opt.enabled ? 'opacity-50' : ''}">
      <div class="flex items-center gap-3">
        <!-- Toggle Enable/Disable -->
        <button 
          onclick="toggleOption(${opt.id})"
          class="w-10 h-10 rounded-lg ${opt.enabled ? 'bg-green-500' : 'bg-gray-500'} text-white hover:opacity-80 transition flex items-center justify-center"
          title="${opt.enabled ? '有効' : '無効'}"
        >
          <i class="fas ${opt.enabled ? 'fa-check' : 'fa-times'}"></i>
        </button>
        
        <!-- Option Text -->
        <div class="flex-1 text-white font-semibold">
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
            onclick="changeWeight(${opt.id}, 2)"
            class="px-3 py-1 rounded ${opt.weight === 2 ? 'bg-orange-500' : 'bg-orange-300'} text-white text-sm hover:bg-orange-600 transition"
            title="2倍の確率"
          >
            x2
          </button>
          <button 
            onclick="changeWeight(${opt.id}, 3)"
            class="px-3 py-1 rounded ${opt.weight === 3 ? 'bg-red-500' : 'bg-red-300'} text-white text-sm hover:bg-red-600 transition"
            title="3倍の確率"
          >
            x3
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
  
  let currentAngle = -Math.PI / 2; // Start from top
  
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
    // Play ticking sound during spin
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
  
  for (const opt of enabledOptions) {
    random -= opt.weight;
    if (random <= 0) {
      selectedOption = opt;
      break;
    }
  }
  
  if (!selectedOption) {
    selectedOption = enabledOptions[0];
  }
  
  // Calculate target angle
  const selectedIndex = enabledOptions.findIndex(opt => opt.id === selectedOption.id);
  const sliceAngle = 360 / enabledOptions.length;
  const targetAngle = (selectedIndex * sliceAngle) + (sliceAngle / 2);
  
  // Add multiple rotations for effect
  const spins = 5 + Math.random() * 3;
  const totalRotation = (360 * spins) + targetAngle;
  
  // Animate
  const canvas = document.getElementById('rouletteCanvas');
  canvas.style.transform = `rotate(${totalRotation}deg)`;
  
  // Show result after animation
  setTimeout(() => {
    spinning = false;
    document.getElementById('spinBtn').disabled = false;
    canvas.style.transform = 'rotate(0deg)';
    
    // Play win sound
    playWinSound();
    
    // Show modal
    document.getElementById('resultText').textContent = selectedOption.text;
    document.getElementById('resultModal').classList.remove('hidden');
  }, 4000);
}

// Close modal
function closeModal() {
  document.getElementById('resultModal').classList.add('hidden');
}

// Make functions globally accessible
window.deleteOption = deleteOption;
window.toggleOption = toggleOption;
window.changeWeight = changeWeight;
