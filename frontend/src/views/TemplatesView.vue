<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <router-link to="/dashboard" class="text-gray-600 hover:text-gray-900">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
          </router-link>
          <h1 class="text-2xl font-bold text-gray-900">Meus Templates</h1>
        </div>
        <button @click="createNew" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          + Novo Template
        </button>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 py-8">
      <!-- Search and Filters -->
      <div class="mb-6 flex items-center space-x-4">
        <div class="flex-1">
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="Buscar templates..."
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select v-model="sortBy" class="px-4 py-2 border rounded-lg">
          <option value="newest">Mais recentes</option>
          <option value="oldest">Mais antigos</option>
          <option value="name">Nome (A-Z)</option>
        </select>
      </div>

      <!-- Templates Grid -->
      <div v-if="loading" class="flex justify-center py-12">
        <div class="spinner"></div>
      </div>

      <div v-else-if="filteredTemplates.length === 0" class="text-center py-12">
        <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
        </svg>
        <p class="text-gray-500 text-lg">Nenhum template encontrado</p>
        <button @click="createNew" class="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Criar Primeiro Template
        </button>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div 
          v-for="template in filteredTemplates" 
          :key="template._id"
          class="bg-white border rounded-lg overflow-hidden hover:shadow-lg transition group"
        >
          <!-- Image Preview -->
          <div class="aspect-video bg-gray-100 overflow-hidden relative cursor-pointer" @click="editTemplate(template._id)">
            <img 
              v-if="template.originalImageUrl"
              :src="template.originalImageUrl" 
              :alt="template.name"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
              <svg class="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
              </svg>
            </div>
          </div>

          <!-- Info -->
          <div class="p-4">
            <h3 class="font-semibold text-gray-900 truncate">{{ template.name }}</h3>
            <div class="flex items-center justify-between mt-2 text-sm text-gray-600">
              <span>{{ template.areas?.length || 0 }} elementos</span>
              <span>{{ formatDate(template.createdAt) }}</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="border-t px-4 py-3 flex items-center justify-between">
            <button @click="editTemplate(template._id)" class="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Editar
            </button>
            <button @click="duplicateTemplate(template)" class="text-gray-600 hover:text-gray-700 text-sm">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
              </svg>
            </button>
            <button @click="confirmDelete(template)" class="text-red-600 hover:text-red-700 text-sm">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- Delete Confirmation Modal -->
    <div v-if="deleteModal.show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <h2 class="text-xl font-semibold mb-4">Confirmar Exclusão</h2>
        <p class="text-gray-600 mb-6">
          Tem certeza que deseja excluir o template "{{ deleteModal.template?.name }}"? Esta ação não pode ser desfeita.
        </p>
        <div class="flex space-x-3">
          <button @click="deleteTemplate" class="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700">
            Excluir
          </button>
          <button @click="deleteModal.show = false" class="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTemplateStore } from '@/stores/template'

const router = useRouter()
const templateStore = useTemplateStore()

const loading = ref(false)
const searchQuery = ref('')
const sortBy = ref('newest')
const deleteModal = ref({ show: false, template: null })

onMounted(async () => {
  loading.value = true
  try {
    await templateStore.fetchTemplates()
  } finally {
    loading.value = false
  }
})

const filteredTemplates = computed(() => {
  let filtered = [...templateStore.templates]

  // Search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(t => 
      t.name.toLowerCase().includes(query) ||
      t.description?.toLowerCase().includes(query)
    )
  }

  // Sort
  if (sortBy.value === 'newest') {
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  } else if (sortBy.value === 'oldest') {
    filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  } else if (sortBy.value === 'name') {
    filtered.sort((a, b) => a.name.localeCompare(b.name))
  }

  return filtered
})

function createNew() {
  router.push('/dashboard')
}

function editTemplate(id) {
  router.push(`/editor/${id}`)
}

function duplicateTemplate(template) {
  // TODO: Implement duplicate
  alert('Funcionalidade em desenvolvimento')
}

function confirmDelete(template) {
  deleteModal.value = { show: true, template }
}

async function deleteTemplate() {
  try {
    await templateStore.deleteTemplate(deleteModal.value.template._id)
    deleteModal.value = { show: false, template: null }
  } catch (error) {
    alert('Erro ao excluir template')
  }
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}
</script>
