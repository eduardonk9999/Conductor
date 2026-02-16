<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div class="flex items-center space-x-4">
          <span class="text-gray-600">{{ authStore.user?.name }}</span>
          <button @click="logout" class="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded">
            Sair
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 py-8">
      <!-- Quick Actions -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer" @click="createNewTemplate">
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
            </div>
          </div>
          <h3 class="text-lg font-semibold text-gray-900">Novo Template</h3>
          <p class="text-gray-600 text-sm mt-1">Crie um novo email a partir de uma imagem</p>
        </div>

        <router-link to="/templates" class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
              </svg>
            </div>
          </div>
          <h3 class="text-lg font-semibold text-gray-900">Meus Templates</h3>
          <p class="text-gray-600 text-sm mt-1">Visualize e edite seus templates salvos</p>
        </router-link>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
          </div>
          <h3 class="text-lg font-semibold text-gray-900">{{ templates.length }}</h3>
          <p class="text-gray-600 text-sm mt-1">Templates criados</p>
        </div>
      </div>

      <!-- Recent Templates -->
      <div class="bg-white rounded-lg shadow">
        <div class="p-6 border-b">
          <h2 class="text-lg font-semibold text-gray-900">Templates Recentes</h2>
        </div>
        <div class="p-6">
          <div v-if="loading" class="flex justify-center py-12">
            <div class="spinner"></div>
          </div>
          <div v-else-if="templates.length === 0" class="text-center py-12">
            <p class="text-gray-500">Nenhum template criado ainda.</p>
            <button @click="createNewTemplate" class="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Criar Primeiro Template
            </button>
          </div>
          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div 
              v-for="template in templates.slice(0, 6)" 
              :key="template._id"
              class="border rounded-lg overflow-hidden hover:shadow-lg transition cursor-pointer"
              @click="editTemplate(template._id)"
            >
              <div class="aspect-video bg-gray-100 overflow-hidden">
                <img 
                  v-if="template.originalImageUrl"
                  :src="template.originalImageUrl" 
                  :alt="template.name"
                  class="w-full h-full object-cover"
                />
              </div>
              <div class="p-4">
                <h3 class="font-semibold text-gray-900 truncate">{{ template.name }}</h3>
                <p class="text-sm text-gray-600 mt-1">{{ template.areas?.length || 0 }} elementos</p>
                <p class="text-xs text-gray-500 mt-2">
                  {{ new Date(template.createdAt).toLocaleDateString('pt-BR') }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Upload Modal -->
    <div v-if="showUploadModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 class="text-xl font-semibold mb-4">Criar Novo Template</h2>
        
        <form @submit.prevent="handleCreateTemplate" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nome do Template</label>
            <input 
              v-model="newTemplate.name"
              type="text" 
              required
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Newsletter Semanal"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Imagem do Email</label>
            <input 
              @change="handleFileSelect"
              type="file" 
              accept="image/*"
              required
              class="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          <div class="flex space-x-2">
            <button 
              type="submit"
              :disabled="uploading"
              class="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {{ uploading ? 'Enviando...' : 'Criar' }}
            </button>
            <button 
              type="button"
              @click="showUploadModal = false"
              class="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useTemplateStore } from '@/stores/template'

const router = useRouter()
const authStore = useAuthStore()
const templateStore = useTemplateStore()

const loading = ref(false)
const templates = ref([])
const showUploadModal = ref(false)
const uploading = ref(false)
const newTemplate = ref({ name: '', file: null })

onMounted(async () => {
  loading.value = true
  try {
    await templateStore.fetchTemplates()
    templates.value = templateStore.templates
  } catch (error) {
    console.error('Error loading templates:', error)
  } finally {
    loading.value = false
  }
})

function createNewTemplate() {
  showUploadModal.value = true
}

function handleFileSelect(e) {
  newTemplate.value.file = e.target.files[0]
}

async function handleCreateTemplate() {
  uploading.value = true
  try {
    const formData = new FormData()
    formData.append('name', newTemplate.value.name)
    formData.append('image', newTemplate.value.file)
    
    const template = await templateStore.createTemplate(formData)
    showUploadModal.value = false
    router.push(`/editor/${template._id}`)
  } catch (error) {
    alert('Erro ao criar template')
  } finally {
    uploading.value = false
  }
}

function editTemplate(id) {
  router.push(`/editor/${id}`)
}

function logout() {
  authStore.logout()
  router.push('/login')
}
</script>
