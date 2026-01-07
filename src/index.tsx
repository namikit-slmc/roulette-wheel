import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'

const app = new Hono()

// Enable CORS for API routes
app.use('/api/*', cors())

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))

// Main page
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Webルーレット - Web Roulette</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <style>
          body {
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            min-height: 100vh;
          }
          
          .roulette-container {
            position: relative;
            width: 500px;
            height: 500px;
            margin: 0 auto;
          }
          
          .roulette-wheel {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            position: relative;
            transition: transform 6s cubic-bezier(0.17, 0.67, 0.12, 0.99);
            box-shadow: 0 10px 50px rgba(0,0,0,0.3);
            border: 8px solid #fff;
          }
          
          .roulette-pointer {
            position: absolute;
            top: -30px;
            left: 50%;
            transform: translateX(-50%);
            width: 0;
            height: 0;
            border-left: 20px solid transparent;
            border-right: 20px solid transparent;
            border-top: 40px solid #e74c3c;
            filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));
            z-index: 10;
          }
          
          .roulette-center {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 60px;
            height: 60px;
            background: white;
            border-radius: 50%;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            z-index: 5;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            color: #3498db;
          }
          
          .option-item {
            transition: all 0.3s ease;
          }
          
          .option-item:hover {
            transform: translateX(5px);
          }
          
          .result-modal {
            animation: slideDown 0.5s ease-out;
          }
          
          @keyframes slideDown {
            from {
              transform: translateY(-100px);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
          
          .pulse {
            animation: pulse 2s infinite;
          }
          
          @keyframes pulse {
            0%, 100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.05);
            }
          }
        </style>
    </head>
    <body>
        <div class="min-h-screen p-8">
            <!-- Header -->
            <div class="max-w-7xl mx-auto mb-8">
                <div class="text-center mb-4">
                    <h1 class="text-5xl font-bold text-gray-800 mb-2">
                        <i class="fas fa-dharmachakra mr-3"></i>
                        Webルーレット
                    </h1>
                </div>
                
                <!-- Sound Controls -->
                <div class="flex justify-center items-center gap-4 mb-4">
                    <button id="soundToggle" class="bg-white bg-opacity-80 text-gray-700 px-6 py-2 rounded-lg hover:bg-opacity-100 transition shadow-md">
                        <i class="fas fa-volume-up mr-2"></i>
                        <span id="soundStatus">サウンド: ON</span>
                    </button>
                    <div class="flex items-center gap-3 bg-white bg-opacity-80 px-4 py-2 rounded-lg shadow-md">
                        <i class="fas fa-volume-down text-gray-700"></i>
                        <input type="range" id="volumeSlider" min="0" max="100" value="50" class="w-32">
                        <i class="fas fa-volume-up text-gray-700"></i>
                        <span id="volumeValue" class="text-gray-700 font-semibold w-12">50%</span>
                    </div>
                </div>
            </div>

            <div class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
                <!-- Left Panel: Roulette -->
                <div class="bg-white bg-opacity-90 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
                    <div class="roulette-container">
                        <div class="roulette-pointer"></div>
                        <canvas id="rouletteCanvas" class="roulette-wheel"></canvas>
                        <div class="roulette-center">
                            <i class="fas fa-star text-2xl"></i>
                        </div>
                    </div>
                    
                    <div class="mt-8 text-center">
                        <button id="spinBtn" class="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-12 py-4 rounded-full text-xl font-bold hover:shadow-2xl transform hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed">
                            <i class="fas fa-play-circle mr-2"></i>
                            ルーレットを回す
                        </button>
                    </div>
                </div>

                <!-- Right Panel: Options Management -->
                <div class="bg-white bg-opacity-90 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
                    <!-- Add Option Form -->
                    <div class="mb-6">
                        <div class="flex gap-2">
                            <input 
                                type="text" 
                                id="newOption" 
                                placeholder="新しい選択肢を入力..."
                                class="flex-1 px-4 py-3 rounded-lg border-2 border-gray-300 bg-white text-gray-800 placeholder-gray-500 focus:outline-none focus:border-blue-500"
                            />
                            <button 
                                id="addBtn" 
                                class="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition font-semibold"
                            >
                                <i class="fas fa-plus mr-2"></i>
                                追加
                            </button>
                        </div>
                    </div>

                    <!-- Options List -->
                    <div class="space-y-3 max-h-[600px] overflow-y-auto" id="optionsList">
                        <!-- Options will be dynamically added here -->
                    </div>
                    
                    <div id="emptyState" class="text-center text-gray-600 py-12">
                        <i class="fas fa-inbox text-6xl mb-4 opacity-50"></i>
                        <p>選択肢がありません。上のフォームから追加してください。</p>
                    </div>
                </div>
            </div>

            <!-- Result Modal -->
            <div id="resultModal" class="hidden fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
                <div class="result-modal bg-white rounded-3xl p-12 max-w-lg w-full text-center shadow-2xl">
                    <div class="text-6xl mb-6">🎉</div>
                    <div id="resultText" class="text-5xl font-bold text-indigo-600 mb-8 pulse"></div>
                    <button id="closeModal" class="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-3 rounded-full text-lg font-semibold hover:shadow-xl transition">
                        閉じる
                    </button>
                </div>
            </div>
        </div>

        <script src="/static/app.js"></script>
    </body>
    </html>
  `)
})

export default app
