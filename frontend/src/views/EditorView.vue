<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <button @click="goBack" class="text-gray-600 hover:text-gray-900">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
          </button>
          <h1 class="text-xl font-semibold">{{ template?.name || 'Novo Template' }}</h1>
        </div>
        <div class="flex items-center space-x-2">
          <button @click="processOcr" class="px-4 py-2 text-sm bg-purple-600 text-white rounded hover:bg-purple-700" :disabled="processingOcr">
            {{ processingOcr ? 'Processando...' : 'Detectar Textos (OCR)' }}
          </button>
          <button @click="saveTemplate" class="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700" :disabled="saving">
            {{ saving ? 'Salvando...' : 'Salvar' }}
          </button>
          <button @click="generatePreview" class="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700">
            Gerar HTML
          </button>
        </div>
      </div>
    </header>

    <div class="flex h-[calc(100vh-65px)]">
      <!-- Sidebar - Tools -->
      <aside class="w-64 bg-white border-r overflow-y-auto">
        <div class="p-4 space-y-4">
          <div>
            <h3 class="text-sm font-semibold text-gray-700 mb-2">Criar fatia (slice)</h3>
            <p class="text-xs text-gray-500 mb-2">Escolha o tipo e desenhe um retângulo na imagem. Cada retângulo vira <strong>uma linha da tabela</strong> do email. Use <strong>Fatia da imagem</strong> para que o pedaço selecionado vire a imagem daquela linha.</p>
            <div class="grid grid-cols-2 gap-2">
              <button
                @click="addArea('slice')"
                type="button"
                :class="[
                  'p-3 border-2 rounded transition text-center',
                  pendingAreaType === 'slice'
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-300'
                    : 'border-dashed hover:border-blue-500 hover:bg-blue-50'
                ]"
              >
                <svg class="w-6 h-6 mx-auto mb-1 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"/>
                </svg>
                <span class="text-xs block font-medium">Fatia da imagem</span>
              </button>
              <button
                @click="addArea('color')"
                type="button"
                :class="[
                  'p-3 border-2 rounded transition text-center',
                  pendingAreaType === 'color'
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-300'
                    : 'border-dashed hover:border-blue-500 hover:bg-blue-50'
                ]"
              >
                <svg class="w-6 h-6 mx-auto mb-1 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="4" y="4" width="16" height="16" rx="2"/>
                </svg>
                <span class="text-xs block">Cor</span>
              </button>
              <button
                @click="addArea('text')"
                type="button"
                :class="[
                  'p-3 border-2 rounded transition text-center',
                  pendingAreaType === 'text'
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-300'
                    : 'border-dashed hover:border-blue-500 hover:bg-blue-50'
                ]"
              >
                <svg class="w-6 h-6 mx-auto mb-1 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"/>
                </svg>
                <span class="text-xs block">Texto</span>
              </button>
              <button
                @click="addArea('button')"
                type="button"
                :class="[
                  'p-3 border-2 rounded transition text-center',
                  pendingAreaType === 'button'
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-300'
                    : 'border-dashed hover:border-blue-500 hover:bg-blue-50'
                ]"
              >
                <svg class="w-6 h-6 mx-auto mb-1 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"/>
                </svg>
                <span class="text-xs block">Botão</span>
              </button>
              <button
                @click="addArea('image')"
                type="button"
                :class="[
                  'p-3 border-2 rounded transition text-center',
                  pendingAreaType === 'image'
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-300'
                    : 'border-dashed hover:border-blue-500 hover:bg-blue-50'
                ]"
              >
                <svg class="w-6 h-6 mx-auto mb-1 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                <span class="text-xs block">Imagem</span>
              </button>
              <button
                @click="addArea('spacer')"
                type="button"
                :class="[
                  'p-3 border-2 rounded transition text-center',
                  pendingAreaType === 'spacer'
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-300'
                    : 'border-dashed hover:border-blue-500 hover:bg-blue-50'
                ]"
              >
                <svg class="w-6 h-6 mx-auto mb-1 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16"/>
                </svg>
                <span class="text-xs block">Espaço</span>
              </button>
            </div>
            <p v-if="isDrawing" class="text-xs text-blue-600 mt-2 font-medium">Solte o mouse para concluir a fatia.</p>
          </div>

          <!-- OCR Results -->
          <div v-if="ocrResults.length > 0">
            <h3 class="text-sm font-semibold text-gray-700 mb-2">Textos Detectados (OCR)</h3>
            <div class="space-y-2 max-h-60 overflow-y-auto">
              <div v-for="(text, idx) in ocrResults" :key="idx" 
                   @click="addAreaFromOcr(text)"
                   class="p-2 bg-purple-50 rounded cursor-pointer hover:bg-purple-100 transition">
                <p class="text-xs font-medium truncate">{{ text.text }}</p>
                <p class="text-xs text-gray-500">Confiança: {{ text.confidence.toFixed(0) }}%</p>
              </div>
            </div>
          </div>

          <!-- Selected Area Properties -->
          <div v-if="selectedArea" class="border-t pt-4">
            <h3 class="text-sm font-semibold text-gray-700 mb-3">Propriedades</h3>
            
            <div class="space-y-3">
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">Tipo</label>
                <select v-model="selectedArea.type" class="w-full px-3 py-2 border rounded text-sm">
                  <option value="slice">Fatia da imagem</option>
                  <option value="color">Bloco de cor</option>
                  <option value="text">Texto</option>
                  <option value="button">Botão</option>
                  <option value="image">Imagem (URL)</option>
                  <option value="spacer">Espaço</option>
                </select>
              </div>

              <p v-if="selectedArea.type === 'slice'" class="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                Esta linha da tabela será o recorte da imagem na região selecionada.
              </p>
              <p v-if="selectedArea.type === 'button'" class="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                Selecionou o botão na imagem: na tabela vira um botão clicável (recorte). Defina o <strong>Link</strong> abaixo.
              </p>
              <div v-if="selectedArea.type === 'color'" class="space-y-2">
                <label class="block text-xs font-medium text-gray-700 mb-1">Cor do bloco</label>
                <div class="flex items-center gap-2">
                  <input
                    v-model="selectedArea.styles.backgroundColor"
                    type="color"
                    class="w-12 h-10 border rounded cursor-pointer"
                  />
                  <input
                    v-model="selectedArea.styles.backgroundColor"
                    type="text"
                    class="flex-1 px-3 py-2 border rounded text-sm"
                    placeholder="#f0f0f0"
                  />
                </div>
                <p class="text-xs text-gray-500">A altura do bloco na tabela usa a altura da seleção.</p>
              </div>

              <div v-if="selectedArea.type !== 'spacer' && selectedArea.type !== 'slice' && selectedArea.type !== 'color'">
                <label class="block text-xs font-medium text-gray-700 mb-1">Conteúdo</label>
                <textarea 
                  v-if="selectedArea.type === 'text'"
                  v-model="selectedArea.content" 
                  rows="3"
                  class="w-full px-3 py-2 border rounded text-sm"
                  placeholder="Digite o texto..."
                ></textarea>
                <input 
                  v-else-if="selectedArea.type === 'button'"
                  v-model="selectedArea.content"
                  type="text" 
                  class="w-full px-3 py-2 border rounded text-sm"
                  placeholder="Texto do botão"
                />
                <input 
                  v-else-if="selectedArea.type === 'image'"
                  v-model="selectedArea.content"
                  type="text" 
                  class="w-full px-3 py-2 border rounded text-sm"
                  placeholder="URL da imagem"
                />
              </div>

              <div v-if="selectedArea.type === 'button'">
                <label class="block text-xs font-medium text-gray-700 mb-1">Link</label>
                <input 
                  v-model="selectedArea.link"
                  type="text" 
                  class="w-full px-3 py-2 border rounded text-sm"
                  placeholder="https://exemplo.com"
                />
              </div>

              <!-- Styles (texto, botão com texto, imagem - não para slice, color, spacer) -->
              <div v-if="selectedArea.type !== 'spacer' && selectedArea.type !== 'slice' && selectedArea.type !== 'color' && selectedArea.styles" class="space-y-2">
                <h4 class="text-xs font-semibold text-gray-600">Estilos</h4>
                
                <div v-if="selectedArea.type === 'text' || selectedArea.type === 'button'">
                  <label class="block text-xs text-gray-600 mb-1">Tamanho da Fonte</label>
                  <input 
                    v-model.number="selectedArea.styles.fontSize"
                    type="number" 
                    class="w-full px-3 py-1 border rounded text-sm"
                    min="10"
                    max="72"
                  />
                </div>

                <div v-if="selectedArea.type === 'text' || selectedArea.type === 'button'">
                  <label class="block text-xs text-gray-600 mb-1">Cor do Texto</label>
                  <input 
                    v-model="selectedArea.styles.color"
                    type="color" 
                    class="w-full h-10 border rounded cursor-pointer"
                  />
                </div>

                <div v-if="selectedArea.type === 'button'">
                  <label class="block text-xs text-gray-600 mb-1">Cor de Fundo</label>
                  <input 
                    v-model="selectedArea.styles.backgroundColor"
                    type="color" 
                    class="w-full h-10 border rounded cursor-pointer"
                  />
                </div>

                <div v-if="selectedArea.type === 'text'">
                  <label class="block text-xs text-gray-600 mb-1">Alinhamento</label>
                  <select v-model="selectedArea.styles.textAlign" class="w-full px-3 py-1 border rounded text-sm">
                    <option value="left">Esquerda</option>
                    <option value="center">Centro</option>
                    <option value="right">Direita</option>
                  </select>
                </div>
              </div>

              <button @click="deleteSelectedArea" class="w-full px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700">
                Excluir Elemento
              </button>
            </div>
          </div>
        </div>
      </aside>

      <!-- Main Canvas -->
      <main class="flex-1 overflow-auto bg-gray-100 p-8">
        <div class="max-w-4xl mx-auto">
          <div
            ref="canvasRef"
            class="relative bg-white shadow-lg mx-auto cursor-crosshair"
            :style="{ width: emailWidth + 'px' }"
            @mousedown="startDrawing"
          >
            <!-- Original Image (cliques na imagem disparam o desenho do slice) -->
            <img
              v-if="template?.originalImageUrl"
              :src="template.originalImageUrl"
              alt="Template"
              class="w-full block select-none"
              draggable="false"
            />

            <!-- Selection Areas -->
            <div
              v-for="area in areas"
              :key="area.id"
              class="selection-area"
              :class="{ active: selectedArea?.id === area.id }"
              :style="{
                left: area.x + 'px',
                top: area.y + 'px',
                width: area.width + 'px',
                height: area.height + 'px'
              }"
              @mousedown.stop="selectArea(area, $event)"
            >
              <div class="absolute inset-0 flex items-center justify-center text-xs font-semibold text-blue-600 pointer-events-none">
                {{ area.type.toUpperCase() }}
              </div>

              <!-- Resize Handles -->
              <template v-if="selectedArea?.id === area.id">
                <div class="resize-handle nw" @mousedown.stop="startResize(area, 'nw', $event)"></div>
                <div class="resize-handle ne" @mousedown.stop="startResize(area, 'ne', $event)"></div>
                <div class="resize-handle sw" @mousedown.stop="startResize(area, 'sw', $event)"></div>
                <div class="resize-handle se" @mousedown.stop="startResize(area, 'se', $event)"></div>
                <div class="resize-handle n" @mousedown.stop="startResize(area, 'n', $event)"></div>
                <div class="resize-handle s" @mousedown.stop="startResize(area, 's', $event)"></div>
                <div class="resize-handle w" @mousedown.stop="startResize(area, 'w', $event)"></div>
                <div class="resize-handle e" @mousedown.stop="startResize(area, 'e', $event)"></div>
              </template>
            </div>

            <!-- Drawing Selection Box -->
            <div
              v-if="isDrawing && drawBox"
              class="absolute border-2 border-blue-500 bg-blue-100 bg-opacity-20 pointer-events-none"
              :style="{
                left: drawBox.x + 'px',
                top: drawBox.y + 'px',
                width: drawBox.width + 'px',
                height: drawBox.height + 'px'
              }"
            ></div>
          </div>
        </div>
      </main>

      <!-- Preview Panel -->
      <aside v-if="showPreview" class="w-96 bg-white border-l overflow-y-auto">
        <div class="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h3 class="font-semibold">Preview HTML</h3>
          <div class="flex items-center space-x-2">
            <button @click="copyHtml" class="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300">
              Copiar
            </button>
            <button @click="downloadHtml" class="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
              Download
            </button>
            <button @click="showPreview = false" class="text-gray-500 hover:text-gray-700">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>
        
        <!-- Tabs -->
        <div class="border-b flex">
          <button 
            @click="previewTab = 'visual'"
            class="flex-1 px-4 py-2 text-sm font-medium"
            :class="previewTab === 'visual' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'"
          >
            Visual
          </button>
          <button 
            @click="previewTab = 'code'"
            class="flex-1 px-4 py-2 text-sm font-medium"
            :class="previewTab === 'code' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'"
          >
            Código
          </button>
        </div>

        <div class="p-4">
          <div v-if="previewTab === 'visual'" class="border rounded">
            <iframe 
              ref="previewIframe"
              class="w-full"
              style="min-height: 500px;"
              sandbox="allow-same-origin"
            ></iframe>
          </div>
          <div v-else>
            <pre class="code-editor bg-gray-900 text-green-400 p-4 rounded overflow-x-auto text-xs">{{ generatedHtml }}</pre>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTemplateStore } from '@/stores/template'
import { v4 as uuidv4 } from 'uuid'

const route = useRoute()
const router = useRouter()
const templateStore = useTemplateStore()

const template = ref(null)
const areas = ref([])
const selectedArea = ref(null)
const emailWidth = ref(600)

const isDrawing = ref(false)
const drawBox = ref(null)
const startPoint = ref({ x: 0, y: 0 })
const pendingAreaType = ref('slice')

const isDragging = ref(false)
const isResizing = ref(false)
const resizeHandle = ref(null)
const dragStart = ref({ x: 0, y: 0 })

const canvasRef = ref(null)
const previewIframe = ref(null)

const showPreview = ref(false)
const previewTab = ref('visual')
const generatedHtml = ref('')

const saving = ref(false)
const processingOcr = ref(false)
const ocrResults = ref([])

function normalizeArea(area) {
  return {
    ...area,
    styles: area.styles && typeof area.styles === 'object' ? area.styles : {}
  }
}

onMounted(async () => {
  const templateId = route.params.id
  if (templateId) {
    try {
      template.value = await templateStore.fetchTemplate(templateId)
      areas.value = (template.value.areas || []).map(normalizeArea)
      emailWidth.value = template.value.emailWidth || 600
    } catch (err) {
      alert('Template não encontrado.')
      router.push('/templates')
    }
  }
})

function addArea(type) {
  pendingAreaType.value = type
  // User will draw the area on canvas
}

function addAreaFromOcr(ocrText) {
  const area = {
    id: uuidv4(),
    type: 'text',
    x: ocrText.bbox.x0,
    y: ocrText.bbox.y0,
    width: ocrText.bbox.x1 - ocrText.bbox.x0,
    height: ocrText.bbox.y1 - ocrText.bbox.y0,
    content: ocrText.text,
    styles: {
      fontSize: 16,
      color: '#333333',
      textAlign: 'left'
    }
  }
  areas.value.push(area)
  selectedArea.value = area
}

function startDrawing(e) {
  // Permitir desenhar ao clicar na imagem ou no canvas, mas não em cima de uma área já criada
  if (!canvasRef.value?.contains(e.target) || e.target.closest('.selection-area') || e.target.closest('.resize-handle')) return
  if (isDragging.value || isResizing.value) return

  const rect = canvasRef.value.getBoundingClientRect()
  startPoint.value = {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  }
  isDrawing.value = true
  drawBox.value = { x: startPoint.value.x, y: startPoint.value.y, width: 0, height: 0 }
  document.addEventListener('mousemove', onDrawingMove)
  document.addEventListener('mouseup', onDrawingUp)
}

function onDrawingMove(e) {
  if (!isDrawing.value || !canvasRef.value) return
  const rect = canvasRef.value.getBoundingClientRect()
  const currentX = e.clientX - rect.left
  const currentY = e.clientY - rect.top
  drawBox.value = {
    x: Math.min(startPoint.value.x, currentX),
    y: Math.min(startPoint.value.y, currentY),
    width: Math.abs(currentX - startPoint.value.x),
    height: Math.abs(currentY - startPoint.value.y)
  }
}

function onDrawingUp() {
  if (!isDrawing.value || !drawBox.value || !canvasRef.value) {
    cleanupDrawing()
    return
  }
  const rect = canvasRef.value.getBoundingClientRect()
  const cw = rect.width
  const ch = rect.height
  // Limitar a fatia aos limites do canvas (imagem)
  let x = drawBox.value.x
  let y = drawBox.value.y
  let w = drawBox.value.width
  let h = drawBox.value.height
  if (x < 0) { w += x; x = 0 }
  if (y < 0) { h += y; y = 0 }
  if (x + w > cw) w = cw - x
  if (y + h > ch) h = ch - y
  if (w > 10 && h > 10) {
    const type = pendingAreaType.value
    const newArea = {
      id: uuidv4(),
      type,
      x: Math.round(x),
      y: Math.round(y),
      width: Math.round(w),
      height: Math.round(h),
      content: type === 'slice' || type === 'color' ? '' : type === 'button' ? 'Clique aqui' : type === 'image' ? '' : type === 'text' ? 'Seu texto aqui' : '',
      link: type === 'button' ? '#' : '',
      styles: type === 'spacer' || type === 'slice'
        ? {}
        : type === 'color'
        ? { backgroundColor: '#e0e0e0' }
        : {
            fontSize: 16,
            color: type === 'button' ? '#ffffff' : '#333333',
            backgroundColor: type === 'button' ? '#3b82f6' : '',
            textAlign: 'left',
            padding: type === 'button' ? '12px 30px' : '10px 20px',
            borderRadius: '4px'
          }
    }
    areas.value.push(newArea)
    selectedArea.value = newArea
  }
  cleanupDrawing()
}

function cleanupDrawing() {
  isDrawing.value = false
  drawBox.value = null
  document.removeEventListener('mousemove', onDrawingMove)
  document.removeEventListener('mouseup', onDrawingUp)
}


function selectArea(area, e) {
  if (!area.styles) area.styles = {}
  if (area.type === 'color' && !area.styles.backgroundColor) area.styles.backgroundColor = '#e0e0e0'
  selectedArea.value = area
  dragStart.value = { x: e.clientX, y: e.clientY }
  isDragging.value = true
  
  document.addEventListener('mousemove', dragArea)
  document.addEventListener('mouseup', stopDragArea)
}

function dragArea(e) {
  if (!isDragging.value || !selectedArea.value) return
  
  const dx = e.clientX - dragStart.value.x
  const dy = e.clientY - dragStart.value.y
  
  selectedArea.value.x += dx
  selectedArea.value.y += dy
  
  dragStart.value = { x: e.clientX, y: e.clientY }
}

function stopDragArea() {
  isDragging.value = false
  document.removeEventListener('mousemove', dragArea)
  document.removeEventListener('mouseup', stopDragArea)
}

function startResize(area, handle, e) {
  selectedArea.value = area
  resizeHandle.value = handle
  isResizing.value = true
  dragStart.value = { x: e.clientX, y: e.clientY }
  
  document.addEventListener('mousemove', resizeArea)
  document.addEventListener('mouseup', stopResize)
}

function resizeArea(e) {
  if (!isResizing.value || !selectedArea.value) return
  
  const dx = e.clientX - dragStart.value.x
  const dy = e.clientY - dragStart.value.y
  
  const handle = resizeHandle.value
  
  if (handle.includes('n')) {
    selectedArea.value.y += dy
    selectedArea.value.height -= dy
  }
  if (handle.includes('s')) {
    selectedArea.value.height += dy
  }
  if (handle.includes('w')) {
    selectedArea.value.x += dx
    selectedArea.value.width -= dx
  }
  if (handle.includes('e')) {
    selectedArea.value.width += dx
  }
  
  dragStart.value = { x: e.clientX, y: e.clientY }
}

function stopResize() {
  isResizing.value = false
  resizeHandle.value = null
  document.removeEventListener('mousemove', resizeArea)
  document.removeEventListener('mouseup', stopResize)
}

function deleteSelectedArea() {
  if (!selectedArea.value) return
  areas.value = areas.value.filter(a => a.id !== selectedArea.value.id)
  selectedArea.value = null
}

async function saveTemplate() {
  if (!template.value?._id) {
    alert('Salve o template primeiro a partir do dashboard.')
    return
  }
  saving.value = true
  try {
    await templateStore.updateTemplate(template.value._id, {
      areas: areas.value,
      emailWidth: emailWidth.value
    })
    alert('Template salvo com sucesso!')
  } catch (error) {
    alert(error.response?.data?.message || 'Erro ao salvar template')
  } finally {
    saving.value = false
  }
}

async function generatePreview() {
  if (!template.value?._id) {
    alert('Carregue um template primeiro.')
    return
  }
  try {
    // Enviar as áreas atuais do editor para o backend antes de gerar o HTML
    // (o servidor gera o HTML a partir do que está salvo no banco)
    await templateStore.updateTemplate(template.value._id, {
      areas: areas.value,
      emailWidth: emailWidth.value
    })
    const html = await templateStore.generateHtml(template.value._id)
    generatedHtml.value = html
    showPreview.value = true

    await nextTick()
    if (previewIframe.value?.contentDocument) {
      const doc = previewIframe.value.contentDocument
      doc.open()
      doc.write(html)
      doc.close()
    }
  } catch (error) {
    alert(error.response?.data?.message || 'Erro ao gerar HTML')
  }
}

async function processOcr() {
  if (!template.value?._id) {
    alert('Carregue um template primeiro.')
    return
  }
  processingOcr.value = true
  try {
    const results = await templateStore.processOcr(template.value._id)
    ocrResults.value = results ?? []
    alert(`${ocrResults.value.length} textos detectados!`)
  } catch (error) {
    alert(error.response?.data?.message || 'Erro ao processar OCR')
  } finally {
    processingOcr.value = false
  }
}

function copyHtml() {
  navigator.clipboard.writeText(generatedHtml.value)
  alert('HTML copiado!')
}

function downloadHtml() {
  const name = template.value?.name || 'template'
  const blob = new Blob([generatedHtml.value], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${name}.html`
  a.click()
  URL.revokeObjectURL(url)
}

function goBack() {
  router.push('/templates')
}
</script>
